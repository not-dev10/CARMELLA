import { motion } from "framer-motion"
import { AlertTriangle, AlertCircle, Package } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const LOW_STOCK_ITEMS = [
  { id: 1, name: "Artisan Nesting Bowls (Set of 3)", sku: "CR-2024-NB3", stock: 8, reorderLevel: 20, status: "critical" },
  { id: 2, name: "Minimalist Water Pitcher", sku: "CR-2024-MWP", stock: 0, reorderLevel: 15, status: "out" },
  { id: 3, name: "Speckled Dinner Plate", sku: "CR-2024-SDP", stock: 12, reorderLevel: 25, status: "warning" }
]

export function InventorySection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-4xl font-black tracking-tight text-gray-800 mb-2">Inventory Alerts</h2>
        <p className="text-gray-500">Monitor low stock items and reorder suggestions.</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {LOW_STOCK_ITEMS.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "bg-white border-l-4 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow",
              item.status === "out" ? "border-l-red-600 bg-red-50/30" :
              item.status === "critical" ? "border-l-orange-600 bg-orange-50/30" :
              "border-l-yellow-600 bg-yellow-50/30"
            )}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className={cn(
                    "p-2 rounded-lg",
                    item.status === "out" ? "bg-red-100" :
                    item.status === "critical" ? "bg-orange-100" :
                    "bg-yellow-100"
                  )}>
                    {item.status === "out" ? (
                      <AlertCircle className={cn(
                        "w-5 h-5",
                        item.status === "out" ? "text-red-600" :
                        item.status === "critical" ? "text-orange-600" :
                        "text-yellow-600"
                      )} />
                    ) : (
                      <AlertTriangle className={cn(
                        "w-5 h-5",
                        item.status === "out" ? "text-red-600" :
                        item.status === "critical" ? "text-orange-600" :
                        "text-yellow-600"
                      )} />
                    )}
                  </div>
                  <div>
                    <h3 className="font-serif text-lg text-gray-800">{item.name}</h3>
                    <p className="text-xs text-gray-500">SKU: {item.sku}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Current Stock</p>
                    <p className="text-2xl font-bold text-gray-800">{item.stock}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Reorder Level</p>
                    <p className="text-2xl font-bold text-gray-800">{item.reorderLevel}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Status</p>
                    <Badge className={cn(
                      "text-xs font-bold",
                      item.status === "out" ? "bg-red-100 text-red-700" :
                      item.status === "critical" ? "bg-orange-100 text-orange-700" :
                      "bg-yellow-100 text-yellow-700"
                    )}>
                      {item.status === "out" ? "Out of Stock" :
                       item.status === "critical" ? "Critical" :
                       "Low Stock"}
                    </Badge>
                  </div>
                </div>
              </div>

              <Button className="btn-gradient text-sm">
                <Package className="w-4 h-4 mr-1" />
                Reorder
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
