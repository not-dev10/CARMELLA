import { motion, AnimatePresence } from "framer-motion"
import { Grid3x3, Plus, Edit2, Trash2, X, Save, RefreshCw } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { categoriesAPI } from "@/lib/api"

interface Category {
  id: string
  name: string
  description?: string
  image_url?: string
  created_at?: string
}

export function CategoriesSection() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    imageUrl: ""
  })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    // Force fresh data on mount
    fetchCategories()
  }, [])

  // Also refresh when returning to this tab
  useEffect(() => {
    const handleFocus = () => {
      fetchCategories()
    }
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const response = await categoriesAPI.getAll()
      console.log("[CATEGORIES] Fetched categories:", response.categories)
      setCategories(response.categories || [])
    } catch (error) {
      console.error("Failed to fetch categories:", error)
      setCategories([])
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingCategory(null)
    setFormData({ name: "", description: "", imageUrl: "" })
    setShowModal(true)
  }

  const handleEdit = (category: Category) => {
    console.log("[CATEGORIES] Editing category:", category)
    setEditingCategory(category)
    setFormData({
      name: category.name,
      description: category.description || "",
      imageUrl: category.image_url || ""
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!formData.name.trim()) return

    try {
      setSaving(true)
      if (editingCategory) {
        // Update existing category
        await categoriesAPI.update(editingCategory.id, formData)
      } else {
        // Create new category
        await categoriesAPI.create(formData)
      }
      setShowModal(false)
      fetchCategories()
    } catch (error: any) {
      console.error("Failed to save category:", error)
      const errorMsg = error.message || "Failed to save category. Please try again."
      alert(errorMsg)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category? This action cannot be undone.")) {
      return
    }

    try {
      setDeleting(id)
      await categoriesAPI.delete(id)
      fetchCategories()
    } catch (error: any) {
      console.error("Failed to delete category:", error)
      const errorMsg = error.message || "Failed to delete category. Please try again."
      alert(errorMsg)
    } finally {
      setDeleting(null)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="mt-4 text-muted-foreground">Loading categories...</p>
      </div>
    )
  }

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
        <div className="flex gap-2">
          <Button onClick={fetchCategories} variant="outline" disabled={loading}>
            <RefreshCw className={`w-5 h-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={handleCreate} className="btn-gradient">
            <Plus className="w-5 h-5 mr-2" />
            Add Category
          </Button>
        </div>
      </div>

      {categories.length === 0 ? (
        <div className="admin-card text-center py-12">
          <Grid3x3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-foreground font-semibold">No categories found</p>
          <p className="text-muted-foreground text-sm mt-2">Create your first category to get started</p>
          <Button onClick={handleCreate} className="btn-gradient mt-4">
            <Plus className="w-5 h-5 mr-2" />
            Add Category
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="admin-card hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {category.image_url ? (
                    <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                      <img 
                        src={category.image_url} 
                        alt={category.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="p-2 bg-primary/10 dark:bg-primary/20 rounded-lg">
                      <Grid3x3 className="w-5 h-5 text-primary" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-serif text-lg text-foreground">{category.name}</h3>
                    {category.description && (
                      <p className="text-xs text-muted-foreground line-clamp-1">{category.description}</p>
                    )}
                  </div>
                </div>
                <Badge className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                  Active
                </Badge>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => handleEdit(category)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-primary border border-primary rounded-lg hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors text-sm font-medium"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
                <button 
                  onClick={() => handleDelete(category.id)}
                  disabled={deleting === category.id}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-sm font-medium disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  {deleting === category.id ? "Deleting..." : "Delete"}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card dark:bg-gray-900 rounded-2xl shadow-2xl max-w-lg w-full p-8 relative overflow-hidden border border-border dark:border-gray-800"
            >
              {/* Gradient header */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500" />
              
              {/* Close button */}
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 p-2 hover:bg-muted dark:hover:bg-gray-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>

              {/* Content */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-black text-foreground">
                    {editingCategory ? "Edit Category" : "Create Category"}
                  </h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    {editingCategory ? "Update category details" : "Add a new product category"}
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Category Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Vases, Bowls, Mugs"
                      className="w-full px-4 py-3 border border-border dark:border-gray-700 bg-background dark:bg-gray-800 text-foreground rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Brief description of this category..."
                      rows={3}
                      className="w-full px-4 py-3 border border-border dark:border-gray-700 bg-background dark:bg-gray-800 text-foreground rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Image URL
                    </label>
                    <input
                      type="url"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                      className="w-full px-4 py-3 border border-border dark:border-gray-700 bg-background dark:bg-gray-800 text-foreground rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    />
                    {formData.imageUrl && (
                      <div className="mt-2">
                        <img 
                          src={formData.imageUrl} 
                          alt="Preview" 
                          className="w-full h-32 object-cover rounded-lg"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() => setShowModal(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={!formData.name.trim() || saving}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? "Saving..." : editingCategory ? "Update" : "Create"}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
