import { useState, useEffect } from 'react'
import { motion } from "framer-motion"
import { Loader, Edit2, Plus, Minus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { inventoryAPI } from "@/lib/api"

interface InventoryItem {
  id: string
  product_id: string
  warehouse_location: string
  quantity_on_hand: number
  quantity_reserved: number
  quantity_available: number
  reorder_point: number
  reorder_quantity: number
  sku: string
  barcode?: string
  last_restock_date?: string
  notes?: string
  is_active: boolean
  products?: {
    id: string
    name: string
    slug: string
    image_url: string
    base_price: number
  } | null
}

interface InventoryStats {
  totalItems: number
  totalQuantity: number
  lowStockCount: number
  outOfStockCount: number
}

export function InventorySection() {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [stats, setStats] = useState<InventoryStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [warehouseFilter, setWarehouseFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<{ quantity: number; reorderPoint: number } | null>(null)
  const [adjusting, setAdjusting] = useState<string | null>(null)

  useEffect(() => {
    fetchInventory()
    fetchStats()
  }, [])

  const fetchInventory = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await inventoryAPI.getAll({
        search: searchQuery,
        warehouse: warehouseFilter !== 'all' ? warehouseFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      })
      console.log('[INVENTORY] Response:', response)
      console.log('[INVENTORY] Inventory items:', response.inventory)
      setInventory(response.inventory || [])
    } catch (err) {
      console.error('Failed to fetch inventory:', err)
      setError(err instanceof Error ? err.message : 'Failed to load inventory')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await inventoryAPI.getStats()
      setStats(response.stats)
    } catch (err) {
      console.error('Failed to fetch inventory stats:', err)
    }
  }

  const handleAdjustStock = async (itemId: string, change: number) => {
    try {
      setAdjusting(itemId)
      await inventoryAPI.adjust(itemId, change, 'adjustment', `Manual ${change > 0 ? 'restock' : 'removal'}`)
      
      // Update local state
      const updated = inventory.map(item =>
        item.id === itemId
          ? {
              ...item,
              quantity_on_hand: item.quantity_on_hand + change,
              quantity_available: item.quantity_available + change,
            }
          : item
      )
      setInventory(updated)
      fetchStats()
    } catch (err) {
      console.error('Failed to adjust stock:', err)
      alert(err instanceof Error ? err.message : 'Failed to adjust stock')
    } finally {
      setAdjusting(null)
    }
  }

  const handleSaveEdit = async (itemId: string) => {
    if (!editValues) return

    try {
      await inventoryAPI.update(itemId, {
        quantity_on_hand: editValues.quantity,
        reorder_point: editValues.reorderPoint,
      })

      const updated = inventory.map(item =>
        item.id === itemId
          ? {
              ...item,
              quantity_on_hand: editValues.quantity,
              quantity_available: editValues.quantity - item.quantity_reserved,
              reorder_point: editValues.reorderPoint,
            }
          : item
      )
      setInventory(updated)
      setEditingId(null)
      setEditValues(null)
      fetchStats()
    } catch (err) {
      console.error('Failed to update inventory:', err)
      alert(err instanceof Error ? err.message : 'Failed to update inventory')
    }
  }

  const getStockStatus = (item: InventoryItem) => {
    if (item.quantity_available === 0) return 'out'
    if (item.quantity_available <= item.reorder_point) return 'critical'
    if (item.quantity_available <= item.reorder_point * 1.5) return 'warning'
    return 'ok'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'out':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-l-red-600'
      case 'critical':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-l-orange-600'
      case 'warning':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-l-yellow-600'
      default:
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-l-green-600'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'out':
        return 'Out of Stock'
      case 'critical':
        return 'Critical'
      case 'warning':
        return 'Low Stock'
      default:
        return 'In Stock'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 animate-spin text-primary mr-2" />
        <p className="text-muted-foreground">Loading inventory...</p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-4xl font-black tracking-tight text-foreground mb-2">Inventory Management</h2>
        <p className="text-muted-foreground">Track stock levels, reorder points, and warehouse locations.</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="admin-card p-6">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Total Items</p>
            <p className="text-3xl font-bold text-foreground">{stats.totalItems}</p>
          </div>
          <div className="admin-card p-6">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Total Quantity</p>
            <p className="text-3xl font-bold text-foreground">{stats.totalQuantity}</p>
          </div>
          <div className="admin-card p-6 border-l-4 border-l-yellow-600">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Low Stock</p>
            <p className="text-3xl font-bold text-yellow-600">{stats.lowStockCount}</p>
          </div>
          <div className="admin-card p-6 border-l-4 border-l-red-600">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Out of Stock</p>
            <p className="text-3xl font-bold text-red-600">{stats.outOfStockCount}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="admin-card p-4 flex flex-col lg:flex-row gap-4">
        <input
          type="text"
          placeholder="Search by SKU or product name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="admin-input flex-1"
        />
        <select
          value={warehouseFilter}
          onChange={(e) => setWarehouseFilter(e.target.value)}
          className="admin-button-secondary"
        >
          <option value="all">All Warehouses</option>
          <option value="Main Warehouse">Main Warehouse</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="admin-button-secondary"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="low">Low Stock</option>
        </select>
        <Button onClick={fetchInventory} className="btn-gradient">
          Search
        </Button>
      </div>

      {error && (
        <div className="admin-card text-center py-12">
          <p className="text-red-600 dark:text-red-400 font-semibold">{error}</p>
        </div>
      )}

      {inventory.length === 0 ? (
        <div className="admin-card text-center py-12">
          <p className="text-muted-foreground">No inventory items found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {inventory.map((item) => {
            const status = getStockStatus(item)
            const isEditing = editingId === item.id

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "admin-card border-l-4 p-6 hover:shadow-md transition-shadow",
                  getStatusColor(status)
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden">
                        {item.products?.image_url ? (
                          <img
                            src={item.products.image_url}
                            alt={item.products.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-serif text-lg text-foreground">{item.products?.name || 'Unknown Product'}</h3>
                        <p className="text-xs text-muted-foreground">SKU: {item.sku}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">On Hand</p>
                        {isEditing ? (
                          <input
                            type="number"
                            value={editValues?.quantity || 0}
                            onChange={(e) =>
                              setEditValues({ ...editValues!, quantity: parseInt(e.target.value) || 0 })
                            }
                            className="w-full px-2 py-1 bg-muted border border-border rounded text-sm"
                          />
                        ) : (
                          <p className="text-2xl font-bold text-foreground">{item.quantity_on_hand}</p>
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Reserved</p>
                        <p className="text-2xl font-bold text-foreground">{item.quantity_reserved}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Available</p>
                        <p className="text-2xl font-bold text-foreground">{item.quantity_available}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Reorder Point</p>
                        {isEditing ? (
                          <input
                            type="number"
                            value={editValues?.reorderPoint || 0}
                            onChange={(e) =>
                              setEditValues({ ...editValues!, reorderPoint: parseInt(e.target.value) || 0 })
                            }
                            className="w-full px-2 py-1 bg-muted border border-border rounded text-sm"
                          />
                        ) : (
                          <p className="text-2xl font-bold text-foreground">{item.reorder_point}</p>
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Status</p>
                        <Badge className={cn('text-xs font-bold', getStatusColor(status))}>
                          {getStatusLabel(status)}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    {isEditing ? (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleSaveEdit(item.id)}
                          className="bg-primary hover:bg-primary/90"
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingId(null)
                            setEditValues(null)
                          }}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingId(item.id)
                            setEditValues({
                              quantity: item.quantity_on_hand,
                              reorderPoint: item.reorder_point,
                            })
                          }}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={adjusting === item.id}
                          onClick={() => handleAdjustStock(item.id, 1)}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={adjusting === item.id || item.quantity_on_hand === 0}
                          onClick={() => handleAdjustStock(item.id, -1)}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}
