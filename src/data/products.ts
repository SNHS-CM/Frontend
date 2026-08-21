import { assetUrl } from '../api/client'
import type { ApiProduct } from '../api/types'
import { clothingPhoto } from './placeholder'

export type Category = '아우터' | '상의' | '하의' | '원피스' | '액세서리'
export type ProductColor = '블랙' | '화이트' | '베이지' | '그레이' | '그린' | '블루' | '브라운'
export type Season = '봄' | '여름' | '가을' | '겨울' | '사계절'

export interface Product {
  id: string
  name: string
  brand: string
  price: number
  category: Category
  color: ProductColor
  season: Season
  material: string
  co2: number
  rating: number
  seed: string
  tag?: '신상' | '베스트' | '세일'
  /** 서버에 업로드된 옷 사진. 없으면 seed 로 플레이스홀더를 만든다. */
  imageUrl?: string
  description?: string
}

export const categories: Category[] = ['아우터', '상의', '하의', '원피스', '액세서리']

/** Swatch hexes are for the filter dots only — they are not theme tokens. */
export const productColors: { name: ProductColor; hex: string }[] = [
  { name: '블랙', hex: '#2b2b2b' },
  { name: '화이트', hex: '#f5f3ec' },
  { name: '베이지', hex: '#ded0b3' },
  { name: '그레이', hex: '#9b9b95' },
  { name: '그린', hex: '#566d38' },
  { name: '블루', hex: '#4a6b8a' },
  { name: '브라운', hex: '#8a6a4a' },
]

/** Which season the app should promote right now. */
export function currentSeason(date = new Date()): Season {
  const m = date.getMonth() + 1
  if (m >= 3 && m <= 5) return '봄'
  if (m >= 6 && m <= 8) return '여름'
  if (m >= 9 && m <= 11) return '가을'
  return '겨울'
}

export const products: Product[] = [
  {
    id: 'p1',
    name: '오가닉 코튼 오버셔츠',
    brand: 'REWEAVE',
    price: 68000,
    category: '상의',
    color: '베이지',
    season: '사계절',
    material: '오가닉 코튼 100%',
    co2: 3.2,
    rating: 4.8,
    seed: 'fashion-1',
    tag: '베스트',
  },
  {
    id: 'p2',
    name: '리사이클 울 코트',
    brand: 'FIELD NOTE',
    price: 219000,
    category: '아우터',
    color: '그레이',
    season: '겨울',
    material: '재생 울 70%',
    co2: 8.6,
    rating: 4.9,
    seed: 'fashion-2',
    tag: '신상',
  },
  {
    id: 'p3',
    name: '헴프 와이드 팬츠',
    brand: 'SOIL',
    price: 89000,
    category: '하의',
    color: '베이지',
    season: '여름',
    material: '헴프 55% · 코튼 45%',
    co2: 4.1,
    rating: 4.6,
    seed: 'fashion-3',
  },
  {
    id: 'p4',
    name: '린넨 셔츠 원피스',
    brand: 'REWEAVE',
    price: 128000,
    category: '원피스',
    color: '화이트',
    season: '여름',
    material: '유러피안 린넨 100%',
    co2: 5.4,
    rating: 4.7,
    seed: 'fashion-4',
    tag: '신상',
  },
  {
    id: 'p5',
    name: '데드스톡 데님 자켓',
    brand: 'LOOP',
    price: 156000,
    category: '아우터',
    color: '블루',
    season: '봄',
    material: '데드스톡 데님',
    co2: 6.9,
    rating: 4.8,
    seed: 'fashion-5',
  },
  {
    id: 'p6',
    name: '리사이클 나일론 크로스백',
    brand: 'SOIL',
    price: 74000,
    category: '액세서리',
    color: '블랙',
    season: '사계절',
    material: '리사이클 나일론',
    co2: 2.1,
    rating: 4.5,
    seed: 'fashion-6',
    tag: '세일',
  },
  {
    id: 'p7',
    name: '베이직 리브 니트',
    brand: 'FIELD NOTE',
    price: 59000,
    category: '상의',
    color: '그레이',
    season: '가을',
    material: '유기농 울 혼방',
    co2: 3.8,
    rating: 4.6,
    seed: 'fashion-7',
  },
  {
    id: 'p8',
    name: '텐셀 미디 스커트',
    brand: 'LOOP',
    price: 79000,
    category: '하의',
    color: '브라운',
    season: '여름',
    material: '텐셀 라이오셀',
    co2: 3.0,
    rating: 4.4,
    seed: 'fashion-8',
  },
  {
    id: 'p9',
    name: '코튼 랩 원피스',
    brand: 'REWEAVE',
    price: 99000,
    category: '원피스',
    color: '그린',
    season: '여름',
    material: '오가닉 코튼 100%',
    co2: 4.5,
    rating: 4.7,
    seed: 'fashion-9',
    tag: '베스트',
  },
  {
    id: 'p10',
    name: '업사이클 카고 팬츠',
    brand: 'LOOP',
    price: 112000,
    category: '하의',
    color: '그린',
    season: '가을',
    material: '업사이클 원단',
    co2: 5.0,
    rating: 4.6,
    seed: 'fashion-10',
  },
  {
    id: 'p11',
    name: '코르크 소재 벨트',
    brand: 'SOIL',
    price: 39000,
    category: '액세서리',
    color: '브라운',
    season: '사계절',
    material: '천연 코르크',
    co2: 1.4,
    rating: 4.3,
    seed: 'fashion-11',
  },
  {
    id: 'p12',
    name: '플리스 집업 자켓',
    brand: 'FIELD NOTE',
    price: 134000,
    category: '아우터',
    color: '블랙',
    season: '겨울',
    material: '재생 폴리에스터',
    co2: 6.2,
    rating: 4.7,
    seed: 'fashion-12',
    tag: '세일',
  },
]

export function productImage(seed: string, w = 600, h = 800) {
  return clothingPhoto(seed, w, h)
}

/** 카드와 상세 화면이 쓸 사진 한 장. 업로드본이 있으면 그것을, 없으면 seed 로
 *  만든 플레이스홀더를 돌려준다. */
export function resolveProductImage(product: Product, w = 600, h = 800) {
  return product.imageUrl || productImage(product.seed, w, h)
}

/** 백엔드 ProductOut -> 화면이 쓰는 Product. */
export function productFromApi(dto: ApiProduct): Product {
  return {
    id: dto.id,
    name: dto.name,
    brand: dto.brand,
    price: dto.price,
    category: dto.category,
    color: dto.color,
    season: dto.season,
    material: dto.material,
    co2: dto.co2,
    rating: dto.rating,
    seed: dto.seed,
    tag: dto.tag ?? undefined,
    // '/media/...' 는 API 호스트 기준이라 dev 서버 주소로 붙이면 안 된다.
    imageUrl: dto.imageUrl ? assetUrl(dto.imageUrl) : undefined,
    description: dto.description || undefined,
  }
}

export function formatKRW(value: number) {
  return `${value.toLocaleString('ko-KR')}원`
}
