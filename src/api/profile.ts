/** Profile endpoints — everything the profile screen and its sheets need. */

import { api } from './client'
import type {
  ApiBanner,
  ApiNotif,
  ApiProfile,
  ApiStats,
  ApiSurvey,
  ApiSurveyResult,
  ApiToken,
  ApiVerificationSent,
  ApiVerificationStatus,
} from './types'

// --- account ----------------------------------------------------------------

export interface SignupInput {
  email: string
  password: string
  name: string
  agreeTerms: boolean
  agreePrivacy: boolean
  agreeData: boolean
}

export const signup = (input: SignupInput) =>
  api.post<ApiToken>('/api/auth/signup', input, { auth: false })

export const login = (email: string, password: string) =>
  api.post<ApiToken>('/api/auth/login', { email, password }, { auth: false })

export const fetchMe = () => api.get<ApiProfile>('/api/auth/me')

export const changePassword = (currentPassword: string, newPassword: string) =>
  api.put<{ detail: string }>('/api/auth/password', { currentPassword, newPassword })

// --- profile ----------------------------------------------------------------

export const getProfile = () => api.get<ApiProfile>('/api/profile/me')

/** Fields the server accepts on PATCH /me. Anything else is client-side only. */
export interface ProfilePatch {
  name?: string
  gender?: string
  bio?: string
  phone?: string
  address?: string
  zip?: string
  language?: string
}

export const patchProfile = (patch: ProfilePatch) =>
  api.patch<ApiProfile>('/api/profile/me', patch)

export const getStats = () => api.get<ApiStats>('/api/profile/me/stats')

export function uploadPhoto(file: File) {
  const form = new FormData()
  form.append('file', file)
  return api.put<{ photo: string }>('/api/profile/me/photo', form)
}

export const removePhoto = () => api.delete<{ photo: string }>('/api/profile/me/photo')

export const saveBanner = (banner: Partial<ApiBanner>) =>
  api.put<ApiBanner>('/api/profile/me/banner', banner)

export function uploadBannerImage(file: File) {
  const form = new FormData()
  form.append('file', file)
  return api.put<ApiBanner>('/api/profile/me/banner/image', form)
}

export const setTheme = (theme: 'light' | 'dark') =>
  api.put<{ theme: 'light' | 'dark' }>('/api/profile/me/theme', { theme })

// --- style survey -----------------------------------------------------------

export interface SurveyPayload {
  skinTone: string | null
  styles: string[]
  fit: string | null
  height: string
  weight: string
  age: string
}

/** Saving the survey also recomputes the keywords server-side. */
export const saveSurvey = (payload: SurveyPayload) =>
  api.put<ApiSurveyResult>('/api/profile/survey', payload)

export const setStyleKeywords = (styleKeywords: string[]) =>
  api.put<{ styleKeywords: string[] }>('/api/profile/survey/keywords', { styleKeywords })

export const getSurvey = () => api.get<ApiSurveyResult>('/api/profile/survey')

export type { ApiSurvey }

// --- notifications ----------------------------------------------------------

export const patchNotif = (patch: Partial<ApiNotif>) =>
  api.patch<ApiNotif>('/api/profile/notifications', patch)

// --- browsing history -------------------------------------------------------

export const recordVisit = (productId: string) =>
  api.post<unknown>('/api/profile/history', { productId })

export const clearHistory = () => api.delete<{ detail: string }>('/api/profile/history')

// --- address & verification -------------------------------------------------

export const saveAddress = (address: string, zip: string) =>
  api.put<{ address: string; zip: string }>('/api/profile/address', { address, zip })

export const requestVerification = (channel: 'email' | 'phone', target?: string) =>
  api.post<ApiVerificationSent>('/api/profile/verification/request', { channel, target })

export const confirmVerification = (channel: 'email' | 'phone', code: string) =>
  api.post<ApiVerificationStatus>('/api/profile/verification/confirm', { channel, code })
