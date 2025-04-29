import mongoose, { Document } from 'mongoose';

export interface IEvent extends Document {
  name: string;
  location: string;
  date: Date;
  startTime: string;
  endTime: string;
  capacity: number;
  bloodTypesNeeded: string[];
  organizer: mongoose.Types.ObjectId;
  registrations: Array<{
    donorId: mongoose.Types.ObjectId;
    bloodType: string;
    registrationDate: Date;
    status: 'registered' | 'attended' | 'cancelled';
  }>;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
}

const eventSchema = new mongoose.Schema<IEvent>({
  name: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  capacity: {
    type: Number,
    required: true,
    default: 50
  },
  bloodTypesNeeded: {
    type: [String],
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    required: true
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  registrations: [{
    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    bloodType: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      required: true
    },
    registrationDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['registered', 'attended', 'cancelled'],
      default: 'registered'
    }
  }],
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming'
  }
}, { timestamps: true });

export default mongoose.model<IEvent>('Event', eventSchema);
