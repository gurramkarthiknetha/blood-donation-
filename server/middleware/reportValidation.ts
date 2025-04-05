import { Request, Response, NextFunction } from 'express';
import { ApiError } from './errorHandler';

export const validateReportSchedule = (req: Request, res: Response, next: NextFunction) => {
  const { frequency } = req.body;

  if (!frequency) {
    throw new ApiError(400, 'Report frequency is required');
  }

  if (!['daily', 'weekly', 'monthly'].includes(frequency)) {
    throw new ApiError(400, 'Invalid report frequency. Must be daily, weekly, or monthly');
  }

  next();
};