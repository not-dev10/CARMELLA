"use client"

import { FadeIn } from "@/components/animations/fade-in"
import { Button } from "@/components/ui/button"
import { Lock, Heart, ShoppingCart, TrendingUp, Leaf, Sparkles, Star, Plus } from "lucide-react"
import Link from "@/components/ui/link-shim"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import { homepageAPI } from "@/lib/api"
import { OptimizedImage } from "@/components/ui/optimized-image"
import { cn } from "@/lib/utils"

interface Product {
    id: string
    name: string
    slug: string
    description: string
    image_url: string
    base_price: number | null
    sale_price?: number | null
    sale_percentage?: number | null
    b2b_price?: number | null
    moq: number | null
    badge?: string
    stock_quantity: number
    is_featured: boolean
    pricingLocked?: boolean
    userTier?: 'guest' | 'user' | 'b2b_approved' | 'b2b_pending' | 'b2b_rejected'
}

// Product Card Component
function ProductCard({ product, index, onToggleWishlist, isWishlisted }: {
    product: Product
    index: number
    onToggleWishlist: (id: string, e: React.MouseEvent) => void
    isWishlisted: boolean
}) {
    const [isHovered, setIsHovered] = useState(false)

    const displayPrice = product.sale_price || product.base_price
    const hasDiscount = product.sale_price && product.base_price && product.sale_price < product.base_price

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            className="group relative"
        >
            <Link href={`/product/${product.id}`}>
                <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-800">
                    {/* Image Container */}
                    <div className="relative aspect-square overflow-hidden bg-gray-50 dark:bg-gray-800">
                        <OptimizedImage
                            src={product.image_url}
                            alt={product.name}
                            preset="thumbnail"
                            className="w-full h-full group-hover:scale-110 transition-transform duration-500"
                        />

                        {/* Badges */}
                        <div className="absolute top-3 left-3 flex flex-col gap-2">
                            {hasDiscount && (
                                <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ delay: index * 0.1 + 0.2 }}
                                    className="bg-red-500 text-white px-2.5 py-1 rounded-lg text-xs font-bold shadow-lg"
                                >
                                    -{product.sale_percentage?.toFixed(0)}%
                                </motion.div>
                            )}
                            {product.badge && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: index * 0.1 + 0.3 }}
                                    className="bg-primary text-white px-2.5 py-1 rounded-lg text-xs font-semibold shadow-lg flex items-center gap-1"
                                >
                                    {product.badge === 'new' && <Sparkles className="w-3 h-3" />}
                                    {product.badge === 'bestseller' && <TrendingUp className="w-3 h-3" />}
                                    {product.badge === 'eco' && <Leaf className="w-3 h-3" />}
                                    {product.badge}
                                </motion.div>
                            )}
                        </div>

                        {/* Wishlist Button */}
                        <motion.button
                            onClick={(e) => onToggleWishlist(product.id, e)}
                            className={cn(
                                "absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-md shadow-lg transition-all z-10",
                                isWishlisted
                                    ? "bg-red-500 text-white"
                                    : "bg-white/90 dark:bg-gray-900/90 text-gray-700 dark:text-gray-300 hover:bg-red-500 hover:text-white"
                            )}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <Heart className={cn("w-4 h-4", isWishlisted && "fill-current")} />
                        </motion.button>

                        {/* Quick Actions - Show on hover */}
                        <AnimatePresence>
                            {isHovered && (
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: 20, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent"
                                >
                                    <Button
                                        size="sm"
                                        className="w-full bg-white text-gray-900 hover:bg-gray-100 font-semibold shadow-lg"
                                        onClick={(e) => {
                                            e.preventDefault()
                                            // Add to cart logic
                                        }}
                                    >
                                        <ShoppingCart className="w-4 h-4 mr-2" />
                                        Add to Cart
                                    </Button>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Stock indicator */}
                        {product.stock_quantity < 10 && product.stock_quantity > 0 && (
                            <div className="absolute bottom-3 left-3 bg-orange-500 text-white px-2.5 py-1 rounded-lg text-xs font-semibold shadow-lg">
                                Only {product.stock_quantity} left!
                            </div>
                        )}
                        {product.stock_quantity === 0 && (
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                                <span className="bg-gray-900 text-white px-4 py-2 rounded-lg font-semibold">
                                    Out of Stock
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Content */}
                    <div className="p-4">
                        {/* Product Name */}
                        <h3 className="font-semibold text-base text-gray-900 dark:text-white mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                            {product.name}
                        </h3>

                        {/* Rating */}
                        <div className="flex items-center gap-1 mb-2">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                            ))}
                            <span className="text-xs text-gray-500 ml-1">(4.5)</span>
                        </div>

                        {/* Pricing */}
                        {product.pricingLocked ? (
                            <div className="flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                                <Lock className="w-4 h-4 text-gray-500" />
                                <span className="text-xs text-gray-600 dark:text-gray-400">
                                    {product.userTier === 'guest' ? 'Login to view' : 'Approval required'}
                                </span>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {/* Main Price */}
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-bold text-primary">
                                        ${displayPrice?.toFixed(2)}
                                    </span>
                                    {hasDiscount && (
                                        <span className="text-sm text-gray-400 line-through">
                                            ${product.base_price?.toFixed(2)}
                                        </span>
                                    )}
                                </div>

                                {/* B2B Price */}
                                {product.userTier === 'b2b_approved' && product.b2b_price && (
                                    <div className="flex items-center gap-2 p-2 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-emerald-200 dark:border-emerald-900">
                                        <div className="flex-1">
                                            <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                                                Bulk Price
                                            </p>
                                            <p className="text-sm font-bold text-emerald-900 dark:text-emerald-300">
                                                ${product.b2b_price.toFixed(2)}
                                            </p>
                                        </div>
                                        <span className="text-xs text-emerald-600 dark:text-emerald-500">
                                            {product.moq}+ units
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </Link>
        </motion.div>
    )
}

export function ProductShowcase() {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [wishlist, setWishlist] = useState<string[]>([])

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const data = await homepageAPI.getFeaturedProducts()
                setProducts(data.products || [])
            } catch (error) {
                console.error("Failed to fetch featured products:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchProducts()
    }, [])

    const toggleWishlist = (id: string, e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setWishlist(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        )
    }

    if (loading) {
        return (
            <section className="py-16 px-6 bg-white dark:bg-gray-950">
                <div className="container mx-auto max-w-7xl">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {[...Array(10)].map((_, i) => (
                            <div key={i} className="animate-pulse">
                                <div className="aspect-square bg-gray-200 dark:bg-gray-800 rounded-2xl mb-3" />
                                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded mb-2" />
                                <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-2/3" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        )
    }

    return (
        <section className="py-16 px-6 bg-white dark:bg-gray-950">
            <div className="container mx-auto max-w-7xl">
                {/* Section Header */}
                <div className="flex justify-between items-end mb-12">
                    <FadeIn>
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200 }}
                            className="inline-block mb-3"
                        >
                            <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 dark:bg-primary/20 text-primary rounded-full text-sm font-semibold">
                                <TrendingUp className="w-4 h-4" />
                                Featured Products
                            </span>
                        </motion.div>
                        <h2 className="font-serif text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                            Trending Now
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">
                            Discover our most popular items
                        </p>
                    </FadeIn>
                    <FadeIn delay={0.2} direction="left">
                        <Link href="/catalog" className="hidden md:block">
                            <Button variant="outline" className="gap-2">
                                View All
                                <Plus className="w-4 h-4" />
                            </Button>
                        </Link>
                    </FadeIn>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                    {products.slice(0, 10).map((product, index) => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            index={index}
                            onToggleWishlist={toggleWishlist}
                            isWishlisted={wishlist.includes(product.id)}
                        />
                    ))}
                </div>

                {/* Mobile View All Button */}
                <div className="mt-8 text-center md:hidden">
                    <Link href="/catalog">
                        <Button className="w-full max-w-sm gap-2">
                            View All Products
                            <Plus className="w-4 h-4" />
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    )
}
