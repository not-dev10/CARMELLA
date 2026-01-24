import React, { createContext, useContext, useEffect, useState, useRef } from 'react'
import { cartAPI } from '@/lib/api'
import { useAuth } from './AuthContext'

export interface CartItem {
  id: string
  productId: string
  name: string
  sku: string
  image?: string
  price: number
  quantity: number
  discountPrice?: number
  discountPercentage?: number
}

export interface CartContextType {
  items: CartItem[]
  loading: boolean
  addItem: (productId: string, quantity: number, item: CartItem) => Promise<void>
  removeItem: (itemId: string) => Promise<void>
  updateQuantity: (itemId: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  getSubtotal: () => number
  getTotalSavings: () => number
  syncCart: () => Promise<void>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const syncedRef = useRef(false)
  const loadingTimeoutRef = useRef<number | undefined>(undefined)
  const { user } = useAuth()

  // Sync cart from database
  const syncCartFromDatabase = async () => {
    if (!user) return

    try {
      console.log('[Cart] Fetching cart from database...')
      const response = await cartAPI.get()
      console.log('[Cart] Database response:', response)
      
      if (response.items && Array.isArray(response.items)) {
        // Convert database cart items to CartItem format
        const dbItems: CartItem[] = response.items.map((item: any) => {
          console.log('[Cart] Processing item:', item)
          return {
            id: item.id,
            productId: item.product_id,
            name: item.products?.name || item.product?.name || 'Product',
            sku: item.products?.sku || item.product?.sku || '',
            image: item.products?.image_url || item.product?.image_url,
            price: item.products?.base_price || item.product?.base_price || 0,
            quantity: item.quantity,
            discountPrice: item.products?.sale_price || item.products?.b2b_price || item.product?.sale_price || item.product?.b2b_price,
          }
        })
        console.log('[Cart] Converted items:', dbItems)
        setItems(dbItems)
      }
    } catch (error) {
      console.error('Error syncing cart from database:', error)
    }
  }

  // Load cart from localStorage and sync with database on mount
  useEffect(() => {
    const loadCart = async () => {
      // Set a timeout to prevent infinite loading
      loadingTimeoutRef.current = setTimeout(() => {
        console.warn('[Cart] Loading timeout - forcing loading to false')
        setLoading(false)
      }, 5000) as unknown as number

      try {
        // First load from localStorage for immediate display
        const savedCart = localStorage.getItem('carmella_cart')
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart)
          setItems(parsedCart)
        }

        // If user is logged in and not yet synced, sync with database
        if (user && !syncedRef.current) {
          console.log('[Cart] Syncing from database...')
          await syncCartFromDatabase()
          syncedRef.current = true
        }
      } catch (error) {
        console.error('Error loading cart:', error)
        setItems([])
      } finally {
        if (loadingTimeoutRef.current) {
          clearTimeout(loadingTimeoutRef.current)
        }
        setLoading(false)
      }
    }

    loadCart()

    // Reset sync flag when user changes
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
      }
    }
  }, [user?.id]) // Only depend on user ID, not the entire user object

  // Save cart to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem('carmella_cart', JSON.stringify(items))
  }, [items])

  const addItem = async (productId: string, quantity: number, item: CartItem) => {
    console.log('[Cart] Adding item:', { productId, quantity, user: !!user })
    
    // Update local state immediately for better UX
    setItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.productId === productId)
      if (existingItem) {
        return prevItems.map((i) =>
          i.productId === productId ? { ...i, quantity: i.quantity + quantity } : i
        )
      }
      return [...prevItems, { ...item, quantity }]
    })

    // Sync to database if user is logged in
    if (user) {
      try {
        console.log('[Cart] Syncing to database...', { productId, quantity })
        const response = await cartAPI.add(productId, quantity)
        console.log('[Cart] Database sync successful:', response)
      } catch (error) {
        console.error('[Cart] Error adding item to database cart:', error)
        // Optionally show error to user
      }
    } else {
      console.log('[Cart] User not logged in, skipping database sync')
    }
  }

  const removeItem = async (itemId: string) => {
    // Update local state immediately
    setItems((prevItems) => prevItems.filter((i) => i.id !== itemId))

    // Sync to database if user is logged in
    if (user) {
      try {
        await cartAPI.remove(itemId)
      } catch (error) {
        console.error('Error removing item from database cart:', error)
      }
    }
  }

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeItem(itemId)
      return
    }

    // Update local state immediately
    setItems((prevItems) =>
      prevItems.map((i) => (i.id === itemId ? { ...i, quantity } : i))
    )

    // Sync to database if user is logged in
    if (user) {
      try {
        await cartAPI.update(itemId, quantity)
      } catch (error) {
        console.error('Error updating item quantity in database cart:', error)
      }
    }
  }

  const clearCart = async () => {
    // Update local state immediately
    setItems([])

    // Sync to database if user is logged in
    if (user) {
      try {
        await cartAPI.clear()
      } catch (error) {
        console.error('Error clearing database cart:', error)
      }
    }
  }

  const syncCart = async () => {
    if (user) {
      await syncCartFromDatabase()
    }
  }

  const getSubtotal = () => {
    return items.reduce((total, item) => {
      const price = item.discountPrice || item.price
      return total + price * item.quantity
    }, 0)
  }

  const getTotalSavings = () => {
    return items.reduce((total, item) => {
      if (item.discountPrice && item.discountPrice < item.price) {
        return total + (item.price - item.discountPrice) * item.quantity
      }
      return total
    }, 0)
  }

  return (
    <CartContext.Provider
      value={{
        items,
        loading,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getSubtotal,
        getTotalSavings,
        syncCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
