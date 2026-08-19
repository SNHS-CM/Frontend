import { Bell, Bookmark, Leaf, MessageCircle, Search, SlidersHorizontal, Sparkles } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import CategoryFilter, {
  categoryFilterCount,
  emptyCategoryFilter,
  type CategoryFilterValue,
} from '../components/CategoryFilter'
import ProductCard from '../components/ProductCard'
import SectionHeader from '../components/SectionHeader'
import StatusBar from '../components/StatusBar'
import { useRecommendations } from '../hooks/useRecommendations'
import { currentSeason, products } from '../data/products'

const newArrivals = products.filter((p) => p.tag === '신상')

export default function Home() {
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState<CategoryFilterValue>(emptyCategoryFilter)
  const [filterSheetOpen, setFilterSheetOpen] = useState(false)

  const season = currentSeason()
  const { items: recommendations, hasSignal } = useRecommendations(4)
  const filterCount = categoryFilterCount(filters)

  const seasonPicks = useMemo(
    () => products.filter((p) => p.season === season).slice(0, 6),
    [season],
  )

  // Searching or picking any filter swaps the curated sections for a plain grid.
  const browsing = query.trim() !== '' || filterCount > 0

  const filtered = useMemo(() => {
    if (!browsing) return []
    return products.filter((p) => {
      // An empty selection means "no restriction on this axis".
      const matchesCategory =
        filters.categories.length === 0 || filters.categories.includes(p.category)
      const matchesColor = filters.colors.length === 0 || filters.colors.includes(p.color)
      const matchesQuery = query
        ? p.name.includes(query) || p.brand.toLowerCase().includes(query.toLowerCase())
        : true
      return matchesCategory && matchesColor && matchesQuery
    })
  }, [browsing, filters, query])

  return (
    <div className="pb-24">
      <StatusBar />

      <header className="flex items-center justify-between px-5 pb-4 pt-2">
        <div>
          <p className="text-xs text-moss-500">안녕하세요</p>
          <p className="font-display text-lg font-medium text-ink-900">지니 님 👋</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/saved"
            aria-label="보관함"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-moss-100 text-moss-700"
          >
            <Bookmark size={18} />
          </Link>
          <Link
            to="/chat"
            aria-label="채팅"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-moss-100 text-moss-700"
          >
            <MessageCircle size={18} />
          </Link>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-moss-100 text-moss-700"
            aria-label="알림"
          >
            <Bell size={18} />
          </button>
        </div>
      </header>

      <div className="flex items-center gap-2 px-5">
        <div className="flex flex-1 items-center gap-2 rounded-full bg-moss-100 px-4 py-3 text-sm">
          <Search size={16} className="text-moss-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="친환경 소재, 브랜드 검색"
            className="w-full bg-transparent text-ink-900 placeholder:text-moss-500 focus:outline-none"
          />
        </div>
        <button
          type="button"
          onClick={() => setFilterSheetOpen(true)}
          aria-label="카테고리"
          className="relative flex h-11 shrink-0 items-center gap-1.5 rounded-full bg-moss-100 px-3.5 text-sm font-medium text-moss-700"
        >
          <SlidersHorizontal size={16} />
          카테고리
          {filterCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-clay-500 px-1 text-[10px] font-bold text-cream">
              {filterCount}
            </span>
          )}
        </button>
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
            <SectionHeader
              title="지니 님을 위한 추천"
              subtitle={
                hasSignal ? '좋아요·저장한 취향을 분석했어요' : '먼저 마음에 드는 옷을 눌러보세요'
              }
            />
            <div className="grid grid-cols-2 gap-3 px-5">
              {recommendations.map(({ product, reason }) => (
                <div key={product.id} className="relative">
                  <span className="absolute left-2 top-2 z-10 flex items-center gap-0.5 rounded-full bg-moss-700/90 px-2 py-0.5 text-[10px] font-medium text-cream backdrop-blur">
                    <Sparkles size={9} />
                    {reason}
                  </span>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-7 space-y-3">
            <SectionHeader title={`${season} 추천 상품`} subtitle={`지금 입기 좋은 ${season} 아이템`} />
            <div className="flex gap-3 overflow-x-auto px-5 pb-1">
              {seasonPicks.map((p) => (
                <div key={p.id} className="w-36 shrink-0">
                  <ProductCard product={p} />
                </div>
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

      <CategoryFilter
        open={filterSheetOpen}
        value={filters}
        onClose={() => setFilterSheetOpen(false)}
        onApply={setFilters}
      />
    </div>
  )
}
