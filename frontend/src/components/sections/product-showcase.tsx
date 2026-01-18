"use client"

import { FadeIn } from "@/components/animations/fade-in"
import { Button } from "@/components/ui/button"
import { Lock, Heart, Eye, TrendingUp, Leaf, Sparkles, Package } from "lucide-react"
import Link from "@/components/ui/link-shim"
import { motion } from "framer-motion"
import { ParallaxImage } from "@/components/animations/parallax"
import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { homepageAPI } from "@/lib/api"

interface Product {
    id: string
    name: string
    slug: string
    description: string
    image_url: string
    gallery_urls?: string[]
    base_price: number | null
    sale_price?: number | null
    sale_percentage?: number | null
    b2b_price?: number | null
    moq: number | null
    badge?: string
    stock_quantity: number
    is_featured: boolean
    category_id: string
    pricingLocked?: boolean
    userTier?: 'guest' | 'user' | 'b2b_approved' | 'b2b_pending' | 'b2b_rejected'
}

const BADGE_CONFIG = {
    bestseller: { icon: TrendingUp, label: "Bestseller", color: "bg-secondary text-secondary-foreground" },
    new: { icon: Sparkles, label: "New", color: "bg-accent text-accent-foreground" },
    eco: { icon: Leaf, label: "Eco-Friendly", color: "bg-primary text-primary-foreground" }
}

const getStockStatus = (quantity: number) => {
    if (quantity === 0) return { label: "Out of Stock", color: "text-destructive" }
    if (quantity < 10) return { label: "Low Stock", color: "text-destructive" }
    return { label: "In Stock", color: "text-primary" }
}

