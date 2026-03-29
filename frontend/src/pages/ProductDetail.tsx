"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Heart, ShoppingCart, Package, Shield, Truck, ChevronLeft, ChevronRight, Star, AlertCircle, Loader2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { OptimizedImage } from "@/components/ui/optimized-image"
import Link from "@/components/ui/link-shim"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"
import { useCart } from "@/contexts/CartContext"
import { productsAPI, cartAPI } from "@/lib/api"

interface Product {
    id: string
    name: string
    category: string
    base_price: number
    sale_price?: number
    b2b_price?: number
    image_url?: string
    gallery_urls?: string[]
    images?: string[]
    badge?: string
    stock_status: string
    moq: number
    description: string
    features?: string[]
    tier_pricing?: Array<{ min_qty: number; max_qty?: number; price: number; discount_percent: number }>
    rating?: number
    review_count?: number
}

export default function ProductDetail() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [product, setProduct] = useState<Product | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [currentImage, setCurrentImage] = useState(0)
    const [quantity, setQuantity] = useState(12)
    const [isWishlisted, setIsWishlisted] = useState(false)
    const [addedToCart, setAddedToCart] = useState(false)
    const [addingToCart, setAddingToCart] = useState(false)
    const [showCartOptions, setShowCartOptions] = useState(false)
    const [buyMode, setBuyMode] = useState<'retail' | 'bulk'>('bulk') // Default to bulk for B2B users
    const { addItem } = useCart()
    const { user } = useAuth()
    const navigateTo = useNavigate()

    useEffect(() => {
        const fetchProduct = async () => {
            if (!id) return
            
            try {
                setLoading(true)
                setError(null)
                const data = await productsAPI.getById(id)
                
                // Check if response is an error
                if (data?.error) {
                    setError(data.error)
                    setProduct(null)
                    return
                }
                
                // Handle both wrapped and unwrapped responses
                const product = data?.product || data
                if (!product || !product.id) {
                    setError('Product not found')
                    setProduct(null)
                    return
                }
                
                setProduct(product)
                // Set initial quantity based on user role and buy mode
                const userApprovalStatus = (user as any)?.b2b_approval_status || 'none'
                const isB2BApproved = userApprovalStatus === 'approved'
                setQuantity(isB2BApproved ? (product.moq || 12) : 1)
                // Default to bulk mode for B2B users
                if (isB2BApproved) {
                    setBuyMode('bulk')
                }
            } catch (err: any) {
                console.error('Error fetching product:', err)
                setError(err.message || 'Failed to load product')
                setProduct(null)
            } finally {
                setLoading(false)
            }
        }

        fetchProduct()
    }, [id])

    // Get approval status from user object (from AuthContext)
    const approvalStatus = (user as any)?.b2b_approval_status || 'none'
    const isApproved = approvalStatus === 'approved'
    const needsApproval = approvalStatus === 'none' && user // Logged in but no approval status

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
                    <p className="text-muted-foreground">Loading product...</p>
                </div>
            </div>
        )
    }

    if (error || !product) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center max-w-md">
                    <AlertCircle className="w-16 h-16 mx-auto mb-4 text-destructive" />
                    <h2 className="text-2xl font-serif font-semibold mb-2">Product Not Found</h2>
                    <p className="text-muted-foreground mb-6">{error || 'The product you are looking for does not exist.'}</p>
                    <Button onClick={() => navigate('/catalog')}>Browse Catalog</Button>
                </div>
            </div>
        )
    }

    // Prepare images array - prioritize gallery_urls
    const productImages = product.gallery_urls && product.gallery_urls.length > 0 
        ? product.gallery_urls 
        : product.images && product.images.length > 0 
            ? product.images 
            : product.image_url 
                ? [product.image_url]
                : ['https://images.unsplash.com/photo-1581783342308-f792ca11df53?w=800&h=1000&fit=crop']

    // Parse features if stored as JSON string
    const productFeatures = typeof product.features === 'string' 
        ? JSON.parse(product.features) 
        : product.features || []

    // Calculate display price based on user role
    const displayPrice = product.sale_price || product.base_price
    const hasRetailDiscount = product.sale_price && product.sale_price < product.base_price
    const retailDiscountPercent = hasRetailDiscount 
        ? Math.round(((product.base_price - product.sale_price!) / product.base_price) * 100)
        : 0

    // Calculate B2B price based on tier pricing (for approved users)
    const currentB2BPrice = product.tier_pricing?.find(tier => {
        if (tier.max_qty) {
            return quantity >= tier.min_qty && quantity <= tier.max_qty
        }
        return quantity >= tier.min_qty
    })?.price || product.b2b_price

    // Format tier pricing for display
    const tieredPricing = product.tier_pricing?.map(tier => ({
        qty: tier.max_qty ? `${tier.min_qty}-${tier.max_qty}` : `${tier.min_qty}+`,
        price: tier.price,
        discount: `${tier.discount_percent}%`
    })) || []

    // Final price for cart (depends on user role and buy mode)
    const finalPrice = isApproved 
        ? (buyMode === 'bulk' ? (currentB2BPrice || displayPrice) : displayPrice)
        : displayPrice

    // Handle buy mode toggle
    const handleBuyModeChange = (mode: 'retail' | 'bulk') => {
        setBuyMode(mode)
        // Adjust quantity based on mode
        if (mode === 'bulk') {
            setQuantity(product.moq || 12)
        } else {
            setQuantity(1)
        }
    }

    const nextImage = () => {
        setCurrentImage((prev) => (prev + 1) % productImages.length)
    }

    const prevImage = () => {
        setCurrentImage((prev) => (prev - 1 + productImages.length) % productImages.length)
    }

    const handleAddToCart = async () => {
        try {
            setAddingToCart(true)
            const cartItem = {
                id: `${product.id}-${Date.now()}`,
                productId: product.id,
                name: product.name,
                sku: `SKU-${product.id}`,
                image: productImages[0],
                price: product.base_price,
                quantity: quantity,
                discountPrice: finalPrice !== product.base_price ? finalPrice : undefined,
                discountPercentage: finalPrice !== product.base_price 
                    ? Math.round(((product.base_price - finalPrice) / product.base_price) * 100)
                    : undefined,
                buyMode // ✅ Include buy mode
            }

            // Add to local cart
            await addItem(product.id, quantity, cartItem)

            // Sync to backend if user is logged in
            if (user) {
                try {
                    console.log('[ProductDetail] User logged in, syncing to backend:', { userId: user.id, productId: product.id, quantity })
                    const response = await cartAPI.add(product.id, quantity)
                    console.log('[ProductDetail] Cart synced to backend:', response)
                } catch (err) {
                    console.error('[ProductDetail] Error syncing to backend:', err)
                    // Continue anyway - local cart is still updated
                }
            } else {
                console.log('[ProductDetail] User not logged in, skipping backend sync')
            }

            setAddedToCart(true)
            setShowCartOptions(true)
            // Auto-hide after 5 seconds if user doesn't interact
            setTimeout(() => {
                setAddedToCart(false)
                setShowCartOptions(false)
            }, 5000)
        } catch (err) {
            console.error('Error adding to cart:', err)
        } finally {
            setAddingToCart(false)
        }
    }

    const handleViewCart = () => {
        setShowCartOptions(false)
        navigateTo('/checkout')
    }

    const handleContinueShopping = () => {
        setShowCartOptions(false)
        setAddedToCart(false)
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Show approval pending message if user is not approved */}
            {user && approvalStatus === 'pending' && (
                <div className="bg-yellow-50 dark:bg-yellow-950/30 border-b border-yellow-200 dark:border-yellow-900/50">
                    <div className="container mx-auto px-6 py-4 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0" />
                        <div className="flex-1">
                            <h3 className="font-semibold text-yellow-900 dark:text-yellow-100">Account Pending Approval</h3>
                            <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                Your account is under review. Once approved, you'll have full access to our catalog and pricing.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {user && approvalStatus === 'rejected' && (
                <div className="bg-red-50 dark:bg-red-950/30 border-b border-red-200 dark:border-red-900/50">
                    <div className="container mx-auto px-6 py-4 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-500 flex-shrink-0" />
                        <div className="flex-1">
                            <h3 className="font-semibold text-red-900 dark:text-red-100">Account Access Restricted</h3>
                            <p className="text-sm text-red-800 dark:text-red-200">
                                Your account access has been restricted. Please contact our support team for more information.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {needsApproval && (
                <div className="bg-blue-50 dark:bg-blue-950/30 border-b border-blue-200 dark:border-blue-900/50">
                    <div className="container mx-auto px-6 py-4 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-500 flex-shrink-0" />
                        <div className="flex-1">
                            <h3 className="font-semibold text-blue-900 dark:text-blue-100">B2B Approval Required</h3>
                            <p className="text-sm text-blue-800 dark:text-blue-200">
                                Request B2B approval to view pricing and place bulk orders.
                            </p>
                        </div>
                        <Link href="/b2b-request" className="ml-auto">
                            <Button variant="outline" size="sm" className="border-blue-200 hover:bg-blue-100">
                                Request Approval
                            </Button>
                        </Link>
                    </div>
                </div>
            )}
            <div className="border-b border-border">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Link href="/" className="hover:text-foreground">Home</Link>
                        <span>/</span>
                        <Link href="/catalog" className="hover:text-foreground">Catalog</Link>
                        <span>/</span>
                        <span className="text-foreground">{product.name}</span>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
                    {/* Image Gallery - Compact */}
                    <div className="lg:col-span-5 space-y-3">
                        {/* Main Image - Smaller */}
                        <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-900">
                            <OptimizedImage
                                src={productImages[currentImage]}
                                alt={product.name}
                                preset="productMain"
                                className="w-full h-full"
                            />
                            {product.badge && (
                                <Badge className="absolute top-3 left-3 z-10 text-xs">
                                    {product.badge}
                                </Badge>
                            )}

                            {/* Navigation Arrows - Smaller */}
                            {productImages.length > 1 && (
                                <>
                                    <button
                                        onClick={prevImage}
                                        className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-900 transition-colors shadow-md"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={nextImage}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-900 transition-colors shadow-md"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </>
                            )}

                            {/* Image Indicators - Smaller */}
                            {productImages.length > 1 && (
                                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                                    {productImages.map((_, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setCurrentImage(idx)}
                                            className={cn(
                                                "w-1.5 h-1.5 rounded-full transition-all",
                                                idx === currentImage
                                                    ? "bg-white w-6"
                                                    : "bg-white/50 hover:bg-white/70"
                                            )}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Thumbnail Grid - Compact */}
                        {productImages.length > 1 && (
                            <div className="grid grid-cols-5 gap-2">
                                {productImages.map((image, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentImage(idx)}
                                        className={cn(
                                            "relative aspect-square rounded-md overflow-hidden border-2 transition-all",
                                            idx === currentImage
                                                ? "border-primary ring-2 ring-primary/20"
                                                : "border-gray-200 dark:border-gray-700 hover:border-primary/50"
                                        )}
                                    >
                                        <OptimizedImage 
                                            src={image} 
                                            alt={`${product.name} ${idx + 1}`} 
                                            preset="thumbnail"
                                            className="w-full h-full"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info - Compact */}
                    <div className="lg:col-span-7 space-y-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline" className="text-xs">{product.category}</Badge>
                                {product.rating && product.review_count && (
                                    <div className="flex items-center gap-1">
                                        <div className="flex">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={cn(
                                                        "w-3.5 h-3.5 fill-current",
                                                        i < Math.floor(product.rating!) ? "text-yellow-400" : "text-gray-300"
                                                    )}
                                                />
                                            ))}
                                        </div>
                                        <span className="text-xs text-muted-foreground">
                                            {product.rating} ({product.review_count})
                                        </span>
                                    </div>
                                )}
                            </div>
                            <h1 className="font-serif text-2xl sm:text-3xl font-semibold mb-2">{product.name}</h1>
                            <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
                        </div>

                        {/* Pricing - Compact */}
                        {isApproved ? (
                            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-800">
                                {/* Buy Mode Toggle */}
                                <div className="mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                            Purchase Mode:
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleBuyModeChange('retail')}
                                            className={cn(
                                                "flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                                                buyMode === 'retail'
                                                    ? "bg-primary text-white shadow-sm"
                                                    : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
                                            )}
                                        >
                                            🛒 Retail Buy
                                        </button>
                                        <button
                                            onClick={() => handleBuyModeChange('bulk')}
                                            className={cn(
                                                "flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                                                buyMode === 'bulk'
                                                    ? "bg-emerald-600 text-white shadow-sm"
                                                    : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
                                            )}
                                        >
                                            📦 Bulk Buy
                                        </button>
                                    </div>
                                </div>

                                {/* Show pricing based on buy mode */}
                                {buyMode === 'retail' ? (
                                    /* Retail Mode Pricing */
                                    <div className="space-y-2">
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                                            Retail Pricing (Single/Small Quantities):
                                        </p>
                                        {hasRetailDiscount ? (
                                            /* Show both prices when there's a discount */
                                            <>
                                                <div className="flex items-baseline gap-2 mb-1">
                                                    <span className="text-3xl font-bold text-primary">
                                                        ${product.sale_price}
                                                    </span>
                                                    <span className="text-sm text-muted-foreground">per unit</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-base text-muted-foreground line-through">
                                                        ${product.base_price}
                                                    </span>
                                                    <span className="text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 px-2 py-0.5 rounded">
                                                        {retailDiscountPercent}% OFF
                                                    </span>
                                                </div>
                                            </>
                                        ) : (
                                            /* No discount - show only base price */
                                            <div className="flex items-baseline gap-2 mb-1">
                                                <span className="text-3xl font-bold text-primary">
                                                    ${product.base_price}
                                                </span>
                                                <span className="text-sm text-muted-foreground">per unit</span>
                                            </div>
                                        )}
                                        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/30 rounded border border-blue-200 dark:border-blue-900">
                                            <p className="text-xs text-blue-900 dark:text-blue-100 font-medium">
                                                💡 Switch to Bulk Buy for better pricing (MOQ: {product.moq} units)
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    /* Bulk Mode Pricing */
                                    <div className="space-y-3">
                                        {/* Retail Pricing Section */}
                                        <div className="pb-3 border-b border-gray-200 dark:border-gray-700">
                                            <p className="text-xs text-muted-foreground mb-1.5">Retail Pricing:</p>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-sm text-muted-foreground line-through">
                                                    ${product.base_price}
                                                </span>
                                                {hasRetailDiscount && (
                                                    <>
                                                        <span className="text-base font-semibold text-gray-700 dark:text-gray-300">
                                                            ${product.sale_price}
                                                        </span>
                                                        <span className="text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 px-2 py-0.5 rounded">
                                                            {retailDiscountPercent}% OFF
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {/* B2B Pricing Section */}
                                        <div>
                                            <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold mb-1.5">
                                                💼 Your B2B Price:
                                            </p>
                                            {tieredPricing.length > 0 ? (
                                                <>
                                                    <div className="flex items-baseline gap-2 mb-2">
                                                        <span className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                                                            ${currentB2BPrice}
                                                        </span>
                                                        <span className="text-sm text-muted-foreground">per unit</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-1 rounded">
                                                            Save ${(displayPrice - currentB2BPrice!).toFixed(2)} per unit ({Math.round(((displayPrice - currentB2BPrice!) / displayPrice) * 100)}% off retail)
                                                        </span>
                                                    </div>

                                                    {/* Tiered Pricing Table - Compact */}
                                                    <div className="space-y-1.5">
                                                        <p className="text-xs font-semibold mb-1.5">Volume Discounts:</p>
                                                        {tieredPricing.map((tier, idx) => (
                                                            <div
                                                                key={idx}
                                                                className={cn(
                                                                    "flex justify-between items-center p-2 rounded text-xs",
                                                                    tier.price === currentB2BPrice 
                                                                        ? "bg-emerald-100 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800" 
                                                                        : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                                                                )}
                                                            >
                                                                <span className="font-medium">{tier.qty} units</span>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{tier.discount} off</span>
                                                                    <span className="font-bold">${tier.price}/unit</span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    {/* Simple B2B pricing without tiers */}
                                                    <div className="flex items-baseline gap-2 mb-2">
                                                        <span className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                                                            ${product.b2b_price}
                                                        </span>
                                                        <span className="text-sm text-muted-foreground">per unit</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-1 rounded">
                                                            Save ${(displayPrice - product.b2b_price!).toFixed(2)} per unit ({Math.round(((displayPrice - product.b2b_price!) / displayPrice) * 100)}% off retail)
                                                        </span>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : user && approvalStatus === 'pending' ? (
                            <div className="bg-yellow-50 dark:bg-yellow-950/20 rounded-lg p-5 border border-yellow-200 dark:border-yellow-900/50">
                                <div className="text-center space-y-3">
                                    <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                                        <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-serif font-semibold mb-1 text-yellow-900 dark:text-yellow-100">
                                            Approval Pending
                                        </h3>
                                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                            Your B2B approval request is under review. You'll be notified once approved.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : user && approvalStatus === 'rejected' ? (
                            <div className="bg-red-50 dark:bg-red-950/20 rounded-lg p-5 border border-red-200 dark:border-red-900/50">
                                <div className="text-center space-y-3">
                                    <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                                        <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-serif font-semibold mb-1 text-red-900 dark:text-red-100">
                                            Access Restricted
                                        </h3>
                                        <p className="text-sm text-red-800 dark:text-red-200 mb-3">
                                            Your account access has been restricted. Please contact our support team.
                                        </p>
                                        <Link href="/contact">
                                            <Button variant="outline" size="sm" className="border-red-300 hover:bg-red-100 dark:hover:bg-red-900">
                                                Contact Support
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ) : user ? (
                            <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-5 border border-blue-200 dark:border-blue-900/50">
                                <div className="text-center space-y-3">
                                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                                        <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-serif font-semibold mb-1 text-blue-900 dark:text-blue-100">
                                            B2B Approval Required
                                        </h3>
                                        <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                                            Request B2B approval to view pricing and place bulk orders.
                                        </p>
                                        <Link href="/b2b-request">
                                            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                                                Request B2B Approval
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30 rounded-lg p-5 border border-yellow-200 dark:border-yellow-900/50">
                                <div className="text-center space-y-3">
                                    <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                                        <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-serif font-semibold mb-1 text-yellow-900 dark:text-yellow-100">
                                            Pricing Available for Registered Buyers
                                        </h3>
                                        <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-3">
                                            Sign in or create an account to request access to our B2B pricing.
                                        </p>
                                        <div className="flex gap-2 justify-center">
                                            <Link href="/login">
                                                <Button variant="outline" size="sm">Sign In</Button>
                                            </Link>
                                            <Link href="/signup">
                                                <Button size="sm" className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold">
                                                    Create Account
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Quantity Selector - Only for Approved Users */}
                        {isApproved && (
                            <div>
                                <label className="block text-xs font-semibold mb-1.5">
                                    Quantity (MOQ: {product.moq} units)
                                </label>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center border border-gray-300 dark:border-gray-700 rounded-lg">
                                        <button
                                            onClick={() => setQuantity(Math.max(product.moq, quantity - product.moq))}
                                            className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm"
                                        >
                                            -
                                        </button>
                                        <input
                                            type="number"
                                            value={quantity}
                                            onChange={(e) => setQuantity(Math.max(product.moq, parseInt(e.target.value) || product.moq))}
                                            className="w-20 text-center bg-transparent border-x border-gray-300 dark:border-gray-700 py-2 text-sm"
                                            min={product.moq}
                                            step={product.moq}
                                        />
                                        <button
                                            onClick={() => setQuantity(quantity + product.moq)}
                                            className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm"
                                        >
                                            +
                                        </button>
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                        Total: <span className="font-semibold text-foreground">${(finalPrice * quantity).toFixed(2)}</span>
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Actions - Only for Approved Users */}
                        {isApproved ? (
                            <>
                                <div className="flex gap-2">
                                    <Button 
                                        size="default" 
                                        className="flex-1"
                                        onClick={handleAddToCart}
                                        disabled={addingToCart}
                                    >
                                        {addingToCart ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Adding...
                                            </>
                                        ) : addedToCart ? (
                                            <>
                                                <Check className="w-4 h-4 mr-2" />
                                                Added to Cart!
                                            </>
                                        ) : (
                                            <>
                                                <ShoppingCart className="w-4 h-4 mr-2" />
                                                Add to Cart
                                            </>
                                        )}
                                    </Button>
                                    <Button
                                        size="default"
                                        variant={isWishlisted ? "default" : "outline"}
                                        onClick={() => setIsWishlisted(!isWishlisted)}
                                    >
                                        <Heart className={cn("w-4 h-4", isWishlisted && "fill-current")} />
                                    </Button>
                                </div>

                                {/* Cart Options Modal */}
                                {showCartOptions && addedToCart && (
                                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                                        <div className="bg-background rounded-lg p-5 max-w-sm w-full shadow-lg">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Check className="w-5 h-5 text-green-500" />
                                                <h3 className="text-base font-semibold">Added to Cart!</h3>
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-4">
                                                {product.name} has been added to your cart.
                                            </p>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="flex-1"
                                                    onClick={handleContinueShopping}
                                                >
                                                    Continue Shopping
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className="flex-1"
                                                    onClick={handleViewCart}
                                                >
                                                    View Cart
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : null}

                        {/* Features - Compact */}
                        {productFeatures.length > 0 && (
                            <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
                                <h3 className="font-semibold text-sm mb-2">Product Features</h3>
                                <ul className="space-y-1.5">
                                    {productFeatures.map((feature: string, idx: number) => (
                                        <li key={idx} className="flex items-start gap-2 text-xs">
                                            <span className="text-primary mt-0.5">✓</span>
                                            <span className="text-muted-foreground">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Trust Badges - Compact */}
                        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                            <div className="text-center">
                                <Truck className="w-6 h-6 mx-auto mb-1.5 text-primary" />
                                <p className="text-xs font-medium">Free Shipping</p>
                                <p className="text-xs text-muted-foreground">Orders $500+</p>
                            </div>
                            <div className="text-center">
                                <Shield className="w-6 h-6 mx-auto mb-1.5 text-primary" />
                                <p className="text-xs font-medium">Quality Guarantee</p>
                                <p className="text-xs text-muted-foreground">100% Certified</p>
                            </div>
                            <div className="text-center">
                                <Package className="w-6 h-6 mx-auto mb-1.5 text-primary" />
                                <p className="text-xs font-medium">Bulk Orders</p>
                                <p className="text-xs text-muted-foreground">Volume Pricing</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
