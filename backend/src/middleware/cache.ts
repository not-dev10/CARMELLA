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

    // Generate cache key from URL only (don't include auth header for public content)
    // This allows cache to be shared across users and properly cleared
    const key = `${req.path}:${JSON.stringify(req.query)}`;

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
  // Match pattern anywhere in the key, not just as a substring
  const matchingKeys = keys.filter(key => {
    // Match the pattern - handle both with and without leading slashes
    const normalizedPattern = pattern.replace(/^\/+/, '').replace(/\/+$/, '');
    const normalizedKey = key.replace(/^\/+/, '').split(':')[0]; // Get just the path part
    return normalizedKey.includes(normalizedPattern) || key.includes(pattern);
  });
  
  matchingKeys.forEach(key => {
    cache.del(key);
    console.log(`[CACHE] DELETED: ${key}`);
  });
  
  console.log(`[CACHE] Cleared ${matchingKeys.length} keys matching pattern: "${pattern}"`);
  if (matchingKeys.length === 0) {
    console.warn(`[CACHE] ⚠️ WARNING: No cache keys matched pattern "${pattern}". Cached keys: ${keys.slice(0, 5).join(', ')}`);
  }
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
