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

// --- market -----------------------------------------------------------------

/** The four states the backend accepts, same tokens the UI shows. */
export type ApiListingCondition = '새상품' | '거의 새것' | '사용감 조금 있음' | '사용감 있음'

export interface ApiListing {
  id: string
  name: string
  /** '' when the seller left it blank — the API never sends null here. */
  brand: string
  seller: string
  distanceKm: number
  size: string
  /** Original price, null when the seller did not enter one. */
  price: number | null
  discountedPrice: number | null
  points: number
  condition: ApiListingCondition
  /** Placeholder image seed, used when the listing has no photo. */
  seed: string
  description: string
  /** Server path like `/media/listings/x.png`, or '' when there is no photo. */
  imageUrl: string
  /** True only for the signed-in seller — the same listing reads false to others. */
  mine: boolean
  createdAt: string
  updatedAt: string
}

export interface ApiConditionOption {
  value: ApiListingCondition
  label: string
}
