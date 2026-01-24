import { useState } from "react"
import { useNavigate } from "react-router-dom"
import Link from "@/components/ui/link-shim"
import { Button } from "@/components/ui/button"
import { useCart } from "@/contexts/CartContext"
import { useAuth } from "@/contexts/AuthContext"
import { ArrowLeft, AlertCircle, CheckCircle, ShoppingCart, User, ClipboardList, CreditCard, Loader } from "lucide-react"
import Image from "@/components/ui/image-shim"
import { cn } from "@/lib/utils"
import { ordersAPI } from "@/lib/api"
import { motion } from "framer-motion"

type CheckoutStep = 'cart' | 'details' | 'review' | 'payment' | 'confirmation'

export default function Checkout() {
  const navigate = useNavigate()
  const { items, getSubtotal, clearCart } = useCart()
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('cart')
  const [isLoading, setIsLoading] = useState(false)
  const [orderError, setOrderError] = useState<string | null>(null)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    email: user?.email || '',
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: user?.phone || '',
  })

  // Get approval status
  const approvalStatus = (user as any)?.b2b_approval_status || 'none'
  const isApproved = approvalStatus === 'approved'
  const isPending = approvalStatus === 'pending'
  const isRejected = approvalStatus === 'rejected'
  const needsApproval = approvalStatus === 'none' && user

  // Prevent checkout if not approved
  if (user && !isApproved) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md space-y-6">
          <AlertCircle className="w-16 h-16 mx-auto text-yellow-600 dark:text-yellow-500" />
          <div>
            {needsApproval && (
              <>
                <h1 className="font-serif text-3xl font-semibold mb-2">B2B Approval Required</h1>
                <p className="text-muted-foreground mb-6">
                  Request B2B approval to proceed with your order.
                </p>
              </>
            )}
            {isPending && (
              <>
                <h1 className="font-serif text-3xl font-semibold mb-2">Account Pending</h1>
                <p className="text-muted-foreground mb-6">
                  Your account is under review. Once approved, you'll be able to place orders.
                </p>
              </>
            )}
            {isRejected && (
              <>
                <h1 className="font-serif text-3xl font-semibold mb-2">Access Restricted</h1>
                <p className="text-muted-foreground mb-6">
                  Your account access has been restricted. Please contact support.
                </p>
              </>
            )}
          </div>
          <Link href="/catalog">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Catalog
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="font-serif text-3xl font-semibold mb-4">Your Cart is Empty</h1>
          <p className="text-muted-foreground mb-6">
            Add items to your cart before proceeding to checkout.
          </p>
          <Link href="/catalog">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const subtotal = getSubtotal()
  const shipping = 42
  const total = subtotal + shipping

  // Step indicators
  const steps: { id: CheckoutStep; label: string; icon: typeof ShoppingCart }[] = [
    { id: 'cart', label: 'Cart', icon: ShoppingCart },
    { id: 'details', label: 'Details', icon: User },
    { id: 'review', label: 'Review', icon: ClipboardList },
    { id: 'payment', label: 'Payment', icon: CreditCard },
    { id: 'confirmation', label: 'Confirmed', icon: CheckCircle },
  ]

  const handleNext = () => {
    const stepOrder: CheckoutStep[] = ['cart', 'details', 'review', 'payment', 'confirmation']
    const currentIndex = stepOrder.indexOf(currentStep)
    if (currentIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIndex + 1])
    }
  }

  const handlePrev = () => {
    const stepOrder: CheckoutStep[] = ['cart', 'details', 'review', 'payment', 'confirmation']
    const currentIndex = stepOrder.indexOf(currentStep)
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1])
    }
  }

  const handleCompleteOrder = async () => {
    try {
      setIsLoading(true)
      setOrderError(null)

      // Create shipping address string
      const shippingAddress = `${formData.firstName} ${formData.lastName}, ${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}`

      // Call API to create order
      const response = await ordersAPI.create(shippingAddress)
      
      if (response.order) {
        // Use order_number if available, otherwise fall back to id
        setOrderId(response.order.order_number || response.order.id)
        clearCart()
        setCurrentStep('confirmation')
      }
    } catch (error) {
      setOrderError(error instanceof Error ? error.message : 'Failed to create order')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12">
          <Link href="/catalog" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Catalog
          </Link>
          <h1 className="font-serif text-4xl font-semibold mb-8">Checkout</h1>

          {/* Step Indicators */}
          <div className="flex gap-8 mb-12">
            {steps.map((step, idx) => {
              const stepOrder: CheckoutStep[] = ['cart', 'details', 'review', 'payment', 'confirmation']
              const currentIndex = stepOrder.indexOf(currentStep)
              const stepIndex = stepOrder.indexOf(step.id)
              const isCompleted = stepIndex < currentIndex
              const isCurrent = stepIndex === currentIndex

              return (
                <div key={step.id} className="flex items-center gap-3">
                  <button
                    onClick={() => stepIndex <= currentIndex && setCurrentStep(step.id)}
                    className={cn(
                      'flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all',
                      isCompleted
                        ? 'bg-green-500 border-green-500'
                        : isCurrent
                        ? 'bg-primary border-primary'
                        : 'bg-muted border-border'
                    )}
                    disabled={stepIndex > currentIndex}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-6 h-6 text-white" />
                    ) : (
                      <step.icon className={cn('w-6 h-6', isCurrent ? 'text-white' : 'text-muted-foreground')} />
                    )}
                  </button>
                  <span className={cn(
                    'text-sm font-medium hidden sm:inline',
                    isCurrent ? 'text-foreground' : isCompleted ? 'text-green-600' : 'text-muted-foreground'
                  )}>
                    {step.label}
                  </span>
                  {idx < steps.length - 1 && (
                    <div className={cn('hidden lg:block w-12 h-0.5', stepIndex < currentIndex ? 'bg-green-500' : 'bg-border')} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Content */}
        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            {/* Step 1: View Cart */}
            {currentStep === 'cart' && (
              <div className="space-y-8">
                <h2 className="font-serif text-2xl font-semibold">Your Order</h2>
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4 p-4 border border-border rounded-lg">
                      {item.image && (
                        <div className="relative w-24 h-24 flex-shrink-0 rounded overflow-hidden">
                          <Image src={item.image} alt={item.name} fill className="object-cover" />
                        </div>
                      )}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="font-semibold">{item.name}</h3>
                          <p className="text-sm text-muted-foreground">{item.sku}</p>
                        </div>
                        <div className="flex justify-between items-end">
                          <span className="text-sm">Qty: {item.quantity}</span>
                          <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Fill Details */}
            {currentStep === 'details' && (
              <div className="space-y-8">
                <h2 className="font-serif text-2xl font-semibold">Shipping & Contact Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input 
                      type="email" 
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">First Name</label>
                      <input 
                        type="text" 
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Last Name</label>
                      <input 
                        type="text" 
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Phone</label>
                    <input 
                      type="tel" 
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Address</label>
                    <input 
                      type="text" 
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">City</label>
                      <input 
                        type="text" 
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">State</label>
                      <input 
                        type="text" 
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Zip Code</label>
                      <input 
                        type="text" 
                        value={formData.zipCode}
                        onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                        className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Review Order */}
            {currentStep === 'review' && (
              <div className="space-y-8">
                <h2 className="font-serif text-2xl font-semibold">Review Your Order</h2>
                
                {/* Shipping Details */}
                <div className="border border-border rounded-lg p-6">
                  <h3 className="font-semibold mb-4">Shipping Address</h3>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>{formData.firstName} {formData.lastName}</div>
                    <div>{formData.address}</div>
                    <div>{formData.city}, {formData.state} {formData.zipCode}</div>
                    <div className="pt-2">{formData.phone}</div>
                    <div>{formData.email}</div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="border border-border rounded-lg p-6">
                  <h3 className="font-semibold mb-4">Items</h3>
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>{item.name} x {item.quantity}</span>
                        <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Payment Method */}
            {currentStep === 'payment' && (
              <div className="space-y-8">
                <h2 className="font-serif text-2xl font-semibold">Payment Method</h2>
                {orderError && (
                  <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                    {orderError}
                  </div>
                )}
                <div className="space-y-4">
                  <div className="border-2 border-primary rounded-lg p-6">
                    <input type="radio" name="payment" defaultChecked className="mr-3" />
                    <span className="font-medium">Credit / Debit Card</span>
                  </div>
                  <div className="border border-border rounded-lg p-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Card Number</label>
                      <input 
                        type="text" 
                        placeholder="1234 5678 9012 3456"
                        className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Expiry Date</label>
                        <input 
                          type="text" 
                          placeholder="MM/YY"
                          className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">CVV</label>
                        <input 
                          type="text" 
                          placeholder="123"
                          className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Order Confirmation */}
            {currentStep === 'confirmation' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-8 text-center"
              >
                <div className="flex justify-center mb-6">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity }}
                  >
                    <CheckCircle className="w-24 h-24 text-green-500" />
                  </motion.div>
                </div>
                <div>
                  <h2 className="font-serif text-4xl font-semibold mb-4">Order Confirmed!</h2>
                  <p className="text-muted-foreground text-lg mb-2">Thank you for your order</p>
                  <p className="text-2xl font-bold text-primary">Order ID: {orderId}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-6 text-left space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Order Total</p>
                    <p className="text-2xl font-bold">${(getSubtotal() + 42).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Shipping Address</p>
                    <p className="font-medium">{formData.firstName} {formData.lastName}</p>
                    <p className="text-sm">{formData.address}</p>
                    <p className="text-sm">{formData.city}, {formData.state} {formData.zipCode}</p>
                  </div>
                </div>
                <p className="text-muted-foreground">A confirmation email has been sent to {formData.email}</p>
              </motion.div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-4 mt-12">
              {currentStep !== 'cart' && currentStep !== 'confirmation' && (
                <Button variant="outline" onClick={handlePrev}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
              )}
              {currentStep !== 'payment' && currentStep !== 'confirmation' && (
                <Button onClick={handleNext} className="ml-auto">
                  Next Step
                </Button>
              )}
              {currentStep === 'payment' && (
                <Button 
                  onClick={handleCompleteOrder} 
                  disabled={isLoading}
                  className="ml-auto bg-green-600 hover:bg-green-700"
                >
                  {isLoading ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Complete Order'
                  )}
                </Button>
              )}
              {currentStep === 'confirmation' && (
                <Link href="/catalog" className="ml-auto">
                  <Button>Continue Shopping</Button>
                </Link>
              )}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 border border-border rounded-lg p-6 space-y-6">
              <h3 className="font-serif text-xl font-semibold">Order Summary</h3>
              
              <div className="space-y-3 pb-6 border-b border-border">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{item.name}</span>
                    <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>${shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-serif text-lg font-semibold pt-3 border-t border-border">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
