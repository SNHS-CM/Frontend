import { useMemo } from 'react'
import { useListings } from '../context/ListingsContext'
import { usePosts } from '../context/PostsContext'
import { useWishlist } from '../context/WishlistContext'
import { products, type Product } from '../data/products'

export interface Recommendation {
  product: Product
  /** Why this surfaced, phrased for the user. */
  reason: string
}

/** A signal is worth more when it came from a deliberate save than a quick like. */
const WEIGHT = { like: 1, save: 1.5 }
const CATEGORY_SCORE = 3
const BRAND_SCORE = 2

/**
 * Ranks products against the taste profile built from what the user liked and
 * saved across shop / market / discover. Purely client-side: no server, no model.
 */
export function useRecommendations(limit = 4) {
  const { likedKeys, savedKeys } = useWishlist()
  const { listings } = useListings()
  const { likedPosts, savedPosts } = usePosts()

  return useMemo<{ items: Recommendation[]; hasSignal: boolean }>(() => {
    const categoryAffinity = new Map<string, number>()
    const brandAffinity = new Map<string, number>()

    const bump = (map: Map<string, number>, key: string | undefined, amount: number) => {
      if (!key) return
      map.set(key, (map.get(key) ?? 0) + amount)
    }

    for (const [keys, weight] of [
      [likedKeys, WEIGHT.like],
      [savedKeys, WEIGHT.save],
    ] as const) {
      for (const key of keys) {
        const [kind, id] = key.split(':')

        if (kind === 'product') {
          const product = products.find((p) => p.id === id)
          if (!product) continue
          bump(categoryAffinity, product.category, weight)
          bump(brandAffinity, product.brand, weight)
        } else if (kind === 'listing') {
          const listing = listings.find((l) => l.id === id)
          if (!listing) continue
          bump(brandAffinity, listing.brand, weight)
        }
      }
    }

    // Outfit posts contribute the brands of every garment worn in them.
    for (const [posts, weight] of [
      [likedPosts, WEIGHT.like],
      [savedPosts, WEIGHT.save],
    ] as const) {
      for (const post of posts) {
        for (const item of post.items) bump(brandAffinity, item.brand, weight)
      }
    }

    const hasSignal = categoryAffinity.size > 0 || brandAffinity.size > 0

    const scored = products
      // Liked products stay in the feed — liking adds to 보관함, it never removes
      // the item from Home.
      .map((product) => {
        const categoryScore = (categoryAffinity.get(product.category) ?? 0) * CATEGORY_SCORE
        const brandScore = (brandAffinity.get(product.brand) ?? 0) * BRAND_SCORE
        return { product, categoryScore, brandScore, total: categoryScore + brandScore }
      })
      .filter((s) => s.total > 0)
      .sort((a, b) => b.total - a.total || b.product.rating - a.product.rating)
      .slice(0, limit)

    const items = scored.map(({ product, categoryScore, brandScore }) => ({
      product,
      reason:
        brandScore > categoryScore
          ? `${product.brand} 관심`
          : `${product.category} 취향`,
    }))

    // Cold start: no signal yet, so fall back to the best-rated pieces.
    if (items.length === 0) {
      return {
        hasSignal,
        items: [...products]
          .sort((a, b) => b.rating - a.rating)
          .slice(0, limit)
          .map((product) => ({ product, reason: '인기' })),
      }
    }

    return { items, hasSignal }
  }, [likedKeys, savedKeys, listings, likedPosts, savedPosts, limit])
}
