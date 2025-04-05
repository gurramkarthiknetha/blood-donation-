import express from 'express';
import { 
  registerHospital,
  loginHospital,
  updateHospitalProfile,
  getHospitalProfile,
  getAllHospitals,
  updateBloodInventory,
  createBloodRequest,
  updateBloodRequest,
  searchDonors,
  createEmergencyRequest,
  getActiveRequests,
  getHospitalAnalytics,
  getBloodDemandForecast,
  checkInventoryLevels,
  addStorageLocation,
  getStorageStatus,
  moveBloodUnit,
  getStorageTemperature,
  recordTemperature,
  getHospitalStatistics,
  getPerformanceReport,
  scheduleReport,
  unscheduleReport,
  getScheduledReports,
  exportReport,
  getSystemMetrics
} from '../controllers/hospitalController';
import { authMiddleware } from '../middleware/auth';
import { 
  validateHospitalRegistration,
  validateBloodInventoryUpdate, 
  validateBloodRequest,
  validateDonorSearch 
} from '../middleware/validation';
import { validateStorageLocation, validateUnitMove } from '../middleware/storageValidation';
import { validateReportSchedule } from '../middleware/reportValidation';
import { validateExportFormat } from '../middleware/exportValidation';
import { checkDatabaseConnection } from '../middleware/databaseErrorHandler';
import { monitorPerformance, getPerformanceStats } from '../middleware/performanceMonitor';

const router = express.Router();

// Add database connection check to all routes
router.use(checkDatabaseConnection);

// Add performance monitoring to all routes
router.use(monitorPerformance);

// Authentication routes
router.post('/register', validateHospitalRegistration, registerHospital);
router.post('/login', loginHospital);

// Profile routes
router.get('/profile/:id', authMiddleware, getHospitalProfile);
router.put('/profile/:id', authMiddleware, updateHospitalProfile);
router.get('/all', getAllHospitals);

// Blood inventory routes
router.put('/:id/inventory', [authMiddleware, validateBloodInventoryUpdate], updateBloodInventory);

// Blood request routes
router.post('/request', [authMiddleware, validateBloodRequest], createBloodRequest);
router.put('/:hospitalId/request/:requestId', authMiddleware, updateBloodRequest);
router.post('/emergency-request', [authMiddleware, validateBloodRequest], createEmergencyRequest);
router.get('/:hospitalId/active-requests', authMiddleware, getActiveRequests);

// Analytics and forecasting routes
router.get('/:hospitalId/analytics', authMiddleware, getHospitalAnalytics);
router.get('/:hospitalId/forecast', authMiddleware, getBloodDemandForecast);

// Donor search routes
router.post('/search-donors', [authMiddleware, validateDonorSearch], searchDonors);

// Inventory check route
router.get('/:hospitalId/inventory-check', authMiddleware, checkInventoryLevels);

// Storage management routes
router.post('/storage/location', [authMiddleware, validateStorageLocation], addStorageLocation);
router.get('/storage/status', authMiddleware, getStorageStatus);
router.post('/storage/move-unit', [authMiddleware, validateUnitMove], moveBloodUnit);

// Temperature monitoring routes
router.get('/storage/:locationId/temperature', authMiddleware, getStorageTemperature);
router.post('/storage/:locationId/temperature', authMiddleware, recordTemperature);

// Statistics routes
router.get('/:hospitalId/statistics', authMiddleware, getHospitalStatistics);
router.get('/:hospitalId/performance-report', authMiddleware, getPerformanceReport);

// Report scheduling routes
router.post('/:hospitalId/schedule-report', [authMiddleware, validateReportSchedule], scheduleReport);
router.delete('/:hospitalId/schedule-report', authMiddleware, unscheduleReport);
router.get('/scheduled-reports', authMiddleware, getScheduledReports);

// Report export route
router.get('/:hospitalId/export-report', [authMiddleware, validateExportFormat], exportReport);

// Add performance stats endpoint
router.get('/metrics/performance', authMiddleware, getPerformanceStats);

// Add metrics dashboard endpoint
router.get('/metrics/system', authMiddleware, getSystemMetrics);

export default router;