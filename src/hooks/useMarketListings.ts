import { useEffect, useMemo, useState } from 'react'
import { ApiError } from '../api/client'
import * as marketApi from '../api/market'
import type { MarketTab } from '../api/market'
import { filterListings, listingFromApi, type Listing } from '../data/listings'
import { useListings } from '../context/ListingsContext'

/** Long enough that typing a word is one request, short enough to feel live. */
const DEBOUNCE_MS = 250
const PAGE_SIZE = 100

/** The market screen's list: tab, search and distance sort resolved by the
 *  server. Offline — or if the request fails — the same narrowing runs against
 *  the listings already in memory, so the screen never goes blank.
 */
export function useMarketListings(tab: MarketTab, query: string) {
  const { listings, online, version } = useListings()

  const [serverRows, setServerRows] = useState<Listing[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const localRows = useMemo(
    () => filterListings(listings, tab, query),
    [listings, tab, query],
  )

  useEffect(() => {
    if (!online) {
      setServerRows(null)
      setError(null)
      setLoading(false)
      return
    }

    const controller = new AbortController()
    // Only debounce typing; switching tabs should feel immediate.
    const delay = query.trim() ? DEBOUNCE_MS : 0

    const timer = setTimeout(() => {
      setLoading(true)
      marketApi
        .listListings({ tab, q: query, limit: PAGE_SIZE }, controller.signal)
        .then((rows) => {
          if (controller.signal.aborted) return
          setServerRows(rows.map(listingFromApi))
          setError(null)
        })
        .catch((err: unknown) => {
          // An aborted request is a superseded keystroke, not a failure.
          if (controller.signal.aborted) return
          setServerRows(null) // fall back to the in-memory list
          setError(err instanceof ApiError ? err.message : '목록을 불러오지 못했어요.')
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false)
        })
    }, delay)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [online, tab, query, version])

  return {
    listings: serverRows ?? localRows,
    loading,
    error,
  }
}
