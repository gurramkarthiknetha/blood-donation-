import mongoose, { Document } from 'mongoose';

export interface IReward extends Document {
  name: string;
  description: string;
  pointsCost: number;
  available: boolean;
  imageUrl?: string;
  category: 'voucher' | 'merchandise' | 'service' | 'other';
  expiryDate?: Date;
}

const rewardSchema = new mongoose.Schema<IReward>({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  pointsCost: {
    type: Number,
    required: true,
    min: 1
  },
  available: {
    type: Boolean,
    default: true
  },
  imageUrl: {
    type: String
  },
  category: {
    type: String,
    enum: ['voucher', 'merchandise', 'service', 'other'],
    default: 'voucher'
  },
  expiryDate: {
    type: Date
  }
}, { timestamps: true });

export default mongoose.model<IReward>('Reward', rewardSchema);
