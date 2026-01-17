import { cn } from "@/lib/utils"

interface SkeletonProps {
    className?: string
    variant?: "text" | "circular" | "rectangular"
    animation?: "pulse" | "wave" | "none"
}

export function Skeleton({
    className,
    variant = "rectangular",
    animation = "pulse"
}: SkeletonProps) {
    return (
        <div
            className={cn(
                "bg-muted",
                variant === "circular" && "rounded-full",
                variant === "text" && "rounded h-4",
                variant === "rectangular" && "rounded-lg",
                animation === "pulse" && "animate-pulse",
                animation === "wave" && "animate-shimmer bg-gradient-to-r from-muted via-muted-foreground/10 to-muted bg-[length:200%_100%]",
                className
            )}
        />
    )
}

// Product Card Skeleton
export function ProductCardSkeleton() {
    return (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
            <Skeleton className="aspect-[3/4] w-full" animation="wave" />
            <div className="p-4 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-4 w-16" />
                </div>
            </div>
        </div>
    )
}

// Product Grid Skeleton
export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: count }).map((_, i) => (
                <ProductCardSkeleton key={i} />
            ))}
        </div>
    )
}

// Product Detail Skeleton
export function ProductDetailSkeleton() {
    return (
        <div className="container mx-auto px-6 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Image Gallery */}
                <div className="space-y-4">
                    <Skeleton className="aspect-[4/5] w-full rounded-2xl" animation="wave" />
                    <div className="grid grid-cols-4 gap-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Skeleton key={i} className="aspect-square rounded-lg" />
                        ))}
                    </div>
                </div>

                {/* Product Info */}
                <div className="space-y-6">
                    <div className="space-y-3">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-20 w-full" />
                    </div>
                    <Skeleton className="h-32 w-full rounded-xl" />
                    <Skeleton className="h-16 w-full" />
                    <div className="flex gap-3">
                        <Skeleton className="h-12 flex-1" />
                        <Skeleton className="h-12 w-12" />
                    </div>
                </div>
            </div>
        </div>
    )
}

// Testimonial Card Skeleton
export function TestimonialSkeleton() {
    return (
        <div className="bg-card border border-border rounded-xl p-8">
            <div className="flex items-center gap-3 mb-5">
                <Skeleton variant="circular" className="w-12 h-12" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                </div>
            </div>
            <div className="flex gap-1 mb-5">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} variant="circular" className="w-5 h-5" />
                ))}
            </div>
            <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
            </div>
        </div>
    )
}

// Category Card Skeleton
export function CategoryCardSkeleton() {
    return (
        <div className="bg-card border border-border rounded-2xl p-8">
            <Skeleton variant="circular" className="w-20 h-20 mx-auto mb-4" />
            <Skeleton className="h-6 w-32 mx-auto mb-2" />
            <Skeleton className="h-4 w-24 mx-auto" />
        </div>
    )
}
