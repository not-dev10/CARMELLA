/**
 * Client-side caching utility for localStorage
 * Reduces API calls and improves performance
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class CacheManager {
  private prefix = 'carmella_cache_';

  /**
   * Get cached data if valid
   */
  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(this.prefix + key);
      if (!item) return null;

      const entry: CacheEntry<T> = JSON.parse(item);
      const now = Date.now();
      const age = now - entry.timestamp;

      // Check if cache is still valid
      if (age > entry.ttl) {
        localStorage.removeItem(this.prefix + key);
        return null;
      }

      return entry.data;
    } catch (error) {
      console.error('[CACHE] Error reading cache:', error);
      return null;
    }
  }

  /**
   * Set cache with TTL
   */
  set<T>(key: string, data: T, ttlMinutes: number = 60): void {
    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        ttl: ttlMinutes * 60 * 1000, // Convert minutes to milliseconds
      };
      localStorage.setItem(this.prefix + key, JSON.stringify(entry));
    } catch (error) {
      console.error('[CACHE] Error writing cache:', error);
    }
  }

  /**
   * Clear specific cache
   */
  clear(key: string): void {
    try {
      localStorage.removeItem(this.prefix + key);
    } catch (error) {
      console.error('[CACHE] Error clearing cache:', error);
    }
  }

  /**
   * Clear all cache
   */
  clearAll(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('[CACHE] Error clearing all cache:', error);
    }
  }

  /**
   * Get cache info for debugging
   */
  getInfo(): { key: string; age: number; ttl: number }[] {
    try {
      const keys = Object.keys(localStorage);
      return keys
        .filter(key => key.startsWith(this.prefix))
        .map(key => {
          const item = localStorage.getItem(key);
          if (!item) return null;
          const entry: CacheEntry<any> = JSON.parse(item);
          const age = Date.now() - entry.timestamp;
          return {
            key: key.replace(this.prefix, ''),
            age,
            ttl: entry.ttl,
          };
        })
        .filter(Boolean) as { key: string; age: number; ttl: number }[];
    } catch (error) {
      console.error('[CACHE] Error getting cache info:', error);
      return [];
    }
  }
}

export const cache = new CacheManager();
