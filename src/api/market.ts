/** Market endpoints — the secondhand listings behind /market. */

import { api } from './client'
import type { ApiConditionOption, ApiListing, ApiListingCondition } from './types'

/** Mirrors the two buttons on the market screen. `all` is for lookups by id
 *  (cart, wishlist, recommendations) that must see every listing. */
export type MarketTab = 'near' | 'mine' | 'all'

export interface ListingQuery {
  tab?: MarketTab
  /** Matches product name and seller name. */
  q?: string
  limit?: number
  offset?: number
}

export function listListings(query: ListingQuery = {}, signal?: AbortSignal) {
  const params = new URLSearchParams()
  if (query.tab) params.set('tab', query.tab)
  if (query.q?.trim()) params.set('q', query.q.trim())
  if (query.limit != null) params.set('limit', String(query.limit))
  if (query.offset != null) params.set('offset', String(query.offset))

  const qs = params.toString()
  return api.get<ApiListing[]>(`/api/market/listings${qs ? `?${qs}` : ''}`, { signal })
}

export const getListing = (id: string) => api.get<ApiListing>(`/api/market/listings/${id}`)

/** Fields the seller fills in. Everything else (seller, distance, seed) is set
 *  by the server. Omit `points` to let it derive one from the price. */
export interface ListingPayload {
  name: string
  brand?: string
  size: string
  condition: ApiListingCondition
  price?: number | null
  discountedPrice: number
  points?: number
  description?: string
}

export const createListing = (payload: ListingPayload) =>
  api.post<ApiListing>('/api/market/listings', payload)

export const updateListing = (id: string, payload: Partial<ListingPayload>) =>
  api.patch<ApiListing>(`/api/market/listings/${id}`, payload)

export const deleteListing = (id: string) =>
  api.delete<{ detail: string }>(`/api/market/listings/${id}`)

export function uploadListingImage(id: string, file: File) {
  const form = new FormData()
  form.append('file', file)
  return api.put<ApiListing>(`/api/market/listings/${id}/image`, form)
}

export const removeListingImage = (id: string) =>
  api.delete<ApiListing>(`/api/market/listings/${id}/image`)

/** Condition tokens, for clients that cannot hardcode them. The app uses its
 *  own typed constant instead so the union stays checkable at compile time. */
export const getConditions = () =>
  api.get<ApiConditionOption[]>('/api/market/conditions', { auth: false })
