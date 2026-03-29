import { useState } from "react"
import { X, ShoppingCart, Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { OptimizedImage } from "@/components/ui/optimized-image"
import { cn } from "@/lib/utils"

interface Product {
    id: string
    name: string
    image_url: string
    base_price: number
    sale_price?: number
    b2b_price?: number
    moq: number
}

interface AddToCartModalProps {
    product: Product
    isOpen: boolean
    onClose: () => void
    onAddToCart: (quantity: number, buyMode: 'retail' | 'bulk') => void
    isApproved: boolean
}

export function AddToCartModal({ 
    product, 
    isOpen, 
    onClose, 
    onAddToCart,
    isApproved 
}: AddToCartModalProps) {
    const [buyMode, setBuyMode] = useState<'retail' | 'bulk'>('bulk')
    const [quantity, setQuantity] = useState(isApproved ? (product.moq || 12) : 1)

    if (!isOpen) return null

    const displayPrice = product.sale_price || product.base_price
    const hasRetailDiscount = product.sale_price && product.sale_price < product.base_price
    const retailDiscountPercent = hasRetailDiscount 
        ? Math.round(((product.base_price - product.sale_price!) / product.base_price) * 100)
        : 0

    const currentPrice = buyMode === 'bulk' && isApproved 
        ? (product.b2b_price || displayPrice)
        : displayPrice

    const minQty = buyMode === 'bulk' ? (product.moq || 1) : 1
    const step = buyMode === 'bulk' ? (product.moq || 1) : 1

    const handleBuyModeChange = (mode: 'retail' | 'bulk') => {
        setBuyMode(mode)
        setQuantity(mode === 'bulk' ? (product.moq || 12) : 1)
    }

    const handleQuantityChange = (delta: number) => {
        const newQty = Math.max(minQty, quantity + delta)
        setQuantity(newQty)
    }

    const handleAddToCart = () => {
        onAddToCart(quantity, buyMode)
        onClose()
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl max-w-md w-full shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
                    <h3 className="font-semibold text-lg">Add to Cart</h3>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 space-y-4">
                    {/* Product Info */}
                    <div className="flex gap-3">
                        <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                            <OptimizedImage
                                src={product.image_url}
                                alt={product.name}
                                preset="thumbnail"
                                className="w-full h-full"
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm line-clamp-2 mb-1">{product.name}</h4>
                            <div className="flex items-baseline gap-2">
                                <span className="text-lg font-bold text-primary">
                                    ${currentPrice}
                                </span>
                                <span className="text-xs text-muted-foreground">per unit</span>
                            </div>
                        </div>
                    </div>

                    {/* Buy Mode Toggle - Only for Approved Users */}
                    {isApproved && (
                        <div>
                            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                                Purchase Mode:
                            </label>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleBuyModeChange('retail')}
                                    className={cn(
                                        "flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                                        buyMode === 'retail'
                                            ? "bg-primary text-white shadow-sm"
                                            : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                                    )}
                                >
                                    🛒 Retail
                                </button>
                                <button
                                    onClick={() => handleBuyModeChange('bulk')}
                                    className={cn(
                                        "flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                                        buyMode === 'bulk'
                                            ? "bg-emerald-600 text-white shadow-sm"
                                            : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                                    )}
                                >
                                    📦 Bulk
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Pricing Info */}
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                        {buyMode === 'retail' ? (
                            <div>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                                    Retail Price:
                                </p>
                                <div className="flex items-center gap-2">
                                    <span className="text-xl font-bold text-primary">
                                        ${displayPrice}
                                    </span>
                                    {hasRetailDiscount && (
                                        <>
                                            <span className="text-sm text-muted-foreground line-through">
                                                ${product.base_price}
                                            </span>
                                            <span className="text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 px-1.5 py-0.5 rounded">
                                                {retailDiscountPercent}% OFF
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div>
                                <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold mb-1">
                                    💼 B2B Bulk Price:
                                </p>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                                        ${product.b2b_price || displayPrice}
                                    </span>
                                    {product.b2b_price && product.b2b_price < displayPrice && (
                                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-1.5 py-0.5 rounded">
                                            Save {Math.round(((displayPrice - product.b2b_price) / displayPrice) * 100)}%
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                    MOQ: {product.moq} units
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Quantity Selector */}
                    <div>
                        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                            Quantity {buyMode === 'bulk' && `(Min: ${minQty})`}:
                        </label>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center border border-gray-300 dark:border-gray-700 rounded-lg">
                                <button
                                    onClick={() => handleQuantityChange(-step)}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                    disabled={quantity <= minQty}
                                >
                                    <Minus className="w-4 h-4" />
                                </button>
                                <input
                                    type="number"
                                    value={quantity}
                                    onChange={(e) => setQuantity(Math.max(minQty, parseInt(e.target.value) || minQty))}
                                    className="w-20 text-center bg-transparent border-x border-gray-300 dark:border-gray-700 py-2 text-sm"
                                    min={minQty}
                                    step={step}
                                />
                                <button
                                    onClick={() => handleQuantityChange(step)}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="flex-1">
                                <p className="text-xs text-muted-foreground">Total:</p>
                                <p className="text-lg font-bold text-foreground">
                                    ${(currentPrice * quantity).toFixed(2)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex gap-2">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="flex-1"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleAddToCart}
                        className="flex-1"
                    >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Add to Cart
                    </Button>
                </div>
            </div>
        </div>
    )
}
