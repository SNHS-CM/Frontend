/** 아웃핏 빌더 엔드포인트 — 등록한 옷과 코디. */

import { api } from './client'
import type {
  ApiGarment,
  ApiGarmentView,
  ApiOutfit,
  ApiOutfitPreview,
  GarmentType,
} from './types'

// --- 등록한 옷 --------------------------------------------------------------

export const listGarments = (type?: GarmentType) =>
  api.get<ApiGarment[]>(`/api/garments${type ? `?type=${type}` : ''}`)

export interface GarmentInput {
  type: GarmentType
  name: string
  color?: string
  colorHex?: string
  style?: string | null
  fit?: string | null
  emoji?: string
  matchScore?: number
  co2SavedKg?: number
  /** 이미 업로드된 사진 경로 (AI 초안이 함께 준다) */
  imageUrl?: string
}

export const createGarment = (input: GarmentInput) =>
  api.post<ApiGarment>('/api/garments', input)

export const updateGarment = (id: string, patch: Partial<GarmentInput>) =>
  api.patch<ApiGarment>(`/api/garments/${id}`, patch)

export const deleteGarment = (id: string) =>
  api.delete<{ detail: string }>(`/api/garments/${id}`)

export function uploadGarmentImage(id: string, file: File) {
  const form = new FormData()
  form.append('file', file)
  return api.put<{ imageUrl: string }>(`/api/garments/${id}/image`, form)
}

// --- 최근 본 옷 -------------------------------------------------------------

export const recentGarments = (limit = 10) =>
  api.get<ApiGarmentView[]>(`/api/garments/recent?limit=${limit}`)

/** 옷을 열어 봤음을 기록한다. 화면 이동을 막지 않도록 실패는 삼킨다. */
export const recordGarmentView = (id: string) =>
  api.post<ApiGarmentView>(`/api/garments/${id}/view`)

// --- 코디 -------------------------------------------------------------------

export interface OutfitSlots {
  topId?: string | null
  bottomId?: string | null
  shoesId?: string | null
}

/** 고른 조합의 매치 점수·보상을 저장 없이 계산한다. */
export const previewOutfit = (slots: OutfitSlots, signal?: AbortSignal) =>
  api.post<ApiOutfitPreview>('/api/outfits/preview', slots, { signal })

/** Save Outfit. 같은 조합이면 서버가 기존 코디를 돌려준다. */
export const saveOutfit = (slots: OutfitSlots & { title?: string; bookmarked?: boolean }) =>
  api.post<ApiOutfit>('/api/outfits/save', slots)

export const setOutfitBookmark = (id: string, bookmarked: boolean) =>
  api.put<ApiOutfit>(`/api/outfits/${id}/bookmark`, { bookmarked })

export const savedOutfits = (limit = 20) =>
  api.get<ApiOutfit[]>(`/api/outfits/saved?limit=${limit}`)

export const recentOutfits = (limit = 5) =>
  api.get<ApiOutfit[]>(`/api/outfits/recent?limit=${limit}`)

export const deleteOutfit = (id: string) =>
  api.delete<{ detail: string }>(`/api/outfits/${id}`)
