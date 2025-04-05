import express from 'express';
import http from 'http';
import cors from 'cors';
import mongoose from 'mongoose';
import adminRoutes from './routes/admin';
import hospitalRoutes from './routes/hospital';
import donorRoutes from './routes/donor';
import notificationRoutes from './routes/notification';
import { WebSocketService } from './services/websocket';
import { InventoryMonitorService } from './services/inventoryMonitor';
import { initializeNotificationHelpers } from './utils/notificationHelpers';
import { deleteOldNotifications } from './controllers/notificationController';

const app = express();
const server = http.createServer(app);

// Initialize services
const wsService = new WebSocketService(server);
const inventoryMonitor = new InventoryMonitorService();

initializeNotificationHelpers(wsService);
inventoryMonitor.startMonitoring(30); // Check every 30 minutes

// Middlewares
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api/hospital', hospitalRoutes);
app.use('/api/donor', donorRoutes);
app.use('/api/notifications', notificationRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error'
  });
});

// Schedule cleanup of old notifications (run daily)
setInterval(deleteOldNotifications, 24 * 60 * 60 * 1000);

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/blood-donation')
  .then(() => {
    console.log('Connected to MongoDB');
    // Start server
    const PORT = process.env.PORT || 4000;
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });