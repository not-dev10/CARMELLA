"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  BarChart3, ShoppingCart, TrendingUp, Users, Package, AlertCircle,
  Search, Plus, Upload, Edit2, Trash2, ChevronLeft, ChevronRight,
  Settings, LogOut, Bell, Filter, Grid3x3, Clock, CheckCircle, XCircle,
  Mail, Phone, MapPin, Save, X, Download
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { AnalyticsSection } from "@/components/admin/analytics-section"
import { UsersSection } from "@/components/admin/users-section"
import { ContactsSection } from "@/components/admin/contacts-section"
import { CategoriesSection } from "@/components/admin/categories-section"
import { InventorySection } from "@/components/admin/inventory-section"
import { ActivitySection } from "@/components/admin/activity-section"
import { SettingsSection } from "@/components/admin/settings-section"

// Mock Data
const DASHBOARD_STATS = [
  { label: "Total Orders", value: "1,284", trend: "+12.5%", icon: ShoppingCart, color: "primary" },
  { label: "Revenue", value: "$42,500.00", trend: "+8.2%", icon: TrendingUp, color: "primary" },
  { label: "Pending B2B Requests", value: "12", trend: "23:58:12", icon: AlertCircle, color: "terracotta", urgent: true },
  { label: "Active Users", value: "842", trend: "-2%", icon: Users, color: "primary" }
]

const RECENT_ORDERS = [
  { id: "#CR-9821", client: "The Clay Studio", status: "Shipped", date: "Jan 23, 2024", total: "$4,210.00" },
  { id: "#CR-9820", client: "Nordic Living Co.", status: "Pending", date: "Jan 23, 2024", total: "$1,850.50" },
  { id: "#CR-9819", client: "Earth & Fire Gallery", status: "Processing", date: "Jan 22, 2024", total: "$920.00" },
  { id: "#CR-9818", client: "Minimalist Home", status: "Shipped", date: "Jan 22, 2024", total: "$12,400.00" }
]

