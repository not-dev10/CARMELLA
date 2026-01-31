import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Edit2, Trash2, Ban, Loader, Search, X, Save } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { adminAPI } from "@/lib/api"
import { useDebounce } from "@/hooks/useDebounce"

interface User {
  id: string
  email: string
  company_name?: string
  user_type: string
  is_b2b_user: boolean
  b2b_approval_status: string
  b2b_approval_requested_at?: string
  b2b_approval_expires_at?: string
  b2b_approved_at?: string
  status: string
  created_at: string
  total_orders: number
  total_spent: number
  phone?: string
  address?: string
  city?: string
  state?: string
  postal_code?: string
  country?: string
}

interface EditUserData {
  company_name?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  postal_code?: string
  country?: string
  status?: string
  user_type?: string
  is_b2b_user?: boolean
  b2b_approval_status?: string
}

export function UsersSection() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const debouncedSearch = useDebounce(searchQuery, 500)
  
  // Edit modal state
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [editFormData, setEditFormData] = useState<EditUserData>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [page, debouncedSearch])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log("[USERS_SECTION] Fetching users with params:", { page, searchQuery })
      
      const response = await adminAPI.getUsers({
        page,
        limit: 20,
        search: debouncedSearch || undefined,
      })
      
      console.log("[USERS_SECTION] Response received:", response)
      console.log("[USERS_SECTION] Users array:", response.users)
      console.log("[USERS_SECTION] Users count:", response.users?.length)
      console.log("[USERS_SECTION] Pagination:", response.pagination)
      
      // Ensure users is always an array
      const usersArray = Array.isArray(response.users) ? response.users : []
      setUsers(usersArray)
      setTotalPages(response.pagination?.totalPages || 1)
      
      if (usersArray.length === 0) {
        console.log("[USERS_SECTION] No users found in response")
      }
    } catch (err: any) {
      console.error("[USERS_SECTION] Error fetching users:", err)
      console.error("[USERS_SECTION] Error details:", err.response?.data || err.message)
      setError(err.message || "Failed to fetch users")
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`
  }

  const getUserType = (user: User) => {
    if (user.is_b2b_user) {
      return "B2B"
    }
    return "Retail"
  }

  const getApprovalStatus = (user: User) => {
    if (!user.is_b2b_user) return null
    return user.b2b_approval_status
  }

  const handleEditClick = (user: User) => {
    setEditingUser(user)
    setEditFormData({
      company_name: user.company_name || "",
      phone: user.phone || "",
      address: user.address || "",
      city: user.city || "",
      state: user.state || "",
      postal_code: user.postal_code || "",
      country: user.country || "",
      status: user.status,
      user_type: user.user_type,
      is_b2b_user: user.is_b2b_user,
      b2b_approval_status: user.b2b_approval_status,
    })
  }

  const handleSaveEdit = async () => {
    if (!editingUser) return

    try {
      setSaving(true)
      console.log("[USERS_SECTION] Updating user:", editingUser.id, editFormData)
      
      await adminAPI.updateUser(editingUser.id, editFormData)
      
      // Refresh the users list
      await fetchUsers()
      
      // Close modal
      setEditingUser(null)
      setEditFormData({})
    } catch (err: any) {
      console.error("[USERS_SECTION] Error updating user:", err)
      alert(`Failed to update user: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setEditingUser(null)
    setEditFormData({})
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-4xl font-black tracking-tight text-foreground dark:text-white mb-2">User Management</h2>
        <p className="text-muted-foreground">View, manage, and control user accounts and permissions.</p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg p-4 text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="bg-card dark:bg-gray-900 rounded-xl p-4 shadow-md dark:shadow-gray-800/50 mb-6 border border-border dark:border-gray-800">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setPage(1)
              }}
              className="w-full bg-muted dark:bg-gray-800 border-none rounded-lg py-2.5 pl-10 pr-4 text-sm text-foreground focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
      </div>

      <div className="bg-card dark:bg-gray-900 border border-border dark:border-gray-800 rounded-xl overflow-hidden shadow-sm dark:shadow-gray-800/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-muted dark:bg-gray-800">
              <tr>
                <th className="px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase">User</th>
                <th className="px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase">Type</th>
                <th className="px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase">Status</th>
                <th className="px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase">Joined</th>
                <th className="px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase">Orders</th>
                <th className="px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase text-right">Spent</th>
                <th className="px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Loader className="w-5 h-5 animate-spin text-primary" />
                      <span className="text-muted-foreground">Loading users...</span>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="space-y-4">
                      <div>
                        <p className="text-foreground font-medium mb-2">No users found</p>
                        <p className="text-sm text-muted-foreground mb-4">
                          Users will appear here once they sign up. To get started:
                        </p>
                        <ol className="text-sm text-muted-foreground space-y-2 inline-block text-left">
                          <li>1. Go to <a href="/signup" className="text-primary hover:underline">/signup</a> and create an account</li>
                          <li>2. Verify your email with the OTP code</li>
                          <li>3. Return here to see your user in the list</li>
                        </ol>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-muted/50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground">
                          {user.company_name || user.email.split("@")[0]}
                        </span>
                        <span className="text-xs text-muted-foreground">{user.email}</span>
                        {user.phone && <span className="text-xs text-muted-foreground">{user.phone}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        className={cn(
                          "text-xs font-bold",
                          getUserType(user) === "B2B"
                            ? "bg-primary/10 text-primary"
                            : "bg-gray-100 text-gray-700"
                        )}
                      >
                        {getUserType(user)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <Badge
                          className={cn(
                            "text-xs font-bold w-fit",
                            user.status === "active"
                              ? "bg-green-100 text-green-700"
                              : user.status === "inactive"
                              ? "bg-gray-100 text-gray-700"
                              : "bg-red-100 text-red-700"
                          )}
                        >
                          {user.status ? user.status.charAt(0).toUpperCase() + user.status.slice(1) : "Unknown"}
                        </Badge>
                        {(() => {
                          const approvalStatus = getApprovalStatus(user)
                          return approvalStatus ? (
                            <Badge
                              className={cn(
                                "text-xs font-bold w-fit",
                                approvalStatus === "approved"
                                  ? "bg-blue-100 text-blue-700"
                                  : approvalStatus === "pending"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : approvalStatus === "rejected"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-gray-100 text-gray-700"
                              )}
                            >
                              {approvalStatus.charAt(0).toUpperCase() + approvalStatus.slice(1)}
                            </Badge>
                          ) : null
                        })()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{formatDate(user.created_at)}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-foreground">{user.total_orders}</td>
                    <td className="px-6 py-4 text-sm font-bold text-foreground text-right">
                      {formatCurrency(user.total_spent)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEditClick(user)}
                          className="p-1 text-muted-foreground hover:text-primary transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          className="p-1 text-muted-foreground hover:text-orange-500 transition-colors"
                          title="Ban"
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                        <button
                          className="p-1 text-muted-foreground hover:text-red-500 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

              {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 flex items-center justify-between bg-muted dark:bg-gray-800 border-t border-border dark:border-gray-800">
            <span className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:bg-muted dark:hover:bg-gray-700 disabled:opacity-30"
              >
                Previous
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const startPage = Math.max(1, page - 2)
                return startPage + i
              }).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-sm",
                    p === page
                      ? "bg-primary text-white font-medium"
                      : "text-muted-foreground hover:bg-muted dark:hover:bg-gray-700"
                  )}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:bg-muted dark:hover:bg-gray-700 disabled:opacity-30"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit User Modal */}
      <AnimatePresence>
        {editingUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={handleCancelEdit}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card dark:bg-gray-900 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-border dark:border-gray-800"
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-card dark:bg-gray-900 border-b border-border dark:border-gray-800 px-6 py-4 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black text-foreground">Edit User</h3>
                  <p className="text-sm text-muted-foreground">{editingUser.email}</p>
                </div>
                <button
                  onClick={handleCancelEdit}
                  className="p-2 hover:bg-muted dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6">
                {/* Company Info */}
                <div>
                  <h4 className="text-sm font-bold text-foreground uppercase mb-3">Company Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">
                        Company Name
                      </label>
                      <input
                        type="text"
                        value={editFormData.company_name || ""}
                        onChange={(e) => setEditFormData({ ...editFormData, company_name: e.target.value })}
                        className="w-full px-3 py-2 border border-border dark:border-gray-700 bg-background dark:bg-gray-800 text-foreground rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">
                        Phone
                      </label>
                      <input
                        type="text"
                        value={editFormData.phone || ""}
                        onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-border dark:border-gray-700 bg-background dark:bg-gray-800 text-foreground rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div>
                  <h4 className="admin-heading">Address</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="admin-label">
                        Street Address
                      </label>
                      <input
                        type="text"
                        value={editFormData.address || ""}
                        onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                        className="admin-input"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="admin-label">
                          City
                        </label>
                        <input
                          type="text"
                          value={editFormData.city || ""}
                          onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                          className="admin-input"
                        />
                      </div>
                      <div>
                        <label className="admin-label">
                          State/Province
                        </label>
                        <input
                          type="text"
                          value={editFormData.state || ""}
                          onChange={(e) => setEditFormData({ ...editFormData, state: e.target.value })}
                          className="admin-input"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="admin-label">
                          Postal Code
                        </label>
                        <input
                          type="text"
                          value={editFormData.postal_code || ""}
                          onChange={(e) => setEditFormData({ ...editFormData, postal_code: e.target.value })}
                          className="admin-input"
                        />
                      </div>
                      <div>
                        <label className="admin-label">
                          Country
                        </label>
                        <input
                          type="text"
                          value={editFormData.country || ""}
                          onChange={(e) => setEditFormData({ ...editFormData, country: e.target.value })}
                          className="admin-input"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Account Settings */}
                <div>
                  <h4 className="admin-heading">Account Settings</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="admin-label">
                        Account Status
                      </label>
                      <select
                        value={editFormData.status || "active"}
                        onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                        className="admin-select"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="banned">Banned</option>
                      </select>
                    </div>
                    <div>
                      <label className="admin-label">
                        User Type
                      </label>
                      <select
                        value={editFormData.user_type || "user"}
                        onChange={(e) => setEditFormData({ ...editFormData, user_type: e.target.value })}
                        className="admin-select"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* B2B Settings */}
                {editFormData.is_b2b_user && (
                  <div>
                    <h4 className="admin-heading">B2B Settings</h4>
                    <div>
                      <label className="admin-label">
                        B2B Approval Status
                      </label>
                      <select
                        value={editFormData.b2b_approval_status || "none"}
                        onChange={(e) => setEditFormData({ ...editFormData, b2b_approval_status: e.target.value })}
                        className="admin-select"
                      >
                        <option value="none">None</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="admin-modal-footer px-6 py-4 flex items-center justify-end gap-3">
                <button
                  onClick={handleCancelEdit}
                  disabled={saving}
                  className="admin-button-secondary disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={saving}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
