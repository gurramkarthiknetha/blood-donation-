import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import adminRoutes from './routes/adminRoutes';
import hospitalRoutes from './routes/hospitalRoutes';
import donorRoutes from './routes/donorRoutes';
import donationEventRoutes from './routes/donationEventRoutes';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/blood-donation')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/donors', donorRoutes);
app.use('/api/events', donationEventRoutes);

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});