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

// --- 홈 화면 ----------------------------------------------------------------

export type ApiCategory = '아우터' | '상의' | '하의' | '원피스' | '액세서리'
export type ApiProductColor =
  | '블랙'
  | '화이트'
  | '베이지'
  | '그레이'
  | '그린'
  | '블루'
  | '브라운'
export type ApiSeason = '봄' | '여름' | '가을' | '겨울' | '사계절'
export type ApiProductTag = '신상' | '베스트' | '세일'

/** 상품 카탈로그 한 건. 백엔드 ProductOut 과 1:1. */
export interface ApiProduct {
  id: string
  /** 옷 이름 / 옷 판매자(브랜드) */
  name: string
  brand: string
  price: number
  /** 옷 종류 / 옷 컬러 / 시즌 */
  category: ApiCategory
  color: ApiProductColor
  season: ApiSeason
  material: string
  description: string
  co2: number
  rating: number
  /** 업로드한 옷 사진. 비어 있으면 seed 로 플레이스홀더를 만든다. */
  imageUrl: string
  seed: string
  tag: ApiProductTag | null
  /** 보는 사람 기준 표시 — 상세 화면의 좋아요 / 즐겨찾기 */
  liked: boolean
  saved: boolean
}

export interface ApiProductPage {
  items: ApiProduct[]
  total: number
  limit: number
  offset: number
}

export interface ApiColorOption {
  name: ApiProductColor
  hex: string
}

/** 필터 시트가 그릴 선택지. */
export interface ApiCatalogOptions {
  categories: ApiCategory[]
  colors: ApiColorOption[]
  seasons: ApiSeason[]
  tags: ApiProductTag[]
}

/** 옷 판매자 — 카탈로그 브랜드와 마켓 회원. */
export interface ApiSeller {
  name: string
  kind: 'brand' | 'member'
  productCount: number
}

// --- 좋아요 / 즐겨찾기 ------------------------------------------------------

export type ApiFavoriteKind = 'product' | 'listing' | 'post'

export interface ApiFavorite {
  kind: ApiFavoriteKind
  targetId: string
  liked: boolean
  saved: boolean
  likedAt: string | null
  savedAt: string | null
}

/** 'product:p1' 형식 — 화면 전체의 하트/북마크를 한 번에 칠한다. */
export interface ApiFavoriteKeys {
  likedKeys: string[]
  savedKeys: string[]
}

// --- 홈 피드 ----------------------------------------------------------------

export interface ApiHomeGreeting {
  name: string
  photo: string
  unreadMessages: number
  savedCount: number
}

export interface ApiEcoSummary {
  co2SavedKg: number
  ecoPoints: number
  /** 나무 몇 그루를 심은 효과인지 */
  treesEquivalent: number
}

export interface ApiRecommendedProduct {
  product: ApiProduct
  /** 왜 추천됐는지 — 카드 위 뱃지 문구 */
  reason: string
  score: number
}

export interface ApiHomeFeed {
  greeting: ApiHomeGreeting
  eco: ApiEcoSummary
  /** 사용자 분석 알고리즘 결과 */
  recommendations: ApiRecommendedProduct[]
  /** 취향 신호가 아직 없으면 false — 부제목 문구가 달라진다 */
  hasSignal: boolean
  season: ApiSeason
  seasonPicks: ApiProduct[]
  newArrivals: ApiProduct[]
}

// --- 디스커버 ----------------------------------------------------------------

export type ApiOutfitCategory = '데일리' | '오피스' | '캐주얼' | '스트릿' | '미니멀' | '빈티지'
export type ApiPostItemRole = '아우터' | '상의' | '하의' | '신발' | '액세서리'
export type ApiPostSort = 'recent' | 'popular'

/** 코디에 쓰인 옷 한 벌 — 옷 정보와 브랜드. */
export interface ApiPostItem {
  role: ApiPostItemRole
  brand: string
  name: string
  size: string
}

/** 올린 사람 + 체형 수치. 글에 복사된 값이라 작성자가 프로필을 고쳐도 그대로다. */
export interface ApiPostAuthor {
  id: string
  name: string
  avatarSeed: string
  heightCm: number
  weightKg: number
  usualTopSize: string
  usualBottomSize: string
}

/** 디스커버 코디 글. 백엔드 PostOut 과 1:1. */
export interface ApiPost {
  id: string
  title: string
  description: string
  category: ApiOutfitCategory
  author: ApiPostAuthor
  postedAt: string
  /** 사진이 없을 때 쓰는 플레이스홀더 시드 */
  seed: string
  imageUrl: string
  items: ApiPostItem[]
  likes: number
  saves: number
  shares: number
  /** 보는 사람 기준 — 같은 글도 사람마다 다르다 */
  liked: boolean
  saved: boolean
  mine: boolean
}

export interface ApiHeightRange {
  label: string
  min: number
  max: number
}

export interface ApiSortOption {
  value: ApiPostSort
  label: string
}

/** 필터 시트가 그릴 선택지. 브랜드는 올라온 글에서 뽑은 것이라 서버가 준다. */
export interface ApiDiscoverFilters {
  categories: ApiOutfitCategory[]
  brands: string[]
  heightRanges: ApiHeightRange[]
  sorts: ApiSortOption[]
  roles: ApiPostItemRole[]
}

// --- AI ---------------------------------------------------------------------

/** `GET /api/ai/status` — 키가 없으면 enabled=false 라 AI 버튼을 숨긴다. */
export interface ApiAiStatus {
  enabled: boolean
  model: string
}

/** 사진에서 뽑은 옷 등록 초안. 그대로 `POST /api/garments` 에 넣을 수 있다. */
export interface ApiGarmentDraft {
  type: GarmentType
  name: string
  color: string
  colorHex: string
  material: string
  style: string
  fit: string
  emoji: string
  matchScore: number
  co2SavedKg: number
  imageUrl: string
}

export interface ApiGarmentAnalysis {
  isGarment: boolean
  imageUrl: string
  draft: ApiGarmentDraft | null
  /** 매치 힌트, 또는 인식 실패 이유 */
  note: string
}

export interface ApiSuggestedOutfit {
  topId: string
  bottomId: string
  shoesId: string | null
  title: string
  reason: string
  matchScore: number
}

/** 옷장 안에서 찾은 대안. 새로 사라는 제안이 아니다. */
export interface ApiOutfitSwap {
  slot: 'top' | 'bottom' | 'shoes'
  garmentId: string
  garmentName: string
  reason: string
  expectedScore: number
}

export interface ApiOutfitReview {
  matchScore: number
  verdict: string
  comment: string
  tips: string[]
  swap: ApiOutfitSwap | null
}

export interface ApiSubstituteLook {
  garmentIds: string[]
  garmentNames: string[]
  title: string
  reason: string
}

/** '사지 말고 입기' — canSubstitute 가 false 면 솔직하게 못 한다고 답한 것이다. */
export interface ApiWearInstead {
  canSubstitute: boolean
  similarity: number
  look: ApiSubstituteLook | null
  co2AvoidedKg: number
  ecoPoints: number
  message: string
}
