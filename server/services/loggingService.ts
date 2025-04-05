import mongoose, { Schema, Document } from 'mongoose';

export interface ILog extends Document {
  hospitalId: string;
  requestId?: string;
  action: string;
  bloodType: string;
  quantity: number;
  timestamp: Date;
  details?: any;
  donorId?: {
    bloodType: string;
    [key: string]: any;
  };
}

const logSchema = new Schema({
  type: {
    type: String,
    enum: ['INVENTORY_UPDATE', 'BLOOD_REQUEST', 'EMERGENCY_REQUEST', 'REQUEST_FULFILLED'],
    required: true
  },
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    required: true
  },
  bloodType: String,
  quantity: Number,
  previousQuantity: Number,
  urgency: String,
  requestId: mongoose.Schema.Types.ObjectId,
  donorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Donor'
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  details: mongoose.Schema.Types.Mixed
});

export const Log = mongoose.model<ILog>('Log', logSchema);

export const logInventoryUpdate = async (
  hospitalId: string,
  bloodType: string,
  previousQuantity: number,
  newQuantity: number
) => {
  return await Log.create({
    type: 'INVENTORY_UPDATE',
    hospitalId,
    bloodType,
    previousQuantity,
    quantity: newQuantity,
    details: { change: newQuantity - previousQuantity }
  });
};

export const logBloodRequest = async (
  hospitalId: string,
  requestId: string,
  bloodType: string,
  quantity: number,
  urgency: string
) => {
  return await Log.create({
    type: 'BLOOD_REQUEST',
    hospitalId,
    requestId,
    bloodType,
    quantity,
    urgency
  });
};

export const logEmergencyRequest = async (
  hospitalId: string,
  requestId: string,
  bloodType: string,
  quantity: number,
  notifiedDonors: number
) => {
  return await Log.create({
    type: 'EMERGENCY_REQUEST',
    hospitalId,
    requestId,
    bloodType,
    quantity,
    details: { notifiedDonors }
  });
};

export const logRequestFulfilled = async (
  hospitalId: string,
  requestId: string,
  donorId: string,
  bloodType: string,
  quantity: number
) => {
  return await Log.create({
    type: 'REQUEST_FULFILLED',
    hospitalId,
    requestId,
    donorId,
    bloodType,
    quantity
  });
};