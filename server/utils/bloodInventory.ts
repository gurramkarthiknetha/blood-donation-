import Hospital from '../models/hospital';

export const checkLowInventory = async (hospitalId: string) => {
  const threshold = 10; // Units
  const hospital = await Hospital.findById(hospitalId);
  
  if (!hospital) return null;
  
  const lowInventory = hospital.bloodInventory.filter(item => item.quantity < threshold);
  return lowInventory;
};

export const findCompatibleDonors = (bloodType: string): string[] => {
  const compatibilityChart = {
    'A+': ['A+', 'A-', 'O+', 'O-'],
    'A-': ['A-', 'O-'],
    'B+': ['B+', 'B-', 'O+', 'O-'],
    'B-': ['B-', 'O-'],
    'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    'AB-': ['A-', 'B-', 'AB-', 'O-'],
    'O+': ['O+', 'O-'],
    'O-': ['O-']
  };
  
  return compatibilityChart[bloodType] || [];
};

export const calculateUrgencyScore = (request: any): number => {
  const urgencyWeights = {
    'high': 3,
    'medium': 2,
    'low': 1
  };
  
  const timeSinceRequest = Date.now() - request.requestDate.getTime();
  const daysElapsed = timeSinceRequest / (1000 * 60 * 60 * 24);
  
  return urgencyWeights[request.urgency] * (1 + daysElapsed/7);
};