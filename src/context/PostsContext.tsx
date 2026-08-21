import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { ApiError } from '../api/client'
import * as discoverApi from '../api/discover'
import { postFromApi, posts as seedPosts, type OutfitPost } from '../data/posts'
import { useAuth } from './AuthContext'
import { useWishlist } from './WishlistContext'

/** 화면에 페이징 UI 가 없으므로 한 번에 들고 있을 수 있는 만큼만 받는다. */
const PAGE_SIZE = 100

interface PostsContextValue {
  /** 알고 있는 코디 전부. 보관함·추천이 id 로 찾기 때문에 걸러내지 않는다. */
  posts: OutfitPost[]
  loading: boolean
  /** 첫 로드가 실패했을 때. 시드 데이터가 화면에 남는다. */
  error: string | null
  online: boolean
  /** 쓰기가 성공할 때마다 오른다. 목록 쿼리가 다시 받는 신호. */
  version: number
  reload: () => void
  getPost: (id: string) => OutfitPost | undefined
  /** 아직 안 받아온 코디로 바로 들어왔을 때 (딥링크·새로고침). */
  fetchPost: (id: string) => Promise<OutfitPost | null>

  isLiked: (id: string) => boolean
  toggleLike: (id: string) => void
  likeCount: (post: OutfitPost) => number
  isSaved: (id: string) => boolean
  toggleSave: (id: string) => void
  saveCount: (post: OutfitPost) => number
  likedPosts: OutfitPost[]
  savedPosts: OutfitPost[]

  /** 공유 버튼. 횟수만 세므로 실패해도 조용히 넘어간다. */
  share: (id: string) => void
  shareCount: (post: OutfitPost) => number
}

const PostsContext = createContext<PostsContextValue | null>(null)

export function PostsProvider({ children }: { children: ReactNode }) {
  const { status } = useAuth()
  const online = status === 'authenticated'

  // 좋아요·저장 표시는 상품·판매글과 같은 곳(favorites)에 있다. 코디만 따로
  // 들고 있으면 보관함과 디스커버가 서로 다른 답을 내놓는다.
  const wishlist = useWishlist()

  const [posts, setPosts] = useState<OutfitPost[]>(seedPosts)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [version, setVersion] = useState(0)

  const postsRef = useRef(posts)
  postsRef.current = posts

  const bump = useCallback(() => setVersion((v) => v + 1), [])

  useEffect(() => {
    if (!online) {
      setPosts(seedPosts)
      setError(null)
      setLoading(false)
      return
    }

    let cancelled = false
    const load = async () => {
      setLoading(true)
      try {
        const rows = await discoverApi.listPosts({ feed: 'all', limit: PAGE_SIZE })
        if (cancelled) return
        setPosts(rows.map(postFromApi))
        setError(null)
      } catch (err) {
        if (cancelled) return
        // 화면을 비우기보다 지금 보이는 것을 남긴다.
        setError(err instanceof ApiError ? err.message : '코디를 불러오지 못했어요.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [online, version])

  const reload = useCallback(() => {
    setError(null)
    bump()
  }, [bump])

  const getPost = useCallback((id: string) => postsRef.current.find((p) => p.id === id), [])

  const fetchPost = useCallback(
    async (id: string) => {
      const cached = postsRef.current.find((p) => p.id === id)
      if (cached) return cached
      if (!online) return null
      try {
        const post = postFromApi(await discoverApi.getPost(id))
        setPosts((prev) => (prev.some((p) => p.id === post.id) ? prev : [post, ...prev]))
        return post
      } catch {
        return null
      }
    },
    [online],
  )

  // --- 좋아요 / 저장 --------------------------------------------------------
  // 표시 자체는 WishlistContext 가 들고 서버에도 그쪽이 알린다. 여기서는 수만
  // 계산한다: 서버가 준 수에서 그때의 내 표시를 빼면 '나 말고 다른 사람들'이
  // 남고, 거기에 지금 내 표시를 더하면 두 번 세지 않는다.
  const isLiked = useCallback((id: string) => wishlist.isLiked('post', id), [wishlist])
  const toggleLike = useCallback((id: string) => wishlist.toggleLike('post', id), [wishlist])
  const isSaved = useCallback((id: string) => wishlist.isSaved('post', id), [wishlist])
  const toggleSave = useCallback((id: string) => wishlist.toggleSave('post', id), [wishlist])

  const likeCount = useCallback(
    (post: OutfitPost) =>
      post.likes - (post.viewerLiked ? 1 : 0) + (wishlist.isLiked('post', post.id) ? 1 : 0),
    [wishlist],
  )
  const saveCount = useCallback(
    (post: OutfitPost) =>
      post.saves - (post.viewerSaved ? 1 : 0) + (wishlist.isSaved('post', post.id) ? 1 : 0),
    [wishlist],
  )

  const likedPosts = useMemo(
    () => posts.filter((p) => wishlist.isLiked('post', p.id)),
    [posts, wishlist],
  )
  const savedPosts = useMemo(
    () => posts.filter((p) => wishlist.isSaved('post', p.id)),
    [posts, wishlist],
  )

  // --- 공유 -----------------------------------------------------------------

  const share = useCallback(
    (id: string) => {
      // 링크는 이미 복사됐다. 집계가 실패해도 사용자가 할 일은 없다.
      setPosts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, shares: (p.shares ?? 0) + 1 } : p)),
      )
      if (!online) return
      void discoverApi.recordShare(id).catch(() => {
        setPosts((prev) =>
          prev.map((p) =>
            p.id === id ? { ...p, shares: Math.max(0, (p.shares ?? 1) - 1) } : p,
          ),
        )
      })
    },
    [online],
  )

  const shareCount = useCallback((post: OutfitPost) => post.shares ?? 0, [])

  const value = useMemo<PostsContextValue>(
    () => ({
      posts,
      loading,
      error,
      online,
      version,
      reload,
      getPost,
      fetchPost,
      isLiked,
      toggleLike,
      likeCount,
      isSaved,
      toggleSave,
      saveCount,
      likedPosts,
      savedPosts,
      share,
      shareCount,
    }),
    [
      posts,
      loading,
      error,
      online,
      version,
      reload,
      getPost,
      fetchPost,
      isLiked,
      toggleLike,
      likeCount,
      isSaved,
      toggleSave,
      saveCount,
      likedPosts,
      savedPosts,
      share,
      shareCount,
    ],
  )

  return <PostsContext.Provider value={value}>{children}</PostsContext.Provider>
}

export function usePosts() {
  const ctx = useContext(PostsContext)
  if (!ctx) throw new Error('usePosts must be used within PostsProvider')
  return ctx
}
