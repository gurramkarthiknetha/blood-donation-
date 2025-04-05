import StorageManager from './storageManager';

interface TemperatureReading {
  locationId: string;
  timestamp: Date;
  temperature: number;
}

class TemperatureMonitor {
  private static instance: TemperatureMonitor;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private readings: Map<string, TemperatureReading[]> = new Map();
  private readonly CHECK_INTERVAL = 1000 * 60 * 5; // Check every 5 minutes
  private readonly MAX_READINGS = 288; // Store 24 hours worth of readings (288 * 5 minutes)

  private constructor() {}

  static getInstance(): TemperatureMonitor {
    if (!TemperatureMonitor.instance) {
      TemperatureMonitor.instance = new TemperatureMonitor();
    }
    return TemperatureMonitor.instance;
  }

  startMonitoring(): void {
    if (this.monitoringInterval) return;

    this.monitoringInterval = setInterval(
      () => this.checkTemperatures(),
      this.CHECK_INTERVAL
    );
  }

  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  private async checkTemperatures(): Promise<void> {
    const storageManager = StorageManager.getInstance();
    const issues = storageManager.validateStorageConditions();

    for (const { locationId, issues: locationIssues } of issues) {
      const temperatureIssue = locationIssues.find(i => i.includes('Temperature'));
      if (temperatureIssue) {
        this.recordTemperatureAlert(locationId, temperatureIssue);
      }
    }
  }

  private recordTemperatureAlert(locationId: string, issue: string): void {
    console.log(`Temperature alert for location ${locationId}: ${issue}`);
    // Here you would implement actual alert notification logic
  }

  recordReading(locationId: string, temperature: number): void {
    if (!this.readings.has(locationId)) {
      this.readings.set(locationId, []);
    }

    const locationReadings = this.readings.get(locationId)!;
    locationReadings.push({
      locationId,
      timestamp: new Date(),
      temperature
    });

    // Keep only the most recent readings
    if (locationReadings.length > this.MAX_READINGS) {
      locationReadings.shift();
    }
  }

  getReadings(locationId: string, hours: number = 24): TemperatureReading[] {
    const locationReadings = this.readings.get(locationId) || [];
    const cutoff = new Date();
    cutoff.setHours(cutoff.getHours() - hours);

    return locationReadings.filter(reading => reading.timestamp >= cutoff);
  }

  getTemperatureStats(locationId: string): {
    current: number;
    average24h: number;
    min24h: number;
    max24h: number;
    fluctuation24h: number;
  } {
    const readings = this.getReadings(locationId, 24);
    if (readings.length === 0) {
      return {
        current: 0,
        average24h: 0,
        min24h: 0,
        max24h: 0,
        fluctuation24h: 0
      };
    }

    const temperatures = readings.map(r => r.temperature);
    const current = temperatures[temperatures.length - 1];
    const min24h = Math.min(...temperatures);
    const max24h = Math.max(...temperatures);
    const average24h = temperatures.reduce((a, b) => a + b, 0) / temperatures.length;
    const fluctuation24h = max24h - min24h;

    return {
      current,
      average24h,
      min24h,
      max24h,
      fluctuation24h
    };
  }

  detectAnomalies(locationId: string): {
    hasAnomaly: boolean;
    details: string[];
  } {
    const stats = this.getTemperatureStats(locationId);
    const details: string[] = [];

    // Check for rapid temperature changes
    if (stats.fluctuation24h > 3) {
      details.push(`High temperature fluctuation: ${stats.fluctuation24h}°C in 24h`);
    }

    // Check for sustained deviation from average
    const recentReadings = this.getReadings(locationId, 1); // Last hour
    const recentAvg = recentReadings.reduce((a, b) => a + b.temperature, 0) / recentReadings.length;
    
    if (Math.abs(recentAvg - stats.average24h) > 2) {
      details.push(`Sustained temperature deviation: ${Math.abs(recentAvg - stats.average24h)}°C from 24h average`);
    }

    return {
      hasAnomaly: details.length > 0,
      details
    };
  }
}

export default TemperatureMonitor;