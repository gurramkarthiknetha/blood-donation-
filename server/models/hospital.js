import mongoose from 'mongoose';

const hospitalSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  address: { type: String, required: true },
  inventory: [{
    bloodGroup: String,
    quantity: Number
  }],
  requests: [{
    bloodGroup: String,
    quantity: Number,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    requestDate: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

export default mongoose.model('Hospital', hospitalSchema);