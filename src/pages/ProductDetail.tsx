import { ArrowLeft, Bookmark, Heart, Leaf, MessageCircle, Recycle, Star } from 'lucide-react'
import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useChat } from '../context/ChatContext'
import { useWishlist } from '../context/WishlistContext'
import { formatKRW, productImage, products } from '../data/products'

const sizes = ['XS', 'S', 'M', 'L', 'XL']

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const { isLiked, toggleLike, isSaved, toggleSave } = useWishlist()
  const { startOrOpenProductChat } = useChat()
  const [size, setSize] = useState('M')
  const [justAdded, setJustAdded] = useState(false)

  const product = products.find((p) => p.id === id)
  if (!product) return <Navigate to="/home" replace />

  const liked = isLiked('product', product.id)
  const saved = isSaved('product', product.id)

  const handleAdd = () => {
    addToCart('product', product.id)
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 1500)
  }

  const handleChat = () => {
    const conversationId = startOrOpenProductChat(product)
    navigate(`/chat/${conversationId}`)
  }

  return (
    <div className="flex h-full flex-col">
      <div className="relative aspect-[4/5] shrink-0">
        <img
          src={productImage(product.seed, 800, 1000)}
          alt={product.name}
          className="h-full w-full object-cover"
        />
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-sand-50/90 text-ink-900"
          aria-label="뒤로가기"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="absolute right-4 top-4 flex items-center gap-2">
          <button
            type="button"
            onClick={() => toggleLike('product', product.id)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-sand-50/90"
            aria-label="좋아요"
            aria-pressed={liked}
          >
            <Heart size={18} className={liked ? 'fill-clay-500 text-clay-500' : 'text-ink-900'} />
          </button>
          <button
            type="button"
            onClick={() => toggleSave('product', product.id)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-sand-50/90"
            aria-label="즐겨찾기"
            aria-pressed={saved}
          >
            <Bookmark size={18} className={saved ? 'fill-moss-700 text-moss-700' : 'text-ink-900'} />
          </button>
        </div>
      </div>

      <div className="flex-1 space-y-5 px-5 pb-28 pt-5">
        <div>
          <p className="text-xs uppercase tracking-wide text-moss-500">{product.brand}</p>
          <div className="mt-1 flex items-start justify-between gap-3">
            <h1 className="font-display text-xl font-medium text-ink-900">{product.name}</h1>
            <div className="flex shrink-0 items-center gap-1 text-sm text-ink-900">
              <Star size={14} className="fill-clay-400 text-clay-400" />
              {product.rating}
            </div>
          </div>
          <p className="mt-1 text-lg font-semibold text-moss-700">{formatKRW(product.price)}</p>
          <div className="mt-2 flex items-center gap-2">
            <span className="rounded-md bg-moss-100 px-1.5 py-0.5 text-[11px] font-medium text-moss-700">
              {product.category}
            </span>
            <span className="rounded-md bg-moss-100 px-1.5 py-0.5 text-[11px] font-medium text-moss-700">
              {product.color}
            </span>
            <span className="text-[11px] text-moss-400">{product.season}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl bg-moss-100 p-3">
          <img
            src={productImage(`brand-${product.brand}`, 100, 100)}
            alt={product.brand}
            className="h-10 w-10 rounded-full object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-ink-900">{product.brand}</p>
            <p className="flex items-center gap-1 text-xs text-moss-500">
              <Star size={11} className="fill-clay-400 text-clay-400" />
              {product.rating} · 공식 판매자
            </p>
          </div>
          <button
            type="button"
            onClick={handleChat}
            className="flex shrink-0 items-center gap-1 rounded-full bg-moss-700 px-3 py-2 text-xs font-medium text-cream"
          >
            <MessageCircle size={14} />
            문의하기
          </button>
        </div>

        <div className="flex gap-2">
          <div className="flex flex-1 items-center gap-2 rounded-xl bg-moss-100 px-3 py-2.5">
            <Leaf size={16} className="text-moss-600" />
            <div>
              <p className="text-[11px] text-moss-500">소재</p>
              <p className="text-xs font-medium text-ink-900">{product.material}</p>
            </div>
          </div>
          <div className="flex flex-1 items-center gap-2 rounded-xl bg-moss-100 px-3 py-2.5">
            <Recycle size={16} className="text-moss-600" />
            <div>
              <p className="text-[11px] text-moss-500">탄소 절감</p>
              <p className="text-xs font-medium text-ink-900">{product.co2}kg CO2e</p>
            </div>
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-ink-900">사이즈</p>
          <div className="flex gap-2">
            {sizes.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSize(s)}
                className={`h-10 w-11 rounded-xl text-sm font-medium transition-colors ${
                  size === s
                    ? 'bg-moss-700 text-cream'
                    : 'bg-moss-100 text-moss-700'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-ink-900">상품 설명</p>
          <p className="text-sm leading-relaxed text-moss-600">
            {product.material}로 제작되어 피부에 편안하고, 생산 전 과정에서 탄소 배출을 최소화했습니다.
            매 시즌 소량으로 제작되어 오래 입을수록 가치가 더해지는 옷이에요.
          </p>
        </div>
      </div>

      <div className="sticky bottom-0 flex items-center gap-3 border-t border-moss-100 bg-sand-50/95 px-5 py-4 backdrop-blur">
        <div className="shrink-0">
          <p className="text-[11px] text-moss-500">총 금액</p>
          <p className="text-sm font-semibold text-ink-900">{formatKRW(product.price)}</p>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="flex-1 rounded-full bg-clay-500 py-3 text-sm font-semibold text-cream transition-colors active:bg-clay-600"
        >
          {justAdded ? '장바구니에 담았어요 ✓' : '장바구니 담기'}
        </button>
      </div>
    </div>
  )
}
