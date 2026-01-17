"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Filter, X, SlidersHorizontal, Grid3x3, List, Heart, Eye, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Image from "@/components/ui/image-shim"
import Link from "@/components/ui/link-shim"
import { cn } from "@/lib/utils"

// Mock product data
const PRODUCTS = [
    {
        id: 1,
        name: "Terra Ceramic Vase",
        category: "Decor",
        price: 45,
        image: "https://images.unsplash.com/photo-1581783342308-f792ca11df53?w=600&h=800&fit=crop",
        badge: "new",
        stock: "in-stock",
        moq: 12,
        description: "Handcrafted ceramic vase with organic texture"
    },
    {
        id: 2,
        name: "Minimalist Planter",
        category: "Accessories",
        price: 32,
        image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600&h=800&fit=crop",
        badge: null,
        stock: "in-stock",
        moq: 36,
        description: "Modern minimalist planter for indoor plants"
    },
    {
        id: 3,
        name: "Stoneware Mug Set",
        category: "Tableware",
        price: 28,
        image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600&h=800&fit=crop",
        badge: "bestseller",
        stock: "in-stock",
        moq: 24,
        description: "Set of 4 handcrafted stoneware mugs"
    },
    {
        id: 4,
        name: "Artisan Bowl Collection",
        category: "Tableware",
        price: 52,
        image: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=600&h=800&fit=crop",
        badge: "eco",
        stock: "low-stock",
        moq: 18,
        description: "Set of 6 artisan ceramic bowls"
    },
    {
        id: 5,
        name: "Linen Table Runner",
        category: "Textiles",
        price: 38,
        image: "https://images.unsplash.com/photo-1595306669968-3d5272a445bd?w=600&h=800&fit=crop",
        badge: "eco",
        stock: "in-stock",
        moq: 50,
        description: "100% organic linen table runner"
    },
    {
        id: 6,
        name: "Ceramic Dinner Plates",
        category: "Tableware",
        price: 65,
        image: "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=600&h=800&fit=crop",
        badge: "bestseller",
        stock: "in-stock",
        moq: 24,
        description: "Set of 8 handmade dinner plates"
    },
    {
        id: 7,
        name: "Decorative Candle Holders",
        category: "Decor",
        price: 42,
        image: "https://images.unsplash.com/photo-1602874801006-94c0f0c1f1cc?w=600&h=800&fit=crop",
        badge: "new",
        stock: "in-stock",
        moq: 30,
        description: "Set of 3 ceramic candle holders"
    },
    {
        id: 8,
        name: "Handwoven Placemats",
        category: "Textiles",
        price: 29,
        image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=600&h=800&fit=crop",
        badge: "eco",
        stock: "in-stock",
        moq: 48,
        description: "Set of 4 handwoven placemats"
    },
]

