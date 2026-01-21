"use client"

import { useState } from "react"
import { Heart, ShoppingCart, Package, Shield, Truck, ChevronLeft, ChevronRight, Star, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Image from "@/components/ui/image-shim"
import Link from "@/components/ui/link-shim"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"
import { useCart } from "@/contexts/CartContext"

const PRODUCT = {
    id: 1,
    name: "Terra Ceramic Vase",
    category: "Decor",
    price: 45,
    images: [
        "https://images.unsplash.com/photo-1581783342308-f792ca11df53?w=800&h=1000&fit=crop",
        "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800&h=1000&fit=crop",
        "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800&h=1000&fit=crop",
        "https://images.unsplash.com/photo-1615529182904-14819c35db37?w=800&h=1000&fit=crop",
    ],
    badge: "new",
    stock: "in-stock",
    moq: 12,
    description: "Handcrafted ceramic vase with organic texture and earthy glaze.",
    features: [
        "100% handcrafted ceramic",
        "Food-safe glaze finish",
        "Microwave and dishwasher safe",
        "Dimensions: 8\" H x 5\" W",
        "Weight: 1.2 lbs",
        "Made in Portugal"
    ],
    tieredPricing: [
        { qty: "12-49", price: 45, discount: "10%" },
        { qty: "50-199", price: 40, discount: "20%" },
        { qty: "200+", price: 36, discount: "30%" }
    ],
    rating: 4.8,
    reviews: 127
}

export default function ProductDetail() {
    const [currentImage, setCurrentImage] = useState(0)
    const [quantity, setQuantity] = useState(PRODUCT.moq)
    const [isWishlisted, setIsWishlisted] = useState(false)
    const [addedToCart, setAddedToCart] = useState(false)
    const { addItem } = useCart()
    const { user } = useAuth()

    // Get approval status from user object (from AuthContext)
    const approvalStatus = (user as any)?.b2b_approval_status || 'none'
    const isApproved = approvalStatus === 'approved'
    const needsApproval = approvalStatus === 'none' && user // Logged in but no approval status

    const currentPrice = PRODUCT.tieredPricing.find(tier => {
        const [min, max] = tier.qty.split('-').map(n => parseInt(n.replace('+', '')))
        if (max) {
            return quantity >= min && quantity <= max
        }
        return quantity >= min
    })?.price || PRODUCT.price

    const nextImage = () => {
        setCurrentImage((prev) => (prev + 1) % PRODUCT.images.length)
    }

    const prevImage = () => {
        setCurrentImage((prev) => (prev - 1 + PRODUCT.images.length) % PRODUCT.images.length)
    }

    const handleAddToCart = () => {
        addItem(PRODUCT.id.toString(), quantity, {
            id: `${PRODUCT.id}-${Date.now()}`,
            productId: PRODUCT.id.toString(),
            name: PRODUCT.name,
            sku: `SKU-${PRODUCT.id}`,
            image: PRODUCT.images[0],
            price: PRODUCT.price,
            quantity: quantity,
            discountPrice: currentPrice !== PRODUCT.price ? currentPrice : undefined,
            discountPercentage: currentPrice !== PRODUCT.price 
                ? Math.round(((PRODUCT.price - currentPrice) / PRODUCT.price) * 100)
                : undefined,
        })
        setAddedToCart(true)
        setTimeout(() => setAddedToCart(false), 2000)
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
                        <span className="text-foreground">{PRODUCT.name}</span>
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
                                src={PRODUCT.images[currentImage]}
                                alt={PRODUCT.name}
                                fill
                                className="object-cover"
                            />
                            {PRODUCT.badge && (
                                <Badge className="absolute top-4 left-4 z-10">
                                    {PRODUCT.badge}
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
                                {PRODUCT.images.map((_, idx) => (
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
                            {PRODUCT.images.map((image, idx) => (
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
                                    <Image src={image} alt={`${PRODUCT.name} ${idx + 1}`} fill className="object-cover" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="space-y-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <Badge variant="outline">{PRODUCT.category}</Badge>
                                <div className="flex items-center gap-1">
                                    <div className="flex">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={cn(
                                                    "w-4 h-4 fill-current",
                                                    i < Math.floor(PRODUCT.rating) ? "text-secondary" : "text-gray-300"
                                                )}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-sm text-muted-foreground">
                                        {PRODUCT.rating} ({PRODUCT.reviews} reviews)
                                    </span>
                                </div>
                            </div>
                            <h1 className="font-serif text-4xl md:text-5xl font-medium mb-4">{PRODUCT.name}</h1>
                            <p className="text-lg text-muted-foreground leading-relaxed">{PRODUCT.description}</p>
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
                                    {PRODUCT.tieredPricing.map((tier, idx) => (
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
                                    Quantity (MOQ: {PRODUCT.moq} units)
                                </label>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center border border-border rounded-lg">
                                        <button
                                            onClick={() => setQuantity(Math.max(PRODUCT.moq, quantity - PRODUCT.moq))}
                                            className="px-4 py-3 hover:bg-muted transition-colors"
                                        >
                                            -
                                        </button>
                                        <input
                                            type="number"
                                            value={quantity}
                                            onChange={(e) => setQuantity(Math.max(PRODUCT.moq, parseInt(e.target.value) || PRODUCT.moq))}
                                            className="w-24 text-center bg-transparent border-x border-border py-3"
                                            min={PRODUCT.moq}
                                            step={PRODUCT.moq}
                                        />
                                        <button
                                            onClick={() => setQuantity(quantity + PRODUCT.moq)}
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
                            <div className="flex gap-3">
                                <Button 
                                    size="lg" 
                                    className="flex-1"
                                    onClick={handleAddToCart}
                                >
                                    <ShoppingCart className="w-5 h-5 mr-2" />
                                    {addedToCart ? "Added to Cart!" : "Add to Cart"}
                                </Button>
                                <Button
                                    size="lg"
                                    variant={isWishlisted ? "default" : "outline"}
                                    onClick={() => setIsWishlisted(!isWishlisted)}
                                >
                                    <Heart className={cn("w-5 h-5", isWishlisted && "fill-current")} />
                                </Button>
                            </div>
                        ) : (
                            <Link href="/login" className="block">
                                <Button size="lg" className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold">
                                    <ShoppingCart className="w-5 h-5 mr-2" />
                                    Sign In to Order
                                </Button>
                            </Link>
                        )}

                        {/* Features */}
                        <div className="border-t border-border pt-6">
                            <h3 className="font-semibold mb-4">Product Features</h3>
                            <ul className="space-y-2">
                                {PRODUCT.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-sm">
                                        <span className="text-primary mt-1">✓</span>
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

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
