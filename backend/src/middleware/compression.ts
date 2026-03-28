import compression from 'compression';
import { Request, Response } from 'express';

/**
 * Compression middleware configuration
 * Compresses responses using gzip/deflate
 */
export const compressionMiddleware = compression({
  // Compression level (0-9, where 6 is default and good balance)
  level: 6,
  
  // Only compress responses larger than 1KB
  threshold: 1024,
  
  // Filter function to determine what to compress
  filter: (req: Request, res: Response) => {
    // Don't compress if client doesn't support it
    if (req.headers['x-no-compression']) {
      return false;
    }

    // Don't compress images (already compressed)
    const contentType = res.getHeader('Content-Type') as string;
    if (contentType && contentType.startsWith('image/')) {
      return false;
    }

    // Use compression filter
    return compression.filter(req, res);
  }
});
