import { Leaf, Minus, Plus, ShoppingBag, X } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import StatusBar from '../components/StatusBar'
import { useCart, type CartKind } from '../context/CartContext'
import { formatKRW, productImage, products } from '../data/products'
import { resolveListingImage } from '../data/listings'
import { useListings } from '../context/ListingsContext'

interface ResolvedLine {
  kind: CartKind
  id: string
  qty: number
  href: string
  image: string
  brand?: string
  name: string
  unitPrice: number
}

export default function Cart() {
  const navigate = useNavigate()
  const { lines, setQty, removeFromCart, totalItems, totalPrice, totalCo2 } = useCart()
  const { listings } = useListings()

  const resolved: ResolvedLine[] = lines
    .map((line): ResolvedLine | null => {
      if (line.kind === 'product') {
        const product = products.find((p) => p.id === line.id)
        if (!product) return null
        return {
          kind: 'product',
          id: product.id,
          qty: line.qty,
          href: `/product/${product.id}`,
          image: productImage(product.seed, 200, 200),
          brand: product.brand,
          name: product.name,
          unitPrice: product.price,
        }
      }
      const listing = listings.find((l) => l.id === line.id)
      if (!listing) return null
      return {
        kind: 'listing',
        id: listing.id,
        qty: line.qty,
        href: `/market/${listing.id}`,
        image: resolveListingImage(listing, 200, 200),
        brand: listing.brand,
        name: listing.name,
        unitPrice: listing.discountedPrice ?? listing.price ?? 0,
      }
    })
    .filter((l): l is ResolvedLine => l !== null)

  if (resolved.length === 0) {
    return (
      <div className="pb-24">
        <StatusBar />
        <header className="px-5 pb-3 pt-2">
          <h1 className="font-display text-xl font-medium text-ink-900">장바구니</h1>
        </header>
        <div className="mt-16 flex flex-col items-center gap-3 px-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-moss-100">
            <ShoppingBag size={26} className="text-moss-500" />
          </div>
          <p className="text-sm text-moss-500">장바구니가 비어있어요</p>
          <button
            type="button"
            onClick={() => navigate('/shop')}
            className="mt-2 rounded-full bg-moss-700 px-5 py-2.5 text-sm font-medium text-cream"
          >
            쇼핑하러 가기
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="pb-28">
      <StatusBar />
      <header className="px-5 pb-3 pt-2">
        <h1 className="font-display text-xl font-medium text-ink-900">장바구니 ({totalItems})</h1>
      </header>

      <div className="space-y-3 px-5">
        {resolved.map((line) => (
          <div key={`${line.kind}:${line.id}`} className="flex gap-3 rounded-2xl bg-moss-50 p-3">
            <Link to={line.href} className="shrink-0">
              <img
                src={line.image}
                alt={line.name}
                className="h-20 w-20 rounded-xl object-cover"
              />
            </Link>
            <div className="flex flex-1 flex-col justify-between">
              <div className="flex items-start justify-between gap-2">
                <Link to={line.href} className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    {line.brand && <p className="text-[11px] text-moss-500">{line.brand}</p>}
                    {line.kind === 'listing' && (
                      <span className="rounded bg-moss-100 px-1 py-px text-[9px] font-medium text-moss-600">
                        마켓
                      </span>
                    )}
                  </div>
                  <p className="truncate text-sm font-medium text-ink-900">{line.name}</p>
                </Link>
                <button
                  type="button"
                  onClick={() => removeFromCart(line.kind, line.id)}
                  aria-label="삭제"
                  className="shrink-0 text-moss-400"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-moss-700">{formatKRW(line.unitPrice)}</p>
                <div className="flex items-center gap-2 rounded-full bg-moss-100 px-1.5 py-1">
                  <button
                    type="button"
                    onClick={() => setQty(line.kind, line.id, line.qty - 1)}
                    className="flex h-6 w-6 items-center justify-center rounded-full text-moss-700"
                    aria-label="수량 감소"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="w-4 text-center text-xs font-medium text-ink-900">{line.qty}</span>
                  <button
                    type="button"
                    onClick={() => setQty(line.kind, line.id, line.qty + 1)}
                    className="flex h-6 w-6 items-center justify-center rounded-full text-moss-700"
                    aria-label="수량 증가"
                  >
                    <Plus size={12} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mx-5 mt-5 flex items-center gap-2 rounded-2xl bg-moss-700 px-4 py-3 text-cream">
        <Leaf size={16} />
        <p className="text-xs">이 주문으로 탄소 {totalCo2.toFixed(1)}kg을 절감해요</p>
      </div>

      <div className="mx-5 mt-4 space-y-2 rounded-2xl bg-moss-50 p-4 text-sm">
        <div className="flex justify-between text-moss-600">
          <span>상품 금액</span>
          <span>{formatKRW(totalPrice)}</span>
        </div>
        <div className="flex justify-between text-moss-600">
          <span>배송비</span>
          <span>무료</span>
        </div>
        <div className="flex justify-between border-t border-moss-200 pt-2 font-semibold text-ink-900">
          <span>총 결제금액</span>
          <span>{formatKRW(totalPrice)}</span>
        </div>
      </div>

      <div className="px-5 pt-5">
        <button
          type="button"
          className="w-full rounded-full bg-clay-500 py-3.5 text-sm font-semibold text-cream active:bg-clay-600"
        >
          결제하기
        </button>
      </div>
    </div>
  )
}
