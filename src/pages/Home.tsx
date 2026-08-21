import {
  Bell,
  Bookmark,
  CloudOff,
  Leaf,
  MessageCircle,
  Search,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import CategoryFilter, {
  categoryFilterCount,
  emptyCategoryFilter,
  type CategoryFilterValue,
} from '../components/CategoryFilter'
import ProductCard from '../components/ProductCard'
import SectionHeader from '../components/SectionHeader'
import StatusBar from '../components/StatusBar'
import { useAuth } from '../context/AuthContext'
import { useHomeFeed } from '../hooks/useHomeFeed'
import { useProductSearch } from '../hooks/useProductSearch'

/** 헤더 아이콘 위에 얹는 뱃지. 0이면 그리지 않는다. */
function Badge({ count }: { count: number }) {
  if (count <= 0) return null
  return (
    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-clay-500 px-1 text-[10px] font-bold text-cream">
      {count > 99 ? '99+' : count}
    </span>
  )
}

export default function Home() {
  const { status, refresh } = useAuth()
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState<CategoryFilterValue>(emptyCategoryFilter)
  const [filterSheetOpen, setFilterSheetOpen] = useState(false)

  const {
    greeting,
    eco,
    recommendations,
    hasSignal,
    season,
    seasonPicks,
    newArrivals,
    error,
  } = useHomeFeed()

  const filterCount = categoryFilterCount(filters)
  // 검색어나 필터가 있으면 큐레이션 구획 대신 평평한 그리드를 그린다.
  const browsing = query.trim() !== '' || filterCount > 0
  const { items: filtered, total, loading: searching } = useProductSearch(
    query,
    filters,
    browsing,
  )

  const displayName = greeting?.name ?? '지니'

  return (
    <div className="pb-24">
      <StatusBar />

      <header className="flex items-center justify-between px-5 pb-4 pt-2">
        <div className="min-w-0">
          <p className="text-xs text-moss-500">안녕하세요</p>
          <p className="truncate font-display text-lg font-medium text-ink-900">
            {displayName} 님 👋
          </p>
        </div>
        <div className="flex items-center gap-2">
          {status === 'offline' && (
            <button
              type="button"
              onClick={refresh}
              aria-label="오프라인"
              title="서버에 연결할 수 없어요"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-clay-100 text-clay-600"
            >
              <CloudOff size={18} />
            </button>
          )}
          <Link
            to="/saved"
            aria-label="보관함"
            className="relative flex h-10 w-10 items-center justify-center rounded-full bg-moss-100 text-moss-700"
          >
            <Bookmark size={18} />
            <Badge count={greeting?.savedCount ?? 0} />
          </Link>
          <Link
            to="/chat"
            aria-label="채팅"
            className="relative flex h-10 w-10 items-center justify-center rounded-full bg-moss-100 text-moss-700"
          >
            <MessageCircle size={18} />
            <Badge count={greeting?.unreadMessages ?? 0} />
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

      {error && (
        <p role="alert" className="mx-5 mt-3 rounded-xl bg-clay-100 px-3 py-2 text-xs text-clay-600">
          {error}
        </p>
      )}

      <div className="mx-5 mt-4 flex items-center gap-3 rounded-2xl bg-moss-700 p-4 text-cream shadow-card">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-moss-600">
          <Leaf size={20} />
        </div>
        <div>
          <p className="text-sm font-medium">
            이번 달 절약한 탄소 {(eco?.co2SavedKg ?? 12.4).toFixed(1)}kg
          </p>
          <p className="text-xs text-sand-100/70">
            나무 {eco?.treesEquivalent ?? 6}그루를 심은 효과예요
          </p>
        </div>
      </div>

      {browsing ? (
        <>
          <p className="mt-4 px-5 text-xs text-moss-500">
            {searching ? '찾는 중…' : `${total}개 상품`}
          </p>
          <div className="mt-2 grid grid-cols-2 gap-3 px-5">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
          {!searching && filtered.length === 0 && (
            <p className="py-12 text-center text-sm text-moss-500">검색 결과가 없어요.</p>
          )}
        </>
      ) : (
        <>
          <div className="mt-6 space-y-3">
            <SectionHeader
              title={`${displayName} 님을 위한 추천`}
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
