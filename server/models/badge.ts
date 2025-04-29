import mongoose, { Document } from 'mongoose';

export interface IBadge extends Document {
  name: string;
  description: string;
  icon: string;
  criteria: {
    type: 'donations' | 'points' | 'level' | 'streak';
    threshold: number;
  };
  backgroundColor: string;
}

const badgeSchema = new mongoose.Schema<IBadge>({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  criteria: {
    type: {
      type: String,
      enum: ['donations', 'points', 'level', 'streak'],
      required: true
    },
    threshold: {
      type: Number,
      required: true,
      min: 1
    }
  },
  backgroundColor: {
    type: String,
    default: '#f0f0f0'
  }
}, { timestamps: true });

export default mongoose.model<IBadge>('Badge', badgeSchema);
