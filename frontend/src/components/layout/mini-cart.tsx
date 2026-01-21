"use client"

import { useState, useEffect } from "react"
import Link from "@/components/ui/link-shim"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Trash2, Plus, Minus, AlertCircle } from "lucide-react"
import Image from "@/components/ui/image-shim"
import { useCart } from "@/contexts/CartContext"
import { useAuth } from "@/contexts/AuthContext"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface MiniCartProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MiniCart({ open, onOpenChange }: MiniCartProps) {
  const { items, removeItem, updateQuantity, getSubtotal, getTotalSavings } = useCart()
  const { user } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  // Determine user tier for pricing display
  const isGuest = !user
  const isLoggedIn = !!user
  const approvalStatus = (user as any)?.b2b_approval_status || 'none'
  const isApproved = approvalStatus === 'approved'
  const isPending = approvalStatus === 'pending'
  const needsApproval = approvalStatus === 'none' && user

  const subtotal = getSubtotal()
  const savings = getTotalSavings()
  const shipping = subtotal > 0 ? 42 : 0
  const total = subtotal + shipping

  // Determine if checkout is available
  const isCheckoutAvailable = items.length > 0 && (isLoggedIn || isGuest)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:w-[420px] p-0 flex flex-col">
        {/* Header */}
        <SheetHeader className="border-b border-border px-6 py-4">
          <div className="flex items-center gap-2">
            <SheetTitle className="font-serif text-xl">Your Cart</SheetTitle>
            {items.length > 0 && (
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-yellow-400 text-black text-xs font-semibold">
                {items.length}
              </span>
            )}
          </div>
        </SheetHeader>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <EmptyCartState onContinue={() => onOpenChange(false)} />
          ) : (
            <div className="px-6 py-6 space-y-6">
              {/* B2B/Tier Info Banner */}
              {isLoggedIn && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "p-3 rounded-lg flex gap-3",
                    isApproved
                      ? "bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900"
                      : isPending
                      ? "bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-900"
                      : needsApproval
                      ? "bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900"
                      : "bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900"
                  )}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {isApproved ? (
                      <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold">
                        ✓
                      </div>
                    ) : (
                      <AlertCircle className={cn(
                        "w-5 h-5",
                        isPending ? "text-yellow-600 dark:text-yellow-400" :
                        needsApproval ? "text-blue-600 dark:text-blue-400" :
                        "text-red-600 dark:text-red-400"
                      )} />
                    )}
                  </div>
                  <div className="text-sm">
                    <p className={cn("font-semibold", 
                      isApproved ? "text-green-900 dark:text-green-100" :
                      isPending ? "text-yellow-900 dark:text-yellow-100" :
                      needsApproval ? "text-blue-900 dark:text-blue-100" :
                      "text-red-900 dark:text-red-100"
                    )}>
                      {isApproved 
                        ? "B2B Approved - Wholesale Pricing" 
                        : isPending
                        ? "Account Pending Approval"
                        : needsApproval
                        ? "B2B Approval Required"
                        : "Account Access Restricted"
                      }
                    </p>
                    <p className={cn("text-xs mt-0.5",
                      isApproved ? "text-green-700 dark:text-green-200" :
                      isPending ? "text-yellow-700 dark:text-yellow-200" :
                      needsApproval ? "text-blue-700 dark:text-blue-200" :
                      "text-red-700 dark:text-red-200"
                    )}>
                      {isApproved
                        ? "You are receiving wholesale volume discounts."
                        : isPending
                        ? "Your account is under review for B2B access."
                        : needsApproval
                        ? "Request B2B approval to unlock wholesale pricing."
                        : "Your account access has been restricted."
                      }
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Shipping Goal */}
              {subtotal < 500 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">SHIPPING GOAL</span>
                    <span className="text-primary font-semibold">
                      ${(500 - subtotal).toFixed(2)} to free shipping
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <motion.div
                      className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${(subtotal / 500) * 100}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              )}

              {/* Cart Items */}
              <div className="space-y-4">
                {items.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex gap-4 pb-4 border-b border-border/50 last:border-b-0"
                  >
                    {/* Product Image */}
                    {item.image && (
                      <div className="relative w-20 h-20 rounded overflow-hidden flex-shrink-0 bg-muted">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <Link href={`/product/${item.productId}`}>
                        <h4 className="font-serif text-sm font-semibold truncate hover:text-primary transition-colors">
                          {item.name}
                        </h4>
                      </Link>
                      <p className="text-xs text-muted-foreground mt-1">SKU: {item.sku}</p>

                      {/* Price */}
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-lg font-bold text-primary">
                          ${(item.discountPrice || item.price).toFixed(2)}
                        </span>
                        {item.discountPrice && item.discountPrice < item.price && (
                          <>
                            <span className="text-sm text-muted-foreground line-through">
                              ${item.price.toFixed(2)}
                            </span>
                            <span className="inline-flex items-center px-2 py-1 rounded bg-red-500 text-white text-[10px] font-bold">
                              {Math.round(((item.price - item.discountPrice) / item.price) * 100)}% OFF
                            </span>
                          </>
                        )}
                      </div>

                      {/* Quantity Selector */}
                      <div className="flex items-center gap-2 mt-3">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-6 h-6 rounded flex items-center justify-center bg-muted hover:bg-muted/80 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-6 h-6 rounded flex items-center justify-center bg-muted hover:bg-muted/80 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="ml-auto p-2 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer - Pricing and Actions */}
        {items.length > 0 && (
          <div className="border-t border-border px-6 py-6 space-y-4 bg-background">
            {/* Pricing Breakdown */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold">${subtotal.toFixed(2)}</span>
              </div>
              {savings > 0 && (
                <div className="flex justify-between text-red-600 dark:text-red-400">
                  <span className="text-muted-foreground">Total Savings</span>
                  <span className="font-semibold">-${savings.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Freight Shipping (Est.)</span>
                <span className="font-semibold">${shipping.toFixed(2)}</span>
              </div>
            </div>

            {/* Total */}
            <div className="border-t border-border pt-3 flex justify-between items-center">
              <span className="font-serif text-lg font-semibold">Total</span>
              <span className="text-2xl font-bold text-yellow-500">${total.toFixed(2)}</span>
            </div>

            {/* Minimum Order */}
            {subtotal < 500 && (
              <p className="text-xs text-muted-foreground text-center">
                Minimum wholesale order: $500.00
              </p>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <Link href="/checkout">
                <Button
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-lg h-12"
                  disabled={!isCheckoutAvailable}
                  onClick={() => onOpenChange(false)}
                >
                  {isGuest ? "Sign In to Checkout" : "Checkout"}
                  <span className="ml-2">→</span>
                </Button>
              </Link>
              <Button
                variant="outline"
                className="w-full rounded-lg"
                onClick={() => onOpenChange(false)}
              >
                Continue Shopping
              </Button>
            </div>

            {/* Footer Text */}
            <p className="text-[11px] text-muted-foreground text-center">
              SECURE CHECKOUT • CARMELLA CERAMICS • 1-800-123-CERAMICS
            </p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}

/**
 * Empty cart state component
 */
function EmptyCartState({
  onContinue,
}: {
  onContinue: () => void
}) {
  return (
    <div className="h-full flex flex-col items-center justify-center px-6 py-12 text-center">
      {/* Decorative circle */}
      <div className="mb-6">
        <svg
          className="w-24 h-24 mx-auto text-primary/20"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <ellipse cx="50" cy="50" rx="40" ry="45" stroke="currentColor" strokeWidth="2" />
          <circle cx="50" cy="35" r="8" fill="currentColor" />
        </svg>
      </div>

      <h3 className="font-serif text-xl font-semibold mb-2">Your cart is empty</h3>
      <p className="text-sm text-muted-foreground mb-6">
        Discover our latest artisan collection and premium ceramics curated for your business.
      </p>

      {/* Minimum order info */}
      <div className="bg-muted/50 dark:bg-muted/20 rounded-lg p-4 mb-6 w-full text-left">
        <p className="text-xs text-muted-foreground mb-2">
          <span className="font-semibold">Minimum wholesale order:</span> $500.00
        </p>
        <p className="text-xs text-muted-foreground">
          <span className="font-semibold">Subtotal:</span> $0.00
        </p>
      </div>

      {/* CTA */}
      <Link href="/catalog" className="w-full">
        <Button
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-lg h-11 uppercase tracking-wide"
          onClick={onContinue}
        >
          Continue Shopping
          <span className="ml-2">→</span>
        </Button>
      </Link>

      {/* Footer text */}
      <p className="text-[11px] text-muted-foreground text-center mt-6">
        SECURE CHECKOUT • CARMELLA CERAMICS • 1-800-123-CERAMICS
      </p>
    </div>
  )
}
