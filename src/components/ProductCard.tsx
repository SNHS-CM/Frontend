import { Heart } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { formatKRW, productImage, type Product } from '../data/products'

export default function ProductCard({ product }: { product: Product }) {
  const [saved, setSaved] = useState(false)

  return (
    <Link to={`/product/${product.id}`} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-moss-100">
        <img
          src={productImage(product.seed)}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-active:scale-95"
        />
        {product.tag && (
          <span className="absolute left-2 top-2 rounded-full bg-sand-50/90 px-2 py-0.5 text-[11px] font-medium text-moss-700">
            {product.tag}
          </span>
        )}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            setSaved((s) => !s)
          }}
          aria-label="위시리스트에 담기"
          className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-sand-50/90 backdrop-blur"
        >
          <Heart
            size={14}
            className={saved ? 'fill-clay-500 text-clay-500' : 'text-moss-700'}
          />
        </button>
      </div>
      <div className="mt-2 space-y-0.5">
        <p className="text-[11px] uppercase tracking-wide text-moss-500">{product.brand}</p>
        <p className="truncate text-sm font-medium text-ink-900">{product.name}</p>
        <p className="text-sm font-semibold text-moss-700">{formatKRW(product.price)}</p>
      </div>
    </Link>
  )
}
