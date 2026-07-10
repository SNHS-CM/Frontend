import { SlidersHorizontal, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import Chip from '../components/Chip'
import ProductCard from '../components/ProductCard'
import StatusBar from '../components/StatusBar'
import { categories, products, type Category } from '../data/products'

export default function Shop() {
  const location = useLocation()
  const initialCategory = (location.state as { category?: Category } | null)?.category ?? null
  const [active, setActive] = useState<Category | null>(initialCategory)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory = active ? p.category === active : true
      const matchesQuery = query
        ? p.name.includes(query) || p.brand.toLowerCase().includes(query.toLowerCase())
        : true
      return matchesCategory && matchesQuery
    })
  }, [active, query])

  return (
    <div className="pb-24">
      <StatusBar />

      <header className="px-5 pb-3 pt-2">
        <h1 className="font-display text-xl font-medium text-ink-900">쇼핑</h1>
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

      <div className="mt-4 flex gap-2 overflow-x-auto px-5 pb-1">
        <Chip label="전체" active={active === null} onClick={() => setActive(null)} />
        {categories.map((c) => (
          <Chip key={c} label={c} active={active === c} onClick={() => setActive(c)} />
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between px-5">
        <p className="text-xs text-moss-500">{filtered.length}개 상품</p>
        <button type="button" className="flex items-center gap-1 text-xs font-medium text-moss-700">
          <SlidersHorizontal size={14} />
          정렬
        </button>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 px-5">
        {filtered.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
        {filtered.length === 0 && (
          <p className="col-span-2 py-10 text-center text-sm text-moss-500">
            검색 결과가 없어요.
          </p>
        )}
      </div>
    </div>
  )
}
