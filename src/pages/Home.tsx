import { Bell, Leaf, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import Chip from '../components/Chip'
import ProductCard from '../components/ProductCard'
import SectionHeader from '../components/SectionHeader'
import StatusBar from '../components/StatusBar'
import { categories, products, type Category } from '../data/products'

const featured = products.filter((p) => p.tag === '베스트' || p.tag === '신상').slice(0, 4)
const newArrivals = products.filter((p) => p.tag === '신상')

export default function Home() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<Category | null>(null)

  // Searching or picking a category swaps the curated sections for a plain grid.
  const browsing = query.trim() !== '' || category !== null

  const filtered = useMemo(() => {
    if (!browsing) return []
    return products.filter((p) => {
      const matchesCategory = category ? p.category === category : true
      const matchesQuery = query
        ? p.name.includes(query) || p.brand.toLowerCase().includes(query.toLowerCase())
        : true
      return matchesCategory && matchesQuery
    })
  }, [browsing, category, query])

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
        <div className="flex items-center gap-2 rounded-full bg-moss-100 px-4 py-3 text-sm">
          <Search size={16} className="text-moss-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="친환경 소재, 브랜드 검색"
            className="w-full bg-transparent text-ink-900 placeholder:text-moss-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="mx-5 mt-4 flex items-center gap-3 rounded-2xl bg-moss-700 p-4 text-cream shadow-card">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-moss-600">
          <Leaf size={20} />
        </div>
        <div>
          <p className="text-sm font-medium">이번 달 절약한 탄소 12.4kg</p>
          <p className="text-xs text-sand-100/70">나무 6그루를 심은 효과예요</p>
        </div>
      </div>

      <div className="mt-6 flex gap-2 overflow-x-auto px-5 pb-1">
        <Chip label="전체" active={category === null} onClick={() => setCategory(null)} />
        {categories.map((c) => (
          <Chip
            key={c}
            label={c}
            active={category === c}
            onClick={() => setCategory(category === c ? null : c)}
          />
        ))}
      </div>

      {browsing ? (
        <>
          <p className="mt-4 px-5 text-xs text-moss-500">{filtered.length}개 상품</p>
          <div className="mt-2 grid grid-cols-2 gap-3 px-5">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
          {filtered.length === 0 && (
            <p className="py-12 text-center text-sm text-moss-500">검색 결과가 없어요.</p>
          )}
        </>
      ) : (
        <>
          <div className="mt-6 space-y-3">
            <SectionHeader title="추천 상품" subtitle="지니 님을 위한 픽" />
            <div className="grid grid-cols-2 gap-3 px-5">
              {featured.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>

          <div className="mt-7 space-y-3">
            <SectionHeader title="이번 주 신상" />
            <div className="flex gap-3 overflow-x-auto px-5 pb-1">
              {newArrivals.map((p) => (
                <div key={p.id} className="w-36 shrink-0">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
