/** 홈 화면 엔드포인트 — 피드, 상품 카탈로그, 좋아요/즐겨찾기, 채팅 뱃지. */

import { api } from './client'
import type {
  ApiCatalogOptions,
  ApiFavorite,
  ApiFavoriteKeys,
  ApiFavoriteKind,
  ApiHomeFeed,
  ApiProduct,
  ApiProductPage,
  ApiSeller,
} from './types'

// --- 홈 피드 ----------------------------------------------------------------

/** 헤더·탄소 배너·추천·시즌 추천·신상을 한 번에 받아 온다. */
export const getHomeFeed = (signal?: AbortSignal) =>
  api.get<ApiHomeFeed>('/api/home', { signal })

// --- 상품 -------------------------------------------------------------------

export interface ProductQuery {
  /** 옷 이름 또는 브랜드 검색 */
  q?: string
  /** 옷 종류 — 여러 개면 OR */
  categories?: string[]
  /** 옷 컬러 — 여러 개면 OR */
  colors?: string[]
  season?: string
  tag?: string
  limit?: number
  offset?: number
}

export function listProducts(query: ProductQuery = {}, signal?: AbortSignal) {
  const params = new URLSearchParams()
  if (query.q?.trim()) params.set('q', query.q.trim())
  // 같은 축의 값은 같은 키를 반복해 넘긴다 (FastAPI 의 리스트 쿼리 규칙).
  for (const category of query.categories ?? []) params.append('category', category)
  for (const color of query.colors ?? []) params.append('color', color)
  if (query.season) params.set('season', query.season)
  if (query.tag) params.set('tag', query.tag)
  if (query.limit != null) params.set('limit', String(query.limit))
  if (query.offset != null) params.set('offset', String(query.offset))

  const qs = params.toString()
  return api.get<ApiProductPage>(`/api/products${qs ? `?${qs}` : ''}`, { signal })
}

export const getProduct = (id: string) => api.get<ApiProduct>(`/api/products/${id}`)

/** 옷 종류 / 옷 컬러 선택지. 로그인 없이도 받을 수 있다. */
export const getCatalogOptions = (signal?: AbortSignal) =>
  api.get<ApiCatalogOptions>('/api/products/options', { auth: false, signal })

/** 옷 판매자 — 브랜드와 마켓 회원. */
export const listSellers = () => api.get<ApiSeller[]>('/api/products/sellers')

// --- 좋아요 / 즐겨찾기 ------------------------------------------------------

export const getFavoriteKeys = (signal?: AbortSignal) =>
  api.get<ApiFavoriteKeys>('/api/favorites/keys', { signal })

export const toggleLike = (kind: ApiFavoriteKind, targetId: string) =>
  api.post<ApiFavorite>(`/api/favorites/${kind}/${targetId}/like`)

export const toggleSave = (kind: ApiFavoriteKind, targetId: string) =>
  api.post<ApiFavorite>(`/api/favorites/${kind}/${targetId}/save`)

// --- 채팅 -------------------------------------------------------------------

/** 홈 헤더 채팅 아이콘의 뱃지 숫자. */
export const getUnreadCount = () => api.get<{ unread: number }>('/api/chat/unread')
