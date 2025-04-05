import { Types } from 'mongoose';
import Donor from '../models/donor';

export interface BloodRequest {
  _id?: Types.ObjectId;
  bloodType: string;
  quantity: number;
  urgency: 'low' | 'medium' | 'high';
  status: 'pending' | 'fulfilled' | 'cancelled';
  requestDate: Date;
  fulfilledDate?: Date;
  cancellationReason?: string;
  hospitalId: Types.ObjectId;
}

export const calculateUrgencyScore = (request: BloodRequest): number => {
  const urgencyMultiplier = {
    low: 1,
    medium: 2,
    high: 3
  };

  const waitingTime = Date.now() - request.requestDate.getTime();
  const waitingDays = waitingTime / (1000 * 60 * 60 * 24);
  
  return urgencyMultiplier[request.urgency] * (1 + waitingDays / 7);
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