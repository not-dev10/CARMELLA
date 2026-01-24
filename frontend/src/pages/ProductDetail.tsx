"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Heart, ShoppingCart, Package, Shield, Truck, ChevronLeft, ChevronRight, Star, AlertCircle, Loader2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Image from "@/components/ui/image-shim"
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
                setProduct(data.product || data)
                setQuantity(data.product?.moq || data.moq || 12)
            } catch (err: any) {
                console.error('Error fetching product:', err)
                setError(err.message || 'Failed to load product')
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

    // Prepare images array
    const productImages = product.images && product.images.length > 0 
        ? product.images 
        : product.image_url 
            ? [product.image_url]
            : ['https://images.unsplash.com/photo-1581783342308-f792ca11df53?w=800&h=1000&fit=crop']

    // Parse features if stored as JSON string
    const productFeatures = typeof product.features === 'string' 
        ? JSON.parse(product.features) 
        : product.features || []

    // Calculate current price based on tier pricing
    const currentPrice = product.tier_pricing?.find(tier => {
        if (tier.max_qty) {
            return quantity >= tier.min_qty && quantity <= tier.max_qty
        }
        return quantity >= tier.min_qty
    })?.price || product.b2b_price || product.sale_price || product.base_price

    // Format tier pricing for display
    const tieredPricing = product.tier_pricing?.map(tier => ({
        qty: tier.max_qty ? `${tier.min_qty}-${tier.max_qty}` : `${tier.min_qty}+`,
        price: tier.price,
        discount: `${tier.discount_percent}%`
    })) || []

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
                discountPrice: currentPrice !== product.base_price ? currentPrice : undefined,
                discountPercentage: currentPrice !== product.base_price 
                    ? Math.round(((product.base_price - currentPrice) / product.base_price) * 100)
                    : undefined,
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

            <div className="container mx-auto px-6 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Image Gallery */}
                    <div className="space-y-4">
                        {/* Main Image */}
                        <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-muted">
                            <Image
                                src={productImages[currentImage]}
                                alt={product.name}
                                fill
                                className="object-cover"
                            />
                            {product.badge && (
                                <Badge className="absolute top-4 left-4 z-10">
                                    {product.badge}
                                </Badge>
                            )}

                            {/* Navigation Arrows */}
                            <button
                                onClick={prevImage}
                                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                                onClick={nextImage}
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>

                            {/* Image Indicators */}
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                                {productImages.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentImage(idx)}
                                        className={cn(
                                            "w-2 h-2 rounded-full transition-all",
                                            idx === currentImage
                                                ? "bg-white w-8"
                                                : "bg-white/50 hover:bg-white/70"
                                        )}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Thumbnail Grid */}
                        <div className="grid grid-cols-4 gap-4">
                            {productImages.map((image, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentImage(idx)}
                                    className={cn(
                                        "relative aspect-square rounded-lg overflow-hidden border-2 transition-all",
                                        idx === currentImage
                                            ? "border-primary"
                                            : "border-transparent hover:border-muted-foreground/20"
                                    )}
                                >
                                    <Image src={image} alt={`${product.name} ${idx + 1}`} fill className="object-cover" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="space-y-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <Badge variant="outline">{product.category}</Badge>
                                {product.rating && product.review_count && (
                                    <div className="flex items-center gap-1">
                                        <div className="flex">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={cn(
                                                        "w-4 h-4 fill-current",
                                                        i < Math.floor(product.rating!) ? "text-secondary" : "text-gray-300"
                                                    )}
                                                />
                                            ))}
                                        </div>
                                        <span className="text-sm text-muted-foreground">
                                            {product.rating} ({product.review_count} reviews)
                                        </span>
                                    </div>
                                )}
                            </div>
                            <h1 className="font-serif text-4xl md:text-5xl font-medium mb-4">{product.name}</h1>
                            <p className="text-lg text-muted-foreground leading-relaxed">{product.description}</p>
                        </div>

                        {/* Pricing */}
                        {isApproved ? (
                            <div className="bg-muted/30 rounded-xl p-6">
                                <div className="flex items-baseline gap-3 mb-4">
                                    <span className="text-4xl font-bold">${currentPrice}</span>
                                    <span className="text-muted-foreground">per unit</span>
                                </div>

                                {/* Tiered Pricing Table */}
                                <div className="space-y-2">
                                    <p className="text-sm font-semibold mb-2">Volume Discounts:</p>
                                    {tieredPricing.map((tier, idx) => (
                                        <div
                                            key={idx}
                                            className={cn(
                                                "flex justify-between items-center p-2 rounded-lg text-sm",
                                                tier.price === currentPrice ? "bg-primary/10 border border-primary/20" : "bg-background"
                                            )}
                                        >
                                            <span className="font-medium">{tier.qty} units</span>
                                            <div className="flex items-center gap-3">
                                                <span className="text-primary font-semibold">{tier.discount} off</span>
                                                <span className="font-bold">${tier.price}/unit</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : needsApproval ? (
                            <div className="bg-blue-50 dark:bg-blue-950/20 rounded-xl p-8 border border-blue-200 dark:border-blue-900/50">
                                <div className="text-center space-y-4">
                                    <div>
                                        <h3 className="text-xl font-serif font-semibold mb-2">B2B Approval Required</h3>
                                        <p className="text-muted-foreground">
                                            Request B2B approval to view pricing and place bulk orders.
                                        </p>
                                    </div>
                                    <Link href="/b2b-request">
                                        <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                                            Request B2B Approval
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30 rounded-xl p-8 border border-yellow-200 dark:border-yellow-900/50">
                                <div className="text-center space-y-4">
                                    <div>
                                        <h3 className="text-xl font-serif font-semibold mb-2">Pricing Available for Registered Buyers</h3>
                                        <p className="text-muted-foreground">
                                            Sign in or create an account to view pricing and place orders.
                                        </p>
                                    </div>
                                    <div className="flex gap-3 justify-center">
                                        <Link href="/login">
                                            <Button variant="outline">Sign In</Button>
                                        </Link>
                                        <Link href="/signup">
                                            <Button className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold">
                                                Create Account
                                            </Button>
                                        </Link>
                                    </div>
                                    <p className="text-xs text-muted-foreground pt-4">
                                        Need wholesale pricing? <Link href="/contact" className="text-primary hover:underline">Contact our sales team</Link>
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Quantity Selector - Only for approved users */}
                        {isApproved && (
                            <div>
                                <label className="block text-sm font-semibold mb-2">
                                    Quantity (MOQ: {product.moq} units)
                                </label>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center border border-border rounded-lg">
                                        <button
                                            onClick={() => setQuantity(Math.max(product.moq, quantity - product.moq))}
                                            className="px-4 py-3 hover:bg-muted transition-colors"
                                        >
                                            -
                                        </button>
                                        <input
                                            type="number"
                                            value={quantity}
                                            onChange={(e) => setQuantity(Math.max(product.moq, parseInt(e.target.value) || product.moq))}
                                            className="w-24 text-center bg-transparent border-x border-border py-3"
                                            min={product.moq}
                                            step={product.moq}
                                        />
                                        <button
                                            onClick={() => setQuantity(quantity + product.moq)}
                                            className="px-4 py-3 hover:bg-muted transition-colors"
                                        >
                                            +
                                        </button>
                                    </div>
                                    <span className="text-sm text-muted-foreground">
                                        Total: ${(currentPrice * quantity).toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        {isApproved ? (
                            <>
                                <div className="flex gap-3">
                                    <Button 
                                        size="lg" 
                                        className="flex-1"
                                        onClick={handleAddToCart}
                                        disabled={addingToCart}
                                    >
                                        {addingToCart ? (
                                            <>
                                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                Adding...
                                            </>
                                        ) : addedToCart ? (
                                            <>
                                                <Check className="w-5 h-5 mr-2" />
                                                Added to Cart!
                                            </>
                                        ) : (
                                            <>
                                                <ShoppingCart className="w-5 h-5 mr-2" />
                                                Add to Cart
                                            </>
                                        )}
                                    </Button>
                                    <Button
                                        size="lg"
                                        variant={isWishlisted ? "default" : "outline"}
                                        onClick={() => setIsWishlisted(!isWishlisted)}
                                    >
                                        <Heart className={cn("w-5 h-5", isWishlisted && "fill-current")} />
                                    </Button>
                                </div>

                                {/* Cart Options Modal */}
                                {showCartOptions && addedToCart && (
                                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                                        <div className="bg-background rounded-lg p-6 max-w-sm w-full shadow-lg">
                                            <div className="flex items-center gap-3 mb-4">
                                                <Check className="w-6 h-6 text-green-500" />
                                                <h3 className="text-lg font-semibold">Added to Cart!</h3>
                                            </div>
                                            <p className="text-muted-foreground mb-6">
                                                {product.name} has been added to your cart.
                                            </p>
                                            <div className="flex gap-3">
                                                <Button
                                                    variant="outline"
                                                    className="flex-1"
                                                    onClick={handleContinueShopping}
                                                >
                                                    Continue Shopping
                                                </Button>
                                                <Button
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
                        ) : (
                            <Link href="/login" className="block">
                                <Button size="lg" className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold">
                                    <ShoppingCart className="w-5 h-5 mr-2" />
                                    Sign In to Order
                                </Button>
                            </Link>
                        )}

                        {/* Features */}
                        {productFeatures.length > 0 && (
                            <div className="border-t border-border pt-6">
                                <h3 className="font-semibold mb-4">Product Features</h3>
                                <ul className="space-y-2">
                                    {productFeatures.map((feature: string, idx: number) => (
                                        <li key={idx} className="flex items-start gap-2 text-sm">
                                            <span className="text-primary mt-1">✓</span>
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Trust Badges */}
                        <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border">
                            <div className="text-center">
                                <Truck className="w-8 h-8 mx-auto mb-2 text-primary" />
                                <p className="text-xs font-medium">Free Shipping</p>
                                <p className="text-xs text-muted-foreground">Orders $500+</p>
                            </div>
                            <div className="text-center">
                                <Shield className="w-8 h-8 mx-auto mb-2 text-primary" />
                                <p className="text-xs font-medium">Quality Guarantee</p>
                                <p className="text-xs text-muted-foreground">100% Certified</p>
                            </div>
                            <div className="text-center">
                                <Package className="w-8 h-8 mx-auto mb-2 text-primary" />
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
