import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Types, ObjectId } from 'mongoose';
import Hospital from '../models/hospital';
import Donor from '../models/donor';
import {
  logInventoryUpdate,
  logBloodRequest,
  logEmergencyRequest,
  logRequestFulfilled
} from '../services/loggingService';
import {
  getInventoryTrends,
  getRequestAnalytics,
  getDonorDistribution,
  getPeakDemandTimes
} from '../services/analyticsService';
import { generateBloodDemandForecast } from '../services/forecastService';
import { InventoryMonitor } from '../services/inventoryMonitor';
import StorageManager from '../services/storageManager';
import TemperatureMonitor from '../services/temperatureMonitor';
import { calculateHospitalStats, generatePerformanceReport } from '../services/statisticsService';
import ReportScheduler from '../services/reportScheduler';
import { ReportExporter, ExportFormat } from '../services/reportExporter';
import CacheService from '../services/cacheService';
import MetricsDashboard from '../services/metricsDashboard';
import { calculateUrgencyScore, notifyCompatibleDonors, BloodRequest } from '../utils/donorUtils';

export const registerHospital = async (req: Request, res: Response) => {
  try {
    const { name, email, password, ...hospitalData } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const hospital = new Hospital({
      ...hospitalData,
      name,
      email,
      password: hashedPassword
    });

    await hospital.save();
    res.status(201).json({ message: 'Hospital registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error registering hospital', error });
  }
};

export const loginHospital = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const hospital = await Hospital.findOne({ email });
    
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }

    const validPassword = await bcrypt.compare(password, hospital.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    const token = jwt.sign(
      { id: hospital._id, hospitalId: hospital.hospitalId }, 
      process.env.JWT_SECRET || 'secret'
    );
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error });
  }
};

export const updateHospitalProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const hospital = await Hospital.findByIdAndUpdate(id, updates, { new: true });
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }

    res.json(hospital);
  } catch (error) {
    res.status(500).json({ message: 'Error updating hospital', error });
  }
};

export const getHospitalProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const hospital = await Hospital.findById(id);
    
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }

    res.json(hospital);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching hospital profile', error });
  }
};

export const getAllHospitals = async (req: Request, res: Response) => {
  try {
    const hospitals = await Hospital.find({}, '-password');
    res.json(hospitals);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching hospitals', error });
  }
};

export const updateBloodInventory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { bloodType, quantity } = req.body;
    const cacheService = CacheService.getInstance();
    
    const hospital = await Hospital.findById(id);
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }

    const inventoryIndex = hospital.bloodInventory.findIndex(
      (item) => item.bloodType === bloodType
    );

    const previousQuantity = inventoryIndex === -1 ? 0 : hospital.bloodInventory[inventoryIndex].quantity;

    if (inventoryIndex === -1) {
      hospital.bloodInventory.push({
        bloodType,
        quantity,
        lastUpdated: new Date()
      });
    } else {
      hospital.bloodInventory[inventoryIndex].quantity = quantity;
      hospital.bloodInventory[inventoryIndex].lastUpdated = new Date();
    }

    await hospital.save();
    await logInventoryUpdate(id, bloodType, previousQuantity, quantity);
    
    // Invalidate related caches
    cacheService.invalidateInventory(id);
    cacheService.invalidateStatistics(id);
    cacheService.invalidateForecast(id);
    
    res.json(hospital.bloodInventory);
  } catch (error) {
    res.status(500).json({ message: 'Error updating blood inventory', error });
  }
};

export const createBloodRequest = async (req: Request, res: Response) => {
  try {
    const hospitalId = req.user?.hospitalId;
    const hospital = await Hospital.findById(hospitalId);
    
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }

    const request = hospital.bloodRequests.create(req.body);
    hospital.bloodRequests.push(request);
    await hospital.save();

    // Convert mongoose document to plain object and ensure date types
    const requestObj = {
      ...request.toObject(),
      hospitalId: hospital._id,
      requestDate: new Date(request.requestDate),
      fulfilledDate: request.fulfilledDate ? new Date(request.fulfilledDate) : undefined
    };
    
    const notifiedDonors = await notifyCompatibleDonors(requestObj);
    
    res.status(201).json({ 
      request: request,
      notifiedDonors 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating blood request', error });
  }
};

export const updateBloodRequest = async (req: Request, res: Response) => {
  try {
    const { hospitalId, requestId } = req.params;
    const { status, donorId } = req.body;
    
    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }

    const request = hospital.bloodRequests.id(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    request.status = status;
    if (status === 'fulfilled') {
      request.fulfilledDate = new Date();
      await logRequestFulfilled(
        hospitalId,
        requestId,
        donorId,
        request.bloodType,
        request.quantity
      );
    }

    await hospital.save();
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: 'Error updating blood request', error });
  }
};

