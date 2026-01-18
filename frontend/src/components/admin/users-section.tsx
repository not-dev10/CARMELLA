import { motion } from "framer-motion"
import { Edit2, Trash2, Ban } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const ALL_USERS = [
  { id: 1, name: "Anna Bergström", email: "anna@nordicliving.com", type: "B2B", status: "active", joined: "Jan 10, 2024", orders: 12, spent: "$42,500" },
  { id: 2, name: "Marcus Chen", email: "marcus@earthfire.com", type: "B2B", status: "active", joined: "Jan 8, 2024", orders: 8, spent: "$28,900" },
  { id: 3, name: "Sarah Jenkins", email: "sarah@minimalist.com", type: "Retail", status: "active", joined: "Jan 5, 2024", orders: 3, spent: "$12,400" },
  { id: 4, name: "James Wilson", email: "james@artisan.com", type: "B2B", status: "inactive", joined: "Dec 28, 2023", orders: 0, spent: "$0" },
  { id: 5, name: "Emma Rodriguez", email: "emma@ceramics.com", type: "Retail", status: "active", joined: "Jan 15, 2024", orders: 5, spent: "$8,750" }
]

export function UsersSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-4xl font-black tracking-tight text-gray-800 mb-2">User Management</h2>
        <p className="text-gray-500">View, manage, and control user accounts and permissions.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase">User</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase">Type</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase">Joined</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase">Orders</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase text-right">Spent</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {ALL_USERS.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-800">{user.name}</span>
                      <span className="text-xs text-gray-500">{user.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge className={cn(
                      "text-xs font-bold",
                      user.type === "B2B" ? "bg-primary/10 text-primary" : "bg-gray-100 text-gray-700"
                    )}>
                      {user.type}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Badge className={cn(
                      "text-xs font-bold",
                      user.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                    )}>
                      {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{user.joined}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-800">{user.orders}</td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-800 text-right">{user.spent}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-1 text-gray-500 hover:text-primary transition-colors" title="Edit">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-gray-500 hover:text-orange-500 transition-colors" title="Ban">
                        <Ban className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-gray-500 hover:text-red-500 transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  )
}
