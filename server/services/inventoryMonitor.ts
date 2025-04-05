import Hospital from '../models/hospital';

export class InventoryMonitor {
  private static instance: InventoryMonitor;
  private constructor() {}

  static getInstance(): InventoryMonitor {
    if (!InventoryMonitor.instance) {
      InventoryMonitor.instance = new InventoryMonitor();
    }
    return InventoryMonitor.instance;
  }

  async checkBloodAvailability(bloodType: string, quantity: number): Promise<boolean> {
    try {
      const hospitals = await Hospital.find({
        'bloodInventory.bloodType': bloodType,
        'bloodInventory.quantity': { $gte: quantity }
      });
      return hospitals.length > 0;
    } catch (error) {
      console.error('Error checking blood availability:', error);
      return false;
    }
  }

  async findHospitalsWithBlood(bloodType: string, quantity: number) {
    try {
      return await Hospital.find({
        'bloodInventory.bloodType': bloodType,
        'bloodInventory.quantity': { $gte: quantity }
      }).select('name location bloodInventory');
    } catch (error) {
      console.error('Error finding hospitals with blood:', error);
      return [];
    }
  }

  async updateInventory(hospitalId: string, bloodType: string, quantity: number, isAddition: boolean = true) {
    try {
      const updateQuery = isAddition 
        ? { $inc: { 'bloodInventory.$.quantity': quantity } }
        : { $inc: { 'bloodInventory.$.quantity': -quantity } };

      return await Hospital.findOneAndUpdate(
        { 
          _id: hospitalId, 
          'bloodInventory.bloodType': bloodType,
          'bloodInventory.quantity': { $gte: isAddition ? 0 : quantity }
        },
        updateQuery,
        { new: true }
      );
    } catch (error) {
      console.error('Error updating inventory:', error);
      return null;
    }
  }

  async performManualCheck(hospitalId: string) {
    try {
      const hospital = await Hospital.findById(hospitalId);
      if (!hospital) {
        throw new Error('Hospital not found');
      }

      const issues = [];
      const LOW_THRESHOLD = 10;

      for (const stock of hospital.bloodInventory) {
        if (stock.quantity <= LOW_THRESHOLD) {
          issues.push({
            bloodType: stock.bloodType,
            quantity: stock.quantity,
            status: 'low'
          });
        }
      }

      return {
        timestamp: new Date(),
        hospitalId,
        issues,
        totalTypes: hospital.bloodInventory.length,
        lowStockCount: issues.length
      };
    } catch (error) {
      console.error('Error performing manual inventory check:', error);
      throw error;
    }
  }

  startMonitoring(intervalMinutes = 60) {
    setInterval(() => this.checkInventoryLevels(), intervalMinutes * 60 * 1000);
    this.checkInventoryLevels();
  }

  private async checkInventoryLevels() {
    try {
      const hospitals = await Hospital.find({});
      const LOW_THRESHOLD = 10;

      for (const hospital of hospitals) {
        if (!hospital.bloodInventory) continue;

        for (const stock of hospital.bloodInventory) {
          if (stock.quantity <= LOW_THRESHOLD) {
            // Implement notification logic here
            console.log(`Low inventory alert for ${hospital.name}: ${stock.bloodType}`);
          }
        }
      }
    } catch (error) {
      console.error('Error monitoring inventory levels:', error);
    }
  }
}