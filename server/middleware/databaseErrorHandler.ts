import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { ApiError } from './errorHandler';
import ConnectionManager from '../services/connectionManager';
import { MongoServerError } from 'mongodb';

export const handleDatabaseError = (error: Error, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof mongoose.Error) {
    // Handle specific mongoose errors
    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({
        error: 'Validation Error',
        details: Object.values(error.errors).map(err => err.message)
      });
    }

    if (error instanceof mongoose.Error.CastError) {
      return res.status(400).json({
        error: 'Invalid ID Format',
        details: error.message
      });
    }
  }

  // Handle duplicate key errors
  if (error instanceof MongoServerError && error.code === 11000) {
    return res.status(409).json({
      message: 'Duplicate entry found',
      details: (error as MongoServerError).keyValue
    });
  }

  // Check connection status for timeouts
  const connectionManager = ConnectionManager.getInstance();
  if (!connectionManager.getConnectionStatus()) {
    return res.status(503).json({
      error: 'Database Connection Error',
      details: 'Service temporarily unavailable'
    });
  }

  next(error);
};

export const checkDatabaseConnection = (req: Request, res: Response, next: NextFunction) => {
  const connectionManager = ConnectionManager.getInstance();
  if (!connectionManager.getConnectionStatus()) {
    throw new ApiError(503, 'Database connection is not available');
  }
  next();
};