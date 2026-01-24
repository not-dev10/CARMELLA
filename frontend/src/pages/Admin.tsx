"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  BarChart3, ShoppingCart, TrendingUp, Users, Package, AlertCircle,
  Search, Edit2, Settings, LogOut, Bell, Clock, CheckCircle, XCircle,
  Mail, Save, X, Grid3x3
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { ModeToggle } from "@/components/ui/mode-toggle"
import { AnalyticsSection } from "@/components/admin/analytics-section"
import { UsersSection } from "@/components/admin/users-section"
import { ContactsSection } from "@/components/admin/contacts-section"
import { CategoriesSection } from "@/components/admin/categories-section"
import { InventorySection } from "@/components/admin/inventory-section"
import { ActivitySection } from "@/components/admin/activity-section"
import { SettingsSection } from "@/components/admin/settings-section"
import { ProductsSection } from "@/components/admin/products-section"
import { OrdersSection } from "@/components/admin/orders-section"
import { useAuth } from "@/contexts/AuthContext"
import { adminAPI } from "@/lib/api"

// Mock Data - Recent orders shown on dashboard
const RECENT_ORDERS = [
  { id: "ORD-20250124-00001", client: "The Clay Studio", status: "Shipped", date: "Jan 23, 2024", total: "$4,210.00" },
  { id: "ORD-20250124-00002", client: "Nordic Living Co.", status: "Pending", date: "Jan 23, 2024", total: "$1,850.50" },
  { id: "ORD-20250123-00001", client: "Earth & Fire Gallery", status: "Processing", date: "Jan 22, 2024", total: "$920.00" },
  { id: "ORD-20250123-00002", client: "Minimalist Home", status: "Shipped", date: "Jan 22, 2024", total: "$12,400.00" }
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
  const [editingSection, setEditingSection] = useState<string | null>(null)
  const [b2bRequests, setB2bRequests] = useState<any[]>([])
  const [loadingB2B, setLoadingB2B] = useState(false)
  const [processingRequest, setProcessingRequest] = useState<string | null>(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [modalMessage, setModalMessage] = useState("")
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectUserId, setRejectUserId] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [pendingB2BCount, setPendingB2BCount] = useState(0)

  const handleLogout = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  // Fetch B2B requests when B2B tab is active
  useEffect(() => {
    if (activeTab === "b2b") {
      fetchB2BRequests()
    }
  }, [activeTab])

  // Fetch B2B count on mount for the badge
  useEffect(() => {
    fetchB2BRequests()
  }, [])

  const fetchB2BRequests = async () => {
    try {
      setLoadingB2B(true)
      const response = await adminAPI.getB2BRequests()
      setB2bRequests(response.requests || [])
      // Count pending requests
      const pendingCount = (response.requests || []).filter((req: any) => req.status === 'pending').length
      setPendingB2BCount(pendingCount)
    } catch (error) {
      console.error("Failed to fetch B2B requests:", error)
      setB2bRequests([])
      setPendingB2BCount(0)
    } finally {
      setLoadingB2B(false)
    }
  }

  const handleApproveB2B = async (userId: string) => {
    try {
      setProcessingRequest(userId)
      await adminAPI.approveB2BRequest(userId)
      setModalMessage("B2B request approved successfully! The user can now access wholesale pricing.")
      setShowSuccessModal(true)
      fetchB2BRequests() // Refresh the list
    } catch (error: any) {
      console.error("Failed to approve B2B request:", error)
      setModalMessage(error.message || "Failed to approve the request. Please try again.")
      setShowErrorModal(true)
    } finally {
      setProcessingRequest(null)
    }
  }

  const handleRejectB2B = async (userId: string) => {
    setRejectUserId(userId)
    setShowRejectModal(true)
  }

  const confirmRejectB2B = async () => {
    if (!rejectUserId) return
    
    try {
      setProcessingRequest(rejectUserId)
      await adminAPI.rejectB2BRequest(rejectUserId, rejectionReason || undefined)
      setModalMessage("B2B request has been rejected. The user will be notified.")
      setShowSuccessModal(true)
      setShowRejectModal(false)
      setRejectionReason("")
      setRejectUserId(null)
      fetchB2BRequests() // Refresh the list
    } catch (error: any) {
      console.error("Failed to reject B2B request:", error)
      setModalMessage(error.message || "Failed to reject the request. Please try again.")
      setShowErrorModal(true)
      setShowRejectModal(false)
    } finally {
      setProcessingRequest(null)
    }
  }

  const calculateTimeLeft = (expiresAt: string) => {
    const now = new Date().getTime()
    const expiry = new Date(expiresAt).getTime()
    const diff = expiry - now
    
    if (diff <= 0) return "Expired"
    
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    return `${hours}h ${minutes}m left`
  }

  const DASHBOARD_STATS = [
    { label: "Total Orders", value: "1,284", trend: "+12.5%", icon: ShoppingCart, color: "primary" },
    { label: "Revenue", value: "$42,500.00", trend: "+8.2%", icon: TrendingUp, color: "primary" },
    { label: "Pending B2B Requests", value: pendingB2BCount.toString(), trend: "23:58:12", icon: AlertCircle, color: "terracotta", urgent: true },
    { label: "Active Users", value: "842", trend: "-2%", icon: Users, color: "primary" }
  ]

  const SIDEBAR_ITEMS = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "analytics", label: "Analytics", icon: TrendingUp },
    { id: "orders", label: "Orders", icon: ShoppingCart },
    { id: "products", label: "Products", icon: Package },
    { id: "categories", label: "Categories", icon: Grid3x3 },
    { id: "b2b", label: "B2B Requests", icon: AlertCircle, badge: pendingB2BCount > 0 ? pendingB2BCount : undefined },
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
                {activeTab === "products" && <ProductsSection />}

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

                    {loadingB2B ? (
                      <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <p className="mt-4 text-muted-foreground">Loading B2B requests...</p>
                      </div>
                    ) : b2bRequests.length === 0 ? (
                      <div className="admin-card text-center py-12">
                        <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-foreground font-semibold">No B2B requests found</p>
                        <p className="text-muted-foreground text-sm mt-2">New requests will appear here</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4">
                        {b2bRequests.map((request) => (
                          <motion.div
                            key={request.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={cn(
                              "admin-card hover:shadow-lg transition-shadow",
                              request.status === "pending" && "ring-2 ring-secondary ring-offset-2 dark:ring-offset-gray-950"
                            )}
                          >
                            {/* Header with Company Name and Status */}
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="font-serif text-xl text-foreground">{request.company_name || 'N/A'}</h3>
                                  <Badge className={cn(
                                    "text-xs font-bold",
                                    request.status === "pending" ? "bg-secondary/10 dark:bg-secondary/20 text-secondary" :
                                      request.status === "approved" ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" :
                                        "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                                  )}>
                                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                  </Badge>
                                </div>
                              </div>

                              {request.status === "pending" && request.expires_at && (
                                <div className="flex items-center gap-2 bg-secondary/5 dark:bg-secondary/10 border border-secondary/20 dark:border-secondary/30 px-3 py-2 rounded-lg">
                                  <Clock className="w-4 h-4 text-secondary" />
                                  <span className="text-sm font-bold text-secondary">{calculateTimeLeft(request.expires_at)}</span>
                                </div>
                              )}
                            </div>

                            {/* Contact Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pb-4 border-b border-border dark:border-gray-800">
                              <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Contact Person</p>
                                <p className="text-sm font-semibold text-foreground">{request.contact_name || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Email</p>
                                <p className="text-sm font-semibold text-foreground">{request.contact_email || 'N/A'}</p>
                              </div>
                              {request.contact_phone && (
                                <div>
                                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Phone</p>
                                  <p className="text-sm font-semibold text-foreground">{request.contact_phone}</p>
                                </div>
                              )}
                              {request.tax_id && (
                                <div>
                                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Tax ID</p>
                                  <p className="text-sm font-semibold text-foreground">{request.tax_id}</p>
                                </div>
                              )}
                            </div>

                            {/* Business Information */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                              {request.business_type && (
                                <div>
                                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Business Type</p>
                                  <p className="text-sm text-foreground">{request.business_type}</p>
                                </div>
                              )}
                              {request.order_quantity && (
                                <div>
                                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Order Quantity</p>
                                  <p className="text-sm text-foreground">{request.order_quantity}</p>
                                </div>
                              )}
                              {request.purchase_frequency && (
                                <div>
                                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Purchase Frequency</p>
                                  <p className="text-sm text-foreground">{request.purchase_frequency}</p>
                                </div>
                              )}
                            </div>

                            {/* Reason */}
                            {request.reason && (
                              <div className="mb-4">
                                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Reason for Request</p>
                                <p className="text-sm text-foreground bg-muted dark:bg-gray-800 p-3 rounded-lg">{request.reason}</p>
                              </div>
                            )}

                            {/* Request Date */}
                            <div className="text-xs text-muted-foreground mb-4">
                              Requested: {new Date(request.requested_at).toLocaleString()}
                            </div>

                            {/* Action Buttons */}
                            {request.status === "pending" && (
                              <div className="flex gap-3 pt-4 border-t border-border dark:border-gray-800">
                                <Button 
                                  onClick={() => handleApproveB2B(request.user_id)}
                                  disabled={processingRequest === request.user_id}
                                  className="flex-1 btn-gradient"
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  {processingRequest === request.user_id ? "Processing..." : "Approve"}
                                </Button>
                                <Button 
                                  onClick={() => handleRejectB2B(request.user_id)}
                                  disabled={processingRequest === request.user_id}
                                  className="flex-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50"
                                >
                                  <XCircle className="w-4 h-4 mr-2" />
                                  {processingRequest === request.user_id ? "Processing..." : "Reject"}
                                </Button>
                              </div>
                            )}

                            {/* Approved/Rejected Status */}
                            {request.status === "approved" && request.approved_at && (
                              <div className="flex items-center gap-2 text-green-600 dark:text-green-400 pt-4 border-t border-border dark:border-gray-800">
                                <CheckCircle className="w-5 h-5" />
                                <span className="text-sm font-semibold">
                                  Approved on {new Date(request.approved_at).toLocaleDateString()}
                                </span>
                              </div>
                            )}

                            {request.status === "rejected" && (
                              <div className="pt-4 border-t border-border dark:border-gray-800">
                                <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-2">
                                  <XCircle className="w-5 h-5" />
                                  <span className="text-sm font-semibold">Rejected</span>
                                </div>
                                {request.rejection_reason && (
                                  <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                                    Reason: {request.rejection_reason}
                                  </p>
                                )}
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Orders Tab */}
                {activeTab === "orders" && <OrdersSection />}



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

        {/* Success Modal */}
        <AnimatePresence>
          {showSuccessModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowSuccessModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-card dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-8 relative overflow-hidden border border-border dark:border-gray-800"
              >
                {/* Success gradient */}
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500" />
                
                {/* Success Icon */}
                <div className="flex justify-center mb-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg"
                  >
                    <CheckCircle className="w-10 h-10 text-white" />
                  </motion.div>
                </div>

                {/* Content */}
                <div className="text-center space-y-4">
                  <h3 className="text-2xl font-black text-foreground">
                    Success!
                  </h3>
                  <p className="text-muted-foreground">
                    {modalMessage}
                  </p>

                  <Button
                    onClick={() => setShowSuccessModal(false)}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-full py-4 text-base font-bold shadow-lg"
                  >
                    Got it!
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Modal */}
        <AnimatePresence>
          {showErrorModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowErrorModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-card dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-8 relative overflow-hidden border border-border dark:border-gray-800"
              >
                {/* Error gradient */}
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-500 via-rose-500 to-pink-500" />
                
                {/* Error Icon */}
                <div className="flex justify-center mb-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="w-20 h-20 bg-gradient-to-br from-red-500 to-rose-500 rounded-full flex items-center justify-center shadow-lg"
                  >
                    <XCircle className="w-10 h-10 text-white" />
                  </motion.div>
                </div>

                {/* Content */}
                <div className="text-center space-y-4">
                  <h3 className="text-2xl font-black text-foreground">
                    Error
                  </h3>
                  <p className="text-muted-foreground">
                    {modalMessage}
                  </p>

                  <Button
                    onClick={() => setShowErrorModal(false)}
                    className="w-full bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white rounded-full py-4 text-base font-bold shadow-lg"
                  >
                    Close
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reject Confirmation Modal */}
        <AnimatePresence>
          {showRejectModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => {
                setShowRejectModal(false)
                setRejectionReason("")
                setRejectUserId(null)
              }}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-card dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-8 relative overflow-hidden border border-border dark:border-gray-800"
              >
                {/* Warning gradient */}
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500" />
                
                {/* Warning Icon */}
                <div className="flex justify-center mb-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-lg"
                  >
                    <AlertCircle className="w-10 h-10 text-white" />
                  </motion.div>
                </div>

                {/* Content */}
                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-2xl font-black text-foreground mb-2">
                      Reject B2B Request
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Are you sure you want to reject this request? The user will be notified.
                    </p>
                  </div>

                  <div className="text-left">
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Rejection Reason (Optional)
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Provide a reason for rejection..."
                      rows={4}
                      className="w-full px-4 py-3 border border-border dark:border-gray-700 bg-background dark:bg-gray-800 text-foreground rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors resize-none"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      onClick={() => {
                        setShowRejectModal(false)
                        setRejectionReason("")
                        setRejectUserId(null)
                      }}
                      variant="outline"
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={confirmRejectB2B}
                      disabled={processingRequest === rejectUserId}
                      className="flex-1 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white"
                    >
                      {processingRequest === rejectUserId ? "Rejecting..." : "Confirm Reject"}
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
  )
}
