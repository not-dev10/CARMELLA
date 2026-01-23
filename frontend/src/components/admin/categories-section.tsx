import { motion } from "framer-motion"
import { Grid3x3, Plus, Edit2, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const CATEGORIES = [
  { id: 1, name: "Vases", slug: "vases", products: 24, revenue: "$12,450", status: true },
  { id: 2, name: "Bowls", slug: "bowls", products: 18, revenue: "$10,200", status: true },
  { id: 3, name: "Mugs", slug: "mugs", products: 32, revenue: "$8,900", status: true },
  { id: 4, name: "Plates", slug: "plates", products: 15, revenue: "$7,650", status: true },
  { id: 5, name: "Decorative", slug: "decorative", products: 12, revenue: "$3,300", status: false }
]

export function CategoriesSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="flex items-end justify-between">
        <div>
          <h2 className="admin-heading">Category Management</h2>
          <p className="text-muted-foreground">Create, edit, and manage product categories.</p>
        </div>
        <Button className="btn-gradient">
          <Plus className="w-5 h-5 mr-2" />
          Add Category
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {CATEGORIES.map((category) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="admin-card hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 dark:bg-primary/20 rounded-lg">
                  <Grid3x3 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-serif text-lg text-foreground">{category.name}</h3>
                  <p className="text-xs text-muted-foreground">/{category.slug}</p>
                </div>
              </div>
              <Badge className={category.status ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" : "bg-muted text-muted-foreground"}>
                {category.status ? "Active" : "Inactive"}
              </Badge>
            </div>

            <div className="space-y-2 mb-4 pb-4 border-b border-border dark:border-gray-800">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Products:</span>
                <span className="font-semibold text-foreground">{category.products}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Revenue:</span>
                <span className="font-semibold text-foreground">{category.revenue}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-primary border border-primary rounded-lg hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors text-sm font-medium">
                <Edit2 className="w-4 h-4" />
                Edit
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-sm font-medium">
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
