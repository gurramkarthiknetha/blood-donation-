import { Document, Types } from 'mongoose';
import Donor from '../models/donor';

export interface BloodRequest extends Document {
  _id: Types.ObjectId;
  bloodType: string;
  quantity: number;
  urgency: 'low' | 'medium' | 'high';
  status: 'pending' | 'fulfilled' | 'cancelled';
  requestDate: Date;
  hospitalId: Types.ObjectId;
  fulfilledDate?: Date;
}

export const calculateUrgencyScore = (request: BloodRequest): number => {
  const urgencyWeights = {
    low: 1,
    medium: 2,
    high: 3
  };

  const timeElapsed = Date.now() - request.requestDate.getTime();
  const hoursElapsed = timeElapsed / (1000 * 60 * 60);
  
  return urgencyWeights[request.urgency] * (1 + hoursElapsed / 24);
};

export const notifyCompatibleDonors = async (request: BloodRequest) => {
  try {
    const compatibleDonors = await Donor.find({
      bloodType: request.bloodType,
      availability: true,
      lastDonationDate: { 
        $lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) 
      }
    });

    // In a real application, this would send actual notifications
    // For now, we'll just return the compatible donors
    return compatibleDonors;
  } catch (error) {
    console.error('Error notifying donors:', error);
    return [];
  }
};