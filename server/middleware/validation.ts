import { Request, Response, NextFunction } from 'express';
import { ApiError } from './errorHandler';
import { 
  RegisterHospitalRequest, 
  BloodInventoryUpdateRequest,
  BloodRequestCreate,
  DonorSearchRequest
} from '../types/requests';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const URGENCY_LEVELS = ['low', 'medium', 'high'];

export const validateHospitalRegistration = (req: Request, res: Response, next: NextFunction) => {
  const data = req.body as RegisterHospitalRequest;
  
  if (!data.email?.includes('@') || !data.email?.includes('.')) {
    throw new ApiError(400, 'Invalid email format');
  }

  if (!data.password || data.password.length < 8) {
    throw new ApiError(400, 'Password must be at least 8 characters');
  }

  if (!data.phoneNumber?.match(/^\+?[\d\s-]{10,}$/)) {
    throw new ApiError(400, 'Invalid phone number format');
  }

  if (!data.location?.coordinates || 
      data.location.coordinates.length !== 2 ||
      !isValidCoordinates(data.location.coordinates[0], data.location.coordinates[1])) {
    throw new ApiError(400, 'Invalid location coordinates');
  }

  next();
};

export const validateBloodInventoryUpdate = (req: Request, res: Response, next: NextFunction) => {
  const data = req.body as BloodInventoryUpdateRequest;
  
  if (!BLOOD_TYPES.includes(data.bloodType)) {
    throw new ApiError(400, 'Invalid blood type');
  }

  if (typeof data.quantity !== 'number' || data.quantity < 0) {
    throw new ApiError(400, 'Invalid quantity');
  }

  next();
};

export const validateBloodRequest = (req: Request, res: Response, next: NextFunction) => {
  const data = req.body as BloodRequestCreate;
  
  if (!data.hospitalId) {
    throw new ApiError(400, 'Hospital ID is required');
  }

  if (!BLOOD_TYPES.includes(data.bloodType)) {
    throw new ApiError(400, 'Invalid blood type');
  }

  if (typeof data.quantity !== 'number' || data.quantity <= 0) {
    throw new ApiError(400, 'Invalid quantity');
  }

  if (!URGENCY_LEVELS.includes(data.urgency)) {
    throw new ApiError(400, 'Invalid urgency level');
  }

  next();
};

export const validateDonorSearch = (req: Request, res: Response, next: NextFunction) => {
  const data = req.body as DonorSearchRequest;
  
  if (!BLOOD_TYPES.includes(data.bloodType)) {
    throw new ApiError(400, 'Invalid blood type');
  }

  if (!isValidCoordinates(data.longitude, data.latitude)) {
    throw new ApiError(400, 'Invalid coordinates');
  }

  if (data.maxDistance !== undefined && (
    typeof data.maxDistance !== 'number' || 
    data.maxDistance <= 0 || 
    data.maxDistance > 100
  )) {
    throw new ApiError(400, 'Invalid max distance (must be between 0 and 100 km)');
  }

  next();
};

const isValidCoordinates = (longitude: number, latitude: number): boolean => {
  return (
    typeof latitude === 'number' &&
    typeof longitude === 'number' &&
    latitude >= -90 && 
    latitude <= 90 &&
    longitude >= -180 && 
    longitude <= 180
  );
};