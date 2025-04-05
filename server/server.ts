import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { handleDatabaseError, checkDatabaseConnection } from './middleware/databaseErrorHandler';
import { monitorPerformance } from './middleware/performanceMonitor';

// Routes
import donorRoutes from './routes/donorRoutes';
import hospitalRoutes from './routes/hospitalRoutes';
import adminRoutes from './routes/adminRoutes';
import donationEventRoutes from './routes/donationEventRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(monitorPerformance);
app.use(checkDatabaseConnection);

// Routes
app.use('/api/donors', donorRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/events', donationEventRoutes);

// Error handling
app.use(handleDatabaseError);

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/blood-donation')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});