export interface BloodUnit {
  unitId: string;
  bloodType: string;
  donationDate: Date;
  expirationDate: Date;
  donorId: string;
  status: 'available' | 'reserved' | 'used' | 'expired';
  hospitalId: string;
}

const EXPIRATION_DAYS = {
  'red_cells': 42,    // Red blood cells
  'plasma': 365,      // Frozen plasma
  'platelets': 5      // Platelets
};

export const calculateExpirationDate = (
  donationDate: Date,
  componentType: keyof typeof EXPIRATION_DAYS
): Date => {
  const expirationDate = new Date(donationDate);
  expirationDate.setDate(expirationDate.getDate() + EXPIRATION_DAYS[componentType]);
  return expirationDate;
};

export const generateUnitId = (
  bloodType: string,
  donorId: string,
  timestamp: number
): string => {
  return `${bloodType}-${donorId.substr(-6)}-${timestamp}`;
};

export const isUnitExpired = (expirationDate: Date): boolean => {
  return new Date() > expirationDate;
};

export const calculateShelfLife = (expirationDate: Date): number => {
  const now = new Date();
  const timeLeft = expirationDate.getTime() - now.getTime();
  return Math.max(0, Math.ceil(timeLeft / (1000 * 60 * 60 * 24))); // Days remaining
};

export const shouldRotateUnit = (unit: BloodUnit): boolean => {
  const daysLeft = calculateShelfLife(unit.expirationDate);
  // Rotate if less than 7 days remaining and unit is still available
  return daysLeft <= 7 && unit.status === 'available';
};

export const sortUnitsByFIFO = (units: BloodUnit[]): BloodUnit[] => {
  return [...units].sort((a, b) => a.donationDate.getTime() - b.donationDate.getTime());
};