/** 아웃핏 빌더의 상태를 한곳에 모은 훅.
 *
 *  로그인 상태에서는 옷장과 점수·보상을 모두 백엔드에서 가져오고, 서버에 닿지
 *  못하면 기존처럼 `data/outfits.ts` 의 옷으로 동작한다. 점수 계산 규칙은 양쪽이
 *  같으므로 오프라인에서도 표시되는 매치 %는 달라지지 않는다.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ApiError, assetUrl } from '../api/client'
import * as outfitApi from '../api/outfits'
import type { ApiGarment, GarmentType } from '../api/types'
import { useAuth } from '../context/AuthContext'
import {
  bottoms as localBottoms,
  matchOfScores,
  outfitKey,
  tops as localTops,
  type Garment as LocalGarment,
} from '../data/outfits'

/** 화면이 그리는 옷 한 벌. 서버 옷과 로컬 상수 옷을 같은 모양으로 맞춘다. */
export interface BuilderGarment {
  id: string
  type: GarmentType
  name: string
  color: string
  /** 바로 <img src> 에 넣을 수 있는 URL. 비면 emoji 로 폴백한다. */
  image: string
  emoji: string
  matchScore: number
  isMatch: boolean
}

/** 조합 점수와 보상. 에코 값은 서버가 계산하므로 오프라인에서는 null 이다. */
export interface BuilderPreview {
  colorMatchScore: number
  co2SavedKg: number | null
  ecoPoints: number | null
  saved: boolean
  bookmarked: boolean
  outfitId: string | null
}

function fromApi(dto: ApiGarment): BuilderGarment {
  return {
    id: dto.id,
    type: dto.type,
    name: dto.name,
    color: dto.color,
    image: assetUrl(dto.imageUrl),
    emoji: dto.emoji,
    matchScore: dto.matchScore,
    isMatch: dto.isMatch,
  }
}

function fromLocal(g: LocalGarment): BuilderGarment {
  return {
    id: g.id,
    type: g.type,
    name: g.name,
    color: g.color,
    image: g.image ?? '',
    emoji: g.emoji,
    matchScore: g.match,
    isMatch: g.match >= 70, // 백엔드 MATCH_THRESHOLD 와 같은 값
  }
}

const LOCAL_GARMENTS: BuilderGarment[] = [
  ...localTops.map(fromLocal),
  ...localBottoms.map(fromLocal),
]

