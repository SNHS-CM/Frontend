import { Bookmark, Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useWishlist } from '../context/WishlistContext'
import { formatKRW, resolveProductImage, type Product } from '../data/products'

export default function ProductCard({ product }: { product: Product }) {
  const { isLiked, toggleLike, isSaved, toggleSave } = useWishlist()
  const liked = isLiked('product', product.id)
  const saved = isSaved('product', product.id)

  return (
    <Link to={`/product/${product.id}`} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-moss-100">
        <img
          src={resolveProductImage(product)}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-active:scale-95"
        />
        {product.tag && (
          <span className="absolute left-2 top-2 rounded-full bg-sand-50/90 px-2 py-0.5 text-[11px] font-medium text-moss-700">
            {product.tag}
          </span>
        )}
        <div className="absolute right-2 top-2 flex flex-col gap-1.5">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              toggleLike('product', product.id)
            }}
            aria-label="좋아요"
            aria-pressed={liked}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-sand-50/90 backdrop-blur"
          >
            <Heart size={14} className={liked ? 'fill-clay-500 text-clay-500' : 'text-moss-700'} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              toggleSave('product', product.id)
            }}
            aria-label="즐겨찾기"
            aria-pressed={saved}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-sand-50/90 backdrop-blur"
          >
            <Bookmark
              size={14}
              className={saved ? 'fill-moss-700 text-moss-700' : 'text-moss-700'}
            />
          </button>
        </div>
      </div>
      <div className="mt-2 space-y-0.5">
        <p className="text-[11px] uppercase tracking-wide text-moss-500">{product.brand}</p>
        <p className="truncate text-sm font-medium text-ink-900">{product.name}</p>
        <p className="text-sm font-semibold text-moss-700">{formatKRW(product.price)}</p>
      </div>
    </Link>
  )
}
