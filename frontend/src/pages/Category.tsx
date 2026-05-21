"use client"

import { useState, useMemo, useEffect } from "react"
import { useParams } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { SlidersHorizontal, Grid3x3, List, Heart, Lock, Package, ArrowLeft, X } from "lucide-react"
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
    userTier?: 'guest' | 'user' | 'b2b_approved' | 'b2b_pending' | 'b2b_rejected'
}

interface Category {
    id: string
    name: string
    slug: string
    description?: string
}

interface Filters {
    priceRange: [number, number]
    inStock: boolean | null
    featured: boolean | null
}

const SORT_OPTIONS = [
    { value: "featured", label: "Featured" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
    { value: "name", label: "Name: A-Z" },
]

export default function Category() {
    const { slug } = useParams<{ slug: string }>()
    const [products, setProducts] = useState<Product[]>([])
    const [category, setCategory] = useState<Category | null>(null)
    const [sortBy, setSortBy] = useState("featured")
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
    const [showFilters, setShowFilters] = useState(false)
    const [wishlist, setWishlist] = useState<string[]>([])
    const [loading, setLoading] = useState(true)
    const [filters, setFilters] = useState<Filters>({
        priceRange: [0, 10000],
        inStock: null,
        featured: null
    })

    // Fetch products and category
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productsData, categoriesData] = await Promise.all([
                    productsAPI.getAll(),
                    categoriesAPI.getAll()
                ])

                // Find the category by slug
                const foundCategory = categoriesData.categories?.find((c: Category) => c.slug === slug)
                setCategory(foundCategory || null)

                // Filter products by category
                if (foundCategory) {
                    const categoryProducts = productsData.products?.filter((p: Product) => p.category_id === foundCategory.id) || []
                    setProducts(categoryProducts)
                    
                    // Calculate max price for price range
                    if (categoryProducts.length > 0) {
                        const maxPrice = Math.max(...categoryProducts.map((p: Product) => p.base_price || p.sale_price || 0))
                        setFilters(prev => ({
                            ...prev,
                            priceRange: [0, Math.ceil(maxPrice * 1.1)]
                        }))
                    }
                }
            } catch (error) {
                console.error("Failed to fetch data:", error)
            } finally {
                setLoading(false)
            }
        }

        // Scroll to top
        window.scrollTo(0, 0)
        fetchData()
    }, [slug])

    // Apply filters to products
    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            const price = product.sale_price || product.base_price || 0
            
            // Price filter
            if (price < filters.priceRange[0] || price > filters.priceRange[1]) {
                return false
            }
            
            // Stock filter
            if (filters.inStock === true && product.stock_quantity === 0) {
                return false
            }
            if (filters.inStock === false && product.stock_quantity > 0) {
                return false
            }
            
            // Featured filter
            if (filters.featured === true && !product.is_featured) {
                return false
            }
            
            return true
        })
    }, [products, filters])

    // Sort products
    const sortedProducts = useMemo(() => {
        let sorted = [...filteredProducts]

        switch (sortBy) {
            case "price-low":
                sorted = sorted.sort((a, b) => (a.base_price || 0) - (b.base_price || 0))
                break
            case "price-high":
                sorted = sorted.sort((a, b) => (b.base_price || 0) - (a.base_price || 0))
                break
            case "name":
                sorted = sorted.sort((a, b) => a.name.localeCompare(b.name))
                break
            case "featured":
                sorted = sorted.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0))
                break
        }

        return sorted
    }, [filteredProducts, sortBy])

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
                    <p className="text-muted-foreground">Loading category...</p>
                </div>
            </div>
        )
    }

    if (!category) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Category not found</h1>
                    <Link href="/catalog">
                        <Button>Back to Catalog</Button>
                    </Link>
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
                    <Link href="/catalog" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 mb-4">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Catalog
                    </Link>
                    <h1 className="font-serif text-5xl md:text-6xl font-medium mb-4 text-gradient">{category.name}</h1>
                    <p className="text-lg text-muted-foreground max-w-2xl">
                        {category.description || "Explore our collection"}
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-6 py-12">
                {/* Main Layout: Sidebar + Content */}
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Filters */}
                    <aside className={cn(
                        "lg:w-72 flex-shrink-0",
                        showFilters ? "block" : "hidden lg:block"
                    )}>
                        <div className="sticky top-24 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
                            {/* Header */}
                            <div className="flex items-center justify-between lg:block">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-lg">
                                        <SlidersHorizontal className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Filters</h3>
                                </div>
                                <button
                                    onClick={() => setShowFilters(false)}
                                    className="lg:hidden p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Price Filter */}
                            <div className="space-y-4 pb-6 border-b border-gray-200 dark:border-gray-800">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                        <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M8.16 5a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0zM7 8.75A.75.75 0 1 1 8.5 8 .75.75 0 0 1 7 8.75zM7 12.75a.75.75 0 1 0 1.5 0 .75.75 0 0 0-1.5 0zM16 5a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0zM15 8.75a.75.75 0 1 1 1.5 0 .75.75 0 0 1-1.5 0zM15 12.75a.75.75 0 1 0 1.5 0 .75.75 0 0 0-1.5 0z" />
                                        </svg>
                                    </div>
                                    <label className="font-bold text-sm text-gray-900 dark:text-white">Price Range</label>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex gap-2">
                                        <div className="flex-1">
                                            <input
                                                type="number"
                                                placeholder="Min"
                                                value={filters.priceRange[0]}
                                                onChange={(e) => setFilters({
                                                    ...filters,
                                                    priceRange: [Math.max(0, Number(e.target.value)), filters.priceRange[1]]
                                                })}
                                                className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <input
                                                type="number"
                                                placeholder="Max"
                                                value={filters.priceRange[1]}
                                                onChange={(e) => setFilters({
                                                    ...filters,
                                                    priceRange: [filters.priceRange[0], Math.max(filters.priceRange[0], Number(e.target.value))]
                                                })}
                                                className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            />
                                        </div>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max={filters.priceRange[1] * 2}
                                        value={filters.priceRange[1]}
                                        onChange={(e) => setFilters({
                                            ...filters,
                                            priceRange: [filters.priceRange[0], Number(e.target.value)]
                                        })}
                                        className="w-full h-2 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                    />
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Price Range</span>
                                        <span className="text-sm font-bold bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full">
                                            ${filters.priceRange[0]} - ${filters.priceRange[1]}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Stock Status */}
                            <div className="space-y-4 pb-6 border-b border-gray-200 dark:border-gray-800">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                        <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.052-.143Z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <label className="font-bold text-sm text-gray-900 dark:text-white">Stock Status</label>
                                </div>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all group">
                                        <input
                                            type="checkbox"
                                            checked={filters.inStock === null}
                                            onChange={() => setFilters({ ...filters, inStock: null })}
                                            className="w-5 h-5 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <div className="flex-1">
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">All Items</span>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">See all products</p>
                                        </div>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all group">
                                        <input
                                            type="checkbox"
                                            checked={filters.inStock === true}
                                            onChange={() => setFilters({ ...filters, inStock: true })}
                                            className="w-5 h-5 cursor-pointer rounded border-gray-300 text-green-600 focus:ring-green-500"
                                        />
                                        <div className="flex-1">
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">In Stock Only</span>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Ready to ship</p>
                                        </div>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all group">
                                        <input
                                            type="checkbox"
                                            checked={filters.inStock === false}
                                            onChange={() => setFilters({ ...filters, inStock: false })}
                                            className="w-5 h-5 cursor-pointer rounded border-gray-300 text-red-600 focus:ring-red-500"
                                        />
                                        <div className="flex-1">
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">Out of Stock</span>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Coming soon</p>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            {/* Featured Filter */}
                            <div className="space-y-4 pb-6 border-b border-gray-200 dark:border-gray-800">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                                        <svg className="w-4 h-4 text-amber-600 dark:text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.894 3.894a.75.75 0 1 0-1.788-1.788 .75.75 0 0 0 1.788 1.788zM7.754 2.694a2.25 2.25 0 1 1 3.192 3.192 2.25 2.25 0 0 1-3.192-3.192zM11.896 9.735l-1.591-1.591A.75.75 0 1 0 9.504 9.527l1.591 1.591a.75.75 0 1 0 1.061-1.061l-.26-.322zM9.504 9.527L7.913 7.936a.75.75 0 0 0-1.061 1.061l1.591 1.591a.75.75 0 1 0 1.061-1.061z" />
                                        </svg>
                                    </div>
                                    <label className="font-bold text-sm text-gray-900 dark:text-white">Featured</label>
                                </div>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all group">
                                        <input
                                            type="checkbox"
                                            checked={filters.featured === null}
                                            onChange={() => setFilters({ ...filters, featured: null })}
                                            className="w-5 h-5 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <div className="flex-1">
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">All Products</span>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Browse entire catalog</p>
                                        </div>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all group bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                                        <input
                                            type="checkbox"
                                            checked={filters.featured === true}
                                            onChange={() => setFilters({ ...filters, featured: true })}
                                            className="w-5 h-5 cursor-pointer rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                                        />
                                        <div className="flex-1">
                                            <span className="text-sm font-bold text-amber-900 dark:text-amber-200 group-hover:text-amber-900 dark:group-hover:text-amber-100">✨ Featured Only</span>
                                            <p className="text-xs text-amber-700 dark:text-amber-400">Handpicked selections</p>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            {/* Reset Filters Button */}
                            <Button
                                variant="outline"
                                className="w-full h-11 rounded-xl font-semibold text-sm bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all text-gray-900 dark:text-white"
                                onClick={() => setFilters({
                                    priceRange: [0, 10000],
                                    inStock: null,
                                    featured: null
                                })}
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Clear All Filters
                            </Button>
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
                                    {sortedProducts.length} of {products.length} products
                                </p>
                            </div>

                            <div className="flex items-center gap-4">
                                {/* Sort */}
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="px-4 py-2 rounded-lg border border-border bg-background text-sm font-medium hover:bg-muted transition-colors"
                                >
                                    {SORT_OPTIONS.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>

                                {/* View Mode */}
                                <div className="flex gap-1 border border-border rounded-lg p-1 bg-background">
                                    <button
                                        onClick={() => setViewMode("grid")}
                                        className={cn(
                                            "p-2 rounded transition-colors",
                                            viewMode === "grid" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                                        )}
                                    >
                                        <Grid3x3 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setViewMode("list")}
                                        className={cn(
                                            "p-2 rounded transition-colors",
                                            viewMode === "list" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                                        )}
                                    >
                                        <List className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Products Grid/List */}
                        {sortedProducts.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-muted-foreground mb-4">No products match your filters</p>
                                <Button
                                    variant="outline"
                                    onClick={() => setFilters({
                                        priceRange: [0, 10000],
                                        inStock: null,
                                        featured: null
                                    })}
                                >
                                    Clear Filters
                                </Button>
                            </div>
                        ) : (
                            <div className={cn(
                                viewMode === "grid"
                                    ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                                    : "flex flex-col gap-4"
                            )}>
                                <AnimatePresence mode="popLayout">
                                    {sortedProducts.map((product, index) => (
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
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

// Product Card Component (same as Catalog)
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
    if (viewMode === "list") {
        return (
            <div className="flex gap-3 sm:gap-6 bg-card border border-border rounded-lg p-2 sm:p-4 hover:shadow-lg transition-shadow card-gradient-hover">
                <div className="relative w-24 h-24 sm:w-32 sm:h-32 md:w-48 md:h-48 flex-shrink-0 rounded-lg overflow-hidden">
                    <Image src={product.image_url} alt={product.name} fill className="object-cover" />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                    <div>
                        <h3 className="font-serif text-base sm:text-lg md:text-2xl font-semibold mb-1 sm:mb-2 text-gradient line-clamp-2">{product.name}</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-4 line-clamp-2">{product.description}</p>
                        <div className="flex items-center gap-2 sm:gap-4 mb-2 sm:mb-4 flex-wrap">
                            <Badge variant="outline" className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30 text-xs">
                                {product.stock_quantity > 0 ? "In Stock" : "Out of Stock"}
                            </Badge>
                            <span className="text-xs sm:text-sm text-muted-foreground">Stock: {product.stock_quantity}</span>
                        </div>
                    </div>
                    <div className="space-y-3">
                        {product.pricingLocked ? (
                            <div className="p-3 rounded-lg bg-gradient-to-r from-primary/20 to-accent/20 border-2 border-primary/30">
                                <div className="flex items-center gap-2">
                                    <Lock className="w-5 h-5 text-primary" />
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-wider text-primary">Pricing Locked</p>
                                        <p className="text-sm text-foreground">
                                            {product.userTier === 'guest'
                                                ? 'Login to view pricing'
                                                : 'Request B2B approval to see prices'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="p-3 rounded-lg bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200">
                                    <div className="flex items-baseline justify-between gap-2">
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent">
                                                {product.sale_price !== null && product.sale_price !== undefined
                                                    ? `${product.sale_price.toFixed(2)}`
                                                    : product.base_price !== null && product.base_price !== undefined
                                                        ? `${product.base_price.toFixed(2)}`
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
                                </div>

                                <div className="p-3 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200">
                                    <div className="flex items-start gap-3">
                                        <Package className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">B2B Pricing</p>
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
                                                    className="text-sm text-emerald-700 font-semibold hover:text-emerald-900"
                                                >
                                                    📊 Request Bulk Pricing →
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
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
            <motion.div
                whileHover={{ y: -8 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="group relative bg-card border border-border rounded-lg overflow-hidden hover:shadow-xl transition-shadow card-gradient-hover flex flex-col h-full"
            >
                <div className="relative aspect-square overflow-hidden">
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
                <div className="p-2 sm:p-3 flex-1 flex flex-col">
                    <h3 className="font-serif text-sm sm:text-base font-semibold mb-1 text-gradient line-clamp-2">{product.name}</h3>
                    <p className="text-xs text-muted-foreground mb-2">
                        {product.stock_quantity > 0 ? "In Stock" : "Out of Stock"}
                    </p>
                    <div className="space-y-2 flex-1">
                        {product.pricingLocked ? (
                            <div className="p-2 rounded-lg bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30">
                                <div className="flex items-center gap-2">
                                    <Lock className="w-4 h-4 text-primary flex-shrink-0" />
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold uppercase tracking-wider text-primary leading-tight">Locked</p>
                                        <p className="text-xs text-foreground leading-tight">
                                            {product.userTier === 'guest'
                                                ? 'Login to view pricing'
                                                : 'Request B2B approval'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="p-2 rounded-lg bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200">
                                    <div className="flex items-baseline justify-between gap-1">
                                        <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent truncate">
                                            {product.sale_price !== null && product.sale_price !== undefined
                                                ? `${product.sale_price.toFixed(2)}`
                                                : product.base_price !== null && product.base_price !== undefined
                                                    ? `${product.base_price.toFixed(2)}`
                                                    : "Contact"}
                                        </span>
                                        {product.sale_percentage && product.sale_percentage > 0 && (
                                            <span className="px-1.5 py-0.5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded whitespace-nowrap">
                                                {product.sale_percentage.toFixed(0)}% OFF
                                            </span>
                                        )}
                                    </div>
                                    {product.sale_price && product.base_price && (
                                        <span className="text-xs text-gray-500 line-through">
                                            ${product.base_price.toFixed(2)}
                                        </span>
                                    )}
                                </div>

                                <div className="p-2 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200">
                                    <div className="flex items-start gap-2">
                                        <Package className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                                        <div className="min-w-0">
                                            <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 leading-tight">B2B</p>
                                            {product.b2b_price && product.b2b_price > 0 ? (
                                                <p className="text-xs text-emerald-800 font-semibold leading-tight">
                                                    ${product.b2b_price.toFixed(2)}
                                                </p>
                                            ) : (
                                                <p className="text-xs text-emerald-700 font-semibold leading-tight">Request</p>
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
    )
}
