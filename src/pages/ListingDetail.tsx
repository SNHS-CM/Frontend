import { ArrowLeft, Heart, MessageCircle, Pencil } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useChat } from '../context/ChatContext'
import { useWishlist } from '../context/WishlistContext'
import { useListings } from '../context/ListingsContext'
import { resolveListingImage } from '../data/listings'
import { formatKRW } from '../data/products'

export default function ListingDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const { isLiked, toggleLike } = useWishlist()
  const { startOrOpenChat } = useChat()
  const { listings, fetchListing } = useListings()
  const [justAdded, setJustAdded] = useState(false)
  const [notFound, setNotFound] = useState(false)

  // Reading from the array keeps the page live: an edit elsewhere re-renders it.
  const listing = listings.find((l) => l.id === id)

  // Opening the page from a link or a reload can land on a listing the market
  // has not loaded, so fall back to fetching this one on its own.
  useEffect(() => {
    if (listing || !id) return
    let cancelled = false
    void fetchListing(id).then((found) => {
      if (!cancelled && !found) setNotFound(true)
    })
    return () => {
      cancelled = true
    }
  }, [id, listing, fetchListing])

  if (notFound || !id) return <Navigate to="/market" replace />
  if (!listing) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-moss-500">
        불러오는 중…
      </div>
    )
  }

  const saved = isLiked('listing', listing.id)
  const price = listing.discountedPrice ?? listing.price
  const hasDiscount =
    listing.price != null && listing.discountedPrice != null && listing.discountedPrice < listing.price
  const discountRate = hasDiscount
    ? Math.round((1 - listing.discountedPrice! / listing.price!) * 100)
    : 0

  const handleAdd = () => {
    addToCart('listing', listing.id)
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 1500)
  }

  const handleChat = () => {
    const conversationId = startOrOpenChat(listing)
    navigate(`/chat/${conversationId}`)
  }

  return (
    <div className="flex h-full flex-col">
      <div className="relative aspect-[4/5] shrink-0">
        <img
          src={resolveListingImage(listing, 800, 1000)}
          alt={listing.name}
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
        <button
          type="button"
          onClick={() => toggleLike('listing', listing.id)}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-sand-50/90"
          aria-label="위시리스트에 담기"
        >
          <Heart size={18} className={saved ? 'fill-clay-500 text-clay-500' : 'text-ink-900'} />
        </button>
      </div>

      <div className="flex-1 space-y-5 px-5 pb-28 pt-5">
        <div>
          {listing.brand && (
            <p className="text-xs uppercase tracking-wide text-moss-500">{listing.brand}</p>
          )}
          <h1 className="mt-1 font-display text-xl font-medium leading-snug text-ink-900">
            {listing.name}
          </h1>

          <div className="mt-2 flex items-center gap-2">
            <span className="rounded-md bg-moss-100 px-1.5 py-0.5 text-[11px] font-medium text-moss-700">
              {listing.size}
            </span>
            <span className="text-xs text-moss-400">{listing.condition}</span>
          </div>

          <div className="mt-3 space-y-0.5">
            {hasDiscount && (
              <div className="flex items-center gap-1.5">
                <span className="rounded bg-clay-100 px-1 py-0.5 text-[10px] font-bold text-clay-600">
                  -{discountRate}%
                </span>
                <span className="text-xs text-moss-400 line-through">
                  {formatKRW(listing.price!)}
                </span>
              </div>
            )}
            <p className="text-lg font-semibold text-ink-900">
              {price != null ? formatKRW(price) : '가격 문의'}
            </p>
            <p className="text-xs font-medium text-moss-600">🍃 {listing.points} EP 적립</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl bg-moss-100 p-3">
          <img
            src={`https://picsum.photos/seed/${encodeURIComponent(listing.seller)}/100/100`}
            alt={listing.seller}
            className="h-10 w-10 rounded-full object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-ink-900">{listing.seller}</p>
            <p className="text-xs text-moss-500">
              {listing.mine ? '내 판매글' : `${listing.distanceKm}km 근처`}
            </p>
          </div>
          {!listing.mine && (
            <button
              type="button"
              onClick={handleChat}
              className="flex shrink-0 items-center gap-1 rounded-full bg-moss-700 px-3 py-2 text-xs font-medium text-sand-50"
            >
              <MessageCircle size={14} />
              채팅하기
            </button>
          )}
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-ink-900">상품 설명</p>
          <p className="whitespace-pre-line text-sm leading-relaxed text-moss-600">
            {listing.description ||
              `직접 착용/보관하던 아이템으로 상태는 "${listing.condition}"입니다. 실사용감이나 사이즈가 궁금하시면 채팅으로 편하게 물어보세요. 중고 거래로 탄소 배출을 줄이고 EP를 적립해요.`}
          </p>
        </div>
      </div>

      <div className="sticky bottom-0 flex items-center gap-3 border-t border-moss-100 bg-sand-50/95 px-5 py-4 backdrop-blur">
        {listing.mine ? (
          <Link
            to={`/market/${listing.id}/edit`}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-moss-700 py-3 text-sm font-semibold text-sand-50"
          >
            <Pencil size={15} />
            판매글 수정하기
          </Link>
        ) : (
          <>
            <button
              type="button"
              onClick={() => toggleLike('listing', listing.id)}
              aria-label="위시리스트에 담기"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-moss-100"
            >
              <Heart size={18} className={saved ? 'fill-clay-500 text-clay-500' : 'text-moss-700'} />
            </button>
            <button
              type="button"
              onClick={handleAdd}
              className="flex-1 rounded-full bg-clay-500 py-3 text-sm font-semibold text-sand-50 transition-colors active:bg-clay-600"
            >
              {justAdded ? '장바구니에 담았어요 ✓' : '장바구니 담기'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
