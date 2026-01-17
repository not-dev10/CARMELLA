"use client"

import { FadeIn } from "@/components/animations/fade-in"
import { Button } from "@/components/ui/button"
import { Lock, Heart, Eye, TrendingUp, Leaf, Sparkles, Package } from "lucide-react"
import Link from "@/components/ui/link-shim"
import { motion, AnimatePresence } from "framer-motion"
import { ParallaxImage } from "@/components/animations/parallax"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"

const products = [
    {
        id: 3,
        name: "Stoneware Mug Set",
        category: "Dinnerware",
        image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&q=80&w=800",
        badge: "bestseller",
        stock: "in-stock",
        moq: 24,
        tieredPricing: [
            { qty: "24-99", discount: "15%" },
            { qty: "100-499", discount: "25%" },
            { qty: "500+", discount: "35%" }
        ]
    },
    {
        id: 1,
        name: "Terra Ceramic Vase",
        category: "Decor",
        image: "https://images.unsplash.com/photo-1581783342308-f792ca11df53?auto=format&fit=crop&q=80&w=800",
        badge: "new",
        stock: "in-stock",
        moq: 12,
        tieredPricing: [
            { qty: "12-49", discount: "10%" },
            { qty: "50-199", discount: "20%" },
            { qty: "200+", discount: "30%" }
        ]
    },
    {
        id: 6,
        name: "Linen Table Runner",
        category: "Textiles",
        image: "https://images.unsplash.com/photo-1595306669968-3d5272a445bd?auto=format&fit=crop&q=80&w=800",
        badge: "eco",
        stock: "low-stock",
        moq: 50,
        tieredPricing: [
            { qty: "50-199", discount: "12%" },
            { qty: "200-499", discount: "22%" },
            { qty: "500+", discount: "32%" }
        ]
    },
    {
        id: 2,
        name: "Minimalist Planter",
        category: "Accessories",
        image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&q=80&w=800",
        badge: null,
        stock: "in-stock",
        moq: 36,
        tieredPricing: [
            { qty: "36-99", discount: "15%" },
            { qty: "100-299", discount: "25%" },
            { qty: "300+", discount: "35%" }
        ]
    },
]

const BADGE_CONFIG = {
    bestseller: { icon: TrendingUp, label: "Bestseller", color: "bg-secondary text-secondary-foreground" },
    new: { icon: Sparkles, label: "New", color: "bg-accent text-accent-foreground" },
    eco: { icon: Leaf, label: "Eco-Friendly", color: "bg-primary text-primary-foreground" }
}

const STOCK_CONFIG = {
    "in-stock": { label: "In Stock", color: "text-primary" },
    "low-stock": { label: "Low Stock", color: "text-destructive" },
    "pre-order": { label: "Pre-Order", color: "text-accent" }
}

export function ProductShowcase() {
    const [wishlist, setWishlist] = useState<number[]>([])
    const [hoveredProduct, setHoveredProduct] = useState<number | null>(null)

    const toggleWishlist = (id: number, e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setWishlist(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
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
                        const stockConfig = STOCK_CONFIG[product.stock as keyof typeof STOCK_CONFIG]
                        const isWishlisted = wishlist.includes(product.id)
                        const isHovered = hoveredProduct === product.id

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
                                                src={product.image}
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
                                                    // Quick view modal would open here
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
                                                    <p className="text-sm text-muted-foreground">{product.category}</p>
                                                </div>

                                                {/* Stock Indicator */}
                                                <div className="flex items-center gap-1">
                                                    <Package className={`w-3 h-3 ${stockConfig.color}`} />
                                                    <span className={`text-xs font-medium ${stockConfig.color}`}>
                                                        {stockConfig.label}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* MOQ */}
                                            <p className="text-xs text-muted-foreground">
                                                MOQ: <span className="font-semibold text-foreground">{product.moq} units</span>
                                            </p>

                                            {/* B2B Pricing */}
                                            <div className="relative">
                                                <div className="flex items-center gap-2 text-sm font-medium text-primary/80 bg-primary/5 p-2 rounded-lg transition-all duration-300 group-hover:bg-primary/10 group-hover:text-primary">
                                                    <Lock className="w-3 h-3" />
                                                    <span>Login to view wholesale pricing</span>
                                                </div>

                                                {/* Tiered Pricing Preview on Hover */}
                                                <AnimatePresence>
                                                    {isHovered && (
                                                        <motion.div
                                                            initial={{ opacity: 0, y: -10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            exit={{ opacity: 0, y: -10 }}
                                                            className="absolute bottom-full left-0 right-0 mb-2 bg-card border border-border rounded-lg shadow-xl p-3 z-30"
                                                        >
                                                            <p className="text-xs font-semibold mb-2 text-foreground">Tiered Pricing:</p>
                                                            <div className="space-y-1">
                                                                {product.tieredPricing.map((tier, idx) => (
                                                                    <div key={idx} className="flex justify-between items-center text-xs">
                                                                        <span className="text-muted-foreground">{tier.qty} units</span>
                                                                        <span className="font-semibold text-primary">{tier.discount} off</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
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
