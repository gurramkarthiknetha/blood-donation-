import Hospital from '../models/hospital';
import Donor from '../models/donors';
import { checkLowInventory, findCompatibleDonors } from '../utils/bloodInventory';

export const sendLowInventoryAlert = async (hospitalId: string) => {
  const lowInventory = await checkLowInventory(hospitalId);
  if (!lowInventory || lowInventory.length === 0) return;

  // Here you would implement actual notification sending
  // This is a placeholder for email/SMS notification logic
  console.log(`Low inventory alert for hospital ${hospitalId}:`, lowInventory);
};

export const notifyCompatibleDonors = async (bloodRequest: any, maxDistance: number = 50) => {
  const hospital = await Hospital.findById(bloodRequest.hospitalId);
  if (!hospital) return;

  const compatibleBloodTypes = findCompatibleDonors(bloodRequest.bloodType);
  
  const eligibleDonors = await Donor.find({
    bloodType: { $in: compatibleBloodTypes },
    lastDonationDate: { 
      $lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) 
    },
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: hospital.location.coordinates
        },
        $maxDistance: maxDistance * 1000
      }
    }
  });

  // Here you would implement actual donor notification logic
  // This is a placeholder for email/SMS notification logic
  console.log(`Found ${eligibleDonors.length} eligible donors for blood request`);
  
  return eligibleDonors.map(donor => ({
    donorId: donor._id,
    distance: calculateDistance(
      donor.location.coordinates,
      hospital.location.coordinates
    )
  }));
};

const calculateDistance = (coord1: number[], coord2: number[]): number => {
  // Simple Haversine formula implementation
  const [lon1, lat1] = coord1;
  const [lon2, lat2] = coord2;
  const R = 6371; // Earth's radius in km

  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};