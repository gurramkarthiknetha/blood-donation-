const mongoose = require('mongoose');

const bloodRequestSchema = new mongoose.Schema({
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    required: true
  },
  bloodType: {
    type: String,
    required: true,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  urgency: {
    type: String,
    required: true,
    enum: ['normal', 'urgent', 'emergency']
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'approved', 'rejected', 'fulfilled'],
    default: 'pending'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  rejectionReason: String,
  fulfillmentDate: Date
}, {
  timestamps: true
});

// Index for faster queries
bloodRequestSchema.index({ hospitalId: 1, status: 1 });
bloodRequestSchema.index({ status: 1, createdAt: -1 });

const BloodRequest = mongoose.model('BloodRequest', bloodRequestSchema);

module.exports = BloodRequest;