import { createContext, useContext, useState, type ReactNode } from 'react'
import { seedListings, type Listing } from '../data/listings'

export type ListingInput = Omit<Listing, 'id' | 'seller' | 'distanceKm' | 'mine' | 'seed'>

interface ListingsContextValue {
  listings: Listing[]
  getListing: (id: string) => Listing | undefined
  addListing: (input: ListingInput) => string
  updateListing: (id: string, input: ListingInput) => void
}

const ListingsContext = createContext<ListingsContextValue | null>(null)

export function ListingsProvider({ children }: { children: ReactNode }) {
  const [listings, setListings] = useState<Listing[]>(seedListings)

  const getListing = (id: string) => listings.find((l) => l.id === id)

  const addListing = (input: ListingInput) => {
    const id = `u-${Date.now()}`
    const listing: Listing = {
      ...input,
      id,
      seller: '지니',
      distanceKm: 0,
      seed: `market-${id}`,
      mine: true,
    }
    setListings((prev) => [listing, ...prev])
    return id
  }

  const updateListing = (id: string, input: ListingInput) => {
    setListings((prev) => prev.map((l) => (l.id === id ? { ...l, ...input } : l)))
  }

  return (
    <ListingsContext.Provider value={{ listings, getListing, addListing, updateListing }}>
      {children}
    </ListingsContext.Provider>
  )
}

export function useListings() {
  const ctx = useContext(ListingsContext)
  if (!ctx) throw new Error('useListings must be used within ListingsProvider')
  return ctx
}