const PRODUCTS = [
  { id: 1, name: "Earthbound Charcoal Vase", sku: "CR-2024-EBV", stock: 142, price: "$42.50", status: true, image: "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=100&h=100&fit=crop" },
  { id: 2, name: "Artisan Nesting Bowls (Set of 3)", sku: "CR-2024-NB3", stock: 8, price: "$85.00", status: true, image: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=100&h=100&fit=crop", lowStock: true },
  { id: 3, name: "Speckled Morning Mug", sku: "CR-2024-SMM", stock: 520, price: "$12.00", status: false, image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=100&h=100&fit=crop" },
  { id: 4, name: "Minimalist Water Pitcher", sku: "CR-2024-MWP", stock: 0, price: "$28.90", status: true, image: "https://images.unsplash.com/photo-1581783342308-f792ca11df53?w=100&h=100&fit=crop", outOfStock: true }
]

const B2B_REQUESTS = [
  { id: 1, company: "Nordic Interiors Ltd", contact: "Anna Bergström", date: "Jan 24, 2024", status: "pending", timeLeft: "23:45:30" },
  { id: 2, company: "Earth & Fire Gallery", contact: "Marcus Chen", date: "Jan 24, 2024", status: "pending", timeLeft: "22:15:00" },
  { id: 3, company: "Minimalist Home Co.", contact: "Sarah Jenkins", date: "Jan 23, 2024", status: "approved", approvedDate: "Jan 23, 2024" },
  { id: 4, company: "Artisan Collective", contact: "James Wilson", date: "Jan 23, 2024", status: "rejected", reason: "Incomplete documentation" }
]

const ALL_ORDERS = [
  { id: "#CR-9821", client: "The Clay Studio", email: "contact@claystudio.com", status: "Shipped", date: "Jan 23, 2024", total: "$4,210.00", items: 12 },
  { id: "#CR-9820", client: "Nordic Living Co.", email: "orders@nordicliving.com", status: "Pending", date: "Jan 23, 2024", total: "$1,850.50", items: 5 },
  { id: "#CR-9819", client: "Earth & Fire Gallery", email: "info@earthfire.com", status: "Processing", date: "Jan 22, 2024", total: "$920.00", items: 3 },
  { id: "#CR-9818", client: "Minimalist Home", email: "sales@minimalisthome.com", status: "Shipped", date: "Jan 22, 2024", total: "$12,400.00", items: 28 },
  { id: "#CR-9817", client: "Artisan Collective", email: "wholesale@artisancollective.com", status: "Delivered", date: "Jan 21, 2024", total: "$3,560.00", items: 8 }
]

const CLIENTS = [
  { id: 1, name: "The Clay Studio", email: "contact@claystudio.com", phone: "+1 (555) 123-4567", city: "Portland, OR", b2b: true, status: "approved", orders: 12, spent: "$42,500.00" },
  { id: 2, name: "Nordic Living Co.", email: "orders@nordicliving.com", phone: "+1 (555) 234-5678", city: "Stockholm, Sweden", b2b: true, status: "pending", orders: 5, spent: "$18,500.00" },
  { id: 3, name: "Earth & Fire Gallery", email: "info@earthfire.com", phone: "+1 (555) 345-6789", city: "Santa Fe, NM", b2b: true, status: "approved", orders: 8, spent: "$28,900.00" },
  { id: 4, name: "Minimalist Home", email: "sales@minimalisthome.com", phone: "+1 (555) 456-7890", city: "Copenhagen, Denmark", b2b: false, status: "active", orders: 3, spent: "$12,400.00" },
  { id: 5, name: "Artisan Collective", email: "wholesale@artisancollective.com", phone: "+1 (555) 567-8901", city: "Berlin, Germany", b2b: true, status: "rejected", orders: 0, spent: "$0.00" }
]

const HOMEPAGE_SECTIONS = [
  { id: "hero", name: "Hero Section", title: "Handcrafted Ceramics for Modern Living", subtitle: "Discover our curated collection of artisan ceramics", image: "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=400&h=300&fit=crop" },
  { id: "quote", name: "Brand Quote", quote: "Every piece tells a story of craftsmanship and tradition.", author: "Carmella Artisans" },
  { id: "newsletter", name: "Newsletter Section", title: "Stay Updated", description: "Get exclusive offers and new collection announcements" },
  { id: "testimonials", name: "Testimonials", title: "What Our Customers Say", count: 8 }
]

export default function Admin() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [searchQuery, setSearchQuery] = useState("")
  const [editingSection, setEditingSection] = useState<string | null>(null)

  const SIDEBAR_ITEMS = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "analytics", label: "Analytics", icon: TrendingUp },
    { id: "orders", label: "Orders", icon: ShoppingCart },
    { id: "products", label: "Products", icon: Package },
    { id: "categories", label: "Categories", icon: Grid3x3 },
    { id: "b2b", label: "B2B Requests", icon: AlertCircle, badge: 12 },
    { id: "clients", label: "Clients", icon: Users },
    { id: "contacts", label: "Contacts", icon: Mail, badge: 2 },
    { id: "inventory", label: "Inventory Alerts", icon: AlertCircle, badge: 3 },
    { id: "content", label: "Homepage Content", icon: Grid3x3 },
    { id: "activity", label: "Activity Log", icon: Clock },
    { id: "settings", label: "Settings", icon: Settings }
  ]

  return (
    <div className="light" style={{ colorScheme: 'light' }}>
      <div className="flex h-screen bg-gray-50 overflow-hidden">{/* Force light mode */}
        {/* Sidebar */}
        <aside className="w-64 bg-primary text-white flex flex-col shadow-xl">
          <div className="p-8">
            <h1 className="font-serif text-3xl tracking-tight">Carmella</h1>
            <p className="text-white/70 text-xs mt-1 uppercase tracking-widest font-medium">B2B Admin</p>
          </div>

          <nav className="flex-1 px-4 py-4 flex flex-col gap-1">
            {SIDEBAR_ITEMS.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                    activeTab === item.id
                      ? "bg-white/10"
                      : "hover:bg-white/5"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto bg-secondary text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                      {item.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>

          <div className="p-4 border-t border-white/10">
            <button className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 w-full transition-colors">
              <Settings className="w-5 h-5" />
              <span className="text-sm font-medium">Settings</span>
            </button>
            <button className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 w-full transition-colors">
              <LogOut className="w-5 h-5" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Top Header */}
          <header className="sticky top-0 z-10 bg-white shadow-sm px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <h2 className="text-xl font-bold text-gray-800">
                {SIDEBAR_ITEMS.find(i => i.id === activeTab)?.label}
              </h2>
              <div className="relative w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:bg-white transition-colors"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 text-gray-500 hover:bg-gray-50 rounded-lg relative transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2.5 w-2 h-2 bg-secondary rounded-full border-2 border-white"></span>
              </button>
              <div className="h-6 w-[1px] bg-gray-200 mx-2"></div>
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Jan 24, 2024</span>
            </div>
          </header>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-8 max-w-[1400px] mx-auto w-full">
              <AnimatePresence mode="wait">
                {/* Dashboard Tab */}
                {activeTab === "dashboard" && (
                  <motion.div
                    key="dashboard"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-8"
                  >
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {DASHBOARD_STATS.map((stat, idx) => {
                        const Icon = stat.icon
                        return (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className={cn(
                              "bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow flex flex-col gap-2",
                              stat.urgent && "ring-2 ring-secondary ring-offset-2"
                            )}
                          >
                            <div className="flex justify-between items-start">
                              <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
                              <div className={cn(
                                "p-1.5 rounded-lg",
                                stat.color === "primary" ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary"
                              )}>
                                <Icon className="w-5 h-5" />
                              </div>
                            </div>
                            <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                            <p className={cn(
                              "text-xs font-semibold flex items-center gap-1",
                              stat.urgent ? "text-secondary italic" : "text-green-600"
                            )}>
                              {stat.urgent ? (
                                <>
                                  <Clock className="w-3 h-3" /> {stat.trend}
                                </>
                              ) : (
                                <>
                                  <TrendingUp className="w-3 h-3" /> {stat.trend}
                                </>
                              )}
                            </p>
                          </motion.div>
                        )
                      })}
                    </div>

                    {/* Recent Orders */}
                    <div className="bg-white rounded-xl shadow-md overflow-hidden">
                      <div className="px-6 py-4 bg-gray-50 flex items-center justify-between">
                        <h3 className="text-gray-800 font-bold">Recent Orders</h3>
                        <button className="text-primary text-sm font-semibold hover:underline">View All Orders</button>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Order ID</th>
                              <th className="px-6 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Client Name</th>
                              <th className="px-6 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
                              <th className="px-6 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Date</th>
                              <th className="px-6 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-right">Total</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {RECENT_ORDERS.map((order) => (
                              <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4 text-sm font-mono text-gray-500">{order.id}</td>
                                <td className="px-6 py-4 text-base font-serif text-gray-800">{order.client}</td>
                                <td className="px-6 py-4">
                                  <Badge className={cn(
                                    "text-xs font-medium",
                                    order.status === "Shipped" ? "bg-primary/10 text-primary" :
                                      order.status === "Pending" ? "bg-secondary/10 text-secondary" :
                                        "bg-blue-100 text-blue-700"
                                  )}>
                                    {order.status}
                                  </Badge>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">{order.date}</td>
                                <td className="px-6 py-4 text-sm font-bold text-gray-800 text-right">{order.total}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Products Tab */}
                {activeTab === "products" && (
                  <motion.div
                    key="products"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6"
                  >
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                      <div className="flex flex-col gap-2">
                        <h2 className="text-4xl font-black tracking-tight text-gray-800">Product Catalog</h2>
                        <p className="text-gray-500 text-base">Manage your ceramic inventory and B2B pricing tiers.</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button className="flex items-center gap-2 bg-accent text-white hover:bg-accent/90">
                          <Upload className="w-5 h-5" />
                          Bulk CSV Upload
                        </Button>
                        <Button className="flex items-center gap-2 btn-gradient">
                          <Plus className="w-5 h-5" />
                          Add Product
                        </Button>
                      </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-xl p-4 shadow-md">
                      <div className="flex flex-col lg:flex-row gap-4">
                        <div className="flex-1 relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="text"
                            placeholder="Search products by name, SKU, or category..."
                            className="w-full bg-gray-100 border-none rounded-lg py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                        <div className="flex gap-3">
                          <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium hover:border-gray-300">
                            Category: All
                          </button>
                          <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium hover:border-gray-300">
                            Stock Status: All
                          </button>
                          <button className="flex items-center justify-center p-2 bg-gray-100 rounded-lg text-gray-500 hover:text-primary">
                            <Filter className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Products Table */}
                    <div className="bg-white rounded-xl overflow-hidden shadow-md">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-4 w-10">
                                <input type="checkbox" className="rounded text-primary" />
                              </th>
                              <th className="px-4 py-4 w-20 text-center text-[11px] font-bold text-gray-500 uppercase">Image</th>
                              <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase">Product Details</th>
                              <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase">Stock Level</th>
                              <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase">B2B Price</th>
                              <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase">Status</th>
                              <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {PRODUCTS.map((product) => (
                              <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4">
                                  <input type="checkbox" className="rounded text-primary" />
                                </td>
                                <td className="px-4 py-4">
                                  <div className="w-12 h-12 rounded-lg bg-cover bg-center border border-gray-200 mx-auto" style={{ backgroundImage: `url(${product.image})` }} />
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex flex-col">
                                    <span className="font-serif text-lg text-gray-800">{product.name}</span>
                                    <span className="text-xs text-gray-500 mt-0.5">SKU: {product.sku}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold text-gray-800">{product.stock}</span>
                                    <Badge className={cn(
                                      "text-[11px] font-bold uppercase",
                                      product.outOfStock ? "bg-gray-100 text-gray-700" :
                                        product.lowStock ? "bg-red-100 text-red-700" :
                                          "bg-green-100 text-green-700"
                                    )}>
                                      {product.outOfStock ? "Out of Stock" : product.lowStock ? "Low Stock" : "In Stock"}
                                    </Badge>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <span className="font-bold text-sm">{product.price}</span>
                                </td>
                                <td className="px-6 py-4">
                                  <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" defaultChecked={product.status} className="sr-only" />
                                    <div className="w-10 h-5 bg-gray-200 rounded-full transition-colors"></div>
                                    <div className="absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform shadow-sm"></div>
                                  </label>
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <div className="flex items-center justify-end gap-2 text-gray-500">
                                    <button className="p-1 hover:text-primary transition-colors">
                                      <Edit2 className="w-5 h-5" />
                                    </button>
                                    <button className="p-1 hover:text-red-500 transition-colors">
                                      <Trash2 className="w-5 h-5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination */}
                      <div className="px-6 py-4 flex items-center justify-between bg-gray-50 border-t border-gray-200">
                        <span className="text-sm text-gray-500">Showing 1 to 4 of 128 products</span>
                        <div className="flex items-center gap-2">
                          <button className="p-2 rounded-lg border border-gray-300 text-gray-500 hover:bg-white disabled:opacity-30" disabled>
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          <button className="px-3 py-1.5 rounded-lg bg-primary text-white font-medium text-sm">1</button>
                          <button className="px-3 py-1.5 rounded-lg text-sm text-gray-500 hover:bg-gray-100">2</button>
                          <button className="px-3 py-1.5 rounded-lg text-sm text-gray-500 hover:bg-gray-100">3</button>
                          <span className="text-gray-500">...</span>
                          <button className="px-3 py-1.5 rounded-lg text-sm text-gray-500 hover:bg-gray-100">32</button>
                          <button className="p-2 rounded-lg border border-gray-300 text-gray-500 hover:bg-white">
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* B2B Requests Tab */}
                {activeTab === "b2b" && (
                  <motion.div
                    key="b2b"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <h2 className="text-4xl font-black tracking-tight text-gray-800 mb-2">B2B Approval Queue</h2>
                      <p className="text-gray-500">Review and approve wholesale requests with 24-hour expiration windows.</p>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      {B2B_REQUESTS.map((request) => (
                        <motion.div
                          key={request.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={cn(
                            "bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow",
                            request.status === "pending" && "ring-2 ring-secondary ring-offset-2"
                          )}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-serif text-lg text-gray-800">{request.company}</h3>
                                <Badge className={cn(
                                  "text-xs font-bold",
                                  request.status === "pending" ? "bg-secondary/10 text-secondary" :
                                    request.status === "approved" ? "bg-green-100 text-green-700" :
                                      "bg-red-100 text-red-700"
                                )}>
                                  {request.status === "pending" ? "Pending" : request.status === "approved" ? "Approved" : "Rejected"}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 mb-3">Contact: {request.contact}</p>
                              <p className="text-xs text-gray-500">Requested: {request.date}</p>
                            </div>

                            {request.status === "pending" && (
                              <div className="flex items-center gap-2 bg-secondary/5 border border-secondary/20 px-3 py-2 rounded-lg">
                                <Clock className="w-4 h-4 text-secondary" />
                                <span className="text-sm font-bold text-secondary">{request.timeLeft}</span>
                              </div>
                            )}

                            {request.status === "approved" && (
                              <div className="flex items-center gap-2 text-green-600">
                                <CheckCircle className="w-5 h-5" />
                                <span className="text-sm font-semibold">Approved {request.approvedDate}</span>
                              </div>
                            )}

                            {request.status === "rejected" && (
                              <div className="flex flex-col items-end gap-1">
                                <div className="flex items-center gap-2 text-red-600">
                                  <XCircle className="w-5 h-5" />
                                  <span className="text-sm font-semibold">Rejected</span>
                                </div>
                                <p className="text-xs text-red-600">{request.reason}</p>
                              </div>
                            )}
                          </div>

                          {request.status === "pending" && (
                            <div className="flex gap-3 mt-4 pt-4 border-t border-gray-200">
                              <Button className="flex-1 btn-gradient">
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Approve
                              </Button>
                              <Button className="flex-1 bg-red-100 text-red-700 hover:bg-red-200">
                                <XCircle className="w-4 h-4 mr-2" />
                                Reject
                              </Button>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Orders Tab */}
                {activeTab === "orders" && (
                  <motion.div
                    key="orders"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6"
                  >
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                      <div className="flex flex-col gap-2">
                        <h2 className="text-4xl font-black tracking-tight text-gray-800">All Orders</h2>
                        <p className="text-gray-500 text-base">Manage customer orders and track shipments.</p>
                      </div>
                      <Button className="btn-gradient">
                        <Download className="w-5 h-5 mr-2" />
                        Export Orders
                      </Button>
                    </div>

                    <div className="bg-white rounded-xl p-4 shadow-md">
                      <div className="flex flex-col lg:flex-row gap-4">
                        <div className="flex-1 relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="text"
                            placeholder="Search by order ID, client name, or email..."
                            className="w-full bg-gray-100 border-none rounded-lg py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium hover:border-gray-300">
                          Status: All
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium hover:border-gray-300">
                          Date Range: All
                        </button>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl overflow-hidden shadow-md">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase">Order ID</th>
                              <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase">Client</th>
                              <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase">Email</th>
                              <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase">Items</th>
                              <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase">Status</th>
                              <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase">Date</th>
                              <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase text-right">Total</th>
                              <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {ALL_ORDERS.map((order) => (
                              <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4 text-sm font-mono text-gray-500">{order.id}</td>
                                <td className="px-6 py-4 text-base font-serif text-gray-800">{order.client}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">{order.email}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">{order.items} items</td>
                                <td className="px-6 py-4">
                                  <Badge className={cn(
                                    "text-xs font-medium",
                                    order.status === "Shipped" ? "bg-primary/10 text-primary" :
                                      order.status === "Pending" ? "bg-secondary/10 text-secondary" :
                                        order.status === "Delivered" ? "bg-green-100 text-green-700" :
                                          "bg-blue-100 text-blue-700"
                                  )}>
                                    {order.status}
                                  </Badge>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">{order.date}</td>
                                <td className="px-6 py-4 text-sm font-bold text-gray-800 text-right">{order.total}</td>
                                <td className="px-6 py-4 text-right">
                                  <button className="text-primary hover:text-primary/70 text-sm font-semibold">View</button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Clients Tab */}
                {activeTab === "clients" && (
                  <motion.div
                    key="clients"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6"
                  >
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                      <div className="flex flex-col gap-2">
                        <h2 className="text-4xl font-black tracking-tight text-gray-800">Client Management</h2>
                        <p className="text-gray-500 text-base">View and manage B2B and retail clients.</p>
                      </div>
                      <Button className="btn-gradient">
                        <Plus className="w-5 h-5 mr-2" />
                        Add Client
                      </Button>
                    </div>

                    <div className="bg-white rounded-xl p-4 shadow-md">
                      <div className="flex flex-col lg:flex-row gap-4">
                        <div className="flex-1 relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="text"
                            placeholder="Search by company name or email..."
                            className="w-full bg-gray-100 border-none rounded-lg py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium">
                          Type: All
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium">
                          Status: All
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      {CLIENTS.map((client) => (
                        <motion.div
                          key={client.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-serif text-lg text-gray-800">{client.name}</h3>
                                <Badge className={cn(
                                  "text-xs font-bold",
                                  client.b2b ? "bg-primary/10 text-primary" : "bg-gray-100 text-gray-700"
                                )}>
                                  {client.b2b ? "B2B" : "Retail"}
                                </Badge>
                                <Badge className={cn(
                                  "text-xs font-bold",
                                  client.status === "approved" ? "bg-green-100 text-green-700" :
                                    client.status === "pending" ? "bg-secondary/10 text-secondary" :
                                      client.status === "active" ? "bg-blue-100 text-blue-700" :
                                        "bg-red-100 text-red-700"
                                )}>
                                  {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                                </Badge>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                  <Mail className="w-4 h-4 text-gray-400" />
                                  {client.email}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Phone className="w-4 h-4 text-gray-400" />
                                  {client.phone}
                                </div>
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-4 h-4 text-gray-400" />
                                  {client.city}
                                </div>
                                <div className="text-right">
                                  <p className="font-semibold text-gray-800">{client.orders} orders</p>
                                  <p className="text-xs text-gray-500">{client.spent} spent</p>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button className="p-2 text-gray-500 hover:text-primary transition-colors">
                                <Edit2 className="w-5 h-5" />
                              </button>
                              <button className="p-2 text-gray-500 hover:text-red-500 transition-colors">
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Homepage Content Tab */}
                {activeTab === "content" && (
                  <motion.div
                    key="content"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <h2 className="text-4xl font-black tracking-tight text-gray-800 mb-2">Homepage Content Editor</h2>
                      <p className="text-gray-500">Edit homepage sections without coding. Changes go live immediately.</p>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      {HOMEPAGE_SECTIONS.map((section) => (
                        <motion.div
                          key={section.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow"
                        >
                          <div className="p-6 flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-serif text-lg text-gray-800 mb-2">{section.name}</h3>
                              {section.id === "hero" && (
                                <div className="space-y-2 text-sm text-gray-600">
                                  <p><span className="font-semibold">Title:</span> {section.title}</p>
                                  <p><span className="font-semibold">Subtitle:</span> {section.subtitle}</p>
                                </div>
                              )}
                              {section.id === "quote" && (
                                <div className="space-y-2 text-sm text-gray-600">
                                  <p className="italic">"{section.quote}"</p>
                                  <p><span className="font-semibold">— {section.author}</span></p>
                                </div>
                              )}
                              {section.id === "newsletter" && (
                                <div className="space-y-2 text-sm text-gray-600">
                                  <p><span className="font-semibold">Title:</span> {section.title}</p>
                                  <p><span className="font-semibold">Description:</span> {section.description}</p>
                                </div>
                              )}
                              {section.id === "testimonials" && (
                                <div className="space-y-2 text-sm text-gray-600">
                                  <p><span className="font-semibold">Title:</span> {section.title}</p>
                                  <p><span className="font-semibold">Testimonials:</span> {section.count} active</p>
                                </div>
                              )}
                            </div>
                            <Button
                              onClick={() => setEditingSection(section.id)}
                              className="btn-gradient"
                            >
                              <Edit2 className="w-4 h-4 mr-2" />
                              Edit
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Edit Modal */}
                    <AnimatePresence>
                      {editingSection && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                          onClick={() => setEditingSection(null)}
                        >
                          <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
                          >
                            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                              <h3 className="text-xl font-bold text-gray-800">
                                Edit {HOMEPAGE_SECTIONS.find(s => s.id === editingSection)?.name}
                              </h3>
                              <button
                                onClick={() => setEditingSection(null)}
                                className="p-1 text-gray-500 hover:text-gray-700"
                              >
                                <X className="w-6 h-6" />
                              </button>
                            </div>

                            <div className="p-6 space-y-4">
                              {editingSection === "hero" && (
                                <>
                                  <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Hero Title</label>
                                    <input
                                      type="text"
                                      defaultValue="Handcrafted Ceramics for Modern Living"
                                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Hero Subtitle</label>
                                    <input
                                      type="text"
                                      defaultValue="Discover our curated collection of artisan ceramics"
                                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Hero Image URL</label>
                                    <input
                                      type="text"
                                      defaultValue="https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=400&h=300&fit=crop"
                                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20"
                                    />
                                  </div>
                                </>
                              )}
                              {editingSection === "quote" && (
                                <>
                                  <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Quote Text</label>
                                    <textarea
                                      defaultValue="Every piece tells a story of craftsmanship and tradition."
                                      rows={3}
                                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Author Name</label>
                                    <input
                                      type="text"
                                      defaultValue="Carmella Artisans"
                                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20"
                                    />
                                  </div>
                                </>
                              )}
                              {editingSection === "newsletter" && (
                                <>
                                  <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Section Title</label>
                                    <input
                                      type="text"
                                      defaultValue="Stay Updated"
                                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                                    <textarea
                                      defaultValue="Get exclusive offers and new collection announcements"
                                      rows={3}
                                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20"
                                    />
                                  </div>
                                </>
                              )}
                              {editingSection === "testimonials" && (
                                <div>
                                  <label className="block text-sm font-semibold text-gray-700 mb-2">Section Title</label>
                                  <input
                                    type="text"
                                    defaultValue="What Our Customers Say"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20"
                                  />
                                </div>
                              )}
                            </div>

                            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex gap-3 justify-end">
                              <button
                                onClick={() => setEditingSection(null)}
                                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100"
                              >
                                Cancel
                              </button>
                              <Button
                                onClick={() => setEditingSection(null)}
                                className="btn-gradient"
                              >
                                <Save className="w-4 h-4 mr-2" />
                                Save Changes
                              </Button>
                            </div>
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}

                {/* Analytics Tab */}
                {activeTab === "analytics" && <AnalyticsSection />}

                {/* Users Tab */}
                {activeTab === "clients" && <UsersSection />}

                {/* Contacts Tab */}
                {activeTab === "contacts" && <ContactsSection />}

                {/* Categories Tab */}
                {activeTab === "categories" && <CategoriesSection />}

                {/* Inventory Tab */}
                {activeTab === "inventory" && <InventorySection />}

                {/* Activity Tab */}
                {activeTab === "activity" && <ActivitySection />}

                {/* Settings Tab */}
                {activeTab === "settings" && <SettingsSection />}
              </AnimatePresence>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