export function ProductShowcase() {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [wishlist, setWishlist] = useState<string[]>([])
    const [hoveredProduct, setHoveredProduct] = useState<string | null>(null)

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
            <section className="py-24 px-6 bg-background">
                <div className="container mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="animate-pulse">
                                <div className="aspect-[3/4] bg-muted rounded-lg mb-6" />
                                <div className="h-4 bg-muted rounded mb-2" />
                                <div className="h-4 bg-muted rounded w-2/3" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        )
    }

    return (
        <section className="py-24 px-6 bg-background">
            <div className="container mx-auto">
                <div className="flex justify-between items-end mb-16">
                    <FadeIn>
                        <span className="text-xs font-bold tracking-widest uppercase text-muted-foreground mb-2 block">Our Bestsellers</span>
                        <h2 className="font-serif text-4xl">Curated Favorites</h2>
                    </FadeIn>
                    <FadeIn delay={0.2} direction="left">
                        <Link href="/catalog" className="hidden md:flex items-center gap-2 text-sm font-medium border-b border-foreground pb-1 hover:text-primary hover:border-primary transition-colors">
                            View All Products
                        </Link>
                    </FadeIn>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
                    {products.map((product, index) => {
                        const badgeConfig = product.badge ? BADGE_CONFIG[product.badge as keyof typeof BADGE_CONFIG] : null
                        const stockConfig = getStockStatus(product.stock_quantity)
                        const isWishlisted = wishlist.includes(product.id)
                        const _isHovered = hoveredProduct === product.id

                        return (
                            <FadeIn key={product.id} delay={index * 0.1}>
                                <Link href={`/catalog/${product.id}`}>
                                    <motion.div
                                        whileHover={{ y: -8 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                        className="group cursor-pointer relative"
                                        onMouseEnter={() => setHoveredProduct(product.id)}
                                        onMouseLeave={() => setHoveredProduct(null)}
                                    >
                                        <div className="aspect-[3/4] bg-muted rounded-lg mb-6 relative overflow-hidden shadow-md transition-shadow duration-300 group-hover:shadow-xl">
                                            <ParallaxImage
                                                src={product.image_url}
                                                alt={product.name}
                                                fill
                                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                                                containerClassName="h-full w-full"
                                                scale={1.08}
                                            />
                                            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity z-10" />

                                            {/* Product Badge */}
                                            {badgeConfig && (
                                                <Badge className={`absolute top-3 left-3 z-20 ${badgeConfig.color} flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-primary to-accent`}>
                                                    <badgeConfig.icon className="w-3 h-3" />
                                                    <span className="text-xs font-semibold">{badgeConfig.label}</span>
                                                </Badge>
                                            )}

                                            {/* Wishlist Button */}
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={(e) => toggleWishlist(product.id, e)}
                                                className={`absolute top-3 right-3 z-20 p-2 rounded-full backdrop-blur-md transition-all ${isWishlisted
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'bg-white/80 text-foreground hover:bg-white'
                                                    }`}
                                            >
                                                <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
                                            </motion.button>

                                            {/* Quick View Button */}
                                            <Button
                                                size="sm"
                                                className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 z-20 rounded-full gap-2 btn-gradient"
                                                onClick={(e) => {
                                                    e.preventDefault()
                                                    e.stopPropagation()
                                                }}
                                            >
                                                <Eye className="w-4 h-4" />
                                                Quick View
                                            </Button>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex-1">
                                                    <h3 className="font-serif text-xl mb-1 transition-colors duration-300 group-hover:text-primary">
                                                        {product.name}
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground line-clamp-1">{product.description}</p>
                                                </div>

                                                {/* Stock Indicator */}
                                                <div className="flex items-center gap-1">
                                                    <Package className={`w-3 h-3 ${stockConfig.color}`} />
                                                    <span className={`text-xs font-medium ${stockConfig.color}`}>
                                                        {stockConfig.label}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Pricing Tier Section */}
                                            <div className="space-y-3 pt-2">
                                                {product.pricingLocked ? (
                                                    // PRICING LOCKED: Different messages for guest vs logged-in
                                                    <div className="p-3 rounded-lg bg-gradient-to-r from-primary/20 to-accent/20 border-2 border-primary/30 shadow-sm">
                                                        <div className="flex items-start gap-3">
                                                            <Lock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                                                            <div className="flex-1">
                                                                <p className="text-xs font-bold uppercase tracking-wider text-primary mb-1">Pricing Locked</p>
                                                                <p className="text-sm text-foreground font-medium">
                                                                    {product.userTier === 'guest'
                                                                        ? 'Login to view pricing'
                                                                        : 'Request B2B approval'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        {/* LOGGED-IN TIER: Regular Pricing */}
                                                        <div className="p-3 rounded-lg bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200">
                                                            <div className="flex items-baseline justify-between gap-2">
                                                                <div className="flex items-baseline gap-2">
                                                                    <span className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent">
                                                                        {product.sale_price !== null && product.sale_price !== undefined
                                                                            ? `$${product.sale_price.toFixed(2)}`
                                                                            : product.base_price !== null && product.base_price !== undefined
                                                                                ? `$${product.base_price.toFixed(2)}`
                                                                                : "Contact for price"}
                                                                    </span>
                                                                    {product.sale_price && product.base_price && (
                                                                        <span className="text-sm text-gray-500 line-through">
                                                                            ${product.base_price.toFixed(2)}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                {product.sale_percentage && product.sale_percentage > 0 && (
                                                                    <span className="px-2 py-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded">
                                                                        {product.sale_percentage.toFixed(0)}% OFF
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {product.moq && product.moq > 0 && (
                                                                <p className="text-xs text-gray-600 mt-2">
                                                                    Minimum Order: <span className="font-semibold text-gray-800">{product.moq} units</span>
                                                                </p>
                                                            )}
                                                        </div>

                                                        {/* B2B TIER: Bulk Pricing Message */}
                                                        <div className="p-3 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200">
                                                            <div className="flex items-start gap-3">
                                                                <Package className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                                                                <div className="flex-1">
                                                                    <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-1">B2B Pricing</p>
                                                                    {product.b2b_price && product.b2b_price > 0 ? (
                                                                        <p className="text-sm text-emerald-800 font-semibold">
                                                                            Bulk: ${product.b2b_price.toFixed(2)} (50+ units)
                                                                        </p>
                                                                    ) : (
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.preventDefault();
                                                                                e.stopPropagation();
                                                                                window.location.href = '/b2b-request';
                                                                            }}
                                                                            className="text-sm text-emerald-700 font-semibold hover:text-emerald-900 flex items-center gap-1 group"
                                                                        >
                                                                            📊 Request Bulk Pricing →
                                                                            <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity">Get discount</span>
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                </Link>
                            </FadeIn>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
