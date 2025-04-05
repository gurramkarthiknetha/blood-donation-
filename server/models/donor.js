import mongoose from 'mongoose';

const donorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  bloodGroup: { type: String, required: true },
  lastDonation: Date,
  donations: [{
    date: Date,
    hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital' },
    bloodGroup: String
  }]
}, { timestamps: true });

export default mongoose.model('Donor', donorSchema);