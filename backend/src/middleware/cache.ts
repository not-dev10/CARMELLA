import NodeCache from 'node-cache';
import { Request, Response, NextFunction } from 'express';

// Create cache instance with default TTL of 5 minutes
const cache = new NodeCache({
  stdTTL: 300, // 5 minutes
  checkperiod: 60, // Check for expired keys every 60 seconds
  useClones: false // Don't clone data (better performance)
});

/**
 * Cache middleware for GET requests
 * Usage: app.get('/api/products', cacheMiddleware(300), getProducts)
 */
export function cacheMiddleware(ttl: number = 300) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Generate cache key from URL and query params
    const key = `${req.path}:${JSON.stringify(req.query)}:${req.headers.authorization || 'guest'}`;

    // Check if cached
    const cachedResponse = cache.get(key);
    if (cachedResponse) {
      console.log(`[CACHE] HIT: ${key}`);
      return res.json(cachedResponse);
    }

    // Store original json method
    const originalJson = res.json.bind(res);

    // Override json method to cache response
    res.json = function (body: any) {
      cache.set(key, body, ttl);
      console.log(`[CACHE] SET: ${key} (TTL: ${ttl}s)`);
      return originalJson(body);
    };

    next();
  };
}

/**
 * Clear cache by pattern
 */
export function clearCache(pattern?: string) {
  if (!pattern) {
    cache.flushAll();
    console.log('[CACHE] Cleared all cache');
    return;
  }

  const keys = cache.keys();
  const matchingKeys = keys.filter(key => key.includes(pattern));
  
  matchingKeys.forEach(key => cache.del(key));
  console.log(`[CACHE] Cleared ${matchingKeys.length} keys matching: ${pattern}`);
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  return {
    keys: cache.keys().length,
    hits: cache.getStats().hits,
    misses: cache.getStats().misses,
    ksize: cache.getStats().ksize,
    vsize: cache.getStats().vsize
  };
}

export default cache;
