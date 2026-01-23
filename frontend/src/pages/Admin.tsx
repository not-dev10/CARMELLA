"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  BarChart3, ShoppingCart, TrendingUp, Users, Package, AlertCircle,
  Search, Plus, Upload, Edit2, Trash2, ChevronLeft, ChevronRight,
  Settings, LogOut, Bell, Filter, Grid3x3, Clock, CheckCircle, XCircle,
  Mail, Save, X, Download
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useDebounce } from "@/hooks/useDebounce"
import { ModeToggle } from "@/components/ui/mode-toggle"
import { AnalyticsSection } from "@/components/admin/analytics-section"
import { UsersSection } from "@/components/admin/users-section"
import { ContactsSection } from "@/components/admin/contacts-section"
import { CategoriesSection } from "@/components/admin/categories-section"
import { InventorySection } from "@/components/admin/inventory-section"
import { ActivitySection } from "@/components/admin/activity-section"
import { SettingsSection } from "@/components/admin/settings-section"
import { useAuth } from "@/contexts/AuthContext"

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

const HOMEPAGE_SECTIONS = [
  { id: "hero", name: "Hero Section", title: "Handcrafted Ceramics for Modern Living", subtitle: "Discover our curated collection of artisan ceramics", image: "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=400&h=300&fit=crop" },
  { id: "quote", name: "Brand Quote", quote: "Every piece tells a story of craftsmanship and tradition.", author: "Carmella Artisans" },
  { id: "newsletter", name: "Newsletter Section", title: "Stay Updated", description: "Get exclusive offers and new collection announcements" },
  { id: "testimonials", name: "Testimonials", title: "What Our Customers Say", count: 8 }
]

