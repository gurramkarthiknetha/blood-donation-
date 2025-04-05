import mongoose from 'mongoose';
import Hospital from '../models/hospital';
import { ILog, Log } from '../services/loggingService';

interface InventoryTrend {
  date: Date;
  bloodType: string;
  quantity: number;
}

interface RequestAnalytics {
  bloodType: string;
  count: number;
  avgResponseTime: number;
}

interface DonorDistribution {
  [bloodType: string]: number;
}

export const getInventoryTrends = async (hospitalId: string, days: number = 30): Promise<InventoryTrend[]> => {
  const logs = await Log.find({
    hospitalId,
    type: 'INVENTORY_UPDATE',
    timestamp: { $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) }
  });

  return logs.map((log: ILog) => ({
    date: log.timestamp,
    bloodType: log.bloodType,
    quantity: log.quantity
  }));
};

export const getRequestAnalytics = async (hospitalId: string, days: number = 30): Promise<RequestAnalytics[]> => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const hospital = await Hospital.findById(hospitalId);
  if (!hospital) throw new Error('Hospital not found');

  const requests = hospital.bloodRequests.filter(
    req => req.requestDate >= startDate
  );

  const fulfilledRequests = requests.filter(req => req.status === 'fulfilled');
  
  const fulfillmentTimes = fulfilledRequests.map(req => 
    req.fulfilledDate ? req.fulfilledDate.getTime() - req.requestDate.getTime() : 0
  );

  const averageFulfillmentTime = fulfillmentTimes.length > 0
    ? fulfillmentTimes.reduce((a, b) => a + b, 0) / fulfillmentTimes.length
    : 0;

  const requestsByBloodType = requests.reduce((acc, req) => {
    acc[req.bloodType] = (acc[req.bloodType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.keys(requestsByBloodType).map(bloodType => ({
    bloodType,
    count: requestsByBloodType[bloodType],
    avgResponseTime: averageFulfillmentTime
  }));
};

export const getDonorDistribution = async (hospitalId: string): Promise<DonorDistribution> => {
  const logs = await Log.find({
    hospitalId,
    type: 'REQUEST_FULFILLED'
  }).populate('donorId');  // Populate the donor reference to access its properties

  return logs.reduce((acc: DonorDistribution, log: ILog) => {
    const donor = log.donorId as any;  // Cast to any since we know it's populated
    if (donor?.bloodType) {
      acc[donor.bloodType] = (acc[donor.bloodType] || 0) + 1;
    }
    return acc;
  }, {});
};

export const getPeakDemandTimes = async (hospitalId: string): Promise<Record<string, number>> => {
  const requests = await Log.find({
    hospitalId,
    type: { $in: ['BLOOD_REQUEST', 'EMERGENCY_REQUEST'] }
  });

  return requests.reduce((acc, req) => {
    const hour = req.timestamp.getHours();
    acc[hour] = (acc[hour] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
};