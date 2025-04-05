const mongoose = require('mongoose');

const donationEventSchema = new mongoose.Schema({
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 1
  },
  bloodTypesNeeded: [{
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  }],
  registeredDonors: [{
    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Donor'
    },
    bloodType: String,
    status: {
      type: String,
      enum: ['registered', 'checked-in', 'donated', 'no-show'],
      default: 'registered'
    }
  }],
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming'
  }
}, {
  timestamps: true
});

donationEventSchema.index({ date: 1, status: 1 });
donationEventSchema.index({ hospitalId: 1, status: 1 });

const DonationEvent = mongoose.model('DonationEvent', donationEventSchema);

module.exports = DonationEvent;