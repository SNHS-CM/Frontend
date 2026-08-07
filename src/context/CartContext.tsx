import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { products } from '../data/products'
import { RESALE_CO2_ESTIMATE } from '../data/listings'
import { useListings } from './ListingsContext'

export type CartKind = 'product' | 'listing'

interface CartLine {
  kind: CartKind
  id: string
  qty: number
}

interface CartContextValue {
  lines: CartLine[]
  addToCart: (kind: CartKind, id: string) => void
  removeFromCart: (kind: CartKind, id: string) => void
  setQty: (kind: CartKind, id: string, qty: number) => void
  isInCart: (kind: CartKind, id: string) => boolean
  totalItems: number
  totalPrice: number
  totalCo2: number
}

const CartContext = createContext<CartContextValue | null>(null)

function sameLine(a: CartLine, kind: CartKind, id: string) {
  return a.kind === kind && a.id === id
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { listings } = useListings()
  const [lines, setLines] = useState<CartLine[]>([
    { kind: 'product', id: 'p2', qty: 1 },
    { kind: 'product', id: 'p6', qty: 2 },
  ])

  const addToCart = (kind: CartKind, id: string) => {
    setLines((prev) => {
      const existing = prev.find((l) => sameLine(l, kind, id))
      if (existing) {
        return prev.map((l) => (sameLine(l, kind, id) ? { ...l, qty: l.qty + 1 } : l))
      }
      return [...prev, { kind, id, qty: 1 }]
    })
  }

  const removeFromCart = (kind: CartKind, id: string) => {
    setLines((prev) => prev.filter((l) => !sameLine(l, kind, id)))
  }

  const setQty = (kind: CartKind, id: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(kind, id)
      return
    }
    setLines((prev) => prev.map((l) => (sameLine(l, kind, id) ? { ...l, qty } : l)))
  }

  const isInCart = (kind: CartKind, id: string) => lines.some((l) => sameLine(l, kind, id))

  const { totalItems, totalPrice, totalCo2 } = useMemo(() => {
    let items = 0
    let price = 0
    let co2 = 0
    for (const line of lines) {
      if (line.kind === 'product') {
        const product = products.find((p) => p.id === line.id)
        if (!product) continue
        items += line.qty
        price += product.price * line.qty
        co2 += product.co2 * line.qty
      } else {
        const listing = listings.find((l) => l.id === line.id)
        if (!listing) continue
        items += line.qty
        price += (listing.discountedPrice ?? listing.price ?? 0) * line.qty
        co2 += RESALE_CO2_ESTIMATE * line.qty
      }
    }
    return { totalItems: items, totalPrice: price, totalCo2: co2 }
  }, [lines, listings])

  return (
    <CartContext.Provider
      value={{
        lines,
        addToCart,
        removeFromCart,
        setQty,
        isInCart,
        totalItems,
        totalPrice,
        totalCo2,
      }}
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
