import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { ApiError } from './errorHandler';
import ConnectionManager from '../services/connectionManager';

export const handleDatabaseError = (error: any, req: Request, res: Response, next: NextFunction) => {
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

    if (error.name === 'MongoServerError' && error.code === 11000) {
      return res.status(409).json({
        error: 'Duplicate Key Error',
        details: error.keyValue
      });
    }
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