export default function Admin() {
  const { signOut } = useAuth()
  const [activeTab, setActiveTab] = useState("dashboard")
  const [searchQuery, setSearchQuery] = useState("")
  const debouncedSearch = useDebounce(searchQuery, 500)
  const [editingSection, setEditingSection] = useState<string | null>(null)

  const handleLogout = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

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
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-primary dark:bg-gray-900 text-white flex flex-col shadow-xl border-r border-border dark:border-gray-800">
        <div className="p-8">
          <h1 className="font-serif text-3xl tracking-tight">Carmella</h1>
          <p className="text-white/70 dark:text-white/60 text-xs mt-1 uppercase tracking-widest font-medium">B2B Admin</p>
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
            <button 
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 w-full transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Top Header */}
          <header className="sticky top-0 z-10 bg-card dark:bg-gray-900 shadow-sm dark:shadow-gray-800/50 border-b border-border dark:border-gray-800 px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <h2 className="text-xl font-bold text-foreground dark:text-white">
                {SIDEBAR_ITEMS.find(i => i.id === activeTab)?.label}
              </h2>
              <div className="relative w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-muted dark:bg-gray-800 border-none rounded-lg text-sm text-foreground focus:ring-2 focus:ring-primary/20 transition-colors"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <ModeToggle />
              <button className="p-2 text-muted-foreground hover:bg-muted dark:hover:bg-gray-800 rounded-lg relative transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2.5 w-2 h-2 bg-secondary rounded-full border-2 border-card dark:border-gray-900"></span>
              </button>
              <div className="h-6 w-[1px] bg-border dark:bg-gray-800 mx-2"></div>
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Jan 24, 2024</span>
            </div>
          </header>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto bg-background dark:bg-gray-950">
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
                              "admin-card hover:shadow-lg transition-shadow flex flex-col gap-2",
                              stat.urgent && "ring-2 ring-secondary ring-offset-2 dark:ring-offset-gray-950"
                            )}
                          >
                            <div className="flex justify-between items-start">
                              <p className="text-muted-foreground text-sm font-medium">{stat.label}</p>
                              <div className={cn(
                                "p-1.5 rounded-lg",
                                stat.color === "primary" ? "bg-primary/10 dark:bg-primary/20 text-primary" : "bg-secondary/10 dark:bg-secondary/20 text-secondary"
                              )}>
                                <Icon className="w-5 h-5" />
                              </div>
                            </div>
                            <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                            <p className={cn(
                              "text-xs font-semibold flex items-center gap-1",
                              stat.urgent ? "text-secondary italic" : "text-green-600 dark:text-green-400"
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
                    <div className="admin-card overflow-hidden">
                      <div className="px-6 py-4 bg-muted dark:bg-gray-800 flex items-center justify-between">
                        <h3 className="text-foreground font-bold">Recent Orders</h3>
                        <button className="text-primary text-sm font-semibold hover:underline">View All Orders</button>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead className="admin-table-header">
                            <tr>
                              <th className="px-6 py-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Order ID</th>
                              <th className="px-6 py-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Client Name</th>
                              <th className="px-6 py-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Status</th>
                              <th className="px-6 py-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Date</th>
                              <th className="px-6 py-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wider text-right">Total</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border dark:divide-gray-800">
                            {RECENT_ORDERS.map((order) => (
                              <tr key={order.id} className="admin-table-row">
                                <td className="px-6 py-4 text-sm font-mono text-muted-foreground">{order.id}</td>
                                <td className="px-6 py-4 text-base font-serif text-foreground">{order.client}</td>
                                <td className="px-6 py-4">
                                  <Badge className={cn(
                                    "text-xs font-medium",
                                    order.status === "Shipped" ? "bg-primary/10 dark:bg-primary/20 text-primary" :
                                      order.status === "Pending" ? "bg-secondary/10 dark:bg-secondary/20 text-secondary" :
                                        "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                                  )}>
                                    {order.status}
                                  </Badge>
                                </td>
                                <td className="px-6 py-4 text-sm text-muted-foreground">{order.date}</td>
                                <td className="px-6 py-4 text-sm font-bold text-foreground text-right">{order.total}</td>
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
                        <h2 className="admin-heading">Product Catalog</h2>
                        <p className="text-muted-foreground text-base">Manage your ceramic inventory and B2B pricing tiers.</p>
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
                    <div className="admin-card">
                      <div className="flex flex-col lg:flex-row gap-4">
                        <div className="flex-1 relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                          <input
                            type="text"
                            placeholder="Search products by name, SKU, or category..."
                            className="admin-input pl-10"
                          />
                        </div>
                        <div className="flex gap-3">
                          <button className="admin-button-secondary">
                            Category: All
                          </button>
                          <button className="admin-button-secondary">
                            Stock Status: All
                          </button>
                          <button className="flex items-center justify-center p-2 bg-muted dark:bg-gray-800 rounded-lg text-muted-foreground hover:text-primary">
                            <Filter className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Products Table */}
                    <div className="admin-card overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead className="admin-table-header">
                            <tr>
                              <th className="px-6 py-4 w-10">
                                <input type="checkbox" className="rounded text-primary" />
                              </th>
                              <th className="px-4 py-4 w-20 text-center text-[11px] font-bold text-muted-foreground uppercase">Image</th>
                              <th className="px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase">Product Details</th>
                              <th className="px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase">Stock Level</th>
                              <th className="px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase">B2B Price</th>
                              <th className="px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase">Status</th>
                              <th className="px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border dark:divide-gray-800">
                            {PRODUCTS.map((product) => (
                              <tr key={product.id} className="admin-table-row">
                                <td className="px-6 py-4">
                                  <input type="checkbox" className="rounded text-primary" />
                                </td>
                                <td className="px-4 py-4">
                                  <div className="w-12 h-12 rounded-lg bg-cover bg-center border border-border dark:border-gray-800 mx-auto" style={{ backgroundImage: `url(${product.image})` }} />
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex flex-col">
                                    <span className="font-serif text-lg text-foreground">{product.name}</span>
                                    <span className="text-xs text-muted-foreground mt-0.5">SKU: {product.sku}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold text-foreground">{product.stock}</span>
                                    <Badge className={cn(
                                      "text-[11px] font-bold uppercase",
                                      product.outOfStock ? "bg-muted text-muted-foreground" :
                                        product.lowStock ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400" :
                                          "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                                    )}>
                                      {product.outOfStock ? "Out of Stock" : product.lowStock ? "Low Stock" : "In Stock"}
                                    </Badge>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <span className="font-bold text-sm text-foreground">{product.price}</span>
                                </td>
                                <td className="px-6 py-4">
                                  <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" defaultChecked={product.status} className="sr-only" />
                                    <div className="w-10 h-5 bg-muted dark:bg-gray-700 rounded-full transition-colors"></div>
                                    <div className="absolute left-0.5 top-0.5 bg-white dark:bg-gray-900 w-4 h-4 rounded-full transition-transform shadow-sm"></div>
                                  </label>
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <div className="flex items-center justify-end gap-2 text-muted-foreground">
                                    <button className="p-1 hover:text-primary transition-colors">
                                      <Edit2 className="w-5 h-5" />
                                    </button>
                                    <button className="p-1 hover:text-red-500 dark:hover:text-red-400 transition-colors">
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
                      <div className="px-6 py-4 flex items-center justify-between bg-muted dark:bg-gray-800 border-t border-border dark:border-gray-800">
                        <span className="text-sm text-muted-foreground">Showing 1 to 4 of 128 products</span>
                        <div className="flex items-center gap-2">
                          <button className="p-2 rounded-lg border border-border dark:border-gray-800 text-muted-foreground hover:bg-card dark:hover:bg-gray-900 disabled:opacity-30" disabled>
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          <button className="px-3 py-1.5 rounded-lg bg-primary text-white font-medium text-sm">1</button>
                          <button className="px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:bg-muted dark:hover:bg-gray-800">2</button>
                          <button className="px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:bg-muted dark:hover:bg-gray-800">3</button>
                          <span className="text-muted-foreground">...</span>
                          <button className="px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:bg-muted dark:hover:bg-gray-800">32</button>
                          <button className="p-2 rounded-lg border border-border dark:border-gray-800 text-muted-foreground hover:bg-card dark:hover:bg-gray-900">
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
                      <h2 className="admin-heading">B2B Approval Queue</h2>
                      <p className="text-muted-foreground">Review and approve wholesale requests with 24-hour expiration windows.</p>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      {B2B_REQUESTS.map((request) => (
                        <motion.div
                          key={request.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={cn(
                            "admin-card hover:shadow-lg transition-shadow",
                            request.status === "pending" && "ring-2 ring-secondary ring-offset-2 dark:ring-offset-gray-950"
                          )}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-serif text-lg text-foreground">{request.company}</h3>
                                <Badge className={cn(
                                  "text-xs font-bold",
                                  request.status === "pending" ? "bg-secondary/10 dark:bg-secondary/20 text-secondary" :
                                    request.status === "approved" ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" :
                                      "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                                )}>
                                  {request.status === "pending" ? "Pending" : request.status === "approved" ? "Approved" : "Rejected"}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-3">Contact: {request.contact}</p>
                              <p className="text-xs text-muted-foreground">Requested: {request.date}</p>
                            </div>

                            {request.status === "pending" && (
                              <div className="flex items-center gap-2 bg-secondary/5 dark:bg-secondary/10 border border-secondary/20 dark:border-secondary/30 px-3 py-2 rounded-lg">
                                <Clock className="w-4 h-4 text-secondary" />
                                <span className="text-sm font-bold text-secondary">{request.timeLeft}</span>
                              </div>
                            )}

                            {request.status === "approved" && (
                              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                                <CheckCircle className="w-5 h-5" />
                                <span className="text-sm font-semibold">Approved {request.approvedDate}</span>
                              </div>
                            )}

                            {request.status === "rejected" && (
                              <div className="flex flex-col items-end gap-1">
                                <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                                  <XCircle className="w-5 h-5" />
                                  <span className="text-sm font-semibold">Rejected</span>
                                </div>
                                <p className="text-xs text-red-600 dark:text-red-400">{request.reason}</p>
                              </div>
                            )}
                          </div>

                          {request.status === "pending" && (
                            <div className="flex gap-3 mt-4 pt-4 border-t border-border dark:border-gray-800">
                              <Button className="flex-1 btn-gradient">
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Approve
                              </Button>
                              <Button className="flex-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50">
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
                            placeholder="Search by order ID, client name, or email..."
                            className="admin-input pl-10"
                          />
                        </div>
                        <button className="admin-button-secondary">
                          Status: All
                        </button>
                        <button className="admin-button-secondary">
                          Date Range: All
                        </button>
                      </div>
                    </div>

                    <div className="admin-card overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead className="admin-table-header">
                            <tr>
                              <th className="px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase">Order ID</th>
                              <th className="px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase">Client</th>
                              <th className="px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase">Email</th>
                              <th className="px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase">Items</th>
                              <th className="px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase">Status</th>
                              <th className="px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase">Date</th>
                              <th className="px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase text-right">Total</th>
                              <th className="px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border dark:divide-gray-800">
                            {ALL_ORDERS.map((order) => (
                              <tr key={order.id} className="admin-table-row">
                                <td className="px-6 py-4 text-sm font-mono text-muted-foreground">{order.id}</td>
                                <td className="px-6 py-4 text-base font-serif text-foreground">{order.client}</td>
                                <td className="px-6 py-4 text-sm text-muted-foreground">{order.email}</td>
                                <td className="px-6 py-4 text-sm text-muted-foreground">{order.items} items</td>
                                <td className="px-6 py-4">
                                  <Badge className={cn(
                                    "text-xs font-medium",
                                    order.status === "Shipped" ? "bg-primary/10 dark:bg-primary/20 text-primary" :
                                      order.status === "Pending" ? "bg-secondary/10 dark:bg-secondary/20 text-secondary" :
                                        order.status === "Delivered" ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" :
                                          "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                                  )}>
                                    {order.status}
                                  </Badge>
                                </td>
                                <td className="px-6 py-4 text-sm text-muted-foreground">{order.date}</td>
                                <td className="px-6 py-4 text-sm font-bold text-foreground text-right">{order.total}</td>
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
                      <h2 className="admin-heading">Homepage Content Editor</h2>
                      <p className="text-muted-foreground">Edit homepage sections without coding. Changes go live immediately.</p>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      {HOMEPAGE_SECTIONS.map((section) => (
                        <motion.div
                          key={section.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="admin-card hover:shadow-lg transition-shadow"
                        >
                          <div className="p-6 flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-serif text-lg text-foreground mb-2">{section.name}</h3>
                              {section.id === "hero" && (
                                <div className="space-y-2 text-sm text-muted-foreground">
                                  <p><span className="font-semibold">Title:</span> {section.title}</p>
                                  <p><span className="font-semibold">Subtitle:</span> {section.subtitle}</p>
                                </div>
                              )}
                              {section.id === "quote" && (
                                <div className="space-y-2 text-sm text-muted-foreground">
                                  <p className="italic">"{section.quote}"</p>
                                  <p><span className="font-semibold">— {section.author}</span></p>
                                </div>
                              )}
                              {section.id === "newsletter" && (
                                <div className="space-y-2 text-sm text-muted-foreground">
                                  <p><span className="font-semibold">Title:</span> {section.title}</p>
                                  <p><span className="font-semibold">Description:</span> {section.description}</p>
                                </div>
                              )}
                              {section.id === "testimonials" && (
                                <div className="space-y-2 text-sm text-muted-foreground">
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
                          className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4"
                          onClick={() => setEditingSection(null)}
                        >
                          <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="admin-modal max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                          >
                            <div className="admin-modal-header">
                              <h3 className="text-xl font-bold text-foreground">
                                Edit {HOMEPAGE_SECTIONS.find(s => s.id === editingSection)?.name}
                              </h3>
                              <button
                                onClick={() => setEditingSection(null)}
                                className="p-1 text-muted-foreground hover:text-foreground"
                              >
                                <X className="w-6 h-6" />
                              </button>
                            </div>

                            <div className="p-6 space-y-4">
                              {editingSection === "hero" && (
                                <>
                                  <div>
                                    <label className="admin-label">Hero Title</label>
                                    <input
                                      type="text"
                                      defaultValue="Handcrafted Ceramics for Modern Living"
                                      className="admin-input"
                                    />
                                  </div>
                                  <div>
                                    <label className="admin-label">Hero Subtitle</label>
                                    <input
                                      type="text"
                                      defaultValue="Discover our curated collection of artisan ceramics"
                                      className="admin-input"
                                    />
                                  </div>
                                  <div>
                                    <label className="admin-label">Hero Image URL</label>
                                    <input
                                      type="text"
                                      defaultValue="https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=400&h=300&fit=crop"
                                      className="admin-input"
                                    />
                                  </div>
                                </>
                              )}
                              {editingSection === "quote" && (
                                <>
                                  <div>
                                    <label className="admin-label">Quote Text</label>
                                    <textarea
                                      defaultValue="Every piece tells a story of craftsmanship and tradition."
                                      rows={3}
                                      className="admin-input"
                                    />
                                  </div>
                                  <div>
                                    <label className="admin-label">Author Name</label>
                                    <input
                                      type="text"
                                      defaultValue="Carmella Artisans"
                                      className="admin-input"
                                    />
                                  </div>
                                </>
                              )}
                              {editingSection === "newsletter" && (
                                <>
                                  <div>
                                    <label className="admin-label">Section Title</label>
                                    <input
                                      type="text"
                                      defaultValue="Stay Updated"
                                      className="admin-input"
                                    />
                                  </div>
                                  <div>
                                    <label className="admin-label">Description</label>
                                    <textarea
                                      defaultValue="Get exclusive offers and new collection announcements"
                                      rows={3}
                                      className="admin-input"
                                    />
                                  </div>
                                </>
                              )}
                              {editingSection === "testimonials" && (
                                <div>
                                  <label className="admin-label">Section Title</label>
                                  <input
                                    type="text"
                                    defaultValue="What Our Customers Say"
                                    className="admin-input"
                                  />
                                </div>
                              )}
                            </div>

                            <div className="admin-modal-footer">
                              <button
                                onClick={() => setEditingSection(null)}
                                className="px-4 py-2 text-foreground border border-border dark:border-gray-800 rounded-lg hover:bg-muted dark:hover:bg-gray-800"
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
  )
}
