// lib/cache-debug.ts
// Debug utility to monitor cache performance

interface CacheStats {
  endpoint: string;
  hitCount: number;
  missCount: number;
  lastAccessed: number;
  avgResponseTime: number;
}

class CacheDebugger {
  private stats = new Map<string, CacheStats>();
  private requestTimes = new Map<string, number>();
  
  logCacheHit(endpoint: string) {
    // Completely disabled for cleaner console
    return;
  }
  
  logCacheMiss(endpoint: string) {
    // Completely disabled for cleaner console  
    return;
  }
  
  logRequestComplete(endpoint: string) {
    // Completely disabled for cleaner console
    return;
  }
  
  private getOrCreateStats(endpoint: string): CacheStats {
    return this.stats.get(endpoint) || {
      endpoint,
      hitCount: 0,
      missCount: 0,
      lastAccessed: 0,
      avgResponseTime: 0
    };
  }
  
  private updateStats(endpoint: string, stats: CacheStats) {
    this.stats.set(endpoint, stats);
  }
  
  getStats(): CacheStats[] {
    return Array.from(this.stats.values());
  }
  
  getCacheEfficiency(): number {
    return 0;
  }
  
  printSummary() {
    // Completely disabled for cleaner console
    return;
  }
}

export const cacheDebugger = new CacheDebugger();

// Auto-print summary disabled for cleaner console
// if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
//   setInterval(() => {
//     cacheDebugger.printSummary();
//   }, 30000);
// }