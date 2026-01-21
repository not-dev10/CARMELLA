import React, { createContext, useContext, useEffect, useState } from 'react'

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
  addItem: (productId: string, quantity: number, item: CartItem) => void
  removeItem: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  getSubtotal: () => number
  getTotalSavings: () => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('carmella_cart')
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart)
        setItems(parsedCart)
      }
    } catch (error) {
      console.error('Error loading cart:', error)
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Save cart to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem('carmella_cart', JSON.stringify(items))
  }, [items])

  const addItem = (productId: string, quantity: number, item: CartItem) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.productId === productId)
      if (existingItem) {
        return prevItems.map((i) =>
          i.productId === productId ? { ...i, quantity: i.quantity + quantity } : i
        )
      }
      return [...prevItems, { ...item, quantity }]
    })
  }

  const removeItem = (itemId: string) => {
    setItems((prevItems) => prevItems.filter((i) => i.id !== itemId))
  }

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId)
      return
    }
    setItems((prevItems) =>
      prevItems.map((i) => (i.id === itemId ? { ...i, quantity } : i))
    )
  }

  const clearCart = () => {
    setItems([])
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
