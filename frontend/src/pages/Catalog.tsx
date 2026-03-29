"use client"

import { useState, useMemo, useEffect } from "react"
import { useLocation } from "react-router-dom"
import { motion } from "framer-motion"
import { SlidersHorizontal, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { productsAPI, categoriesAPI, cartAPI } from "@/lib/api"
import { ProductCardCompact } from "@/components/product/product-card-compact"
import { useCart } from "@/contexts/CartContext"
import { useAuth } from "@/contexts/AuthContext"

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
}

const SORT_OPTIONS = [
    { value: "featured", label: "Featured" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
    { value: "name", label: "Name: A-Z" },
]

export default function Catalog() {
    const location = useLocation()
    const { addItem } = useCart()
    const { user } = useAuth()
    const [products, setProducts] = useState<Product[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [selectedCategory, setSelectedCategory] = useState("All")
    const [sortBy, setSortBy] = useState("featured")
    const [showFilters, setShowFilters] = useState(false)
    const [wishlist, setWishlist] = useState<string[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productsData, categoriesData] = await Promise.all([
                    productsAPI.getAll(),
                    categoriesAPI.getAll()
                ])
                setProducts(productsData.products || [])
                setCategories(categoriesData.categories || [])
                
                const params = new URLSearchParams(location.search)
                const categoryParam = params.get('category')
                if (categoryParam) setSelectedCategory(categoryParam)
            } catch (error) {
                console.error("Failed to fetch data:", error)
            } finally {
                setLoading(false)
            }
        }

        window.scrollTo(0, 0)
        fetchData()
    }, [location.search])

    const filteredProducts = useMemo(() => {
        let filtered = products

        if (selectedCategory !== "All") {
            const categoryId = categories.find(c => c.slug === selectedCategory)?.id
            if (categoryId) filtered = filtered.filter(p => p.category_id === categoryId)
        }

        switch (sortBy) {
            case "price-low":
                filtered = [...filtered].sort((a, b) => (a.base_price || 0) - (b.base_price || 0))
                break
            case "price-high":
                filtered = [...filtered].sort((a, b) => (b.base_price || 0) - (a.base_price || 0))
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

    const toggleWishlist = (id: string, e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setWishlist(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        )
    }

    const handleAddToCart = async (productId: string, quantity: number, buyMode: 'retail' | 'bulk') => {
        const product = products.find(p => p.id === productId)
        if (!product) return

        const price = buyMode === 'bulk' && product.b2b_price 
            ? product.b2b_price 
            : (product.sale_price || product.base_price || 0)

        const cartItem = {
            id: `${productId}-${Date.now()}`,
            productId,
            name: product.name,
            sku: `SKU-${productId}`,
            image: product.image_url,
            price: product.base_price || 0,
            quantity,
            discountPrice: price !== (product.base_price || 0) ? price : undefined,
            discountPercentage: price !== (product.base_price || 0)
                ? Math.round((((product.base_price || 0) - price) / (product.base_price || 1)) * 100)
                : undefined,
            buyMode // ✅ Include buy mode
        }

        await addItem(productId, quantity, cartItem)

        // Sync to backend if user is logged in
        if (user) {
            try {
                await cartAPI.add(productId, quantity)
            } catch (err) {
                console.error('Error syncing to backend:', err)
            }
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading products...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            {/* Compact Header */}
            <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 py-8 px-6">
                <div className="container mx-auto max-w-7xl">
                    <h1 className="font-serif text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                        All Products
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        {filteredProducts.length} products available
                    </p>
                </div>
            </div>

            <div className="container mx-auto max-w-7xl px-6 py-8">
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Sidebar - Desktop */}
                    <aside className="hidden lg:block w-56 flex-shrink-0">
                        <div className="sticky top-6 space-y-6">
                            {/* Categories */}
                            <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
                                <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-3">Categories</h3>
                                <div className="space-y-1">
                                    <button
                                        onClick={() => setSelectedCategory("All")}
                                        className={cn(
                                            "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                                            selectedCategory === "All"
                                                ? "bg-primary text-white"
                                                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                                        )}
                                    >
                                        All Products
                                    </button>
                                    {categories.map((category) => (
                                        <button
                                            key={category.id}
                                            onClick={() => setSelectedCategory(category.slug)}
                                            className={cn(
                                                "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                                                selectedCategory === category.slug
                                                    ? "bg-primary text-white"
                                                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                                            )}
                                        >
                                            {category.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <div className="flex-1">
                        {/* Toolbar */}
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                            {/* Mobile Filter Button */}
                            <Button
                                variant="outline"
                                size="sm"
                                className="lg:hidden"
                                onClick={() => setShowFilters(!showFilters)}
                            >
                                <SlidersHorizontal className="w-4 h-4 mr-2" />
                                Filters
                            </Button>

                            {/* Sort */}
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white"
                            >
                                {SORT_OPTIONS.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Mobile Filters */}
                        {showFilters && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="lg:hidden mb-6 bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-semibold text-sm">Categories</h3>
                                    <button onClick={() => setShowFilters(false)}>
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="space-y-1">
                                    <button
                                        onClick={() => {
                                            setSelectedCategory("All")
                                            setShowFilters(false)
                                        }}
                                        className={cn(
                                            "w-full text-left px-3 py-2 rounded-lg text-sm",
                                            selectedCategory === "All" ? "bg-primary text-white" : "hover:bg-gray-100 dark:hover:bg-gray-800"
                                        )}
                                    >
                                        All Products
                                    </button>
                                    {categories.map((category) => (
                                        <button
                                            key={category.id}
                                            onClick={() => {
                                                setSelectedCategory(category.slug)
                                                setShowFilters(false)
                                            }}
                                            className={cn(
                                                "w-full text-left px-3 py-2 rounded-lg text-sm",
                                                selectedCategory === category.slug ? "bg-primary text-white" : "hover:bg-gray-100 dark:hover:bg-gray-800"
                                            )}
                                        >
                                            {category.name}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Products Grid - Compact */}
                        {filteredProducts.length === 0 ? (
                            <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                                <p className="text-gray-600 dark:text-gray-400">No products found</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                {filteredProducts.map((product, index) => (
                                    <ProductCardCompact
                                        key={product.id}
                                        product={product}
                                        index={index}
                                        onToggleWishlist={toggleWishlist}
                                        isWishlisted={wishlist.includes(product.id)}
                                        onAddToCart={handleAddToCart}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
