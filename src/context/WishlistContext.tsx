import { createContext, useContext, useState, type ReactNode } from 'react'

export type WishlistKind = 'product' | 'listing'

interface WishlistContextValue {
  isLiked: (kind: WishlistKind, id: string) => boolean
  toggleLike: (kind: WishlistKind, id: string) => void
  likedKeys: string[]
  isSaved: (kind: WishlistKind, id: string) => boolean
  toggleSave: (kind: WishlistKind, id: string) => void
  savedKeys: string[]
}

const WishlistContext = createContext<WishlistContextValue | null>(null)

function keyOf(kind: WishlistKind, id: string) {
  return `${kind}:${id}`
}

function toggleKey(set: Set<string>, key: string) {
  const next = new Set(set)
  if (next.has(key)) {
    next.delete(key)
  } else {
    next.add(key)
  }
  return next
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  // Liking and saving are independent: liking never moves an item out of a feed,
  // it only adds it to 보관함.
  const [liked, setLiked] = useState<Set<string>>(new Set())
  const [saved, setSaved] = useState<Set<string>>(new Set())

  const isLiked = (kind: WishlistKind, id: string) => liked.has(keyOf(kind, id))
  const toggleLike = (kind: WishlistKind, id: string) =>
    setLiked((prev) => toggleKey(prev, keyOf(kind, id)))

  const isSaved = (kind: WishlistKind, id: string) => saved.has(keyOf(kind, id))
  const toggleSave = (kind: WishlistKind, id: string) =>
    setSaved((prev) => toggleKey(prev, keyOf(kind, id)))

  return (
    <WishlistContext.Provider
      value={{
        isLiked,
        toggleLike,
        likedKeys: [...liked],
        isSaved,
        toggleSave,
        savedKeys: [...saved],
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const ctx = useContext(WishlistContext)
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider')
  return ctx
}
