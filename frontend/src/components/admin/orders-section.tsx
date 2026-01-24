import { useState, useEffect } from 'react'
import { Search, Download, Loader, X, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { adminAPI } from '@/lib/api'

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

export function OrdersSection() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [newStatus, setNewStatus] = useState<string>('')
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [updateMessage, setUpdateMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    fetchOrders()
  }, [])

  useEffect(() => {
    filterOrders()
  }, [orders, searchQuery, statusFilter])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await adminAPI.getOrders?.() || { orders: [] }
      setOrders(response.orders || [])
    } catch (err) {
      console.error('Failed to fetch orders:', err)
      setError('Failed to load orders')
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const filterOrders = () => {
    let filtered = orders

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(order =>
        order.order_number?.toLowerCase().includes(query) ||
        order.id.toLowerCase().includes(query) ||
        order.shipping_address.toLowerCase().includes(query)
      )
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter)
    }

    setFilteredOrders(filtered)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
      case 'confirmed':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
      case 'shipped':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
      case 'delivered':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
      case 'cancelled':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
      default:
        return 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400'
    }
  }

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order)
    setNewStatus(order.status)
    setShowModal(true)
    setUpdateMessage(null)
  }

  const handleUpdateStatus = async () => {
    if (!selectedOrder || !newStatus) return

    try {
      setUpdatingStatus(true)
      setUpdateMessage(null)
      
      // Call the API to update order status
      await adminAPI.updateOrderStatus(selectedOrder.id, newStatus)
      
      // Update local state
      const updatedOrders = orders.map(order =>
        order.id === selectedOrder.id
          ? { ...order, status: newStatus as any }
          : order
      )
      setOrders(updatedOrders)
      setSelectedOrder({ ...selectedOrder, status: newStatus as any })
      filterOrders()
      
      setUpdateMessage({ type: 'success', text: 'Order status updated successfully!' })
      setTimeout(() => {
        setShowModal(false)
        setUpdateMessage(null)
      }, 2000)
    } catch (err) {
      console.error('Failed to update order status:', err)
      setUpdateMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to update order status'
      })
    } finally {
      setUpdatingStatus(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex flex-col gap-2">
          <h2 className="admin-heading">All Orders</h2>
          <p className="text-muted-foreground text-base">Manage customer orders and track shipments.</p>
        </div>
        <Button className="btn-gradient">
          <Download className="w-5 h-5 mr-2" />
          Export Orders
        </Button>
      </div>

      <div className="admin-card">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <input
              type="text"
              placeholder="Search by order ID, number, or address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="admin-input pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="admin-button-secondary"
          >
            <option value="all">Status: All</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="admin-card text-center py-12">
          <Loader className="w-8 h-8 animate-spin mx-auto text-primary mb-4" />
          <p className="text-muted-foreground">Loading orders...</p>
        </div>
      ) : error ? (
        <div className="admin-card text-center py-12">
          <p className="text-red-600 dark:text-red-400 font-semibold">{error}</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="admin-card text-center py-12">
          <p className="text-muted-foreground">No orders found</p>
        </div>
      ) : (
        <div className="admin-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="admin-table-header">
                <tr>
                  <th className="px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase">Order ID</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase">Items</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase">Status</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase">Date</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase text-right">Total</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border dark:divide-gray-800">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="admin-table-row">
                    <td className="px-6 py-4 text-sm font-mono text-muted-foreground">
                      {order.order_number || order.id.slice(0, 8)}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{order.items_count} items</td>
                    <td className="px-6 py-4">
                      <Badge className={cn('text-xs font-medium', getStatusColor(order.status))}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{formatDate(order.created_at)}</td>
                    <td className="px-6 py-4 text-sm font-bold text-foreground text-right">
                      {formatCurrency(order.total_amount)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleViewOrder(order)}
                        className="text-primary hover:text-primary/70 text-sm font-semibold flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="text-sm text-muted-foreground">
        Showing {filteredOrders.length} of {orders.length} orders
      </div>

      {/* Order Details Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            {/* Modal Header */}
            <div className="sticky top-0 bg-muted dark:bg-gray-800 px-6 py-4 flex items-center justify-between border-b border-border">
              <h2 className="font-serif text-xl font-semibold">Order Details</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Order Header */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Order Number</p>
                  <p className="font-mono text-lg font-semibold">{selectedOrder.order_number || selectedOrder.id}</p>
                </div>
                <Badge className={cn('text-sm font-semibold px-4 py-2', getStatusColor(selectedOrder.status))}>
                  {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                </Badge>
              </div>

              {/* Order Information Grid */}
              <div className="grid md:grid-cols-2 gap-6 pb-6 border-b border-border">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Order Date</p>
                  <p className="text-sm font-semibold">
                    {new Date(selectedOrder.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Total Amount</p>
                  <p className="text-sm font-bold text-primary">${selectedOrder.total_amount.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Items Count</p>
                  <p className="text-sm font-semibold">{selectedOrder.items_count} item{selectedOrder.items_count !== 1 ? 's' : ''}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">User ID</p>
                  <p className="text-sm font-mono">{selectedOrder.user_id.slice(0, 8)}...</p>
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3 font-semibold">Shipping Address</p>
                <div className="bg-muted/50 dark:bg-gray-800/50 rounded-lg p-4 space-y-1">
                  {selectedOrder.shipping_address.split(',').map((line, idx) => (
                    <p key={idx} className="text-sm text-foreground">
                      {line.trim()}
                    </p>
                  ))}
                </div>
              </div>

              {/* Billing Address */}
              {selectedOrder.billing_address && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3 font-semibold">Billing Address</p>
                  <div className="bg-muted/50 dark:bg-gray-800/50 rounded-lg p-4 space-y-1">
                    {selectedOrder.billing_address.split(',').map((line, idx) => (
                      <p key={idx} className="text-sm text-foreground">
                        {line.trim()}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedOrder.notes && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3 font-semibold">Notes</p>
                  <div className="bg-muted/50 dark:bg-gray-800/50 rounded-lg p-4">
                    <p className="text-sm text-foreground">{selectedOrder.notes}</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-6 border-t border-border">
                <div className="flex-1">
                  <label className="block text-xs text-muted-foreground uppercase tracking-wide mb-2 font-semibold">
                    Update Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-muted dark:bg-gray-800 border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="flex gap-2 items-end">
                  <Button
                    onClick={handleUpdateStatus}
                    disabled={updatingStatus || newStatus === selectedOrder?.status}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {updatingStatus ? 'Updating...' : 'Update'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowModal(false)}
                  >
                    Close
                  </Button>
                </div>
              </div>

              {/* Update Message */}
              {updateMessage && (
                <div
                  className={cn(
                    'p-3 rounded-lg text-sm font-medium',
                    updateMessage.type === 'success'
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                  )}
                >
                  {updateMessage.text}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
