import mongoose, { Schema } from 'mongoose';

const bloodInventorySchema = new Schema({
  bloodType: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    required: true
  },
  quantity: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now }
});

const BloodRequestSchema = new Schema({
  bloodType: { 
    type: String, 
    required: true,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  quantity: { type: Number, required: true },
  urgency: { 
    type: String, 
    required: true,
    enum: ['low', 'medium', 'high']
  },
  status: { 
    type: String, 
    required: true,
    enum: ['pending', 'fulfilled', 'cancelled'],
    default: 'pending'
  },
  requestDate: { type: Date, default: Date.now },
  fulfilledDate: { type: Date },
  hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true }
});

const hospitalSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  hospitalId: { type: String, required: true, unique: true },
  bloodInventory: [bloodInventorySchema],
  bloodRequests: [BloodRequestSchema],
  licenseNumber: { type: String, required: true, unique: true }
}, {
  timestamps: true
});

hospitalSchema.index({ location: '2dsphere' });
hospitalSchema.index({ hospitalId: 1 });

export default mongoose.model('Hospital', hospitalSchema);
