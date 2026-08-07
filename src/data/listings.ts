import { productImage } from './products'

export interface Listing {
  id: string
  name: string
  brand?: string
  seller: string
  distanceKm: number
  size: string
  price?: number
  discountedPrice?: number
  points: number
  condition: '새상품' | '거의 새것' | '사용감 조금 있음' | '사용감 있음'
  seed: string
  description?: string
  imageUrl?: string
  mine?: boolean
}

// Flat estimate of carbon saved by buying one secondhand item instead of new.
export const RESALE_CO2_ESTIMATE = 2.5

// Drop real photos into src/assets/listings/ named after a listing's `id`
// (e.g. l1.jpg, l2.png). Matching files are picked up automatically; any
// listing without one keeps its placeholder image.
const uploadedImages = import.meta.glob('../assets/listings/*.{png,jpg,jpeg,webp}', {
  eager: true,
  import: 'default',
}) as Record<string, string>

export function listingImage(id: string) {
  const match = Object.entries(uploadedImages).find(([path]) => {
    const filename = path.split('/').pop() ?? ''
    return filename.startsWith(`${id}.`)
  })
  return match?.[1]
}

// A listing's own uploaded photo wins, then a file dropped into
// src/assets/listings/, then the placeholder fallback.
export function resolveListingImage(listing: Listing, w = 600, h = 800) {
  return listing.imageUrl ?? listingImage(listing.id) ?? productImage(listing.seed, w, h)
}

export const seedListings: Listing[] = [
  {
    id: '1',
    name: 'MEDALIST 로우 스니커즈 스웨이드 앤 가죽 화이트',
    brand: 'Autry',
    seller: '김지훈',
    distanceKm: 1.2,
    size: '39',
    price: 345000,
    discountedPrice: 330000,
    points: 150,
    condition: '거의 새것',
    seed: 'market-1',
  },
  {
    id: '2',
    name: '남성 오버데님셔츠(반팔)',
    brand: 'uniqlo',
    seller: '다니에루',
    distanceKm: 2.4,
    size: 'L',
    price: 39900,
    discountedPrice: 20000,
    points: 100,
    condition: '거의 새것',
    seed: 'market-2',
  },
  {
    id: '3',
    name: '리브니트 집탑 스웨터',
    brand: 'H&M',
    seller: '알렉산드리아 에이든',
    distanceKm: 0.8,
    size: 'L',
    price: 54900,
    discountedPrice: 48000,
    points: 110,
    condition: '사용감 있음',
    seed: 'market-3',
  },
  {
    id: '4',
    name: '듀러블 롱 벌룬 팬츠 (크림)',
    brand: 'URBANSTOFF',
    seller: '가람클레어',
    distanceKm: 3.1,
    size: 'M',
    price: 55500,
    discountedPrice: 35000,
    points: 110,
    condition: '사용감 있음',
    seed: 'market-4',
  },
  {
    id: '5',
    name: '남녀공용 유니버시티 오버핏 후드 티셔츠(브라운)',
    brand: '아일랜드모던',
    seller: '가론소안',
    distanceKm: 1.7,
    size: 'Free',
    price: 35000,
    discountedPrice: 20000,
    points: 80,
    condition: '사용감 조금 있음',
    seed: 'market-5',
  },
  {
    id: '6',
    name: 'WEPON CLOTH CULOTTE PANTS',
    brand: 'YOJI YAMAMOTO',
    seller: '백은별',
    distanceKm: 0,
    size: 'M',
    price: 375000,
    discountedPrice: 360000,
    points: 90,
    condition: '새상품',
    seed: 'market-6',
    mine: true,
  },
  {
    id: '7',
    name: '후드 데님 아우터(그레이)',
    brand: '8 seconds',
    seller: '백은별',
    distanceKm: 0,
    size: 'L',
    price: 89900,
    discountedPrice: 50000,
    points: 110,
    condition: '거의 새것',
    seed: 'market-7',
    mine: true,
  },
]
