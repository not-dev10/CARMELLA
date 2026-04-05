"use client"

import { useState, useMemo, useEffect } from "react"
import { useParams } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { SlidersHorizontal, Grid3x3, List, Heart, Lock, Package, ArrowLeft } from "lucide-react"
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

    // Sort products
    const sortedProducts = useMemo(() => {
        let sorted = [...products]

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
    }, [products, sortBy])

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
                            {sortedProducts.length} products
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

                {/* Products Grid/List */}
                {sortedProducts.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground mb-4">No products found in this category</p>
                        <Link href="/catalog">
                            <Button>Browse All Products</Button>
                        </Link>
                    </div>
                ) : (
                    <div className={cn(
                        viewMode === "grid"
                            ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4"
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
