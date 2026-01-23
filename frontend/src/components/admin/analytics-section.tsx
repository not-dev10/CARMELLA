import { motion } from "framer-motion"
import { BarChart3 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const SALES_TREND = [
  { date: "Jan 15", sales: 4200, orders: 28 },
  { date: "Jan 16", sales: 5100, orders: 35 },
  { date: "Jan 17", sales: 3800, orders: 22 },
  { date: "Jan 18", sales: 6200, orders: 42 },
  { date: "Jan 19", sales: 5900, orders: 38 },
  { date: "Jan 20", sales: 7100, orders: 48 },
  { date: "Jan 21", sales: 6800, orders: 45 }
]

const REVENUE_BY_CATEGORY = [
  { category: "Vases", revenue: "$12,450", percentage: 28 },
  { category: "Bowls", revenue: "$10,200", percentage: 24 },
  { category: "Mugs", revenue: "$8,900", percentage: 21 },
  { category: "Plates", revenue: "$7,650", percentage: 18 },
  { category: "Other", revenue: "$3,300", percentage: 9 }
]

const TOP_PRODUCTS = [
  { id: 1, name: "Earthbound Charcoal Vase", sales: 342, revenue: "$14,511", trend: "+12%" },
  { id: 2, name: "Artisan Nesting Bowls", sales: 298, revenue: "$25,330", trend: "+8%" },
  { id: 3, name: "Speckled Morning Mug", sales: 521, revenue: "$6,252", trend: "+18%" },
  { id: 4, name: "Minimalist Water Pitcher", sales: 187, revenue: "$5,283", trend: "+5%" }
]

export function AnalyticsSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-4xl font-black tracking-tight text-foreground mb-2">Analytics & Reports</h2>
        <p className="text-muted-foreground">Sales trends, revenue breakdown, and top performing products.</p>
      </div>

      {/* Sales Trend Chart */}
      <div className="admin-card p-6">
        <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          Sales Trend (Last 7 Days)
        </h3>
        <div className="space-y-4">
          {SALES_TREND.map((item, idx) => (
            <div key={idx} className="flex items-center gap-4">
              <span className="w-16 text-sm font-semibold text-muted-foreground">{item.date}</span>
              <div className="flex-1 flex items-center gap-2">
                <div className="flex-1 bg-muted dark:bg-gray-800 rounded-full h-8 relative overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-primary to-primary/70 h-full rounded-full transition-all"
                    style={{ width: `${(item.sales / 7100) * 100}%` }}
                  />
                </div>
                <span className="w-20 text-right text-sm font-semibold text-foreground">${item.sales}</span>
              </div>
              <Badge className="bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs">{item.orders} orders</Badge>
            </div>
          ))}
        </div>
      </div>

      {/* Revenue by Category */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="admin-card p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">Revenue by Category</h3>
          <div className="space-y-4">
            {REVENUE_BY_CATEGORY.map((item, idx) => (
              <div key={idx}>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-semibold text-foreground">{item.category}</span>
                  <span className="text-sm font-bold text-foreground">{item.revenue}</span>
                </div>
                <div className="w-full bg-muted dark:bg-gray-800 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground mt-1">{item.percentage}% of total</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="admin-card p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">Top Performing Products</h3>
          <div className="space-y-3">
            {TOP_PRODUCTS.map((product) => (
              <div key={product.id} className="flex items-center justify-between p-3 bg-muted dark:bg-gray-800 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">{product.name}</p>
                  <p className="text-xs text-muted-foreground">{product.sales} sales</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-foreground">{product.revenue}</p>
                  <p className={cn("text-xs font-semibold", product.trend.includes("+") ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400")}>
                    {product.trend}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
