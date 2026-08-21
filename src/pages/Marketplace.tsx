import { Heart, Leaf, MapPin, MessageCircle, Plus, Search } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import StatusBar from '../components/StatusBar'
import { useWishlist } from '../context/WishlistContext'
import { useListings } from '../context/ListingsContext'
import { useMarketListings } from '../hooks/useMarketListings'
import { resolveListingImage, type Listing } from '../data/listings'
import { formatKRW } from '../data/products'
import { useI18n } from '../i18n'
import ConnectionBadge from '../components/ConnectionBadge'

type Tab = 'near' | 'mine'

export default function Marketplace() {
  const { t } = useI18n()
  const { syncError } = useListings()
  const [tab, setTab] = useState<Tab>('near')
  const [query, setQuery] = useState('')

  const { listings: visible, loading, error } = useMarketListings(tab, query)

  // A failed read is already phrased for the user; a failed write needs the
  // "could not save" framing so it does not read as the list being wrong.
  const notice = error ?? (syncError && t('auth.syncError', { message: syncError }))

  return (
    <div className="pb-24">
      <StatusBar />

      <header className="flex items-center justify-between px-5 pb-3 pt-2">
        <h1 className="font-display text-xl font-medium text-ink-900">마켓</h1>
        <div className="flex items-center gap-2">
          <ConnectionBadge />
          <Link
            to="/chat"
            aria-label="채팅 목록"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-moss-100 text-moss-700"
          >
            <MessageCircle size={18} />
          </Link>
        </div>
      </header>

      {notice && (
        <p role="alert" className="mx-5 mb-3 rounded-xl bg-clay-100 px-3 py-2 text-xs text-clay-600">
          {notice}
        </p>
      )}

      <div className="flex items-center gap-2 px-5">
        <div className="flex flex-1 items-center gap-2 rounded-full bg-moss-100 px-4 py-3 text-sm">
          <Search size={16} className="text-moss-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="아이템, 판매자 검색"
            className="w-full bg-transparent text-ink-900 placeholder:text-moss-500 focus:outline-none"
          />
        </div>
        <button
          type="button"
          aria-label="지역 설정"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-moss-100 text-moss-700"
        >
          <MapPin size={18} />
        </button>
      </div>

      <div className="mt-4 flex gap-2 px-5">
        {(
          [
            ['near', '내 주변'],
            ['mine', '내 판매글'],
          ] as [Tab, string][]
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setTab(value)}
            className={`flex-1 rounded-full py-2.5 text-sm font-medium transition-colors ${
              tab === value
                ? 'bg-moss-700 text-sand-50'
                : 'border border-moss-200 bg-sand-50 text-moss-600'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-3 px-5">
        {visible.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
        {visible.length === 0 && (
          <p className="py-12 text-center text-sm text-moss-500">
            {loading
              ? '불러오는 중…'
              : query
                ? '검색 결과가 없어요.'
                : tab === 'mine'
                  ? '등록한 판매글이 없어요.'
                  : '주변에 등록된 아이템이 없어요.'}
          </p>
        )}
      </div>

      <Link
        to="/market/new"
        className="absolute bottom-24 right-5 z-10 flex items-center gap-1.5 rounded-full bg-clay-500 px-5 py-3.5 text-sm font-semibold text-sand-50 shadow-card active:bg-clay-600"
      >
        <Plus size={16} />
        판매 등록
      </Link>
    </div>
  )
}

function ListingCard({ listing }: { listing: Listing }) {
  const { isLiked, toggleLike } = useWishlist()
  const saved = isLiked('listing', listing.id)

  return (
    <Link
      to={`/market/${listing.id}`}
      className="relative flex w-full items-start gap-3 rounded-2xl border border-moss-100 bg-sand-50 p-3 text-left shadow-card"
    >
      <img
        src={resolveListingImage(listing, 200, 200)}
        alt={listing.name}
        loading="lazy"
        className="h-20 w-20 shrink-0 rounded-xl bg-moss-100 object-cover"
      />
      <div className="min-w-0 flex-1 space-y-1">
        {listing.brand && (
          <p className="truncate text-[11px] font-medium uppercase tracking-wide text-moss-500">
            {listing.brand}
          </p>
        )}
        <p className="line-clamp-2 pr-6 text-sm font-medium leading-snug text-ink-900">
          {listing.name}
        </p>
        <p className="truncate text-xs text-moss-500">
          {listing.seller}
          {!listing.mine && <> · {listing.distanceKm}km</>}
        </p>
        <div className="flex items-center gap-2 pt-0.5">
          <span className="rounded-md bg-moss-100 px-1.5 py-0.5 text-[11px] font-medium text-moss-700">
            {listing.size}
          </span>
          <span className="text-[11px] text-moss-400">{listing.condition}</span>
        </div>
        <div className="space-y-0.5 pt-1">
          {hasDiscount(listing) && (
            <div className="flex items-center gap-1.5">
              <span className="rounded bg-clay-100 px-1 py-0.5 text-[10px] font-bold text-clay-600">
                -{discountRate(listing)}%
              </span>
              <span className="text-[11px] text-moss-400 line-through">
                {formatKRW(listing.price!)}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-base font-semibold text-ink-900">
              {listing.discountedPrice != null
                ? formatKRW(listing.discountedPrice)
                : listing.price != null
                  ? formatKRW(listing.price)
                  : ''}
            </span>
            <span className="flex items-center gap-1 text-xs font-medium text-moss-600">
              <Leaf size={13} />
              {listing.points} EP 적립
            </span>
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          toggleLike('listing', listing.id)
        }}
        aria-label="위시리스트에 담기"
        className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-sand-50/90 backdrop-blur"
      >
        <Heart size={14} className={saved ? 'fill-clay-500 text-clay-500' : 'text-moss-700'} />
      </button>
    </Link>
  )
}

function hasDiscount(listing: Listing) {
  return (
    listing.price != null && listing.discountedPrice != null && listing.discountedPrice < listing.price
  )
}

function discountRate(listing: Listing) {
  if (!hasDiscount(listing)) return 0
  return Math.round((1 - listing.discountedPrice! / listing.price!) * 100)
}
