import { ArrowLeft, Bookmark, Heart, MessageCircle, Share2 } from 'lucide-react'
import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { useChat } from '../context/ChatContext'
import { usePosts } from '../context/PostsContext'
import {
  authorAvatar,
  formatPostedAt,
  resolvePostImage,
  type OutfitItem,
} from '../data/posts'

export default function PostDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getPost, isLiked, toggleLike, likeCount, isSaved, toggleSave, saveCount } = usePosts()
  const { startOrOpenPostChat } = useChat()
  const [toast, setToast] = useState('')

  const post = getPost(id ?? '')
  if (!post) return <Navigate to="/discover" replace />

  const liked = isLiked(post.id)
  const saved = isSaved(post.id)

  const showToast = (text: string) => {
    setToast(text)
    setTimeout(() => setToast(''), 1800)
  }

  const handleShare = async () => {
    const url = `${window.location.origin}/discover/${post.id}`
    try {
      if (navigator.share) {
        await navigator.share({ title: post.title, text: post.description, url })
        return
      }
      await navigator.clipboard.writeText(url)
      showToast('링크를 복사했어요')
    } catch {
      // User dismissed the share sheet, or the clipboard was blocked — nothing to recover.
      showToast('공유하지 못했어요')
    }
  }

  const handleSave = () => {
    toggleSave(post.id)
    showToast(saved ? '저장을 해제했어요' : '저장했어요')
  }

  const handleChat = () => {
    const conversationId = startOrOpenPostChat(post)
    navigate(`/chat/${conversationId}`)
  }

  return (
    <div className="relative flex h-full flex-col">
      <div className="relative aspect-[4/5] shrink-0">
        <img
          src={resolvePostImage(post, 800, 1000)}
          alt={post.title}
          className="h-full w-full object-cover"
        />
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="뒤로가기"
          className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-sand-50/90 text-ink-900 backdrop-blur"
        >
          <ArrowLeft size={18} />
        </button>
        <button
          type="button"
          onClick={handleShare}
          aria-label="공유하기"
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-sand-50/90 text-ink-900 backdrop-blur"
        >
          <Share2 size={17} />
        </button>
      </div>

      <div className="flex-1 space-y-5 px-5 pb-28 pt-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-moss-100 px-2.5 py-0.5 text-[11px] font-medium text-moss-700">
              {post.category}
            </span>
            <span className="text-xs text-moss-400">{formatPostedAt(post.postedAt)}</span>
          </div>
          <h1 className="mt-2 font-display text-xl font-medium leading-snug text-ink-900">
            {post.title}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-moss-600">{post.description}</p>
        </div>

        <div className="rounded-2xl bg-moss-100 p-4">
          <div className="flex items-center gap-3">
            <img
              src={authorAvatar(post.author)}
              alt={post.author.name}
              className="h-11 w-11 rounded-full object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-ink-900">{post.author.name}</p>
              <p className="text-xs text-moss-500">
                {post.author.heightCm}cm · {post.author.weightKg}kg
              </p>
            </div>
            <button
              type="button"
              onClick={handleChat}
              className="flex shrink-0 items-center gap-1 rounded-full bg-moss-700 px-3 py-2 text-xs font-medium text-cream"
            >
              <MessageCircle size={14} />
              채팅하기
            </button>
          </div>

          <div className="mt-3 grid grid-cols-4 gap-2 border-t border-moss-200 pt-3">
            <Stat label="키" value={`${post.author.heightCm}cm`} />
            <Stat label="몸무게" value={`${post.author.weightKg}kg`} />
            <Stat label="상의" value={post.author.usualTopSize} />
            <Stat label="하의" value={post.author.usualBottomSize} />
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-ink-900">착용 아이템 {post.items.length}개</p>
          <div className="divide-y divide-moss-100 overflow-hidden rounded-2xl bg-moss-50">
            {post.items.map((item, i) => (
              <ItemRow key={`${item.brand}-${item.name}-${i}`} item={item} />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-moss-500">
          <span className="flex items-center gap-1">
            <Heart size={13} className={liked ? 'fill-clay-500 text-clay-500' : ''} />
            좋아요 {likeCount(post)}
          </span>
          <span className="flex items-center gap-1">
            <Bookmark size={13} className={saved ? 'fill-moss-700 text-moss-700' : ''} />
            저장 {saveCount(post)}
          </span>
        </div>
      </div>

      {toast && (
        <div className="absolute bottom-24 left-1/2 z-30 -translate-x-1/2 rounded-full bg-moss-900/90 px-4 py-2 text-xs font-medium text-cream">
          {toast}
        </div>
      )}

      <div className="sticky bottom-0 flex items-center gap-2 border-t border-moss-100 bg-sand-50/95 px-5 py-4 backdrop-blur">
        <button
          type="button"
          onClick={() => toggleLike(post.id)}
          aria-label="좋아요"
          className="flex h-12 flex-1 items-center justify-center gap-1.5 rounded-full bg-moss-100 text-sm font-medium text-moss-700"
        >
          <Heart size={17} className={liked ? 'fill-clay-500 text-clay-500' : ''} />
          {likeCount(post)}
        </button>
        <button
          type="button"
          onClick={handleSave}
          aria-label="저장"
          className={`flex h-12 flex-1 items-center justify-center gap-1.5 rounded-full text-sm font-medium transition-colors ${
            saved ? 'bg-moss-700 text-cream' : 'bg-moss-100 text-moss-700'
          }`}
        >
          <Bookmark size={17} className={saved ? 'fill-cream' : ''} />
          {saved ? '저장됨' : '저장'}
        </button>
        <button
          type="button"
          onClick={handleChat}
          className="flex h-12 flex-[1.4] items-center justify-center gap-1.5 rounded-full bg-clay-500 text-sm font-semibold text-cream active:bg-clay-600"
        >
          <MessageCircle size={17} />
          채팅하기
        </button>
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="text-[10px] text-moss-500">{label}</p>
      <p className="text-xs font-semibold text-ink-900">{value}</p>
    </div>
  )
}

function ItemRow({ item }: { item: OutfitItem }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <span className="w-12 shrink-0 rounded-md bg-moss-100 px-1.5 py-0.5 text-center text-[10px] font-medium text-moss-700">
        {item.role}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[11px] uppercase tracking-wide text-moss-500">{item.brand}</p>
        <p className="truncate text-sm text-ink-900">{item.name}</p>
      </div>
      {item.size && (
        <span className="shrink-0 text-xs font-medium text-moss-600">{item.size}</span>
      )}
    </div>
  )
}
