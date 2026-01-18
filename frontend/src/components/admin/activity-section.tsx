import { motion } from "framer-motion"
import { Clock, CheckCircle, Edit3, Users, Grid3x3, ShoppingCart } from "lucide-react"
import { cn } from "@/lib/utils"

const ACTIVITY_LOG = [
  { id: 1, action: "B2B Request Approved", user: "Admin", target: "Nordic Interiors Ltd", date: "Jan 24, 2024 14:32", type: "approval" },
  { id: 2, action: "Product Updated", user: "Admin", target: "Earthbound Charcoal Vase", date: "Jan 24, 2024 10:15", type: "update" },
  { id: 3, action: "Order Shipped", user: "System", target: "Order #CR-9821", date: "Jan 23, 2024 16:45", type: "order" },
  { id: 4, action: "User Registered", user: "System", target: "Emma Rodriguez", date: "Jan 23, 2024 09:20", type: "user" },
  { id: 5, action: "Category Created", user: "Admin", target: "New Collection", date: "Jan 22, 2024 13:10", type: "category" }
]

function getIcon(type: string) {
  switch (type) {
    case "approval":
      return <CheckCircle className="w-5 h-5" />
    case "update":
      return <Edit3 className="w-5 h-5" />
    case "order":
      return <ShoppingCart className="w-5 h-5" />
    case "user":
      return <Users className="w-5 h-5" />
    case "category":
      return <Grid3x3 className="w-5 h-5" />
    default:
      return <Clock className="w-5 h-5" />
  }
}

function getColor(type: string) {
  switch (type) {
    case "approval":
      return "bg-green-100 text-green-700"
    case "update":
      return "bg-blue-100 text-blue-700"
    case "order":
      return "bg-primary/10 text-primary"
    case "user":
      return "bg-purple-100 text-purple-700"
    case "category":
      return "bg-indigo-100 text-indigo-700"
    default:
      return "bg-gray-100 text-gray-700"
  }
}

export function ActivitySection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-4xl font-black tracking-tight text-gray-800 mb-2">Activity Log</h2>
        <p className="text-gray-500">Track all admin actions and system events.</p>
      </div>

      <div className="space-y-3">
        {ACTIVITY_LOG.map((log, idx) => (
          <motion.div
            key={log.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-4">
              <div className={cn("p-2 rounded-lg", getColor(log.type))}>
                {getIcon(log.type)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-gray-800">{log.action}</h3>
                  <span className="text-xs text-gray-500">{log.date}</span>
                </div>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">{log.user}</span> {log.action.toLowerCase()} on{" "}
                  <span className="font-medium text-gray-800">{log.target}</span>
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
