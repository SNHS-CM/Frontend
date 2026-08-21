import { Bookmark, Heart, MessageCircle, Search, SlidersHorizontal } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Chip from '../components/Chip'
import StatusBar from '../components/StatusBar'
import DiscoverFilterSheet, {
  activeFilterCount,
  emptyFilters,
  type DiscoverFilters,
} from '../components/DiscoverFilterSheet'
import { usePosts } from '../context/PostsContext'
import { useDiscoverPosts } from '../hooks/useDiscoverPosts'
import {
  authorAvatar,
  authorKey,
  formatPostedAt,
  outfitCategories,
  resolvePostImage,
  type OutfitCategory,
  type OutfitPost,
} from '../data/posts'
import ConnectionBadge from '../components/ConnectionBadge'

export default function Discover() {
  const { isLiked, toggleLike, likeCount, isSaved, toggleSave } = usePosts()
  const [category, setCategory] = useState<OutfitCategory | null>(null)
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState<DiscoverFilters>(emptyFilters)
  const [sheetOpen, setSheetOpen] = useState(false)

  const {
    posts: visible,
    loading,
    error,
  } = useDiscoverPosts({
    category,
    query,
    brands: filters.brands,
    height: filters.height,
    sort: filters.sort,
  })

  const filterCount = activeFilterCount(filters)

  return (
    <div className="pb-24">
      <StatusBar />

      <header className="flex items-center justify-between px-5 pb-3 pt-2">
        <h1 className="font-display text-xl font-medium text-ink-900">디스커버</h1>
        <div className="flex items-center gap-2">
          <ConnectionBadge />
          <Link
            to="/saved"
            aria-label="보관함"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-moss-100 text-moss-700"
          >
            <Bookmark size={18} />
          </Link>
          <Link
            to="/chat"
            aria-label="채팅 목록"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-moss-100 text-moss-700"
          >
            <MessageCircle size={18} />
          </Link>
        </div>
      </header>

      {error && (
        <p role="alert" className="mx-5 mb-3 rounded-xl bg-clay-100 px-3 py-2 text-xs text-clay-600">
          {error}
        </p>
      )}

      <div className="flex items-center gap-2 px-5">
        <div className="flex flex-1 items-center gap-2 rounded-full bg-moss-100 px-4 py-3 text-sm">
          <Search size={16} className="text-moss-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="코디, 브랜드, 작성자 검색"
            className="w-full bg-transparent text-ink-900 placeholder:text-moss-500 focus:outline-none"
          />
        </div>
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          aria-label="필터"
          className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-moss-100 text-moss-700"
        >
          <SlidersHorizontal size={18} />
          {filterCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-clay-500 text-[9px] font-bold text-cream">
              {filterCount}
            </span>
          )}
        </button>
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto px-5 pb-1">
        <Chip label="전체" active={category === null} onClick={() => setCategory(null)} />
        {outfitCategories.map((c) => (
          <Chip
            key={c}
            label={c}
            active={category === c}
            onClick={() => setCategory(category === c ? null : c)}
          />
        ))}
      </div>

      <p className="mt-3 px-5 text-xs text-moss-500">{visible.length}개의 코디</p>

      <div className="mt-2 grid grid-cols-2 gap-3 px-5">
        {visible.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            liked={isLiked(post.id)}
            saved={isSaved(post.id)}
            likes={likeCount(post)}
            onToggleLike={() => toggleLike(post.id)}
            onToggleSave={() => toggleSave(post.id)}
          />
        ))}
      </div>

      {visible.length === 0 && (
        <p className="py-14 text-center text-sm text-moss-500">
          {loading ? '불러오는 중…' : '조건에 맞는 코디가 없어요.'}
        </p>
      )}

      <DiscoverFilterSheet
        open={sheetOpen}
        value={filters}
        onClose={() => setSheetOpen(false)}
        onApply={setFilters}
      />
    </div>
  )
}

export function PostCard({
  post,
  liked,
  saved,
  likes,
  onToggleLike,
  onToggleSave,
}: {
  post: OutfitPost
  liked: boolean
  saved: boolean
  likes: number
  onToggleLike: () => void
  onToggleSave: () => void
}) {
  const navigate = useNavigate()

  return (
    <Link to={`/discover/${post.id}`} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-moss-100">
        <img
          src={resolvePostImage(post)}
          alt={post.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-active:scale-95"
        />
        <span className="absolute left-2 top-2 rounded-full bg-sand-50/90 px-2 py-0.5 text-[10px] font-medium text-moss-700 backdrop-blur">
          {post.category}
        </span>
        <div className="absolute right-2 top-2 flex flex-col gap-1.5">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              onToggleLike()
            }}
            aria-label="좋아요"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-sand-50/90 backdrop-blur"
          >
            <Heart size={14} className={liked ? 'fill-clay-500 text-clay-500' : 'text-moss-700'} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              onToggleSave()
            }}
            aria-label="저장"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-sand-50/90 backdrop-blur"
          >
            <Bookmark
              size={14}
              className={saved ? 'fill-moss-700 text-moss-700' : 'text-moss-700'}
            />
          </button>
        </div>
      </div>

      <div className="mt-2 space-y-1">
        <p className="line-clamp-2 text-sm font-medium leading-snug text-ink-900">{post.title}</p>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            navigate(`/discover/author/${encodeURIComponent(authorKey(post.author))}`)
          }}
          className="flex w-full items-center gap-1.5 text-left"
        >
          <img
            src={authorAvatar(post.author, 40)}
            alt={post.author.name}
            className="h-4 w-4 rounded-full object-cover"
          />
          <p className="truncate text-[11px] text-moss-500 underline decoration-moss-200 underline-offset-2">
            {post.author.name} · {post.author.heightCm}cm
          </p>
        </button>
        <div className="flex items-center justify-between text-[11px] text-moss-400">
          <span className="flex items-center gap-1">
            <Heart size={11} className={liked ? 'fill-clay-500 text-clay-500' : ''} />
            {likes}
          </span>
          <span>{formatPostedAt(post.postedAt)}</span>
        </div>
      </div>
    </Link>
  )
}