const CATEGORIES = ["All", "Tableware", "Decor", "Textiles", "Accessories"]
const SORT_OPTIONS = [
    { value: "featured", label: "Featured" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
    { value: "name", label: "Name: A-Z" },
]

export default function Catalog() {
    const [selectedCategory, setSelectedCategory] = useState("All")
    const [sortBy, setSortBy] = useState("featured")
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
    const [showFilters, setShowFilters] = useState(false)
    const [wishlist, setWishlist] = useState<number[]>([])

    // Filter and sort products
    const filteredProducts = useMemo(() => {
        let filtered = PRODUCTS

        // Filter by category
        if (selectedCategory !== "All") {
            filtered = filtered.filter(p => p.category === selectedCategory)
        }

        // Sort
        switch (sortBy) {
            case "price-low":
                filtered = [...filtered].sort((a, b) => a.price - b.price)
                break
            case "price-high":
                filtered = [...filtered].sort((a, b) => b.price - a.price)
                break
            case "name":
                filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name))
                break
        }

        return filtered
    }, [selectedCategory, sortBy])

    const toggleWishlist = (id: number) => {
        setWishlist(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        )
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="bg-muted/30 py-16 px-6">
                <div className="container mx-auto">
                    <h1 className="font-serif text-5xl md:text-6xl font-medium mb-4">Product Catalog</h1>
                    <p className="text-lg text-muted-foreground max-w-2xl">
                        Explore our curated collection of handcrafted ceramics and home essentials
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-6 py-12">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Filters - Desktop */}
                    <aside className="hidden lg:block w-64 flex-shrink-0">
                        <div className="sticky top-24">
                            <h3 className="font-serif text-xl font-semibold mb-4">Categories</h3>
                            <div className="space-y-2">
                                {CATEGORIES.map(category => (
                                    <button
                                        key={category}
                                        onClick={() => setSelectedCategory(category)}
                                        className={cn(
                                            "w-full text-left px-4 py-2 rounded-lg transition-colors",
                                            selectedCategory === category
                                                ? "bg-primary text-primary-foreground"
                                                : "hover:bg-muted"
                                        )}
                                    >
                                        {category}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <div className="flex-1">
                        {/* Toolbar */}
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                            <div className="flex items-center gap-4">
                                {/* Mobile Filter Toggle */}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="lg:hidden"
                                    onClick={() => setShowFilters(!showFilters)}
                                >
                                    <SlidersHorizontal className="w-4 h-4 mr-2" />
                                    Filters
                                </Button>

                                <p className="text-sm text-muted-foreground">
                                    {filteredProducts.length} products
                                </p>
                            </div>

                            <div className="flex items-center gap-4">
                                {/* Sort */}
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="px-4 py-2 rounded-lg border border-border bg-background text-sm"
                                >
                                    {SORT_OPTIONS.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>

                                {/* View Mode */}
                                <div className="flex gap-1 border border-border rounded-lg p-1">
                                    <button
                                        onClick={() => setViewMode("grid")}
                                        className={cn(
                                            "p-2 rounded",
                                            viewMode === "grid" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                                        )}
                                    >
                                        <Grid3x3 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setViewMode("list")}
                                        className={cn(
                                            "p-2 rounded",
                                            viewMode === "list" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                                        )}
                                    >
                                        <List className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Mobile Filters */}
                        <AnimatePresence>
                            {showFilters && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="lg:hidden mb-8 overflow-hidden"
                                >
                                    <div className="bg-muted/30 p-4 rounded-lg">
                                        <h3 className="font-semibold mb-3">Categories</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {CATEGORIES.map(category => (
                                                <Badge
                                                    key={category}
                                                    variant={selectedCategory === category ? "default" : "outline"}
                                                    className="cursor-pointer"
                                                    onClick={() => setSelectedCategory(category)}
                                                >
                                                    {category}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Products Grid/List */}
                        <div className={cn(
                            viewMode === "grid"
                                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                                : "flex flex-col gap-4"
                        )}>
                            <AnimatePresence mode="popLayout">
                                {filteredProducts.map((product, index) => (
                                    <motion.div
                                        key={product.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ duration: 0.3, delay: index * 0.05 }}
                                    >
                                        <ProductCard
                                            product={product}
                                            viewMode={viewMode}
                                            isWishlisted={wishlist.includes(product.id)}
                                            onToggleWishlist={() => toggleWishlist(product.id)}
                                        />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Product Card Component
function ProductCard({
    product,
    viewMode,
    isWishlisted,
    onToggleWishlist
}: {
    product: typeof PRODUCTS[0]
    viewMode: "grid" | "list"
    isWishlisted: boolean
    onToggleWishlist: () => void
}) {
    if (viewMode === "list") {
        return (
            <div className="flex gap-6 bg-card border border-border rounded-lg p-4 hover:shadow-lg transition-shadow">
                <div className="relative w-48 h-48 flex-shrink-0 rounded-lg overflow-hidden">
                    <Image src={product.image} alt={product.name} fill className="object-cover" />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                    <div>
                        <h3 className="font-serif text-2xl font-semibold mb-2">{product.name}</h3>
                        <p className="text-muted-foreground mb-4">{product.description}</p>
                        <div className="flex items-center gap-4 mb-4">
                            <Badge variant="outline">{product.category}</Badge>
                            <span className="text-sm text-muted-foreground">MOQ: {product.moq} units</span>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold">${product.price}</span>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={onToggleWishlist}>
                                <Heart className={cn("w-4 h-4", isWishlisted && "fill-current text-primary")} />
                            </Button>
                            <Link href={`/product/${product.id}`}>
                                <Button size="sm">View Details</Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <Link href={`/product/${product.id}`}>
            <div className="group relative bg-card border border-border rounded-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="relative aspect-[3/4] overflow-hidden">
                    <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {product.badge && (
                        <Badge className="absolute top-3 left-3 z-10">
                            {product.badge}
                        </Badge>
                    )}
                    <button
                        onClick={(e) => {
                            e.preventDefault()
                            onToggleWishlist()
                        }}
                        className={cn(
                            "absolute top-3 right-3 z-10 p-2 rounded-full backdrop-blur-md transition-all",
                            isWishlisted
                                ? "bg-primary text-primary-foreground"
                                : "bg-white/80 hover:bg-white"
                        )}
                    >
                        <Heart className={cn("w-4 h-4", isWishlisted && "fill-current")} />
                    </button>
                </div>
                <div className="p-4">
                    <h3 className="font-serif text-xl font-semibold mb-1">{product.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{product.category}</p>
                    <div className="flex items-center justify-between">
                        <span className="text-lg font-bold">${product.price}</span>
                        <span className="text-xs text-muted-foreground">MOQ: {product.moq}</span>
                    </div>
                </div>
            </div>
        </Link>
    )
}
