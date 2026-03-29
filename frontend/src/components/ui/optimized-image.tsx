import { useState } from 'react'
import { ImagePresets, generateSrcSet, optimizeCloudinaryUrl } from '@/lib/imageOptimization'
import { cn } from '@/lib/utils'

interface OptimizedImageProps {
  src: string
  alt: string
  preset?: keyof typeof ImagePresets
  width?: number
  height?: number
  className?: string
  loading?: 'lazy' | 'eager'
  onLoad?: () => void
  onError?: () => void
}

/**
 * Optimized Image Component
 * Automatically applies Cloudinary transformations for optimal performance
 */
export function OptimizedImage({
  src,
  alt,
  preset,
  width,
  height,
  className,
  loading = 'lazy',
  onLoad,
  onError
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  // Get optimized URL
  const optimizedSrc = preset
    ? ImagePresets[preset](src)
    : optimizeCloudinaryUrl(src, { width, height })

  // Generate srcset for responsive images
  const srcSet = src.includes('cloudinary.com')
    ? generateSrcSet(src)
    : undefined

  const handleLoad = () => {
    setIsLoading(false)
    onLoad?.()
  }

  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
    onError?.()
  }

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Loading skeleton */}
      {isLoading && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 bg-muted flex items-center justify-center">
          <span className="text-muted-foreground text-sm">Failed to load image</span>
        </div>
      )}

      {/* Actual image */}
      <img
        src={optimizedSrc}
        srcSet={srcSet}
        sizes="(max-width: 640px) 640px, (max-width: 1024px) 1024px, 1920px"
        alt={alt}
        loading={loading}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          'w-full h-full object-cover transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100'
        )}
      />
    </div>
  )
}

/**
 * Background Image Component with Optimization
 */
export function OptimizedBackgroundImage({
  src,
  preset,
  className,
  children
}: {
  src: string
  preset?: keyof typeof ImagePresets
  className?: string
  children?: React.ReactNode
}) {
  const optimizedSrc = preset
    ? ImagePresets[preset](src)
    : optimizeCloudinaryUrl(src)

  return (
    <div
      className={cn('relative bg-cover bg-center', className)}
      style={{ backgroundImage: `url(${optimizedSrc})` }}
    >
      {children}
    </div>
  )
}
