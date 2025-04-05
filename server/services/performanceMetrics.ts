export class PerformanceMetrics {
  private static instance: PerformanceMetrics;
  private metrics: Map<string, number[]> = new Map();
  private readonly maxSamples: number = 1000;

  private constructor() {}

  static getInstance(): PerformanceMetrics {
    if (!PerformanceMetrics.instance) {
      PerformanceMetrics.instance = new PerformanceMetrics();
    }
    return PerformanceMetrics.instance;
  }

  recordMetric(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    const samples = this.metrics.get(name)!;
    samples.push(value);

    // Keep only the most recent samples
    if (samples.length > this.maxSamples) {
      samples.shift();
    }
  }

  getMetricStats(name: string): {
    avg: number;
    min: number;
    max: number;
    p95: number;
    count: number;
  } {
    const samples = this.metrics.get(name) || [];
    if (samples.length === 0) {
      return {
        avg: 0,
        min: 0,
        max: 0,
        p95: 0,
        count: 0
      };
    }

    const sorted = [...samples].sort((a, b) => a - b);
    const p95Index = Math.floor(sorted.length * 0.95);

    return {
      avg: samples.reduce((a, b) => a + b, 0) / samples.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      p95: sorted[p95Index],
      count: samples.length
    };
  }

  clearMetrics(name?: string): void {
    if (name) {
      this.metrics.delete(name);
    } else {
      this.metrics.clear();
    }
  }

  getAllMetrics(): Record<string, { avg: number; p95: number; count: number }> {
    const result: Record<string, any> = {};
    
    for (const [name, _] of this.metrics) {
      result[name] = this.getMetricStats(name);
    }
    
    return result;
  }

  // Monitor specific database operations
  recordDatabaseOperation(operation: string, duration: number): void {
    this.recordMetric(`db_${operation}`, duration);
  }

  // Monitor API response times
  recordApiResponse(endpoint: string, duration: number): void {
    this.recordMetric(`api_${endpoint}`, duration);
  }

  // Monitor cache performance
  recordCacheOperation(operation: 'hit' | 'miss', duration: number): void {
    this.recordMetric(`cache_${operation}`, duration);
  }
}
