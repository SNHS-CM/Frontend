import { ArrowLeft, Heart } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useWishlist } from '../context/WishlistContext'
import { useListings } from '../context/ListingsContext'
import { resolveListingImage } from '../data/listings'
import { formatKRW, productImage, products } from '../data/products'

export default function Wishlist() {
  const navigate = useNavigate()
  const { likedKeys, toggleLike } = useWishlist()
  const { listings } = useListings()

  const items = likedKeys
    .map((key) => {
      const [kind, id] = key.split(':') as ['product' | 'listing', string]
      if (kind === 'product') {
        const product = products.find((p) => p.id === id)
        if (!product) return null
        return {
          kind,
          id,
          href: `/product/${id}`,
          image: productImage(product.seed, 200, 200),
          brand: product.brand,
          name: product.name,
          price: product.price,
        }
      }
      const listing = listings.find((l) => l.id === id)
      if (!listing) return null
      return {
        kind,
        id,
        href: `/market/${id}`,
        image: resolveListingImage(listing, 200, 200),
        brand: listing.brand,
        name: listing.name,
        price: listing.discountedPrice ?? listing.price ?? 0,
      }
    })
    .filter((x): x is NonNullable<typeof x> => x !== null)

  return (
    <div className="pb-10">
      <header className="flex items-center gap-3 px-5 pb-3 pt-2">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="뒤로가기"
          className="flex h-9 w-9 items-center justify-center rounded-full text-ink-900"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="font-display text-xl font-medium text-ink-900">위시리스트</h1>
      </header>

      {items.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-3 px-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-moss-100">
            <Heart size={26} className="text-moss-500" />
          </div>
          <p className="text-sm text-moss-500">찜한 상품이 없어요</p>
        </div>
      ) : (
        <div className="space-y-3 px-5">
          {items.map((item) => (
            <div
              key={`${item.kind}:${item.id}`}
              className="flex items-center gap-3 rounded-2xl bg-moss-50 p-3"
            >
              <Link to={item.href} className="shrink-0">
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-16 w-16 rounded-xl object-cover"
                />
              </Link>
              <Link to={item.href} className="min-w-0 flex-1">
                {item.brand && <p className="truncate text-[11px] text-moss-500">{item.brand}</p>}
                <p className="truncate text-sm font-medium text-ink-900">{item.name}</p>
                <p className="text-sm font-semibold text-moss-700">{formatKRW(item.price)}</p>
              </Link>
              <button
                type="button"
                onClick={() => toggleLike(item.kind, item.id)}
                aria-label="찜 해제"
                className="shrink-0 text-clay-500"
              >
                <Heart size={18} className="fill-clay-500" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
