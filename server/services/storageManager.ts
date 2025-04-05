import { BloodUnit } from '../utils/bloodUnitTracker';

interface StorageLocation {
  id: string;
  name: string;
  type: 'refrigerator' | 'freezer';
  temperature: number;
  capacity: number;
  currentUnits: BloodUnit[];
}

class StorageManager {
  private static instance: StorageManager;
  private storageLocations: Map<string, StorageLocation> = new Map();

  private constructor() {}

  static getInstance(): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager();
    }
    return StorageManager.instance;
  }

  addStorageLocation(location: StorageLocation): void {
    if (this.storageLocations.has(location.id)) {
      throw new Error('Storage location already exists');
    }
    this.storageLocations.set(location.id, location);
  }

  removeStorageLocation(locationId: string): void {
    const location = this.storageLocations.get(locationId);
    if (!location) {
      throw new Error('Storage location not found');
    }
    if (location.currentUnits.length > 0) {
      throw new Error('Cannot remove location with stored units');
    }
    this.storageLocations.delete(locationId);
  }

  addUnit(locationId: string, unit: BloodUnit): void {
    const location = this.storageLocations.get(locationId);
    if (!location) {
      throw new Error('Storage location not found');
    }
    if (location.currentUnits.length >= location.capacity) {
      throw new Error('Storage location is at capacity');
    }
    location.currentUnits.push(unit);
  }

  removeUnit(locationId: string, unitId: string): BloodUnit {
    const location = this.storageLocations.get(locationId);
    if (!location) {
      throw new Error('Storage location not found');
    }
    
    const unitIndex = location.currentUnits.findIndex(u => u.unitId === unitId);
    if (unitIndex === -1) {
      throw new Error('Unit not found in location');
    }
    
    return location.currentUnits.splice(unitIndex, 1)[0];
  }

  findUnit(unitId: string): { unit: BloodUnit; location: StorageLocation } | null {
    for (const location of this.storageLocations.values()) {
      const unit = location.currentUnits.find(u => u.unitId === unitId);
      if (unit) {
        return { unit, location };
      }
    }
    return null;
  }

  getAvailableCapacity(locationId: string): number {
    const location = this.storageLocations.get(locationId);
    if (!location) {
      throw new Error('Storage location not found');
    }
    return location.capacity - location.currentUnits.length;
  }

  getUnitsNearingExpiration(daysThreshold: number = 7): BloodUnit[] {
    const expiringUnits: BloodUnit[] = [];
    const now = new Date();
    
    for (const location of this.storageLocations.values()) {
      location.currentUnits.forEach(unit => {
        const daysUntilExpiration = Math.ceil(
          (unit.expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysUntilExpiration <= daysThreshold) {
          expiringUnits.push(unit);
        }
      });
    }
    
    return expiringUnits.sort((a, b) => 
      a.expirationDate.getTime() - b.expirationDate.getTime()
    );
  }

  validateStorageConditions(): { 
    locationId: string; 
    issues: string[] 
  }[] {
    const issues: { locationId: string; issues: string[] }[] = [];
    
    for (const [id, location] of this.storageLocations) {
      const locationIssues: string[] = [];
      
      // Check temperature ranges
      if (location.type === 'refrigerator' && 
          (location.temperature < 2 || location.temperature > 6)) {
        locationIssues.push(`Temperature out of range: ${location.temperature}°C`);
      }
      
      if (location.type === 'freezer' && location.temperature > -18) {
        locationIssues.push(`Freezer temperature too high: ${location.temperature}°C`);
      }
      
      // Check capacity
      if (location.currentUnits.length > location.capacity) {
        locationIssues.push('Storage location over capacity');
      }
      
      if (locationIssues.length > 0) {
        issues.push({ locationId: id, issues: locationIssues });
      }
    }
    
    return issues;
  }
}

export default StorageManager;