export const searchDonors = async (req: Request, res: Response) => {
  try {
    const { bloodType, latitude, longitude, maxDistance = 50 } = req.body;
    const cacheService = CacheService.getInstance();
    const searchParams = JSON.stringify({ bloodType, latitude, longitude, maxDistance });

    // Try to get from cache first
    const cachedResults = await cacheService.getDonorSearch(searchParams);
    if (cachedResults) {
      return res.json(cachedResults);
    }

    // If not in cache, perform the search
    const donors = await Donor.find({
      bloodType,
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [longitude, latitude]
          },
          $maxDistance: maxDistance * 1000
        }
      },
      lastDonationDate: {
        $lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
      }
    }).select('-password');

    // Cache the results
    cacheService.setDonorSearch(searchParams, donors);
    res.json(donors);
  } catch (error) {
    res.status(500).json({ message: 'Error searching donors', error });
  }
};

export const createEmergencyRequest = async (req: Request, res: Response) => {
  try {
    const { hospitalId, bloodType, quantity } = req.body;
    const hospital = await Hospital.findById(hospitalId);
    
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }

    const request = hospital.bloodRequests.create({
      bloodType,
      quantity,
      urgency: 'high',
      status: 'pending',
      requestDate: new Date()
    });

    hospital.bloodRequests.push(request);
    await hospital.save();

    const requestWithHospital = {
      ...request.toObject(),
      hospitalId: hospital._id
    };

    const notifiedDonors = await notifyCompatibleDonors(requestWithHospital);
    
    await logEmergencyRequest(
      hospitalId,
      request._id.toString(),
      bloodType,
      quantity,
      notifiedDonors?.length || 0
    );

    res.status(201).json({ 
      request,
      notifiedDonors: notifiedDonors?.length || 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating emergency request', error });
  }
};

export const getActiveRequests = async (req: Request, res: Response) => {
  try {
    const { hospitalId } = req.params;
    const hospital = await Hospital.findById(hospitalId);
    
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }

    const activeRequests = hospital.bloodRequests
      .filter(req => req.status === 'pending')
      .map(req => ({
        ...req.toObject(),
        hospitalId: hospital._id,
        requestDate: new Date(req.requestDate),
        fulfilledDate: req.fulfilledDate ? new Date(req.fulfilledDate) : undefined
      }))
      .sort((a, b) => calculateUrgencyScore(a) - calculateUrgencyScore(b));

    res.json(activeRequests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching active requests', error });
  }
};

export const getHospitalAnalytics = async (req: Request, res: Response) => {
  try {
    const { hospitalId } = req.params;
    const { days = 30 } = req.query;

    const [inventoryTrends, requestAnalytics, donorDistribution, peakDemandTimes] = 
      await Promise.all([
        getInventoryTrends(hospitalId, Number(days)),
        getRequestAnalytics(hospitalId, Number(days)),
        getDonorDistribution(hospitalId),
        getPeakDemandTimes(hospitalId)
      ]);

    res.json({
      inventoryTrends,
      requestAnalytics,
      donorDistribution,
      peakDemandTimes
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching analytics', error });
  }
};

export const getBloodDemandForecast = async (req: Request, res: Response) => {
  try {
    const { hospitalId } = req.params;
    const cacheService = CacheService.getInstance();

    // Try to get from cache first
    const cachedForecast = await cacheService.getForecast(hospitalId);
    if (cachedForecast) {
      return res.json(cachedForecast);
    }

    // If not in cache, generate forecast
    const forecast = await generateBloodDemandForecast(hospitalId);
    const optimizedInventory = forecast.map(f => ({
      bloodType: f.bloodType,
      minimumLevel: Math.ceil(f.predictedDemand * 1.2),
      optimalLevel: Math.ceil(f.predictedDemand * 1.5),
      forecast: f
    }));

    const result = { forecast, optimizedInventory };
    cacheService.setForecast(hospitalId, result);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error generating forecast', error });
  }
};

export const checkInventoryLevels = async (req: Request, res: Response) => {
  try {
    const { hospitalId } = req.params;
    const monitor = InventoryMonitor.getInstance();
    const result = await monitor.performManualCheck(hospitalId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error checking inventory levels', error });
  }
};

export const addStorageLocation = async (req: Request, res: Response) => {
  try {
    const storageManager = StorageManager.getInstance();
    const location = req.body;
    storageManager.addStorageLocation(location);
    res.status(201).json(location);
  } catch (error) {
    res.status(500).json({ message: 'Error adding storage location', error });
  }
};

export const getStorageStatus = async (req: Request, res: Response) => {
  try {
    const storageManager = StorageManager.getInstance();
    const validationIssues = storageManager.validateStorageConditions();
    const expiringUnits = storageManager.getUnitsNearingExpiration();

    res.json({
      storageIssues: validationIssues,
      expiringUnits: expiringUnits,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error getting storage status', error });
  }
};

export const moveBloodUnit = async (req: Request, res: Response) => {
  try {
    const { unitId, fromLocationId, toLocationId } = req.body;
    const storageManager = StorageManager.getInstance();
    
    const unit = storageManager.removeUnit(fromLocationId, unitId);
    storageManager.addUnit(toLocationId, unit);
    
    res.json({ message: 'Unit moved successfully', unit });
  } catch (error) {
    res.status(500).json({ message: 'Error moving blood unit', error });
  }
};

export const getStorageTemperature = async (req: Request, res: Response) => {
  try {
    const { locationId } = req.params;
    const monitor = TemperatureMonitor.getInstance();
    const stats = monitor.getTemperatureStats(locationId);
    const anomalies = monitor.detectAnomalies(locationId);
    const readings = monitor.getReadings(locationId);

    res.json({
      stats,
      anomalies,
      readings
    });
  } catch (error) {
    res.status(500).json({ message: 'Error getting temperature data', error });
  }
};

export const recordTemperature = async (req: Request, res: Response) => {
  try {
    const { locationId } = req.params;
    const { temperature } = req.body;
    const monitor = TemperatureMonitor.getInstance();
    
    monitor.recordReading(locationId, temperature);
    const anomalies = monitor.detectAnomalies(locationId);
    
    res.json({ 
      message: 'Temperature recorded',
      anomalies
    });
  } catch (error) {
    res.status(500).json({ message: 'Error recording temperature', error });
  }
};

export const getHospitalStatistics = async (req: Request, res: Response) => {
  try {
    const { hospitalId } = req.params;
    const { period } = req.query;
    const cacheService = CacheService.getInstance();

    // Try to get from cache first
    const cachedStats = await cacheService.getStatistics(hospitalId);
    if (cachedStats) {
      return res.json(cachedStats);
    }

    const stats = await calculateHospitalStats(hospitalId, Number(period) || 30);
    cacheService.setStatistics(hospitalId, stats);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching hospital statistics', error });
  }
};

export const getPerformanceReport = async (req: Request, res: Response) => {
  try {
    const { hospitalId } = req.params;
    const report = await generatePerformanceReport(hospitalId);
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: 'Error generating performance report', error });
  }
};

export const scheduleReport = async (req: Request, res: Response) => {
  try {
    const { hospitalId } = req.params;
    const { frequency } = req.body;
    
    const scheduler = ReportScheduler.getInstance();
    scheduler.scheduleReport(hospitalId, frequency);
    
    res.json({ message: 'Report scheduled successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error scheduling report', error });
  }
};

export const unscheduleReport = async (req: Request, res: Response) => {
  try {
    const { hospitalId } = req.params;
    const scheduler = ReportScheduler.getInstance();
    scheduler.unscheduleReport(hospitalId);
    
    res.json({ message: 'Report unscheduled successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error unscheduling report', error });
  }
};

export const getScheduledReports = async (req: Request, res: Response) => {
  try {
    const scheduler = ReportScheduler.getInstance();
    const reports = scheduler.getAllScheduledReports();
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching scheduled reports', error });
  }
};

export const exportReport = async (req: Request, res: Response) => {
  try {
    const { hospitalId } = req.params;
    const { format = ExportFormat.PDF } = req.query;
    
    const report = await generatePerformanceReport(hospitalId);
    
    switch (format) {
      case ExportFormat.PDF:
        const pdfBuffer = await ReportExporter.exportToPDF(report);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=report.pdf');
        return res.send(pdfBuffer);
        
      case ExportFormat.EXCEL:
        const excelBuffer = await ReportExporter.exportToExcel(report);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=report.xlsx');
        return res.send(excelBuffer);
        
      case ExportFormat.CSV:
        const csv = await ReportExporter.exportToCSV(report);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=report.csv');
        return res.send(csv);
        
      default:
        throw new Error('Unsupported export format');
    }
  } catch (error) {
    res.status(500).json({ message: 'Error exporting report', error });
  }
};

export const getSystemMetrics = async (req: Request, res: Response) => {
  try {
    const dashboard = MetricsDashboard.getInstance();
    const metrics = await dashboard.collectMetrics();
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ message: 'Error collecting system metrics', error });
  }
};