import mongoose from 'mongoose';
import Hospital from '../models/hospital';
import { Log } from './loggingService';

export interface HospitalStats {
  totalDonations: number;
  successfulRequests: number;
  averageFulfillmentTime: number;
  emergencyResponseRate: number;
  inventoryEfficiency: number;
  donorRetentionRate: number;
}

export class StatisticsService {
  async calculateMetrics(startDate: Date, endDate: Date) {
    const logs = await Log.find({
      timestamp: { $gte: startDate, $lte: endDate }
    });

    const requests = logs.filter(log => 
      log.type === 'BLOOD_REQUEST' || log.type === 'EMERGENCY_REQUEST'
    );

    const fulfillments = logs.filter(log => log.type === 'REQUEST_FULFILLED');
    const donations = logs.filter(log => 
      log.type === 'INVENTORY_UPDATE' && log.details?.change && log.details.change > 0
    );

    // Calculate fulfillment rate
    const fulfilledRequests = requests.filter(req => {
      const fulfillment = fulfillments.find(f => 
        f.requestId && req.requestId && f.requestId.toString() === req.requestId.toString()
      );
      return !!fulfillment;
    });

    const fulfillmentRate = requests.length > 0
      ? (fulfilledRequests.length / requests.length) * 100
      : 0;

    // Emergency request metrics
    const emergencyRequests = requests.filter(r => r.urgency === 'high');
    const fulfilledEmergencies = emergencyRequests.filter(req =>
      fulfillments.some(f => 
        f.requestId && req.requestId && f.requestId.toString() === req.requestId.toString()
      )
    );

    const emergencyFulfillmentRate = emergencyRequests.length > 0
      ? (fulfilledEmergencies.length / emergencyRequests.length) * 100
      : 0;

    // Inventory metrics
    const inventoryUpdates = logs.filter(log => log.type === 'INVENTORY_UPDATE');

    return {
      totalRequests: requests.length,
      fulfillmentRate,
      emergencyRequests: emergencyRequests.length,
      emergencyFulfillmentRate,
      totalDonations: donations.length,
      inventoryUpdates: inventoryUpdates.length
    };
  }
}

export const calculateHospitalStats = async (hospitalId: string, period: number = 30): Promise<HospitalStats> => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - period);

  const logs = await Log.find({
    hospitalId,
    timestamp: { $gte: startDate }
  });

  const requests = logs.filter(log => 
    log.type === 'BLOOD_REQUEST' || log.type === 'EMERGENCY_REQUEST'
  );

  const fulfillments = logs.filter(log => log.type === 'REQUEST_FULFILLED');
  const donations = logs.filter(log => 
    log.type === 'INVENTORY_UPDATE' && log.details?.change && log.details.change > 0
  );

  // Calculate fulfillment times
  const fulfillmentTimes = requests.map(req => {
    const fulfillment = fulfillments.find(f => f.requestId && req.requestId && f.requestId.toString() === req.requestId.toString());
    return fulfillment ? 
      fulfillment.timestamp.getTime() - req.timestamp.getTime() : 
      null;
  }).filter(time => time !== null) as number[];

  // Calculate average fulfillment time in hours
  const averageFulfillmentTime = fulfillmentTimes.length > 0 ?
    fulfillmentTimes.reduce((a, b) => a + b, 0) / fulfillmentTimes.length / (1000 * 60 * 60) :
    0;

  // Calculate emergency response rate
  const emergencyRequests = requests.filter(r => r.urgency === 'high');
  const fulfilledEmergencies = emergencyRequests.filter(req =>
    fulfillments.some(f => f.requestId && req.requestId && f.requestId.toString() === req.requestId.toString())
  );
  const emergencyResponseRate = emergencyRequests.length > 0 ?
    fulfilledEmergencies.length / emergencyRequests.length :
    1;

  // Calculate inventory efficiency
  const inventoryUpdates = logs.filter(log => log.type === 'INVENTORY_UPDATE');
  const expiredUnits = inventoryUpdates.reduce((total, log) => 
    total + (log.details?.expired || 0), 0
  );
  const totalUnits = donations.reduce((total, log) => 
    total + (log.details?.change || 0), 0
  );
  const inventoryEfficiency = totalUnits > 0 ?
    1 - (expiredUnits / totalUnits) :
    1;

  // Calculate donor retention rate
  const uniqueDonors = new Set(donations.map(d => d.donorId?.toString())).size;
  const repeatDonors = donations.reduce((acc, donation) => {
    const donorId = donation.donorId?.toString();
    if (donorId) {
      acc[donorId] = (acc[donorId] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);
  const repeatDonorCount = Object.values(repeatDonors).filter(count => count > 1).length;
  const donorRetentionRate = uniqueDonors > 0 ?
    repeatDonorCount / uniqueDonors :
    0;

  return {
    totalDonations: donations.length,
    successfulRequests: fulfillments.length,
    averageFulfillmentTime,
    emergencyResponseRate,
    inventoryEfficiency,
    donorRetentionRate
  };
};

export const generatePerformanceReport = async (hospitalId: string): Promise<any> => {
  const [monthlyStats, yearlyStats] = await Promise.all([
    calculateHospitalStats(hospitalId, 30),
    calculateHospitalStats(hospitalId, 365)
  ]);

  const hospital = await Hospital.findById(hospitalId);
  if (!hospital) throw new Error('Hospital not found');

  // Calculate trends and improvements
  const improvements = {
    fulfillmentTimeImprovement: 
      (yearlyStats.averageFulfillmentTime - monthlyStats.averageFulfillmentTime) / 
      yearlyStats.averageFulfillmentTime,
    emergencyResponseImprovement:
      monthlyStats.emergencyResponseRate - yearlyStats.emergencyResponseRate,
    efficiencyImprovement:
      monthlyStats.inventoryEfficiency - yearlyStats.inventoryEfficiency
  };

  return {
    hospital: {
      name: hospital.name,
      id: hospital._id
    },
    currentMonth: monthlyStats,
    yearToDate: yearlyStats,
    improvements,
    generatedAt: new Date()
  };
};