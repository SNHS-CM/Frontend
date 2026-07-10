import { Leaf, Minus, Plus, ShoppingBag, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import StatusBar from '../components/StatusBar'
import { useCart } from '../context/CartContext'
import { formatKRW, productImage, products } from '../data/products'

export default function Cart() {
  const navigate = useNavigate()
  const { lines, setQty, removeFromCart, totalItems, totalPrice, totalCo2 } = useCart()

  if (lines.length === 0) {
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
            className="mt-2 rounded-full bg-moss-700 px-5 py-2.5 text-sm font-medium text-sand-50"
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
        {lines.map((line) => {
          const product = products.find((p) => p.id === line.productId)
          if (!product) return null
          return (
            <div key={line.productId} className="flex gap-3 rounded-2xl bg-moss-50 p-3">
              <img
                src={productImage(product.seed, 200, 200)}
                alt={product.name}
                className="h-20 w-20 shrink-0 rounded-xl object-cover"
              />
              <div className="flex flex-1 flex-col justify-between">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[11px] text-moss-500">{product.brand}</p>
                    <p className="text-sm font-medium text-ink-900">{product.name}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFromCart(product.id)}
                    aria-label="삭제"
                    className="text-moss-400"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-moss-700">{formatKRW(product.price)}</p>
                  <div className="flex items-center gap-2 rounded-full bg-moss-100 px-1.5 py-1">
                    <button
                      type="button"
                      onClick={() => setQty(product.id, line.qty - 1)}
                      className="flex h-6 w-6 items-center justify-center rounded-full text-moss-700"
                      aria-label="수량 감소"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="w-4 text-center text-xs font-medium text-ink-900">{line.qty}</span>
                    <button
                      type="button"
                      onClick={() => setQty(product.id, line.qty + 1)}
                      className="flex h-6 w-6 items-center justify-center rounded-full text-moss-700"
                      aria-label="수량 증가"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mx-5 mt-5 flex items-center gap-2 rounded-2xl bg-moss-700 px-4 py-3 text-sand-50">
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
          className="w-full rounded-full bg-clay-500 py-3.5 text-sm font-semibold text-sand-50 active:bg-clay-600"
        >
          결제하기
        </button>
      </div>
    </div>
  )
}
