const { AppError } = require('./errorHandler');

const validateBloodRequest = (req, res, next) => {
  const { bloodType, quantity, urgency } = req.body;
  
  if (!bloodType || !quantity || !urgency) {
    return next(new AppError('Missing required fields', 400));
  }

  const validBloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  if (!validBloodTypes.includes(bloodType)) {
    return next(new AppError('Invalid blood type', 400));
  }

  if (quantity < 1) {
    return next(new AppError('Quantity must be at least 1', 400));
  }

  const validUrgencyLevels = ['normal', 'urgent', 'emergency'];
  if (!validUrgencyLevels.includes(urgency)) {
    return next(new AppError('Invalid urgency level', 400));
  }

  next();
};

const validateDonationEvent = (req, res, next) => {
  const { date, location, capacity, bloodTypesNeeded } = req.body;

  if (!date || !location || !capacity || !bloodTypesNeeded) {
    return next(new AppError('Missing required fields', 400));
  }

  if (new Date(date) < new Date()) {
    return next(new AppError('Event date must be in the future', 400));
  }

  if (capacity < 1) {
    return next(new AppError('Capacity must be at least 1', 400));
  }

  if (!Array.isArray(bloodTypesNeeded) || bloodTypesNeeded.length === 0) {
    return next(new AppError('Blood types needed must be a non-empty array', 400));
  }

  next();
};

module.exports = {
  validateBloodRequest,
  validateDonationEvent
};