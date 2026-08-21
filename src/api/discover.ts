/** 디스커버 엔드포인트 — 코디 피드, 필터 선택지, 공유.
 *
 *  좋아요와 저장은 여기 있는 `/api/discover/posts/{id}/like` 대신 WishlistContext
 *  (= `/api/favorites`) 를 지나간다. 서버에서 둘은 같은 favorites 행이고, 앱에는
 *  이미 상품·판매글까지 아우르는 표시 캐시가 하나 있어서 쓰기 경로를 둘로 두면
 *  그 캐시가 어긋난다.
 */

import { api } from './client'
import type { ApiDiscoverFilters, ApiOutfitCategory, ApiPost, ApiPostSort } from './types'

/** 디스커버 화면에는 없지만 보관함·추천이 쓰는 값까지 포함한다. */
export type PostFeed = 'all' | 'saved' | 'liked' | 'mine'

export interface PostQuery {
  feed?: PostFeed
  category?: ApiOutfitCategory | null
  /** 제목·설명·작성자·아이템을 함께 검색 */
  q?: string
  /** 여러 개면 그중 하나라도 쓴 글 */
  brands?: string[]
  /** 작성자 키. min 이상 max 미만 */
  heightMin?: number
  heightMax?: number
  sort?: ApiPostSort
  limit?: number
  offset?: number
}

export function listPosts(query: PostQuery = {}, signal?: AbortSignal) {
  const params = new URLSearchParams()
  if (query.feed) params.set('feed', query.feed)
  if (query.category) params.set('category', query.category)
  if (query.q?.trim()) params.set('q', query.q.trim())
  // 같은 축의 값은 같은 키를 반복해 넘긴다 (FastAPI 의 리스트 쿼리 규칙).
  for (const brand of query.brands ?? []) params.append('brands', brand)
  if (query.heightMin != null) params.set('heightMin', String(query.heightMin))
  if (query.heightMax != null) params.set('heightMax', String(query.heightMax))
  if (query.sort) params.set('sort', query.sort)
  if (query.limit != null) params.set('limit', String(query.limit))
  if (query.offset != null) params.set('offset', String(query.offset))

  const qs = params.toString()
  return api.get<ApiPost[]>(`/api/discover/posts${qs ? `?${qs}` : ''}`, { signal })
}

export const getPost = (id: string) => api.get<ApiPost>(`/api/discover/posts/${id}`)

/** 분류·브랜드·키 구간·정렬. 로그인 없이도 받을 수 있다. */
export const getFilters = (signal?: AbortSignal) =>
  api.get<ApiDiscoverFilters>('/api/discover/filters', { auth: false, signal })

/** 공유 버튼을 눌렀을 때. 갱신된 글을 돌려준다. */
export const recordShare = (id: string) =>
  api.post<ApiPost>(`/api/discover/posts/${id}/share`)
