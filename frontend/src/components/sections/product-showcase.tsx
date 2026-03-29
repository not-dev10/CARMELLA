"use client"

import { FadeIn } from "@/components/animations/fade-in"
import { Button } from "@/components/ui/button"
import { Lock, Heart, ShoppingCart, TrendingUp, Leaf, Sparkles, Star, Plus } from "lucide-react"
import Link from "@/components/ui/link-shim"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import { homepageAPI } from "@/lib/api"
import { OptimizedImage } from "@/components/ui/optimized-image"
import { AddToCartModal } from "@/components/product/add-to-cart-modal"
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

// Compact Product Card Component
function ProductCard({ product, index, onToggleWishlist, isWishlisted, onAddToCart }: {
    product: Product
    index: number
    onToggleWishlist: (id: string, e: React.MouseEvent) => void
    isWishlisted: boolean
    onAddToCart?: (productId: string, quantity: number, buyMode: 'retail' | 'bulk') => void
}) {
    const [isHovered, setIsHovered] = useState(false)
    const [showAddToCartModal, setShowAddToCartModal] = useState(false)

    const displayPrice = product.sale_price || product.base_price
    const hasDiscount = product.sale_price && product.base_price && product.sale_price < product.base_price
    const isApproved = product.userTier === 'b2b_approved'

    const handleQuickAdd = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setShowAddToCartModal(true)
    }

    const handleAddToCartConfirm = (quantity: number, buyMode: 'retail' | 'bulk') => {
        if (onAddToCart) {
            onAddToCart(product.id, quantity, buyMode)
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            className="group relative"
        >
            <Link href={`/product/${product.id}`}>
                <div className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-800 h-full flex flex-col">
                    {/* Compact Image Container */}
                    <div className="relative aspect-square overflow-hidden bg-gray-50 dark:bg-gray-800">
                        <OptimizedImage
                            src={product.image_url}
                            alt={product.name}
                            preset="thumbnail"
                            className="w-full h-full group-hover:scale-105 transition-transform duration-300"
                        />

                        {/* Compact Badges */}
                        <div className="absolute top-2 left-2 flex flex-col gap-1">
                            {hasDiscount && (
                                <span className="bg-red-500 text-white px-2 py-0.5 rounded text-xs font-bold">
                                    -{product.sale_percentage?.toFixed(0)}%
                                </span>
                            )}
                            {product.badge && (
                                <span className="bg-primary text-white px-2 py-0.5 rounded text-xs font-semibold capitalize">
                                    {product.badge}
                                </span>
                            )}
                        </div>

                        {/* Compact Wishlist Button */}
                        <motion.button
                            onClick={(e) => onToggleWishlist(product.id, e)}
                            className={cn(
                                "absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-sm shadow transition-all z-10",
                                isWishlisted
                                    ? "bg-red-500 text-white"
                                    : "bg-white/80 dark:bg-gray-900/80 text-gray-600 dark:text-gray-400 hover:bg-red-500 hover:text-white"
                            )}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <Heart className={cn("w-3.5 h-3.5", isWishlisted && "fill-current")} />
                        </motion.button>

                        {/* Quick Add Button - Show on hover */}
                        <AnimatePresence>
                            {isHovered && product.stock_quantity > 0 && !product.pricingLocked && (
                                <motion.button
                                    initial={{ y: 10, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: 10, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    onClick={handleQuickAdd}
                                    className="absolute inset-x-2 bottom-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-white py-2 rounded-lg font-semibold text-sm shadow-lg hover:bg-primary hover:text-white transition-colors flex items-center justify-center gap-1.5"
                                >
                                    <ShoppingCart className="w-4 h-4" />
                                    Add
                                </motion.button>
                            )}
                        </AnimatePresence>

                        {/* Stock indicator */}
                        {product.stock_quantity === 0 && (
                            <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center">
                                <span className="bg-gray-900 text-white px-3 py-1.5 rounded-lg font-semibold text-sm">
                                    Out of Stock
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Compact Content */}
                    <div className="p-3 flex-1 flex flex-col">
                        {/* Product Name */}
                        <h3 className="font-medium text-sm text-gray-900 dark:text-white mb-1 line-clamp-2 group-hover:text-primary transition-colors leading-tight">
                            {product.name}
                        </h3>

                        {/* Compact Rating */}
                        <div className="flex items-center gap-0.5 mb-2">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            ))}
                            <span className="text-xs text-gray-500 ml-1">(4.5)</span>
                        </div>

                        {/* Pricing - Compact */}
                        <div className="mt-auto">
                            {product.pricingLocked ? (
                                <div className="flex items-center gap-1.5 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs">
                                    <Lock className="w-3 h-3 text-gray-500 flex-shrink-0" />
                                    <span className="text-gray-600 dark:text-gray-400 truncate">
                                        {product.userTier === 'guest' ? 'Login' : 'Approval needed'}
                                    </span>
                                </div>
                            ) : (
                                <div>
                                    {/* Main Price */}
                                    <div className="flex items-baseline gap-1.5 mb-1">
                                        <span className="text-lg font-bold text-primary">
                                            ${displayPrice?.toFixed(2)}
                                        </span>
                                        {hasDiscount && (
                                            <span className="text-xs text-gray-400 line-through">
                                                ${product.base_price?.toFixed(2)}
                                            </span>
                                        )}
                                    </div>

                                    {/* B2B Price - Compact */}
                                    {product.userTier === 'b2b_approved' && product.b2b_price && (
                                        <div className="flex items-center justify-between p-1.5 bg-emerald-50 dark:bg-emerald-950/30 rounded text-xs border border-emerald-200 dark:border-emerald-900">
                                            <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                                                Bulk: ${product.b2b_price.toFixed(2)}
                                            </span>
                                            <span className="text-emerald-600 dark:text-emerald-500">
                                                {product.moq}+
                                            </span>
                                        </div>
                                    )}

                                    {/* Low Stock Warning */}
                                    {product.stock_quantity > 0 && product.stock_quantity < 10 && (
                                        <div className="mt-1 text-xs text-orange-600 dark:text-orange-400 font-medium">
                                            Only {product.stock_quantity} left
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </Link>

            {/* Add to Cart Modal */}
            {showAddToCartModal && (
                <AddToCartModal
                    product={{
                        id: product.id,
                        name: product.name,
                        image_url: product.image_url,
                        base_price: product.base_price || 0,
                        sale_price: product.sale_price || undefined,
                        b2b_price: product.b2b_price || undefined,
                        moq: product.moq || 12
                    }}
                    isOpen={showAddToCartModal}
                    onClose={() => setShowAddToCartModal(false)}
                    onAddToCart={handleAddToCartConfirm}
                    isApproved={isApproved}
                />
            )}
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
