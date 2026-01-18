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
          <h2 className="text-4xl font-black tracking-tight text-gray-800 mb-2">Category Management</h2>
          <p className="text-gray-500">Create, edit, and manage product categories.</p>
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
            className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Grid3x3 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-serif text-lg text-gray-800">{category.name}</h3>
                  <p className="text-xs text-gray-500">/{category.slug}</p>
                </div>
              </div>
              <Badge className={category.status ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}>
                {category.status ? "Active" : "Inactive"}
              </Badge>
            </div>

            <div className="space-y-2 mb-4 pb-4 border-b border-gray-200">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Products:</span>
                <span className="font-semibold text-gray-800">{category.products}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Revenue:</span>
                <span className="font-semibold text-gray-800">{category.revenue}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-primary border border-primary rounded-lg hover:bg-primary/5 transition-colors text-sm font-medium">
                <Edit2 className="w-4 h-4" />
                Edit
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium">
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
