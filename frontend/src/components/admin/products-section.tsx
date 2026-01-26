import { motion, AnimatePresence } from "framer-motion"
import { Package, Plus, Edit2, Trash2, X, Save, RefreshCw, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { productsAPI, categoriesAPI } from "@/lib/api"
import { cn } from "@/lib/utils"

interface Product {
  id: string
  name: string
  slug?: string
  description?: string
  long_description?: string
  base_price: number
  sale_price?: number
  b2b_price?: number
  category_id: string
  image_url?: string
  stock_quantity: number
  is_featured?: boolean
  is_active?: boolean
  moq?: number
  b2b_min_quantity?: number
  created_at?: string
}

interface Category {
  id: string
  name: string
}

export function ProductsSection() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    long_description: "",
    base_price: "",
    sale_price: "",
    b2b_price: "",
    category_id: "",
    image_url: "",
    stock_quantity: "",
    is_featured: false,
    is_active: true,
    moq: "1",
    b2b_min_quantity: "1"
  })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("")

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await productsAPI.getAll({ limit: 100 })
      console.log("[PRODUCTS] Fetched products:", response.products)
      setProducts(response.products || [])
    } catch (error) {
      console.error("Failed to fetch products:", error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getAll()
      setCategories(response.categories || [])
    } catch (error) {
      console.error("Failed to fetch categories:", error)
    }
  }

  const handleCreate = () => {
    setEditingProduct(null)
    setFormData({
      name: "",
      slug: "",
      description: "",
      long_description: "",
      base_price: "",
      sale_price: "",
      b2b_price: "",
      category_id: "",
      image_url: "",
      stock_quantity: "",
      is_featured: false,
      is_active: true,
      moq: "1",
      b2b_min_quantity: "1"
    })
    setShowModal(true)
  }

  const handleEdit = (product: Product) => {
    console.log("[PRODUCTS] Editing product:", product)
    setEditingProduct(product)
    setFormData({
      name: product.name,
      slug: product.slug || "",
      description: product.description || "",
      long_description: product.long_description || "",
      base_price: product.base_price.toString(),
      sale_price: product.sale_price?.toString() || "",
      b2b_price: product.b2b_price?.toString() || "",
      category_id: product.category_id,
      image_url: product.image_url || "",
      stock_quantity: product.stock_quantity.toString(),
      is_featured: product.is_featured || false,
      is_active: product.is_active !== false,
      moq: product.moq?.toString() || "1",
      b2b_min_quantity: product.b2b_min_quantity?.toString() || "1"
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.base_price || !formData.category_id) {
      alert("Please fill in all required fields (Name, Base Price, Category)")
      return
    }

    try {
      setSaving(true)
      const productData = {
        name: formData.name,
        slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'),
        description: formData.description || undefined,
        long_description: formData.long_description || undefined,
        base_price: parseFloat(formData.base_price),
        sale_price: formData.sale_price ? parseFloat(formData.sale_price) : undefined,
        b2b_price: formData.b2b_price ? parseFloat(formData.b2b_price) : undefined,
        category_id: formData.category_id,
        image_url: formData.image_url || undefined,
        stock_quantity: parseInt(formData.stock_quantity) || 0,
        is_featured: formData.is_featured,
        is_active: formData.is_active,
        moq: parseInt(formData.moq) || 1,
        b2b_min_quantity: parseInt(formData.b2b_min_quantity) || 1
      }

      if (editingProduct) {
        await productsAPI.update(editingProduct.id, productData)
      } else {
        await productsAPI.create(productData)
      }
      setShowModal(false)
      fetchProducts()
    } catch (error: any) {
      console.error("Failed to save product:", error)
      const errorMsg = error.message || "Failed to save product. Please try again."
      alert(errorMsg)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
      return
    }

    try {
      setDeleting(id)
      await productsAPI.delete(id)
      fetchProducts()
    } catch (error: any) {
      console.error("Failed to delete product:", error)
      const errorMsg = error.message || "Failed to delete product. Please try again."
      alert(errorMsg)
    } finally {
      setDeleting(null)
    }
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = !searchQuery || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = !selectedCategory || product.category_id === selectedCategory
    return matchesSearch && matchesCategory
  })

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="mt-4 text-muted-foreground">Loading products...</p>
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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex flex-col gap-2">
          <h2 className="admin-heading">Product Catalog</h2>
          <p className="text-muted-foreground text-base">Manage your ceramic inventory and B2B pricing tiers.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={fetchProducts} variant="outline" disabled={loading}>
            <RefreshCw className={`w-5 h-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={handleCreate} className="btn-gradient">
            <Plus className="w-5 h-5 mr-2" />
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
              placeholder="Search products by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="admin-input pl-10"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="admin-button-secondary"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="admin-card text-center py-12">
          <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-foreground font-semibold">No products found</p>
          <p className="text-muted-foreground text-sm mt-2">
            {searchQuery || selectedCategory ? "Try adjusting your filters" : "Create your first product to get started"}
          </p>
          {!searchQuery && !selectedCategory && (
            <Button onClick={handleCreate} className="btn-gradient mt-4">
              <Plus className="w-5 h-5 mr-2" />
              Add Product
            </Button>
          )}
        </div>
      ) : (
        <div className="admin-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="admin-table-header">
                <tr>
                  <th className="px-4 py-4 w-20 text-center text-[11px] font-bold text-muted-foreground uppercase">Image</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase">Product Details</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase">Stock</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase">Base Price</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase">B2B Price</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase">Status</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border dark:divide-gray-800">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="admin-table-row">
                    <td className="px-4 py-4">
                      {product.image_url ? (
                        <div className="w-12 h-12 rounded-lg overflow-hidden mx-auto">
                          <img 
                            src={product.image_url} 
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-muted dark:bg-gray-800 flex items-center justify-center mx-auto">
                          <Package className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-serif text-lg text-foreground">{product.name}</span>
                        {product.description && (
                          <span className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{product.description}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">{product.stock_quantity}</span>
                        <Badge className={cn(
                          "text-[11px] font-bold uppercase",
                          product.stock_quantity === 0 ? "bg-muted text-muted-foreground" :
                            product.stock_quantity < 10 ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400" :
                              "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                        )}>
                          {product.stock_quantity === 0 ? "Out" : product.stock_quantity < 10 ? "Low" : "In Stock"}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-foreground">${product.base_price ? product.base_price.toFixed(2) : "—"}</span>
                        {product.sale_price && (
                          <span className="text-xs text-green-600 dark:text-green-400">Sale: ${product.sale_price.toFixed(2)}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-sm text-foreground">
                        {product.b2b_price ? `$${product.b2b_price.toFixed(2)}` : "—"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={product.is_active !== false ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" : "bg-muted text-muted-foreground"}>
                        {product.is_active !== false ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 text-muted-foreground">
                        <button 
                          onClick={() => handleEdit(product)}
                          className="p-1 hover:text-primary transition-colors"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(product.id)}
                          disabled={deleting === product.id}
                          className="p-1 hover:text-red-500 dark:hover:text-red-400 transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Info */}
          <div className="px-6 py-4 bg-muted dark:bg-gray-800 border-t border-border dark:border-gray-800">
            <span className="text-sm text-muted-foreground">
              Showing {filteredProducts.length} of {products.length} products
            </span>
          </div>
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
              className="bg-card dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 relative border border-border dark:border-gray-800"
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
                    {editingProduct ? "Edit Product" : "Create Product"}
                  </h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    {editingProduct ? "Update product details" : "Add a new product to your catalog"}
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Basic Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        Product Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g., Handcrafted Ceramic Vase"
                        className="w-full px-4 py-3 border border-border dark:border-gray-700 bg-background dark:bg-gray-800 text-foreground rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        Description
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Short description..."
                        rows={2}
                        className="w-full px-4 py-3 border border-border dark:border-gray-700 bg-background dark:bg-gray-800 text-foreground rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        Category *
                      </label>
                      <select
                        value={formData.category_id}
                        onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                        className="w-full px-4 py-3 border border-border dark:border-gray-700 bg-background dark:bg-gray-800 text-foreground rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                      >
                        <option value="">Select category</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        Stock Quantity
                      </label>
                      <input
                        type="number"
                        value={formData.stock_quantity}
                        onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                        placeholder="0"
                        min="0"
                        className="w-full px-4 py-3 border border-border dark:border-gray-700 bg-background dark:bg-gray-800 text-foreground rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        Base Price * ($)
                      </label>
                      <input
                        type="number"
                        value={formData.base_price}
                        onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        className="w-full px-4 py-3 border border-border dark:border-gray-700 bg-background dark:bg-gray-800 text-foreground rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        Sale Price ($)
                      </label>
                      <input
                        type="number"
                        value={formData.sale_price}
                        onChange={(e) => setFormData({ ...formData, sale_price: e.target.value })}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        className="w-full px-4 py-3 border border-border dark:border-gray-700 bg-background dark:bg-gray-800 text-foreground rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        B2B Price ($)
                      </label>
                      <input
                        type="number"
                        value={formData.b2b_price}
                        onChange={(e) => setFormData({ ...formData, b2b_price: e.target.value })}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        className="w-full px-4 py-3 border border-border dark:border-gray-700 bg-background dark:bg-gray-800 text-foreground rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Image */}
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Image URL
                    </label>
                    <input
                      type="url"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                      className="w-full px-4 py-3 border border-border dark:border-gray-700 bg-background dark:bg-gray-800 text-foreground rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    />
                    {formData.image_url && (
                      <div className="mt-2">
                        <img 
                          src={formData.image_url} 
                          alt="Preview" 
                          className="w-full h-32 object-cover rounded-lg"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Toggles */}
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.is_featured}
                        onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                        className="rounded text-primary"
                      />
                      <span className="text-sm font-semibold text-foreground">Featured Product</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                        className="rounded text-primary"
                      />
                      <span className="text-sm font-semibold text-foreground">Active</span>
                    </label>
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
                    disabled={!formData.name.trim() || !formData.base_price || !formData.category_id || saving}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? "Saving..." : editingProduct ? "Update" : "Create"}
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
