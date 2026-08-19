/** Response shapes from the backend (Backend/app/schemas).
 *  The API serializes camelCase, so these map 1:1 onto the app's own types. */

export interface ApiSurvey {
  skinTone: string | null
  styles: string[]
  height: string
  weight: string
  age: string
  fit: string | null
}

export interface ApiNotif {
  push: boolean
  marketing: boolean
  social: boolean
  eco: boolean
}

export interface ApiProfile {
  id: string
  name: string
  gender: string
  bio: string
  photo: string
  bannerColor: string
  bannerImage: string
  theme: 'light' | 'dark'
  language: string
  email: string
  emailVerified: boolean
  phone: string
  phoneVerified: boolean
  address: string
  zip: string
  styleKeywords: string[]
  survey: ApiSurvey
  notif: ApiNotif
  history: string[]
  totalItems: number
  outfits: number
  co2SavedKg: number
  ecoPoints: number
}

export interface ApiToken {
  accessToken: string
  tokenType: string
  expiresIn: number
  userId: string
}

export interface ApiStats {
  totalItems: number
  outfits: number
  co2SavedKg: number
  ecoPoints: number
}

export interface ApiBanner {
  bannerColor: string
  bannerImage: string
}

export interface ApiSurveyResult {
  survey: ApiSurvey
  styleKeywords: string[]
}

export interface ApiVerificationStatus {
  email: string
  emailVerified: boolean
  phone: string
  phoneVerified: boolean
}

export interface ApiVerificationSent {
  channel: 'email' | 'phone'
  target: string
  expiresAt: string
  /** Only present while the backend runs with DEBUG=true. */
  debugCode: string | null
}

// --- 아웃핏 빌더 ------------------------------------------------------------

export type GarmentType = 'top' | 'bottom' | 'shoes'

/** 등록한 옷. 백엔드 GarmentOut 과 1:1. */
export interface ApiGarment {
  id: string
  type: GarmentType
  name: string
  color: string
  colorHex: string
  style: string | null
  fit: string | null
  imageUrl: string
  emoji: string
  /** 0~100 색 매칭 점수 */
  matchScore: number
  /** 매치 임계값(70)을 넘었는지 — 옷 매치 여부 */
  isMatch: boolean
  co2SavedKg: number
  /** 옷을 저장한 날짜 */
  savedAt: string
  updatedAt: string
}

/** 최근 본 옷 한 건. */
export interface ApiGarmentView {
  garment: ApiGarment
  viewCount: number
  viewedAt: string
}

export interface ApiOutfitItem {
  id: string
  productId: string
  slot: string
  position: number
}

export interface ApiOutfit {
  id: string
  /** 코디 이름 */
  title: string
  description: string
  coverImageUrl: string
  season: string
  likes: number
  items: ApiOutfitItem[]
  top: ApiGarment | null
  bottom: ApiGarment | null
  shoes: ApiGarment | null
  comboKey: string | null
  /** 코디 색상 매치 점수 */
  colorMatchScore: number
  /** 코디 저장 여부(북마크) */
  bookmarked: boolean
  bookmarkedAt: string | null
  co2SavedKg: number
  ecoPoints: number
  createdAt: string
  updatedAt: string
}

/** 저장 전에 조합 점수와 보상을 미리 계산한 결과. */
export interface ApiOutfitPreview {
  comboKey: string | null
  colorMatchScore: number
  co2SavedKg: number
  ecoPoints: number
  /** 이미 저장한 조합인지 */
  saved: boolean
  outfitId: string | null
  bookmarked: boolean
}
