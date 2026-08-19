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
