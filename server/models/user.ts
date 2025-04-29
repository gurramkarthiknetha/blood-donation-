import mongoose, { Document } from 'mongoose';
import bcrypt from 'bcrypt';

interface IUser extends Document {
  email: string;
  password?: string; // Optional for Clerk users
  clerkId?: string; // Clerk user ID
  role: 'donor' | 'hospital' | 'admin';
  fullName: string;
  phoneNumber: string;
  bloodGroup?: string;
  address: string;
  location?: {
    type: string;
    coordinates: number[];
  };
  lastDonationDate?: Date;
  totalDonations?: number;
  rewardPoints?: number;
}

const userSchema = new mongoose.Schema<IUser>({
  fullName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: function(this: IUser) {
      return !this.clerkId; // Password is required only for non-Clerk users
    }
  },
  clerkId: {
    type: String,
    sparse: true, // Allows null/undefined values
    unique: true
  },
  role: {
    type: String,
    enum: ['donor', 'hospital', 'admin'],
    required: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'],
    required: function(this: IUser) {
      return this.role === 'donor';
    }
  },
  address: {
    type: String,
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    }
  },
  lastDonationDate: {
    type: Date
  },
  totalDonations: {
    type: Number,
    default: 0
  },
  rewardPoints: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

export default mongoose.model<IUser>('User', userSchema);
