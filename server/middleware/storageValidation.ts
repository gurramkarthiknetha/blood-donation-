import { Request, Response, NextFunction } from 'express';
import { ApiError } from './errorHandler';

export const validateStorageLocation = (req: Request, res: Response, next: NextFunction) => {
  const { id, name, type, temperature, capacity } = req.body;

  if (!id || !name || !type || temperature === undefined || !capacity) {
    throw new ApiError(400, 'Missing required storage location fields');
  }

  if (!['refrigerator', 'freezer'].includes(type)) {
    throw new ApiError(400, 'Invalid storage type');
  }

  if (typeof temperature !== 'number') {
    throw new ApiError(400, 'Temperature must be a number');
  }

  if (typeof capacity !== 'number' || capacity <= 0) {
    throw new ApiError(400, 'Capacity must be a positive number');
  }

  next();
};

export const validateUnitMove = (req: Request, res: Response, next: NextFunction) => {
  const { unitId, fromLocationId, toLocationId } = req.body;

  if (!unitId || !fromLocationId || !toLocationId) {
    throw new ApiError(400, 'Missing required fields for unit move');
  }

  if (fromLocationId === toLocationId) {
    throw new ApiError(400, 'Source and destination locations must be different');
  }

  next();
};