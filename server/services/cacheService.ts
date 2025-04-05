import NodeCache from 'node-cache';

class CacheService {
  private static instance: CacheService;
  private cache: NodeCache;

  private constructor() {
    this.cache = new NodeCache({
      stdTTL: 300, // 5 minutes default TTL
      checkperiod: 600 // Check for expired keys every 10 minutes
    });
  }

  static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  // Cache inventory data with 1-minute TTL
  async getInventory(hospitalId: string): Promise<any> {
    const key = `inventory_${hospitalId}`;
    const cached = this.cache.get(key);
    if (cached) return cached;

    // If not in cache, this would be implemented to fetch from database
    return null;
  }

  setInventory(hospitalId: string, data: any): void {
    const key = `inventory_${hospitalId}`;
    this.cache.set(key, data, 60); // 1 minute TTL
  }

  // Cache donor search results with 5-minute TTL
  async getDonorSearch(searchParams: string): Promise<any> {
    const key = `donor_search_${searchParams}`;
    const cached = this.cache.get(key);
    if (cached) return cached;

    return null;
  }

  setDonorSearch(searchParams: string, results: any): void {
    const key = `donor_search_${searchParams}`;
    this.cache.set(key, results, 300); // 5 minutes TTL
  }

  // Cache statistics with 15-minute TTL
  async getStatistics(hospitalId: string): Promise<any> {
    const key = `stats_${hospitalId}`;
    const cached = this.cache.get(key);
    if (cached) return cached;

    return null;
  }

  setStatistics(hospitalId: string, data: any): void {
    const key = `stats_${hospitalId}`;
    this.cache.set(key, data, 900); // 15 minutes TTL
  }

  // Cache forecasts with 1-hour TTL
  async getForecast(hospitalId: string): Promise<any> {
    const key = `forecast_${hospitalId}`;
    const cached = this.cache.get(key);
    if (cached) return cached;

    return null;
  }

  setForecast(hospitalId: string, data: any): void {
    const key = `forecast_${hospitalId}`;
    this.cache.set(key, data, 3600); // 1 hour TTL
  }

  // Manual cache invalidation methods
  invalidateInventory(hospitalId: string): void {
    this.cache.del(`inventory_${hospitalId}`);
  }

  invalidateDonorSearch(searchParams: string): void {
    this.cache.del(`donor_search_${searchParams}`);
  }

  invalidateStatistics(hospitalId: string): void {
    this.cache.del(`stats_${hospitalId}`);
  }

  invalidateForecast(hospitalId: string): void {
    this.cache.del(`forecast_${hospitalId}`);
  }

  // Flush all cache
  flushAll(): void {
    this.cache.flushAll();
  }

  // Get cache statistics
  getStats(): NodeCache.Stats {
    return this.cache.getStats();
  }
}

export default CacheService;