import mongoose, { Document } from 'mongoose';

export interface IRedemption extends Document {
  userId: mongoose.Types.ObjectId;
  rewardId: mongoose.Types.ObjectId;
  pointsSpent: number;
  redeemedAt: Date;
  status: 'pending' | 'fulfilled' | 'cancelled';
  deliveryDetails?: {
    address?: string;
    email?: string;
    phone?: string;
  };
}

const redemptionSchema = new mongoose.Schema<IRedemption>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rewardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reward',
    required: true
  },
  pointsSpent: {
    type: Number,
    required: true,
    min: 1
  },
  redeemedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'fulfilled', 'cancelled'],
    default: 'pending'
  },
  deliveryDetails: {
    address: String,
    email: String,
    phone: String
  }
}, { timestamps: true });

export default mongoose.model<IRedemption>('Redemption', redemptionSchema);
