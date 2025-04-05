import { Log } from './loggingService';

interface ForecastResult {
  bloodType: string;
  predictedDemand: number;
  confidence: number;
  nextWeek: DailyForecast[];
}

interface DailyForecast {
  date: Date;
  demand: number;
}

export const generateBloodDemandForecast = async (hospitalId: string): Promise<ForecastResult[]> => {
  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const forecasts: ForecastResult[] = [];

  for (const bloodType of bloodTypes) {
    const historicalData = await getHistoricalDemand(hospitalId, bloodType);
    const forecast = calculateForecast(historicalData);
    forecasts.push(forecast);
  }

  return forecasts;
};

const getHistoricalDemand = async (hospitalId: string, bloodType: string) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  return await Log.find({
    hospitalId,
    bloodType,
    type: { $in: ['BLOOD_REQUEST', 'EMERGENCY_REQUEST'] },
    timestamp: { $gte: thirtyDaysAgo }
  }).sort('timestamp');
};

const calculateForecast = (historicalData: any[]): ForecastResult => {
  const bloodType = historicalData[0]?.bloodType;
  const dailyDemand = aggregateDailyDemand(historicalData);
  
  // Simple moving average for demonstration
  // In production, use more sophisticated ML models
  const averageDemand = calculateMovingAverage(dailyDemand);
  const nextWeekForecast = generateNextWeekForecast(averageDemand);
  
  return {
    bloodType,
    predictedDemand: averageDemand,
    confidence: calculateConfidence(dailyDemand),
    nextWeek: nextWeekForecast
  };
};

const aggregateDailyDemand = (data: any[]): number[] => {
  const dailyMap = new Map<string, number>();
  
  data.forEach(request => {
    const date = request.timestamp.toISOString().split('T')[0];
    const current = dailyMap.get(date) || 0;
    dailyMap.set(date, current + request.quantity);
  });

  return Array.from(dailyMap.values());
};

const calculateMovingAverage = (data: number[]): number => {
  const sum = data.reduce((a, b) => a + b, 0);
  return data.length > 0 ? sum / data.length : 0;
};

const calculateConfidence = (data: number[]): number => {
  if (data.length < 2) return 0;
  
  const mean = data.reduce((a, b) => a + b, 0) / data.length;
  const variance = data.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (data.length - 1);
  const stdDev = Math.sqrt(variance);
  
  // Normalize confidence score between 0 and 1
  return 1 / (1 + stdDev / mean);
};

const generateNextWeekForecast = (averageDemand: number): DailyForecast[] => {
  const forecast: DailyForecast[] = [];
  const today = new Date();
  
  for (let i = 1; i <= 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    
    // Add some randomness to make it more realistic
    const variation = (Math.random() - 0.5) * 0.2; // ±10% variation
    const demand = averageDemand * (1 + variation);
    
    forecast.push({
      date,
      demand: Math.round(demand * 10) / 10 // Round to 1 decimal place
    });
  }
  
  return forecast;
};