import mongoose, { Schema, Document } from 'mongoose';

const DonorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  bloodType: { type: String, required: true },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number]
  },
  lastDonationDate: Date,
  numberOfDonations: { type: Number, default: 0 },
  badges: [String],
  contactNumber: String,
  availability: { type: Boolean, default: true }
});

DonorSchema.index({ location: '2dsphere' });

export default mongoose.models.Donor || mongoose.model('Donor', DonorSchema);