import mongoose, { Document } from 'mongoose';

export interface IDonation extends Document {
  donorId: mongoose.Types.ObjectId;
  hospitalId?: mongoose.Types.ObjectId;
  bloodGroup: string;
  units: number;
  donationDate: Date;
  location: string;
  status: 'pending' | 'completed' | 'rejected';
  certificateUrl?: string;
}

const donationSchema = new mongoose.Schema<IDonation>({
  donorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    required: true
  },
  units: {
    type: Number,
    required: true,
    default: 1
  },
  donationDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  location: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'rejected'],
    default: 'completed'
  },
  certificateUrl: {
    type: String
  }
}, { timestamps: true });

export default mongoose.model<IDonation>('Donation', donationSchema);
