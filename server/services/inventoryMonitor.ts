import Hospital from '../models/hospital';
import { sendLowInventoryNotification } from '../utils/notificationHelpers';

const LOW_THRESHOLD = 10; // Units of blood considered low

export class InventoryMonitorService {
  async checkInventoryLevels() {
    try {
      const hospitals = await Hospital.find({});
      
      for (const hospital of hospitals) {
        if (!hospital.bloodInventory) continue;

        for (const stock of hospital.bloodInventory) {
          if (stock.quantity <= LOW_THRESHOLD) {
            await sendLowInventoryNotification(
              hospital._id,
              stock.bloodType,
              stock.quantity
            );
          }
        }
      }
    } catch (error) {
      console.error('Error monitoring inventory levels:', error);
    }
  }

  startMonitoring(intervalMinutes = 60) {
    // Check inventory levels periodically
    setInterval(() => this.checkInventoryLevels(), intervalMinutes * 60 * 1000);
    
    // Initial check
    this.checkInventoryLevels();
  }
}