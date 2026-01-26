/**
 * Simple In-Memory Cache Utility
 * For caching frequently accessed analytics and inventory stats
 * TTL (Time To Live) reduces stale data while improving performance
 * 
 * Production: Consider using Redis instead for distributed caching
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class Cache {
  private store: Map<string, CacheEntry<any>> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Run cleanup every 5 minutes
    this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  /**
   * Get value from cache if not expired
   */
  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if expired
    const age = Date.now() - entry.timestamp;
    if (age > entry.ttl) {
      this.store.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Set value in cache with TTL in milliseconds
   */
  set<T>(key: string, data: T, ttlMs: number): void {
    this.store.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
    });
  }

  /**
   * Invalidate cache entry
   */
  invalidate(key: string): void {
    this.store.delete(key);
  }

  /**
   * Invalidate all cache entries matching pattern
   */
  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    for (const key of this.store.keys()) {
      if (regex.test(key)) {
        this.store.delete(key);
      }
    }
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.store.clear();
  }

  /**
   * Remove expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.store.delete(key);
      }
    }
  }

  /**
   * Stop cleanup interval (for testing/shutdown)
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * Get cache statistics
   */
  stats(): { size: number; keys: string[] } {
    return {
      size: this.store.size,
      keys: Array.from(this.store.keys()),
    };
  }
}

// Create singleton instance
export const cache = new Cache();

// Cache key patterns
export const CACHE_KEYS = {
  INVENTORY_STATS: "inventory:stats",
  DASHBOARD_STATS: "analytics:dashboard",
  SALES_TREND: "analytics:sales-trend",
  TOP_PRODUCTS: "analytics:top-products",
  REVENUE_BY_CATEGORY: "analytics:revenue-by-category",
  LOW_STOCK_ITEMS: "inventory:low-stock",
  USER_CART: (userId: string) => `cart:${userId}`,
};

// Cache TTLs (in milliseconds)
export const CACHE_TTL = {
  INVENTORY_STATS: 5 * 60 * 1000, // 5 minutes
  DASHBOARD_STATS: 10 * 60 * 1000, // 10 minutes
  SALES_TREND: 30 * 60 * 1000, // 30 minutes
  TOP_PRODUCTS: 1 * 60 * 60 * 1000, // 1 hour
  REVENUE_BY_CATEGORY: 30 * 60 * 1000, // 30 minutes
  LOW_STOCK_ITEMS: 5 * 60 * 1000, // 5 minutes
  USER_CART: 5 * 60 * 1000, // 5 minutes
};

export default cache;
