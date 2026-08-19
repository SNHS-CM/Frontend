import { ArrowLeft, Bookmark, Heart } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Chip from '../components/Chip'
import { useListings } from '../context/ListingsContext'
import { usePosts } from '../context/PostsContext'
import { useWishlist } from '../context/WishlistContext'
import { resolveListingImage } from '../data/listings'
import { resolvePostImage } from '../data/posts'
import { formatKRW, productImage, products } from '../data/products'

type Tab = 'liked' | 'saved'
type ItemKind = 'product' | 'listing' | 'post'

const KIND_LABEL: Record<ItemKind, string> = {
  product: '상품',
  listing: '마켓',
  post: '코디',
}

interface SavedItem {
  key: string
  kind: ItemKind
  href: string
  image: string
  title: string
  subtitle: string
  remove: () => void
}

export default function Saved() {
  const navigate = useNavigate()
  const { likedKeys, toggleLike: toggleWishlist } = useWishlist()
  const { listings } = useListings()
  const { likedPosts, savedPosts, toggleLike: togglePostLike, toggleSave } = usePosts()

  const [tab, setTab] = useState<Tab>('liked')
  const [kindFilter, setKindFilter] = useState<ItemKind | null>(null)

  const likedItems = useMemo<SavedItem[]>(() => {
    const fromWishlist = likedKeys
      .map((key): SavedItem | null => {
        const [kind, id] = key.split(':') as ['product' | 'listing', string]

        if (kind === 'product') {
          const product = products.find((p) => p.id === id)
          if (!product) return null
          return {
            key,
            kind: 'product',
            href: `/product/${id}`,
            image: productImage(product.seed, 400, 500),
            title: product.name,
            subtitle: formatKRW(product.price),
            remove: () => toggleWishlist('product', id),
          }
        }

        const listing = listings.find((l) => l.id === id)
        if (!listing) return null
        return {
          key,
          kind: 'listing',
          href: `/market/${id}`,
          image: resolveListingImage(listing, 400, 500),
          title: listing.name,
          subtitle: formatKRW(listing.discountedPrice ?? listing.price ?? 0),
          remove: () => toggleWishlist('listing', id),
        }
      })
      .filter((x): x is SavedItem => x !== null)

    const fromPosts = likedPosts.map<SavedItem>((post) => ({
      key: `post:${post.id}`,
      kind: 'post',
      href: `/discover/${post.id}`,
      image: resolvePostImage(post, 400, 500),
      title: post.title,
      subtitle: `${post.author.name} · ${post.author.heightCm}cm`,
      remove: () => togglePostLike(post.id),
    }))

    return [...fromWishlist, ...fromPosts]
  }, [likedKeys, listings, likedPosts, toggleWishlist, togglePostLike])

  const savedItems = useMemo<SavedItem[]>(
    () =>
      savedPosts.map((post) => ({
        key: `post:${post.id}`,
        kind: 'post',
        href: `/discover/${post.id}`,
        image: resolvePostImage(post, 400, 500),
        title: post.title,
        subtitle: `${post.author.name} · ${post.author.heightCm}cm`,
        remove: () => toggleSave(post.id),
      })),
    [savedPosts, toggleSave],
  )

  const items = tab === 'liked' ? likedItems : savedItems
  // Only offer type chips when the tab actually holds more than one type.
  const presentKinds = [...new Set(items.map((i) => i.kind))]
  const visible = kindFilter ? items.filter((i) => i.kind === kindFilter) : items

  return (
    <div className="pb-10">
      <header className="flex items-center gap-3 px-5 pb-3 pt-2">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="뒤로가기"
          className="flex h-9 w-9 items-center justify-center rounded-full text-ink-900"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="font-display text-xl font-medium text-ink-900">보관함</h1>
      </header>

      <div className="flex gap-2 px-5">
        {(
          [
            ['liked', '좋아요', likedItems.length],
            ['saved', '저장', savedItems.length],
          ] as [Tab, string, number][]
        ).map(([value, label, count]) => (
          <button
            key={value}
            type="button"
            onClick={() => {
              setTab(value)
              setKindFilter(null)
            }}
            className={`flex-1 rounded-full py-2.5 text-sm font-medium transition-colors ${
              tab === value
                ? 'bg-moss-700 text-cream'
                : 'border border-moss-200 bg-sand-50 text-moss-600'
            }`}
          >
            {label} {count}
          </button>
        ))}
      </div>

      {presentKinds.length > 1 && (
        <div className="mt-4 flex gap-2 overflow-x-auto px-5 pb-1">
          <Chip label="전체" active={kindFilter === null} onClick={() => setKindFilter(null)} />
          {presentKinds.map((kind) => (
            <Chip
              key={kind}
              label={KIND_LABEL[kind]}
              active={kindFilter === kind}
              onClick={() => setKindFilter(kindFilter === kind ? null : kind)}
            />
          ))}
        </div>
      )}

      {visible.length === 0 ? (
        <EmptyState tab={tab} />
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3 px-5">
          {visible.map((item) => (
            <SavedCard key={item.key} item={item} tab={tab} />
          ))}
        </div>
      )}
    </div>
  )
}

function SavedCard({ item, tab }: { item: SavedItem; tab: Tab }) {
  return (
    <Link to={item.href} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-moss-100">
        <img
          src={item.image}
          alt={item.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-active:scale-95"
        />
        <span className="absolute left-2 top-2 rounded-full bg-sand-50/90 px-2 py-0.5 text-[10px] font-medium text-moss-700 backdrop-blur">
          {KIND_LABEL[item.kind]}
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            item.remove()
          }}
          aria-label={tab === 'liked' ? '좋아요 해제' : '저장 해제'}
          className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-sand-50/90 backdrop-blur"
        >
          {tab === 'liked' ? (
            <Heart size={14} className="fill-clay-500 text-clay-500" />
          ) : (
            <Bookmark size={14} className="fill-moss-700 text-moss-700" />
          )}
        </button>
      </div>
      <div className="mt-2 space-y-0.5">
        <p className="line-clamp-2 text-sm font-medium leading-snug text-ink-900">{item.title}</p>
        <p className="truncate text-xs text-moss-500">{item.subtitle}</p>
      </div>
    </Link>
  )
}

function EmptyState({ tab }: { tab: Tab }) {
  return (
    <div className="mt-16 flex flex-col items-center gap-3 px-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-moss-100">
        {tab === 'liked' ? (
          <Heart size={26} className="text-moss-500" />
        ) : (
          <Bookmark size={26} className="text-moss-500" />
        )}
      </div>
      <p className="text-sm text-moss-500">
        {tab === 'liked' ? '좋아요한 항목이 없어요' : '저장한 코디가 없어요'}
      </p>
      <Link
        to={tab === 'liked' ? '/home' : '/discover'}
        className="mt-2 rounded-full bg-moss-700 px-5 py-2.5 text-sm font-medium text-cream"
      >
        {tab === 'liked' ? '쇼핑 둘러보기' : '코디 둘러보기'}
      </Link>
    </div>
  )
}
