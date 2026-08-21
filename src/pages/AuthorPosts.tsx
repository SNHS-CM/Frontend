/** 한 사람이 올린 코디 전체.
 *
 *  디스커버 카드나 코디 상세에서 작성자를 누르면 여기로 온다. 목록 자체는
 *  디스커버와 같은 카드를 그대로 쓰고, 서버가 작성자로 걸러 준다. 오프라인이면
 *  메모리에 있는 코디에서 같은 사람을 찾는다.
 */

import { ArrowLeft } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ApiError } from '../api/client'
import * as discoverApi from '../api/discover'
import StatusBar from '../components/StatusBar'
import { useAuth } from '../context/AuthContext'
import { usePosts } from '../context/PostsContext'
import { authorAvatar, postFromApi, type OutfitPost } from '../data/posts'
import { PostCard } from './Discover'

export default function AuthorPosts() {
  const { authorId = '' } = useParams()
  const navigate = useNavigate()
  const { status } = useAuth()
  const online = status === 'authenticated'
  const { posts, isLiked, toggleLike, likeCount, isSaved, toggleSave, version } = usePosts()

  const [serverRows, setServerRows] = useState<OutfitPost[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 서버가 없을 때의 폴백. 로컬 상수 코디에는 작성자 id 가 없어 이름으로도 찾는다.
  const localRows = useMemo(
    () => posts.filter((p) => p.author.id === authorId || p.author.name === authorId),
    [posts, authorId],
  )

  useEffect(() => {
    if (!online) {
      setServerRows(null)
      setError(null)
      setLoading(false)
      return
    }

    const controller = new AbortController()
    setLoading(true)
    discoverApi
      .listPosts({ author: authorId, limit: 100 }, controller.signal)
      .then((rows) => {
        if (controller.signal.aborted) return
        setServerRows(rows.map(postFromApi))
        setError(null)
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return
        setServerRows(null)
        setError(err instanceof ApiError ? err.message : '코디를 불러오지 못했어요.')
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [online, authorId, version])

  const visible = serverRows ?? localRows
  // 작성자 정보는 글에 복사돼 있으므로 첫 글에서 그대로 읽는다.
  const author = visible[0]?.author ?? null
  const totalLikes = visible.reduce((sum, p) => sum + likeCount(p), 0)

  return (
    <div className="pb-24">
      <StatusBar />

      <header className="flex items-center gap-3 px-5 pb-3 pt-2">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="뒤로가기"
          className="flex h-9 w-9 items-center justify-center rounded-full text-ink-900"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="truncate font-display text-xl font-medium text-ink-900">
          {author?.name ?? '작성자'}
        </h1>
      </header>

      {author && (
        <div className="mx-5 rounded-2xl bg-moss-100 p-4">
          <div className="flex items-center gap-3">
            <img
              src={authorAvatar(author)}
              alt={author.name}
              className="h-11 w-11 rounded-full object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-ink-900">{author.name}</p>
              <p className="text-xs text-moss-500">
                코디 {visible.length}개 · 좋아요 {totalLikes}
              </p>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-4 gap-2 border-t border-moss-200 pt-3">
            <Stat label="키" value={`${author.heightCm}cm`} />
            <Stat label="몸무게" value={`${author.weightKg}kg`} />
            <Stat label="상의" value={author.usualTopSize} />
            <Stat label="하의" value={author.usualBottomSize} />
          </div>
        </div>
      )}

      {error && (
        <p role="alert" className="mx-5 mt-3 rounded-xl bg-clay-100 px-3 py-2 text-xs text-clay-600">
          {error}
        </p>
      )}

      <div className="mt-4 grid grid-cols-2 gap-3 px-5">
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
          {loading ? '불러오는 중…' : '아직 올린 코디가 없어요.'}
        </p>
      )}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="text-[11px] text-moss-500">{label}</p>
      <p className="text-xs font-medium text-ink-900">{value}</p>
    </div>
  )
}
