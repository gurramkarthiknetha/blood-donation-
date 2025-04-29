import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server } from 'socket.io';
import userRoutes from './api/users';
import profileRoutes from './api/profile';
import eventRoutes from './api/events';
import rewardRoutes from './api/rewards';

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'clerk-token', 'clerk-user-id', 'clerk-user-email', 'clerk-user-name']
}));

app.use(express.json());
app.use(cookieParser());

// API Routes
app.use('/api', userRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/rewards', rewardRoutes);

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  // Only send response if headers haven't been sent yet
  if (!res.headersSent) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// MongoDB connection
// Use MongoDB Atlas or fallback to local MongoDB
const MONGODB_URI = 'mongodb+srv://blood-donation-user:blood-donation-password@cluster0.mongodb.net/blood-donation?retryWrites=true&w=majority';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch((err) => {
    console.error('MongoDB Atlas connection error:', err);
    console.log('Trying to connect to local MongoDB...');

    // Fallback to local MongoDB
    mongoose.connect('mongodb://localhost:27017/blood-donation')
      .then(() => console.log('Connected to local MongoDB'))
      .catch((localErr) => console.error('Local MongoDB connection error:', localErr));
  });

// Create HTTP server
const httpServer = createServer(app);

// Initialize Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'clerk-token', 'clerk-user-id', 'clerk-user-email', 'clerk-user-name']
  }
});

// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Authenticate socket connection
  const token = socket.handshake.auth.token;
  if (token) {
    // You can verify the token here
    // For now, we'll just log it
    console.log('Client authenticated with token');
  }

  // Handle events
  socket.on('join-room', (room) => {
    socket.join(room);
    console.log(`Socket ${socket.id} joined room: ${room}`);
  });

  socket.on('leave-room', (room) => {
    socket.leave(room);
    console.log(`Socket ${socket.id} left room: ${room}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Start the server
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