export function useOutfitBuilder() {
  const { status } = useAuth()
  const online = status === 'authenticated'

  const [garments, setGarments] = useState<BuilderGarment[]>(LOCAL_GARMENTS)
  const [topId, setTopId] = useState<string | null>(null)
  const [bottomId, setBottomId] = useState<string | null>(null)
  const [shoesId, setShoesId] = useState<string | null>(null)

  const [preview, setPreview] = useState<BuilderPreview | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /** 오프라인에서 북마크한 조합 키. 서버의 bookmarked 를 대신한다. */
  const [localFavorites, setLocalFavorites] = useState<Set<string>>(() => new Set())

  const tops = useMemo(() => garments.filter((g) => g.type === 'top'), [garments])
  const bottoms = useMemo(() => garments.filter((g) => g.type === 'bottom'), [garments])
  const shoes = useMemo(() => garments.filter((g) => g.type === 'shoes'), [garments])

  const top = useMemo(() => tops.find((g) => g.id === topId) ?? null, [tops, topId])
  const bottom = useMemo(
    () => bottoms.find((g) => g.id === bottomId) ?? null,
    [bottoms, bottomId],
  )
  const shoe = useMemo(() => shoes.find((g) => g.id === shoesId) ?? null, [shoes, shoesId])

  // --- 옷장 불러오기 --------------------------------------------------------

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)

    if (!online) {
      setGarments(LOCAL_GARMENTS)
      setLoading(false)
      return
    }
    try {
      const list = await outfitApi.listGarments()
      setGarments(list.map(fromApi))
    } catch (err) {
      // 서버가 응답하지 않으면 기존 옷으로라도 화면을 띄운다.
      setGarments(LOCAL_GARMENTS)
      setError(err instanceof ApiError ? err.message : '옷장을 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }, [online])

  useEffect(() => {
    void load()
  }, [load])

  // 옷장이 바뀌면 첫 상·하의를 기본 선택으로 둔다 (defaultOutfit 과 같은 동작).
  useEffect(() => {
    setTopId((current) =>
      current && tops.some((g) => g.id === current) ? current : (tops[0]?.id ?? null),
    )
    setBottomId((current) =>
      current && bottoms.some((g) => g.id === current) ? current : (bottoms[0]?.id ?? null),
    )
    setShoesId((current) =>
      current && shoes.some((g) => g.id === current) ? current : null,
    )
  }, [tops, bottoms, shoes])

  // --- 조합 점수 ------------------------------------------------------------

  // 옷을 빠르게 갈아 끼우면 응답이 순서를 바꿔 도착할 수 있다. 마지막 요청의
  // 결과만 반영해 오래된 점수가 화면을 덮어쓰지 않게 한다.
  const requestId = useRef(0)

  useEffect(() => {
    if (!top || !bottom) {
      setPreview(null)
      return
    }

    const localScore = matchOfScores(
      [top, bottom, shoe].filter((g): g is BuilderGarment => g !== null).map((g) => g.matchScore),
    )

    if (!online) {
      setPreview({
        colorMatchScore: localScore,
        co2SavedKg: null,
        ecoPoints: null,
        saved: localFavorites.has(outfitKey(top.id, bottom.id)),
        bookmarked: localFavorites.has(outfitKey(top.id, bottom.id)),
        outfitId: null,
      })
      return
    }

    const id = ++requestId.current
    const controller = new AbortController()

    // 응답을 기다리는 동안에도 점수는 바로 보이게 한다 (같은 규칙이라 값이 같다).
    setPreview((prev) => ({
      colorMatchScore: localScore,
      co2SavedKg: prev?.co2SavedKg ?? null,
      ecoPoints: prev?.ecoPoints ?? null,
      saved: false,
      bookmarked: false,
      outfitId: null,
    }))

    outfitApi
      .previewOutfit(
        { topId: top.id, bottomId: bottom.id, shoesId: shoe?.id ?? null },
        controller.signal,
      )
      .then((res) => {
        if (id !== requestId.current) return
        setPreview({
          colorMatchScore: res.colorMatchScore,
          co2SavedKg: res.co2SavedKg,
          ecoPoints: res.ecoPoints,
          saved: res.saved,
          bookmarked: res.bookmarked,
          outfitId: res.outfitId,
        })
      })
      .catch((err) => {
        // 옷을 바꿔서 취소된 요청이거나 이미 지난 요청이면 무시한다.
        if (err instanceof DOMException && err.name === 'AbortError') return
        if (id !== requestId.current) return
        if (err instanceof ApiError && err.isOffline) return // 로컬 점수를 그대로 둔다
        setError(err instanceof ApiError ? err.message : '점수를 계산하지 못했습니다.')
      })

    return () => controller.abort()
  }, [top, bottom, shoe, online, localFavorites])

  // --- 저장 / 북마크 --------------------------------------------------------

  const persist = useCallback(
    async (bookmarked: boolean) => {
      if (!top || !bottom) return

      if (!online) {
        setLocalFavorites((prev) => {
          const next = new Set(prev)
          const key = outfitKey(top.id, bottom.id)
          if (bookmarked) next.add(key)
          else next.delete(key)
          return next
        })
        return
      }

      setSaving(true)
      setError(null)
      try {
        const outfit =
          preview?.outfitId != null
            ? await outfitApi.setOutfitBookmark(preview.outfitId, bookmarked)
            : await outfitApi.saveOutfit({
                topId: top.id,
                bottomId: bottom.id,
                shoesId: shoe?.id ?? null,
                bookmarked,
              })

        setPreview({
          colorMatchScore: outfit.colorMatchScore,
          co2SavedKg: outfit.co2SavedKg,
          ecoPoints: outfit.ecoPoints,
          saved: true,
          bookmarked: outfit.bookmarked,
          outfitId: outfit.id,
        })
      } catch (err) {
        setError(err instanceof ApiError ? err.message : '코디를 저장하지 못했습니다.')
      } finally {
        setSaving(false)
      }
    },
    [online, top, bottom, shoe, preview?.outfitId],
  )

  const save = useCallback(() => persist(true), [persist])
  const toggleBookmark = useCallback(
    () => persist(!(preview?.bookmarked ?? false)),
    [persist, preview?.bookmarked],
  )

  /** 옷을 골랐을 때 열람 기록을 남긴다. 실패해도 화면 동작을 막지 않는다. */
  const noteView = useCallback(
    (garmentId: string) => {
      if (!online) return
      void outfitApi.recordGarmentView(garmentId).catch(() => {})
    },
    [online],
  )

  const selectTop = useCallback(
    (id: string) => {
      setTopId(id)
      noteView(id)
    },
    [noteView],
  )
  const selectBottom = useCallback(
    (id: string) => {
      setBottomId(id)
      noteView(id)
    },
    [noteView],
  )
  /** 신발은 선택이라 같은 것을 다시 누르면 해제된다. */
  const selectShoes = useCallback(
    (id: string) => {
      setShoesId((current) => (current === id ? null : id))
      noteView(id)
    },
    [noteView],
  )

  return {
    online,
    loading,
    saving,
    error,
    dismissError: () => setError(null),
    reload: load,

    tops,
    bottoms,
    shoes,
    top,
    bottom,
    shoe,
    selectTop,
    selectBottom,
    selectShoes,

    preview,
    matchScore: preview?.colorMatchScore ?? 0,
    isBookmarked: preview?.bookmarked ?? false,
    save,
    toggleBookmark,
  }
}
