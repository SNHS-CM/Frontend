import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { products } from '../data/products'

interface CartLine {
  productId: string
  qty: number
}

interface CartContextValue {
  lines: CartLine[]
  addToCart: (productId: string) => void
  removeFromCart: (productId: string) => void
  setQty: (productId: string, qty: number) => void
  totalItems: number
  totalPrice: number
  totalCo2: number
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([
    { productId: 'p2', qty: 1 },
    { productId: 'p6', qty: 2 },
  ])

  const addToCart = (productId: string) => {
    setLines((prev) => {
      const existing = prev.find((l) => l.productId === productId)
      if (existing) {
        return prev.map((l) => (l.productId === productId ? { ...l, qty: l.qty + 1 } : l))
      }
      return [...prev, { productId, qty: 1 }]
    })
  }

  const removeFromCart = (productId: string) => {
    setLines((prev) => prev.filter((l) => l.productId !== productId))
  }

  const setQty = (productId: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(productId)
      return
    }
    setLines((prev) => prev.map((l) => (l.productId === productId ? { ...l, qty } : l)))
  }

  const { totalItems, totalPrice, totalCo2 } = useMemo(() => {
    let items = 0
    let price = 0
    let co2 = 0
    for (const line of lines) {
      const product = products.find((p) => p.id === line.productId)
      if (!product) continue
      items += line.qty
      price += product.price * line.qty
      co2 += product.co2 * line.qty
    }
    return { totalItems: items, totalPrice: price, totalCo2: co2 }
  }, [lines])

  return (
    <CartContext.Provider
      value={{ lines, addToCart, removeFromCart, setQty, totalItems, totalPrice, totalCo2 }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
