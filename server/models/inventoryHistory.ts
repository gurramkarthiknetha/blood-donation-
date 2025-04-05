import mongoose from 'mongoose';

const inventoryHistorySchema = new mongoose.Schema({
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    required: true
  },
  bloodType: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['received', 'used', 'updated'],
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  notes: String
});

export default mongoose.model('InventoryHistory', inventoryHistorySchema);