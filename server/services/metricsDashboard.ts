import { PerformanceMetrics } from './performanceMetrics';
import CacheService from './cacheService';
import ConnectionManager from './connectionManager';
import { type Stats } from 'fs';

interface SystemMetrics {
  api: {
    responseTime: {
      avg: number;
      p95: number;
      totalRequests: number;
    };
    activeEndpoints: string[];
  };
  cache: {
    hitRate: number;
    missRate: number;
    size: number;
    keys: number;
  };
  database: {
    connectionPool: {
      active: number;
      available: number;
      pending: number;
    };
    operations: {
      reads: { avg: number; p95: number };
      writes: { avg: number; p95: number };
    };
  };
  memory: {
    used: number;
    total: number;
    heapUsed: number;
  };
}

class MetricsDashboard {
  private static instance: MetricsDashboard;
  private updateInterval: NodeJS.Timeout | null = null;
  private readonly UPDATE_INTERVAL = 10000; // 10 seconds

  private constructor() {}

  static getInstance(): MetricsDashboard {
    if (!MetricsDashboard.instance) {
      MetricsDashboard.instance = new MetricsDashboard();
    }
    return MetricsDashboard.instance;
  }

  startMonitoring(): void {
    if (this.updateInterval) return;
    
    this.updateInterval = setInterval(() => {
      this.collectMetrics();
    }, this.UPDATE_INTERVAL);
  }

  stopMonitoring(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  async collectMetrics(): Promise<SystemMetrics> {
    const performanceMetrics = PerformanceMetrics.getInstance();
    const cacheService = CacheService.getInstance();
    const connectionManager = ConnectionManager.getInstance();
    const cacheStats = this.getCacheStats();

    // Get memory usage
    const memoryUsage = process.memoryUsage();

    // Get API metrics
    const apiMetrics = Object.entries(performanceMetrics.getAllMetrics())
      .filter(([key]) => key.startsWith('api_'))
      .reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {} as Record<string, any>);

    // Calculate aggregated metrics
    const totalRequests = Object.values(apiMetrics).reduce((sum, metric) => sum + metric.count, 0);
    const avgResponseTime = Object.values(apiMetrics).reduce((sum, metric) => sum + metric.avg, 0) / Object.keys(apiMetrics).length;
    const p95ResponseTime = Math.max(...Object.values(apiMetrics).map(metric => metric.p95));

    // Get database operation metrics
    const dbMetrics = Object.entries(performanceMetrics.getAllMetrics())
      .filter(([key]) => key.startsWith('db_'))
      .reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {} as Record<string, any>);

    return {
      api: {
        responseTime: {
          avg: avgResponseTime,
          p95: p95ResponseTime,
          totalRequests
        },
        activeEndpoints: Object.keys(apiMetrics)
      },
      cache: {
        hitRate: cacheStats.hits / (cacheStats.hits + cacheStats.misses) * 100,
        missRate: cacheStats.misses / (cacheStats.hits + cacheStats.misses) * 100,
        size: cacheStats.ksize || 0, // Use ksize instead of size
        keys: cacheStats.keys
      },
      database: {
        connectionPool: {
          active: connectionManager.getActiveConnections(),
          available: 10 - connectionManager.getActiveConnections(), // Assuming max pool size of 10
          pending: 0 // This would need to be tracked separately
        },
        operations: {
          reads: {
            avg: this.calculateAvgDbMetric(dbMetrics, 'read'),
            p95: this.calculateP95DbMetric(dbMetrics, 'read')
          },
          writes: {
            avg: this.calculateAvgDbMetric(dbMetrics, 'write'),
            p95: this.calculateP95DbMetric(dbMetrics, 'write')
          }
        }
      },
      memory: {
        used: memoryUsage.rss,
        total: memoryUsage.heapTotal,
        heapUsed: memoryUsage.heapUsed
      }
    };
  }

  private calculateAvgDbMetric(metrics: Record<string, any>, type: string): number {
    const relevantMetrics = Object.entries(metrics)
      .filter(([key]) => key.includes(type));
    if (relevantMetrics.length === 0) return 0;
    
    return relevantMetrics.reduce((sum, [_, value]) => sum + value.avg, 0) / relevantMetrics.length;
  }

  private calculateP95DbMetric(metrics: Record<string, any>, type: string): number {
    const relevantMetrics = Object.entries(metrics)
      .filter(([key]) => key.includes(type))
      .map(([_, value]) => value.p95);
    if (relevantMetrics.length === 0) return 0;
    
    return Math.max(...relevantMetrics);
  }

  private getCacheStats(): any {
    const cacheService = CacheService.getInstance();
    const cacheStats = cacheService.getStats();
    return {
      hits: cacheStats.hits,
      misses: cacheStats.misses,
      size: cacheStats.ksize || 0, // Use ksize instead of size
      keys: cacheStats.keys
    };
  }
}

export default MetricsDashboard;