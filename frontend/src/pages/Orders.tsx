import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Package, Calendar, DollarSign, Truck } from 'lucide-react'
import Link from '@/components/ui/link-shim'
import { ordersAPI } from '@/lib/api'
import { motion } from 'framer-motion'

interface Order {
  id: string
  total_amount: number
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  created_at: string
  items_count: number
  shipping_address: string
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200',
  confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200',
  shipped: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200',
  delivered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200',
}

const statusIcons = {
  pending: Package,
  confirmed: Package,
  shipped: Truck,
  delivered: Package,
  cancelled: Package,
}

export default function Orders() {
  const { user, loading: authLoading } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      setLoading(false)
      return
    }

    const fetchOrders = async () => {
      try {
        setLoading(true)
        const response = await ordersAPI.getAll()
        setOrders(response.orders || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load orders')
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [user, authLoading])

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading orders...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="font-serif text-3xl font-semibold mb-4">Sign In Required</h1>
          <p className="text-muted-foreground mb-6">Please sign in to view your orders.</p>
          <Link href="/login">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    )
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
          <h1 className="font-serif text-4xl font-semibold mb-2">Order History</h1>
          <p className="text-muted-foreground">View and track your orders</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
            {error}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h2 className="font-serif text-2xl font-semibold mb-2">No Orders Yet</h2>
            <p className="text-muted-foreground mb-6">You haven't placed any orders yet.</p>
            <Link href="/catalog">
              <Button>Start Shopping</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, index) => {
              const StatusIcon = statusIcons[order.status]
              const orderDate = new Date(order.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border border-border rounded-lg p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="grid md:grid-cols-5 gap-4 items-center">
                    {/* Order ID */}
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Order ID</p>
                      <p className="font-mono text-sm font-semibold">{order.id.slice(0, 8)}...</p>
                    </div>

                    {/* Date */}
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Date</p>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <p className="text-sm">{orderDate}</p>
                      </div>
                    </div>

                    {/* Amount */}
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Total</p>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                        <p className="text-sm font-semibold">${order.total_amount.toFixed(2)}</p>
                      </div>
                    </div>

                    {/* Status */}
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Status</p>
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${statusColors[order.status]}`}>
                        <StatusIcon className="w-3 h-3" />
                        <span className="capitalize">{order.status}</span>
                      </div>
                    </div>

                    {/* Action */}
                    <div className="text-right">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>

                  {/* Items Count */}
                  <div className="mt-4 pt-4 border-t border-border/50">
                    <p className="text-xs text-muted-foreground">
                      {order.items_count} item{order.items_count !== 1 ? 's' : ''} • Shipping to: {order.shipping_address}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
