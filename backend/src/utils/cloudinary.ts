import { config } from "../config/index.js";

/**
 * Extract public_id from Cloudinary URL
 * Example: https://res.cloudinary.com/dwis8ote1/image/upload/v1234567890/carmella/products/abc123.jpg
 * Returns: carmella/products/abc123
 */
export function extractPublicId(cloudinaryUrl: string): string | null {
  if (!cloudinaryUrl || !cloudinaryUrl.includes('cloudinary.com')) {
    return null;
  }

  try {
    // Match pattern: /upload/v{version}/{public_id}.{extension}
    const match = cloudinaryUrl.match(/\/upload\/(?:v\d+\/)?(.+)\.\w+$/);
    if (match && match[1]) {
      return match[1];
    }
    return null;
  } catch (error) {
    console.error('[CLOUDINARY] Error extracting public_id:', error);
    return null;
  }
}

/**
 * Delete image from Cloudinary using Admin API
 * Requires API Key and API Secret (not just upload preset)
 */
export async function deleteFromCloudinary(imageUrl: string): Promise<boolean> {
  const publicId = extractPublicId(imageUrl);
  
  if (!publicId) {
    console.log('[CLOUDINARY] No valid public_id found in URL:', imageUrl);
    return false;
  }

  const cloudName = config.cloudinary.cloudName;
  const apiKey = config.cloudinary.apiKey;
  const apiSecret = config.cloudinary.apiSecret;

  if (!cloudName || !apiKey || !apiSecret) {
    console.error('[CLOUDINARY] Missing credentials for deletion. Need CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET');
    return false;
  }

  try {
    console.log(`[CLOUDINARY] Deleting image with public_id: ${publicId}`);

    // Generate timestamp for signature
    const timestamp = Math.round(Date.now() / 1000);
    
    // Create signature (SHA-1 hash of params + api_secret)
    const crypto = await import('crypto');
    const stringToSign = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash('sha1').update(stringToSign).digest('hex');

    // Make DELETE request to Cloudinary Admin API
    const formData = new URLSearchParams();
    formData.append('public_id', publicId);
    formData.append('timestamp', timestamp.toString());
    formData.append('api_key', apiKey);
    formData.append('signature', signature);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      }
    );

    const result = await response.json() as { result?: string; error?: any };
    
    if (result.result === 'ok') {
      console.log(`[CLOUDINARY] Successfully deleted: ${publicId}`);
      return true;
    } else if (result.result === 'not found') {
      console.log(`[CLOUDINARY] Image not found (may have been deleted already): ${publicId}`);
      return true; // Consider this success since image is gone
    } else {
      console.error(`[CLOUDINARY] Delete failed:`, result);
      return false;
    }
  } catch (error) {
    console.error(`[CLOUDINARY] Error deleting image:`, error);
    return false;
  }
}

/**
 * Delete multiple images from Cloudinary
 */
export async function deleteMultipleFromCloudinary(imageUrls: string[]): Promise<{
  success: number;
  failed: number;
  total: number;
}> {
  const results = await Promise.allSettled(
    imageUrls.map(url => deleteFromCloudinary(url))
  );

  const success = results.filter(r => r.status === 'fulfilled' && r.value === true).length;
  const failed = results.length - success;

  return {
    success,
    failed,
    total: results.length
  };
}
