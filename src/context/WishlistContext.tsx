import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import * as homeApi from '../api/home'
import { useAuth } from './AuthContext'

export type WishlistKind = 'product' | 'listing' | 'post'

interface WishlistContextValue {
  isLiked: (kind: WishlistKind, id: string) => boolean
  toggleLike: (kind: WishlistKind, id: string) => void
  likedKeys: string[]
  isSaved: (kind: WishlistKind, id: string) => boolean
  toggleSave: (kind: WishlistKind, id: string) => void
  savedKeys: string[]
  /** 서버와 동기화 중인지 — 오프라인이면 false. */
  online: boolean
  /** 좋아요/즐겨찾기가 바뀔 때마다 오르는 값. 추천 피드를 다시 받는 신호로 쓴다. */
  version: number
}

const WishlistContext = createContext<WishlistContextValue | null>(null)

function keyOf(kind: WishlistKind, id: string) {
  return `${kind}:${id}`
}

function toggleKey(set: Set<string>, key: string) {
  const next = new Set(set)
  if (next.has(key)) {
    next.delete(key)
  } else {
    next.add(key)
  }
  return next
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { status } = useAuth()
  const online = status === 'authenticated'

  // 좋아요와 즐겨찾기는 서로 독립이다. 좋아요는 피드에서 상품을 치우지 않고
  // 보관함에 더하기만 한다.
  const [liked, setLiked] = useState<Set<string>>(new Set())
  const [saved, setSaved] = useState<Set<string>>(new Set())
  const [version, setVersion] = useState(0)

  // 로그인하면 서버에 저장된 표시를 그대로 가져와 화면 전체를 칠한다.
  useEffect(() => {
    if (!online) {
      setLiked(new Set())
      setSaved(new Set())
      return
    }
    const controller = new AbortController()
    homeApi
      .getFavoriteKeys(controller.signal)
      .then((keys) => {
        if (controller.signal.aborted) return
        setLiked(new Set(keys.likedKeys))
        setSaved(new Set(keys.savedKeys))
      })
      .catch(() => {
        // 못 받아오면 이번 세션 동안은 메모리에만 담긴다.
      })
    return () => controller.abort()
  }, [online])

  /** 화면은 먼저 바꾸고 서버에 알린다. 실패하면 되돌린다 — 하트가 눌린 채로
   *  서버에는 없는 상태가 남지 않게. */
  const persist = useCallback(
    (
      kind: WishlistKind,
      id: string,
      apply: (prev: Set<string>) => Set<string>,
      setter: (updater: (prev: Set<string>) => Set<string>) => void,
      call: (kind: WishlistKind, id: string) => Promise<unknown>,
    ) => {
      setter(apply)
      setVersion((v) => v + 1)
      if (!online) return

      void call(kind, id).catch(() => {
        setter(apply) // 같은 토글을 한 번 더 적용하면 원래대로 돌아온다
        setVersion((v) => v + 1)
      })
    },
    [online],
  )

  const isLiked = useCallback(
    (kind: WishlistKind, id: string) => liked.has(keyOf(kind, id)),
    [liked],
  )
  const toggleLike = useCallback(
    (kind: WishlistKind, id: string) =>
      persist(
        kind,
        id,
        (prev) => toggleKey(prev, keyOf(kind, id)),
        setLiked,
        homeApi.toggleLike,
      ),
    [persist],
  )

  const isSaved = useCallback(
    (kind: WishlistKind, id: string) => saved.has(keyOf(kind, id)),
    [saved],
  )
  const toggleSave = useCallback(
    (kind: WishlistKind, id: string) =>
      persist(
        kind,
        id,
        (prev) => toggleKey(prev, keyOf(kind, id)),
        setSaved,
        homeApi.toggleSave,
      ),
    [persist],
  )

  const value = useMemo<WishlistContextValue>(
    () => ({
      isLiked,
      toggleLike,
      likedKeys: [...liked],
      isSaved,
      toggleSave,
      savedKeys: [...saved],
      online,
      version,
    }),
    [isLiked, toggleLike, liked, isSaved, toggleSave, saved, online, version],
  )

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
}

export function useWishlist() {
  const ctx = useContext(WishlistContext)
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider')
  return ctx
}
