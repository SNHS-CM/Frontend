/** AI 엔드포인트 — 옷 사진 인식, 스타일링, 에코 대안.
 *
 *  OpenAI 를 프론트에서 직접 부르지 않는다. 키가 번들에 박혀 배포되면 누구나
 *  꺼내 쓸 수 있으므로, 호출은 전부 백엔드를 지나간다.
 *
 *  키가 없거나 응답이 오지 않으면 서버가 503 을 준다. 화면은 그때 기존
 *  규칙 기반 동작으로 돌아간다.
 */

import { api } from './client'
import type {
  ApiAiStatus,
  ApiGarmentAnalysis,
  ApiOutfitReview,
  ApiSuggestedOutfit,
  ApiWearInstead,
} from './types'

/** AI 를 쓸 수 있는지. 로그인 없이도 받을 수 있다. */
export const getAiStatus = (signal?: AbortSignal) =>
  api.get<ApiAiStatus>('/api/ai/status', { auth: false, signal })

// --- 1. 사진으로 옷 등록 ----------------------------------------------------

/** 옷 사진 한 장 → 등록 초안. 서버는 사진만 저장하고 옷은 만들지 않는다. */
export function analyzeGarmentPhoto(file: File, signal?: AbortSignal) {
  const form = new FormData()
  form.append('file', file)
  return api.post<ApiGarmentAnalysis>('/api/ai/garments/analyze', form, { signal })
}

// --- 2. 스타일링 ------------------------------------------------------------

export interface SuggestQuery {
  /** 반드시 포함할 내 옷 */
  anchorGarmentId?: string
  /** 지금 보고 있는 상품과 어울리게 */
  anchorProductId?: string
  limit?: number
}

export const suggestOutfits = (query: SuggestQuery = {}, signal?: AbortSignal) =>
  api.post<{ outfits: ApiSuggestedOutfit[] }>('/api/ai/outfit/suggest', query, { signal })

export const reviewOutfit = (
  outfit: { topId: string; bottomId: string; shoesId?: string | null },
  signal?: AbortSignal,
) => api.post<ApiOutfitReview>('/api/ai/outfit/review', outfit, { signal })

// --- 3. 사지 말고 입기 ------------------------------------------------------

export const wearInstead = (productId: string, signal?: AbortSignal) =>
  api.post<ApiWearInstead>('/api/ai/eco/wear-instead', { productId }, { signal })
