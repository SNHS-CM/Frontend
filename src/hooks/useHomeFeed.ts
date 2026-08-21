/** 홈 화면이 처음에 그리는 것들 — 헤더, 탄소 배너, 추천, 시즌 추천, 신상.
 *
 *  서버가 한 번에 내려주므로 구획마다 왕복하지 않는다. 로그인 상태가 아니거나
 *  서버에 닿지 못하면 기존처럼 `data/products.ts` 의 상수로 화면을 채운다.
 */

import { useCallback, useEffect, useMemo, useState } from 'react'
import { ApiError } from '../api/client'
import * as homeApi from '../api/home'
import type { ApiHomeFeed } from '../api/types'
import { useAuth } from '../context/AuthContext'
import { useWishlist } from '../context/WishlistContext'
import { currentSeason, productFromApi, products, type Product, type Season } from '../data/products'
import { useRecommendations, type Recommendation } from './useRecommendations'

export interface HomeGreeting {
  name: string
  unreadMessages: number
  savedCount: number
}

export interface HomeEco {
  co2SavedKg: number
  ecoPoints: number
  treesEquivalent: number
}

interface HomeFeed {
  greeting: HomeGreeting | null
  eco: HomeEco | null
  recommendations: Recommendation[]
  hasSignal: boolean
  season: Season
  seasonPicks: Product[]
  newArrivals: Product[]
  loading: boolean
  error: string | null
  online: boolean
  reload: () => void
}

function fromApi(feed: ApiHomeFeed) {
  return {
    greeting: {
      name: feed.greeting.name,
      unreadMessages: feed.greeting.unreadMessages,
      savedCount: feed.greeting.savedCount,
    },
    eco: feed.eco,
    recommendations: feed.recommendations.map((r) => ({
      product: productFromApi(r.product),
      reason: r.reason,
    })),
    hasSignal: feed.hasSignal,
    season: feed.season as Season,
    seasonPicks: feed.seasonPicks.map(productFromApi),
    newArrivals: feed.newArrivals.map(productFromApi),
  }
}

export function useHomeFeed(): HomeFeed {
  const { status } = useAuth()
  const online = status === 'authenticated'
  // 좋아요/즐겨찾기가 바뀌면 추천도 달라지므로 피드를 다시 받는다.
  const { version } = useWishlist()

  const [feed, setFeed] = useState<ReturnType<typeof fromApi> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [nonce, setNonce] = useState(0)

  // 오프라인에서 쓸 로컬 계산. 훅 규칙상 항상 호출해야 해서 온라인일 때도 돈다.
  const localSeason = currentSeason()
  const local = useRecommendations(4)
  const localSeasonPicks = useMemo(
    () => products.filter((p) => p.season === localSeason).slice(0, 6),
    [localSeason],
  )
  const localArrivals = useMemo(() => products.filter((p) => p.tag === '신상'), [])

  useEffect(() => {
    if (!online) {
      setFeed(null)
      setError(null)
      setLoading(false)
      return
    }

    const controller = new AbortController()
    setLoading(true)
    homeApi
      .getHomeFeed(controller.signal)
      .then((res) => {
        if (controller.signal.aborted) return
        setFeed(fromApi(res))
        setError(null)
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return
        // 서버가 조용하면 로컬 상수로라도 화면을 띄운다.
        setFeed(null)
        setError(err instanceof ApiError ? err.message : '홈을 불러오지 못했어요.')
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [online, version, nonce])

  const reload = useCallback(() => setNonce((n) => n + 1), [])

  if (feed) {
    return { ...feed, loading, error, online, reload }
  }

  return {
    greeting: null,
    eco: null,
    recommendations: local.items,
    hasSignal: local.hasSignal,
    season: localSeason,
    seasonPicks: localSeasonPicks,
    newArrivals: localArrivals,
    loading,
    error,
    online,
    reload,
  }
}
