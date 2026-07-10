import { Bell, Leaf, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Chip from '../components/Chip'
import ProductCard from '../components/ProductCard'
import SectionHeader from '../components/SectionHeader'
import StatusBar from '../components/StatusBar'
import { categories, products } from '../data/products'

const featured = products.filter((p) => p.tag === '베스트' || p.tag === '신상').slice(0, 4)
const newArrivals = products.filter((p) => p.tag === '신상')

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="pb-24">
      <StatusBar />

      <header className="flex items-center justify-between px-5 pb-4 pt-2">
        <div>
          <p className="text-xs text-moss-500">안녕하세요</p>
          <p className="font-display text-lg font-medium text-ink-900">지니 님 👋</p>
        </div>
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-moss-100 text-moss-700"
          aria-label="알림"
        >
          <Bell size={18} />
        </button>
      </header>

      <div className="px-5">
        <button
          type="button"
          onClick={() => navigate('/shop')}
          className="flex w-full items-center gap-2 rounded-full bg-moss-100 px-4 py-3 text-left text-sm text-moss-500"
        >
          <Search size={16} />
          친환경 소재, 브랜드 검색
        </button>
      </div>

      <div className="mx-5 mt-4 flex items-center gap-3 rounded-2xl bg-moss-700 p-4 text-sand-50 shadow-card">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-moss-600">
          <Leaf size={20} />
        </div>
        <div>
          <p className="text-sm font-medium">이번 달 절약한 탄소 12.4kg</p>
          <p className="text-xs text-sand-100/70">나무 6그루를 심은 효과예요</p>
        </div>
      </div>

      <div className="mt-6 flex gap-2 overflow-x-auto px-5 pb-1">
        <Chip label="전체" active onClick={() => navigate('/shop')} />
        {categories.map((c) => (
          <Chip key={c} label={c} onClick={() => navigate('/shop', { state: { category: c } })} />
        ))}
      </div>

      <div className="mt-6 space-y-3">
        <SectionHeader title="추천 상품" subtitle="지니 님을 위한 픽" to="/shop" />
        <div className="grid grid-cols-2 gap-3 px-5">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>

      <div className="mt-7 space-y-3">
        <SectionHeader title="이번 주 신상" to="/shop" />
        <div className="flex gap-3 overflow-x-auto px-5 pb-1">
          {newArrivals.map((p) => (
            <div key={p.id} className="w-36 shrink-0">
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
