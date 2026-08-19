import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { ApiError } from '../api/client'
import * as marketApi from '../api/market'
import {
  listingFromApi,
  listingToPayload,
  seedListings,
  type Listing,
  type ListingInput,
} from '../data/listings'
import { useAuth } from './AuthContext'

export type { ListingInput }

/** How many listings the market holds in memory. The by-id lookups below need
 *  the whole set, so this is the ceiling on a market that has no paging UI. */
const PAGE_SIZE = 100

interface ListingsContextValue {
  /** Every listing we know about. Cart, wishlist and recommendations look up by
   *  id across all of them, so this stays unfiltered — the market screen does
   *  its own narrowing through `useMarketListings`. */
  listings: Listing[]
  loading: boolean
  /** Set when the initial load failed; the seed data stays on screen. */
  error: string | null
  /** True when writes go to the server. False keeps the old local-only behavior. */
  online: boolean
  /** Set when a background write could not reach the server. Form submits throw
   *  instead, so the form can show the message next to the button. */
  syncError: string | null
  /** Bumped after every successful load or write, so queries can refetch. */
  version: number
  reload: () => void
  getListing: (id: string) => Listing | undefined
  /** For deep links into a listing that is not in memory yet. */
  fetchListing: (id: string) => Promise<Listing | null>
  addListing: (input: ListingInput, photo?: File | null) => Promise<string>
  updateListing: (id: string, input: ListingInput, photo?: File | null) => Promise<void>
  removeListing: (id: string) => Promise<void>
}

const ListingsContext = createContext<ListingsContextValue | null>(null)

const readAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })

const messageOf = (error: unknown, fallback: string) =>
  error instanceof ApiError ? error.message : fallback

export function ListingsProvider({ children }: { children: ReactNode }) {
  const { status } = useAuth()
  const online = status === 'authenticated'

  const [listings, setListings] = useState<Listing[]>(seedListings)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [syncError, setSyncError] = useState<string | null>(null)
  const [version, setVersion] = useState(0)

  const listingsRef = useRef(listings)
  listingsRef.current = listings

  const bump = useCallback(() => setVersion((v) => v + 1), [])

  // Load the market whenever the session changes or a write invalidates it.
  useEffect(() => {
    if (!online) {
      setListings(seedListings)
      setError(null)
      setLoading(false)
      return
    }

    let cancelled = false
    const load = async () => {
      setLoading(true)
      try {
        const rows = await marketApi.listListings({ tab: 'all', limit: PAGE_SIZE })
        if (cancelled) return
        setListings(rows.map(listingFromApi))
        setError(null)
      } catch (err) {
        if (cancelled) return
        // Leave whatever is on screen rather than emptying the market.
        setError(messageOf(err, '마켓을 불러오지 못했어요.'))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [online, version])

  const reload = useCallback(() => {
    setError(null)
    setSyncError(null)
    bump()
  }, [bump])

  const getListing = useCallback(
    (id: string) => listingsRef.current.find((l) => l.id === id),
    [],
  )

  const fetchListing = useCallback(
    async (id: string) => {
      const cached = listingsRef.current.find((l) => l.id === id)
      if (cached) return cached
      if (!online) return null
      try {
        const listing = listingFromApi(await marketApi.getListing(id))
        setListings((prev) =>
          prev.some((l) => l.id === listing.id) ? prev : [listing, ...prev],
        )
        return listing
      } catch {
        return null
      }
    },
    [online],
  )

  /** The photo is a separate request: the listing has to exist before it can own
   *  an image. A failure here must not read as "the listing was not saved", or
   *  the seller retries and posts a duplicate. */
  const attachPhoto = useCallback(async (id: string, photo: File) => {
    try {
      return await marketApi.uploadListingImage(id, photo)
    } catch (err) {
      setSyncError(messageOf(err, '사진을 올리지 못했어요. 수정에서 다시 시도해 주세요.'))
      return null
    }
  }, [])

  const addListing = useCallback(
    async (input: ListingInput, photo?: File | null) => {
      if (!online) {
        const id = `u-${Date.now()}`
        const listing: Listing = {
          ...input,
          id,
          seller: '지니',
          distanceKm: 0,
          seed: `market-${id}`,
          mine: true,
          imageUrl: photo ? await readAsDataUrl(photo) : undefined,
        }
        setListings((prev) => [listing, ...prev])
        return id
      }

      const created = await marketApi.createListing(listingToPayload(input))
      const withPhoto = photo ? await attachPhoto(created.id, photo) : null
      const saved = listingFromApi(withPhoto ?? created)

      // Show it immediately — the caller navigates straight to its detail page.
      setListings((prev) => [saved, ...prev.filter((l) => l.id !== saved.id)])
      bump()
      return saved.id
    },
    [online, attachPhoto, bump],
  )

  const updateListing = useCallback(
    async (id: string, input: ListingInput, photo?: File | null) => {
      if (!online) {
        const imageUrl = photo ? await readAsDataUrl(photo) : undefined
        setListings((prev) =>
          prev.map((l) =>
            l.id === id ? { ...l, ...input, ...(imageUrl ? { imageUrl } : {}) } : l,
          ),
        )
        return
      }

      const updated = await marketApi.updateListing(id, listingToPayload(input))
      const withPhoto = photo ? await attachPhoto(id, photo) : null
      const saved = listingFromApi(withPhoto ?? updated)

      setListings((prev) => prev.map((l) => (l.id === id ? saved : l)))
      bump()
    },
    [online, attachPhoto, bump],
  )

  const removeListing = useCallback(
    async (id: string) => {
      if (online) await marketApi.deleteListing(id)
      setListings((prev) => prev.filter((l) => l.id !== id))
      if (online) bump()
    },
    [online, bump],
  )

  const value = useMemo<ListingsContextValue>(
    () => ({
      listings,
      loading,
      error,
      online,
      syncError,
      version,
      reload,
      getListing,
      fetchListing,
      addListing,
      updateListing,
      removeListing,
    }),
    [
      listings,
      loading,
      error,
      online,
      syncError,
      version,
      reload,
      getListing,
      fetchListing,
      addListing,
      updateListing,
      removeListing,
    ],
  )

  return <ListingsContext.Provider value={value}>{children}</ListingsContext.Provider>
}

export function useListings() {
  const ctx = useContext(ListingsContext)
  if (!ctx) throw new Error('useListings must be used within ListingsProvider')
  return ctx
}
