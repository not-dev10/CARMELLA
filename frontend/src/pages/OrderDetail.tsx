import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Package, Truck, AlertCircle, Loader } from 'lucide-react'
import { ordersAPI } from '@/lib/api'
import { cn } from '@/lib/utils'

interface Order {
  id: string
  order_number?: string
  user_id: string
  total_amount: number
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  created_at: string
  items_count: number
  shipping_address: string
  billing_address?: string
  notes?: string
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200',
  confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200',
  shipped: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200',
  delivered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200',
}

const statusSteps = {
  pending: 1,
  confirmed: 2,
  shipped: 3,
  delivered: 4,
  cancelled: 0,
}

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id || !user) return

    const fetchOrder = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await ordersAPI.getById(id)
        setOrder(response.order || null)
        // Note: order items would need a separate API endpoint to fetch
        // For now, we'll display what we have
      } catch (err) {
        console.error('Failed to fetch order:', err)
        setError(err instanceof Error ? err.message : 'Failed to load order details')
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [id, user])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading order details...</p>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-destructive" />
          <h2 className="text-2xl font-serif font-semibold mb-2">Order Not Found</h2>
          <p className="text-muted-foreground mb-6">{error || 'The order you are looking for does not exist.'}</p>
          <Button onClick={() => navigate('/orders')}>Back to Orders</Button>
        </div>
      </div>
    )
  }

  const orderDate = new Date(order.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const currentStep = statusSteps[order.status]

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12">
          <button
            onClick={() => navigate('/orders')}
            className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Orders
          </button>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-serif text-4xl font-semibold mb-2">Order Details</h1>
              <p className="text-muted-foreground">Order {order.order_number || order.id.slice(0, 8)}</p>
            </div>
            <Badge className={cn('text-sm font-semibold px-4 py-2', statusColors[order.status])}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </Badge>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Order Timeline */}
            <div className="border border-border rounded-lg p-6">
              <h2 className="font-serif text-xl font-semibold mb-6">Order Status</h2>
              <div className="space-y-4">
                {/* Timeline Steps */}
                <div className="flex items-center justify-between">
                  {[
                    { step: 1, label: 'Pending', icon: Package },
                    { step: 2, label: 'Confirmed', icon: Package },
                    { step: 3, label: 'Shipped', icon: Truck },
                    { step: 4, label: 'Delivered', icon: Package },
                  ].map((item, idx) => {
                    const Icon = item.icon
                    const isCompleted = currentStep > item.step
                    const isCurrent = currentStep === item.step

                    return (
                      <div key={item.step} className="flex flex-col items-center flex-1">
                        <div
                          className={cn(
                            'w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all',
                            isCompleted || isCurrent
                              ? 'bg-primary text-white'
                              : 'bg-muted text-muted-foreground'
                          )}
                        >
                          <Icon className="w-6 h-6" />
                        </div>
                        <p className="text-xs font-medium text-center">{item.label}</p>
                        {idx < 3 && (
                          <div
                            className={cn(
                              'h-1 flex-1 mx-2 mt-2',
                              isCompleted ? 'bg-primary' : 'bg-muted'
                            )}
                          />
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Status Message */}
                <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    {order.status === 'pending' && 'Your order is being processed. We will confirm it shortly.'}
                    {order.status === 'confirmed' && 'Your order has been confirmed and is being prepared for shipment.'}
                    {order.status === 'shipped' && 'Your order is on its way! Track your package for delivery updates.'}
                    {order.status === 'delivered' && 'Your order has been delivered. Thank you for your purchase!'}
                    {order.status === 'cancelled' && 'This order has been cancelled.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Order Information */}
            <div className="border border-border rounded-lg p-6">
              <h2 className="font-serif text-xl font-semibold mb-6">Order Information</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Order Number</p>
                  <p className="font-mono text-lg font-semibold">{order.order_number || order.id}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Order Date</p>
                  <p className="text-lg font-semibold">{orderDate}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Total Items</p>
                  <p className="text-lg font-semibold">{order.items_count} item{order.items_count !== 1 ? 's' : ''}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Order Total</p>
                  <p className="text-lg font-bold text-primary">${order.total_amount.toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="border border-border rounded-lg p-6">
              <h2 className="font-serif text-xl font-semibold mb-6">Shipping Address</h2>
              <div className="space-y-2">
                {order.shipping_address.split(',').map((line, idx) => (
                  <p key={idx} className="text-sm text-foreground">
                    {line.trim()}
                  </p>
                ))}
              </div>
            </div>

            {/* Billing Address */}
            {order.billing_address && (
              <div className="border border-border rounded-lg p-6">
                <h2 className="font-serif text-xl font-semibold mb-6">Billing Address</h2>
                <div className="space-y-2">
                  {order.billing_address.split(',').map((line, idx) => (
                    <p key={idx} className="text-sm text-foreground">
                      {line.trim()}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 border border-border rounded-lg p-6 space-y-6">
              <div>
                <h3 className="font-serif text-lg font-semibold mb-4">Order Summary</h3>
                <div className="space-y-3 pb-4 border-b border-border">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">${order.total_amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium">Included</span>
                  </div>
                </div>
                <div className="flex justify-between font-serif text-lg font-semibold pt-4">
                  <span>Total</span>
                  <span className="text-primary">${order.total_amount.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-3">
                <Button className="w-full" variant="outline">
                  Download Invoice
                </Button>
                <Button className="w-full" variant="outline">
                  Contact Support
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
