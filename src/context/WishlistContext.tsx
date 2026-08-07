import { createContext, useContext, useState, type ReactNode } from 'react'

export type WishlistKind = 'product' | 'listing'

interface WishlistContextValue {
  isLiked: (kind: WishlistKind, id: string) => boolean
  toggleLike: (kind: WishlistKind, id: string) => void
  likedKeys: string[]
}

const WishlistContext = createContext<WishlistContextValue | null>(null)

function keyOf(kind: WishlistKind, id: string) {
  return `${kind}:${id}`
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [liked, setLiked] = useState<Set<string>>(new Set())

  const isLiked = (kind: WishlistKind, id: string) => liked.has(keyOf(kind, id))

  const toggleLike = (kind: WishlistKind, id: string) => {
    setLiked((prev) => {
      const next = new Set(prev)
      const key = keyOf(kind, id)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  return (
    <WishlistContext.Provider value={{ isLiked, toggleLike, likedKeys: [...liked] }}>
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const ctx = useContext(WishlistContext)
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider')
  return ctx
}
