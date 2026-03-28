/**
 * Cloudinary Image Optimization Utilities
 * Automatically adds transformations to Cloudinary URLs for optimal performance
 */

export interface ImageTransformOptions {
  width?: number
  height?: number
  quality?: 'auto' | 'auto:low' | 'auto:good' | 'auto:best' | number
  format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png'
  crop?: 'fill' | 'fit' | 'scale' | 'crop' | 'thumb'
  gravity?: 'auto' | 'face' | 'center' | 'north' | 'south' | 'east' | 'west'
  dpr?: 'auto' | number
}

/**
 * Optimize Cloudinary URL with transformations
 * Example: https://res.cloudinary.com/cloud/image/upload/v123/path.jpg
 * Becomes: https://res.cloudinary.com/cloud/image/upload/w_800,q_auto,f_auto/v123/path.jpg
 */
export function optimizeCloudinaryUrl(
  url: string,
  options: ImageTransformOptions = {}
): string {
  // Return original URL if not a Cloudinary URL
  if (!url || !url.includes('cloudinary.com')) {
    return url
  }

  // Default options for optimal performance
  const {
    width,
    height,
    quality = 'auto',
    format = 'auto',
    crop = 'fill',
    gravity,
    dpr = 'auto'
  } = options

  // Build transformation string
  const transformations: string[] = []

  if (width) transformations.push(`w_${width}`)
  if (height) transformations.push(`h_${height}`)
  if (crop) transformations.push(`c_${crop}`)
  if (gravity) transformations.push(`g_${gravity}`)
  transformations.push(`q_${quality}`)
  transformations.push(`f_${format}`)
  transformations.push(`dpr_${dpr}`)

  const transformString = transformations.join(',')

  // Insert transformations into URL
  // Pattern: /upload/ -> /upload/{transformations}/
  return url.replace('/upload/', `/upload/${transformString}/`)
}

/**
 * Preset configurations for common use cases
 */
export const ImagePresets = {
  // Product thumbnails in grids
  thumbnail: (url: string) => optimizeCloudinaryUrl(url, {
    width: 400,
    height: 400,
    quality: 'auto:good',
    crop: 'fill',
    gravity: 'auto'
  }),

  // Product detail main image
  productMain: (url: string) => optimizeCloudinaryUrl(url, {
    width: 800,
    height: 800,
    quality: 'auto:best',
    crop: 'fit'
  }),

  // Product gallery images
  gallery: (url: string) => optimizeCloudinaryUrl(url, {
    width: 600,
    height: 600,
    quality: 'auto:good',
    crop: 'fill'
  }),

  // Category cards
  categoryCard: (url: string) => optimizeCloudinaryUrl(url, {
    width: 550,
    height: 550,
    quality: 'auto:good',
    crop: 'fill',
    gravity: 'auto'
  }),

  // Hero/banner images
  hero: (url: string) => optimizeCloudinaryUrl(url, {
    width: 1920,
    height: 1080,
    quality: 'auto:good',
    crop: 'fill'
  }),

  // Mobile optimized
  mobile: (url: string) => optimizeCloudinaryUrl(url, {
    width: 640,
    quality: 'auto:low',
    crop: 'scale'
  }),

  // Avatar/profile images
  avatar: (url: string) => optimizeCloudinaryUrl(url, {
    width: 200,
    height: 200,
    quality: 'auto:good',
    crop: 'thumb',
    gravity: 'face'
  })
}

/**
 * Generate responsive srcset for images
 */
export function generateSrcSet(url: string, widths: number[] = [400, 800, 1200, 1600]): string {
  return widths
    .map(width => {
      const optimized = optimizeCloudinaryUrl(url, { width, quality: 'auto' })
      return `${optimized} ${width}w`
    })
    .join(', ')
}

/**
 * Get optimal image size based on viewport
 */
export function getResponsiveImageUrl(url: string): string {
  if (typeof window === 'undefined') {
    return optimizeCloudinaryUrl(url, { width: 800 })
  }

  const width = window.innerWidth
  
  if (width <= 640) {
    return optimizeCloudinaryUrl(url, { width: 640, quality: 'auto:good' })
  } else if (width <= 1024) {
    return optimizeCloudinaryUrl(url, { width: 1024, quality: 'auto:good' })
  } else if (width <= 1920) {
    return optimizeCloudinaryUrl(url, { width: 1920, quality: 'auto:best' })
  } else {
    return optimizeCloudinaryUrl(url, { width: 2560, quality: 'auto:best' })
  }
}
