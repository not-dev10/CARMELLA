"use client"

import { useState, useMemo, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { SlidersHorizontal, Grid3x3, List, Heart, Lock, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Image from "@/components/ui/image-shim"
import Link from "@/components/ui/link-shim"
import { cn } from "@/lib/utils"
import { productsAPI, categoriesAPI } from "@/lib/api"

interface Product {
    id: string
    name: string
    slug: string
    category_id: string
    base_price: number | null
    sale_price?: number | null
    sale_percentage?: number | null
    b2b_price?: number | null
    moq?: number | null
    image_url: string
    badge?: string
    stock_quantity: number
    description: string
    is_featured: boolean
    pricingLocked?: boolean
}

interface Category {
    id: string
    name: string
    slug: string
}

const SORT_OPTIONS = [
    { value: "featured", label: "Featured" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
    { value: "name", label: "Name: A-Z" },
]

export default function Catalog() {
    const [products, setProducts] = useState<Product[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [selectedCategory, setSelectedCategory] = useState("All")
    const [sortBy, setSortBy] = useState("featured")
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
    const [showFilters, setShowFilters] = useState(false)
    const [wishlist, setWishlist] = useState<string[]>([])
    const [loading, setLoading] = useState(true)

    // Fetch products and categories
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productsData, categoriesData] = await Promise.all([
                    productsAPI.getAll(),
                    categoriesAPI.getAll()
                ])
                setProducts(productsData.products || [])
                setCategories(categoriesData.categories || [])
            } catch (error) {
                console.error("Failed to fetch data:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    // Filter and sort products
    const filteredProducts = useMemo(() => {
        let filtered = products

        // Filter by category
        if (selectedCategory !== "All") {
            const categoryId = categories.find(c => c.slug === selectedCategory)?.id
            if (categoryId) {
                filtered = filtered.filter(p => p.category_id === categoryId)
            }
        }

        // Sort
        switch (sortBy) {
            case "price-low":
                filtered = [...filtered].sort((a, b) => a.base_price - b.base_price)
                break
            case "price-high":
                filtered = [...filtered].sort((a, b) => b.base_price - a.base_price)
                break
            case "name":
                filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name))
                break
            case "featured":
                filtered = [...filtered].sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0))
                break
        }

        return filtered
    }, [products, categories, selectedCategory, sortBy])

    const toggleWishlist = (id: string) => {
        setWishlist(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        )
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading products...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header with Gradient */}
            <div className="section-gradient-accent py-16 px-6 relative overflow-hidden">
                <div className="absolute inset-0 gradient-mesh opacity-40" />
                <div className="container mx-auto relative z-10">
                    <h1 className="font-serif text-5xl md:text-6xl font-medium mb-4 text-gradient">Product Catalog</h1>
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
                                <button
                                    onClick={() => setSelectedCategory("All")}
                                    className={cn(
                                        "w-full text-left px-4 py-2 rounded-lg transition-colors",
                                        selectedCategory === "All"
                                            ? "bg-primary text-primary-foreground"
                                            : "hover:bg-muted"
                                    )}
                                >
                                    All
                                </button>
                                {categories.map(category => (
                                    <button
                                        key={category.id}
                                        onClick={() => setSelectedCategory(category.slug)}
                                        className={cn(
                                            "w-full text-left px-4 py-2 rounded-lg transition-colors",
                                            selectedCategory === category.slug
                                                ? "bg-primary text-primary-foreground"
                                                : "hover:bg-muted"
                                        )}
                                    >
                                        {category.name}
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
                                            <Badge
                                                variant={selectedCategory === "All" ? "default" : "outline"}
                                                className="cursor-pointer"
                                                onClick={() => setSelectedCategory("All")}
                                            >
                                                All
                                            </Badge>
                                            {categories.map(category => (
                                                <Badge
                                                    key={category.id}
                                                    variant={selectedCategory === category.slug ? "default" : "outline"}
                                                    className="cursor-pointer"
                                                    onClick={() => setSelectedCategory(category.slug)}
                                                >
                                                    {category.name}
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
    product: Product
    viewMode: "grid" | "list"
    isWishlisted: boolean
    onToggleWishlist: () => void
}) {
    const displayPrice = product.sale_price || product.base_price

    if (viewMode === "list") {
        return (
            <div className="flex gap-6 bg-card border border-border rounded-lg p-4 hover:shadow-lg transition-shadow card-gradient-hover">
                <div className="relative w-48 h-48 flex-shrink-0 rounded-lg overflow-hidden">
                    <Image src={product.image_url} alt={product.name} fill className="object-cover" />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                    <div>
                        <h3 className="font-serif text-2xl font-semibold mb-2 text-gradient">{product.name}</h3>
                        <p className="text-muted-foreground mb-4">{product.description}</p>
                        <div className="flex items-center gap-4 mb-4">
                            <Badge variant="outline" className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30">
                                {product.stock_quantity > 0 ? "In Stock" : "Out of Stock"}
                            </Badge>
                            <span className="text-sm text-muted-foreground">Stock: {product.stock_quantity}</span>
                        </div>
                    </div>
                    <div className="space-y-3">
                        {/* Pricing Tier Section */}
                        {product.pricingLocked ? (
                            // GUEST TIER: Pricing Locked
                            <div className="p-3 rounded-lg bg-gradient-to-r from-primary/20 to-accent/20 border-2 border-primary/30">
                                <div className="flex items-center gap-2">
                                    <Lock className="w-5 h-5 text-primary" />
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-wider text-primary">Pricing Locked</p>
                                        <p className="text-sm text-foreground">Sign in to see prices</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* LOGGED-IN TIER: Regular Pricing */}
                                <div className="p-3 rounded-lg bg-gradient-to-r from-primary/10 to-transparent border border-primary/30">
                                    <div className="flex items-baseline justify-between gap-2">
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-2xl font-bold text-primary">
                                                {product.sale_price !== null && product.sale_price !== undefined
                                                    ? `$${product.sale_price.toFixed(2)}`
                                                    : product.base_price !== null && product.base_price !== undefined
                                                        ? `$${product.base_price.toFixed(2)}`
                                                        : "Contact for price"}
                                            </span>
                                            {product.sale_price && product.base_price && (
                                                <span className="text-sm text-muted-foreground line-through">
                                                    ${product.base_price.toFixed(2)}
                                                </span>
                                            )}
                                        </div>
                                        {product.sale_percentage && product.sale_percentage > 0 && (
                                            <span className="px-2 py-1 bg-destructive text-destructive-foreground text-xs font-bold rounded">
                                                {product.sale_percentage.toFixed(0)}% OFF
                                            </span>
                                        )}
                                    </div>
                                    {product.moq && product.moq > 0 && (
                                        <p className="text-xs text-muted-foreground mt-2">
                                            Minimum Order: <span className="font-semibold text-foreground">{product.moq} units</span>
                                        </p>
                                    )}
                                </div>

                                {/* B2B TIER: Bulk Pricing Message */}
                                <div className="p-3 rounded-lg bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40">
                                    <div className="flex items-start gap-3">
                                        <Package className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-wider text-amber-700">B2B Pricing</p>
                                            {product.b2b_price && product.b2b_price > 0 ? (
                                                <p className="text-sm text-amber-900 font-semibold">
                                                    Bulk: ${product.b2b_price.toFixed(2)} (50+ units)
                                                </p>
                                            ) : (
                                                <Link href="/b2b-request" className="text-sm text-amber-700 font-semibold hover:text-amber-900">
                                                    📊 Request Bulk Pricing →
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-2">
                            <Button variant="outline" size="sm" onClick={onToggleWishlist} className="hover-gradient">
                                <Heart className={cn("w-4 h-4", isWishlisted && "fill-current text-primary")} />
                            </Button>
                            <Link href={`/product/${product.id}`} className="flex-1">
                                <Button size="sm" className="btn-gradient w-full">View Details</Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <Link href={`/product/${product.id}`}>
            <div className="group relative bg-card border border-border rounded-lg overflow-hidden hover:shadow-xl transition-shadow card-gradient-hover flex flex-col h-full">
                <div className="relative aspect-[3/4] overflow-hidden">
                    <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {product.badge && (
                        <Badge className="absolute top-3 left-3 z-10 bg-gradient-to-r from-primary to-accent text-primary-foreground">
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
                                ? "bg-gradient-to-r from-primary to-accent text-primary-foreground"
                                : "bg-white/80 hover:bg-white"
                        )}
                    >
                        <Heart className={cn("w-4 h-4", isWishlisted && "fill-current")} />
                    </button>
                </div>
                <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-serif text-lg font-semibold mb-1 text-gradient line-clamp-2">{product.name}</h3>
                    <p className="text-xs text-muted-foreground mb-3">
                        {product.stock_quantity > 0 ? "In Stock" : "Out of Stock"}
                    </p>
                    <div className="space-y-2 flex-1">
                        {/* Pricing Tier Section */}
                        {product.pricingLocked ? (
                            // GUEST TIER: Pricing Locked
                            <div className="p-2 rounded-lg bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30">
                                <div className="flex items-center gap-2">
                                    <Lock className="w-4 h-4 text-primary flex-shrink-0" />
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold uppercase tracking-wider text-primary leading-tight">Locked</p>
                                        <p className="text-xs text-foreground leading-tight">Sign in</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* LOGGED-IN TIER: Regular Pricing */}
                                <div className="p-2 rounded-lg bg-gradient-to-r from-primary/10 to-transparent border border-primary/30">
                                    <div className="flex items-baseline justify-between gap-1">
                                        <span className="text-xl font-bold text-primary truncate">
                                            {product.sale_price !== null && product.sale_price !== undefined
                                                ? `$${product.sale_price.toFixed(2)}`
                                                : product.base_price !== null && product.base_price !== undefined
                                                    ? `$${product.base_price.toFixed(2)}`
                                                    : "Contact"}
                                        </span>
                                        {product.sale_percentage && product.sale_percentage > 0 && (
                                            <span className="px-1.5 py-0.5 bg-destructive text-destructive-foreground text-xs font-bold rounded whitespace-nowrap">
                                                {product.sale_percentage.toFixed(0)}% OFF
                                            </span>
                                        )}
                                    </div>
                                    {product.sale_price && product.base_price && (
                                        <span className="text-xs text-muted-foreground line-through">
                                            ${product.base_price.toFixed(2)}
                                        </span>
                                    )}
                                </div>

                                {/* B2B TIER: Bulk Pricing Message */}
                                <div className="p-2 rounded-lg bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40">
                                    <div className="flex items-start gap-2">
                                        <Package className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                                        <div className="min-w-0">
                                            <p className="text-xs font-bold uppercase tracking-wider text-amber-700 leading-tight">B2B</p>
                                            {product.b2b_price && product.b2b_price > 0 ? (
                                                <p className="text-xs text-amber-900 font-semibold leading-tight">
                                                    ${product.b2b_price.toFixed(2)}
                                                </p>
                                            ) : (
                                                <p className="text-xs text-amber-700 font-semibold leading-tight">Request</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    )
}
