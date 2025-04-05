import { Request, Response, NextFunction } from 'express';
import { PerformanceMetrics } from '../services/performanceMetrics';

export const monitorPerformance = (req: Request, res: Response, next: NextFunction) => {
  const startTime = process.hrtime();
  const metrics = PerformanceMetrics.getInstance();

  // Add listener for when response finishes
  res.on('finish', () => {
    const [seconds, nanoseconds] = process.hrtime(startTime);
    const duration = seconds * 1000 + nanoseconds / 1000000; // Convert to milliseconds
    
    const endpoint = `${req.method}_${req.baseUrl}${req.path}`;
    metrics.recordApiResponse(endpoint, duration);
  });

  next();
};

export const getPerformanceStats = (req: Request, res: Response) => {
  const metrics = PerformanceMetrics.getInstance();
  res.json(metrics.getAllMetrics());
};