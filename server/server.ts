import express, { Request, Response, NextFunction } from 'express';
const app = express();
const path = require('path');
require('dotenv').config();
const mongoose = require('mongoose');
const cors = require('cors');

// Create uploads directory if it doesn't exist
const fs = require('fs');
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// Configure CORS
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400
}));

// Import routes
const donorRoutes = require('./routes/donor');
const hospitalRoutes = require('./routes/hospital');

interface ServerError extends Error {
  code?: string;
  status?: number;
}

const port = Number(process.env.PORT) || 4000;

// Function to start server
const startServer = async (initialPort: number) => {
  try {
    await mongoose.connect(process.env.DBURL);
    console.log("DB connected Successfully");

    const server = app.listen(initialPort, () => {
      console.log(`Server running on port ${initialPort}`);
    }).on('error', (err: ServerError) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`Port ${initialPort} is busy, trying ${initialPort + 1}`);
        startServer(initialPort + 1);
      } else {
        console.error('Server error:', err);
      }
    });
  } catch (e) {
    console.log("Error in connecting to DB: ", e);
  }
};

// body parser middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Use routes
app.use('/api/donor', donorRoutes);
app.use('/api/hospital', hospitalRoutes);

// Error handler
app.use((err: ServerError, req: Request, res: Response, next: NextFunction) => {
    console.error("Error occurred:", err);
    res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error'
    });
});

startServer(port);