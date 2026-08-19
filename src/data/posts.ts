import { productImage } from './products'

export type OutfitCategory = '데일리' | '오피스' | '캐주얼' | '스트릿' | '미니멀' | '빈티지'

export const outfitCategories: OutfitCategory[] = [
  '데일리',
  '오피스',
  '캐주얼',
  '스트릿',
  '미니멀',
  '빈티지',
]

/** One garment worn in the outfit. */
export interface OutfitItem {
  role: '아우터' | '상의' | '하의' | '신발' | '액세서리'
  brand: string
  name: string
  size?: string
}

export interface OutfitAuthor {
  name: string
  avatarSeed: string
  /** 체형 수치 — shown so readers can judge fit against their own body. */
  heightCm: number
  weightKg: number
  usualTopSize: string
  usualBottomSize: string
}

export interface OutfitPost {
  id: string
  title: string
  description: string
  category: OutfitCategory
  author: OutfitAuthor
  /** ISO date string. */
  postedAt: string
  seed: string
  imageUrl?: string
  items: OutfitItem[]
  likes: number
  saves: number
}

// Drop real photos into src/assets/posts/ named after a post's `id`
// (e.g. d1.jpg). Matching files are picked up automatically.
const uploadedImages = import.meta.glob('../assets/posts/*.{png,jpg,jpeg,webp}', {
  eager: true,
  import: 'default',
}) as Record<string, string>

export function postImage(id: string) {
  const match = Object.entries(uploadedImages).find(([path]) => {
    const filename = path.split('/').pop() ?? ''
    return filename.startsWith(`${id}.`)
  })
  return match?.[1]
}

export function resolvePostImage(post: OutfitPost, w = 600, h = 800) {
  return post.imageUrl ?? postImage(post.id) ?? productImage(post.seed, w, h)
}

export function authorAvatar(author: OutfitAuthor, size = 100) {
  return `https://picsum.photos/seed/${author.avatarSeed}/${size}/${size}`
}

/** "3일 전" for anything within a month, otherwise an absolute date. */
export function formatPostedAt(iso: string) {
  const posted = new Date(iso)
  const diffMs = Date.now() - posted.getTime()
  const diffDays = Math.floor(diffMs / 86_400_000)

  if (diffDays <= 0) {
    const diffHours = Math.floor(diffMs / 3_600_000)
    if (diffHours <= 0) return '방금 전'
    return `${diffHours}시간 전`
  }
  if (diffDays < 30) return `${diffDays}일 전`
  return posted.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
}

function daysAgo(days: number) {
  return new Date(Date.now() - days * 86_400_000).toISOString()
}

export const posts: OutfitPost[] = [
  {
    id: 'd1',
    title: '장마철에도 산뜻하게, 린넨 셋업',
    description: '습한 날엔 붙지 않는 소재가 최고예요. 통기성 좋은 린넨으로 위아래 맞췄습니다.',
    category: '데일리',
    author: {
      name: '백은별',
      avatarSeed: 'author-eunbyul',
      heightCm: 163,
      weightKg: 48,
      usualTopSize: 'S',
      usualBottomSize: '26',
    },
    postedAt: daysAgo(1),
    seed: 'outfit-1',
    items: [
      { role: '상의', brand: 'REWEAVE', name: '오가닉 린넨 셔츠', size: 'S' },
      { role: '하의', brand: 'SOIL', name: '헴프 와이드 팬츠', size: '26' },
      { role: '신발', brand: 'Autry', name: 'MEDALIST 로우 스니커즈', size: '235' },
    ],
    likes: 342,
    saves: 88,
  },
  {
    id: 'd2',
    title: '출근룩도 중고로 충분해요',
    description: '트렌치 하나면 셔츠가 뭐든 정돈돼 보여요. 전부 리세일로 구한 조합입니다.',
    category: '오피스',
    author: {
      name: '가람클레어',
      avatarSeed: 'author-garam',
      heightCm: 172,
      weightKg: 61,
      usualTopSize: 'M',
      usualBottomSize: '30',
    },
    postedAt: daysAgo(3),
    seed: 'outfit-2',
    items: [
      { role: '아우터', brand: 'FIELD NOTE', name: '베이지 트렌치 코트', size: 'L' },
      { role: '상의', brand: 'uniqlo', name: '코튼 옥스포드 셔츠', size: 'M' },
      { role: '하의', brand: 'URBANSTOFF', name: '듀러블 롱 벌룬 팬츠', size: 'M' },
    ],
    likes: 511,
    saves: 176,
  },
  {
    id: 'd3',
    title: '데님 온 데님, 톤만 다르게',
    description: '같은 데님이라도 워싱 차이를 두면 답답해 보이지 않아요.',
    category: '캐주얼',
    author: {
      name: '다니에루',
      avatarSeed: 'author-daniel',
      heightCm: 180,
      weightKg: 72,
      usualTopSize: 'L',
      usualBottomSize: '32',
    },
    postedAt: daysAgo(5),
    seed: 'outfit-3',
    items: [
      { role: '아우터', brand: '8 seconds', name: '후드 데님 아우터', size: 'L' },
      { role: '상의', brand: 'uniqlo', name: '남성 오버데님셔츠(반팔)', size: 'L' },
      { role: '하의', brand: 'LOOP', name: '데드스톡 스트레이트 데님', size: '32' },
    ],
    likes: 268,
    saves: 64,
  },
  {
    id: 'd4',
    title: '오버핏 후디 하나로 끝내는 주말',
    description: '큰 후디엔 밑단이 정리된 팬츠를 매치하면 실루엣이 살아요.',
    category: '스트릿',
    author: {
      name: '가론소안',
      avatarSeed: 'author-garon',
      heightCm: 176,
      weightKg: 66,
      usualTopSize: 'Free',
      usualBottomSize: '31',
    },
    postedAt: daysAgo(7),
    seed: 'outfit-4',
    items: [
      { role: '상의', brand: '아일랜드모던', name: '유니버시티 오버핏 후드 티셔츠', size: 'Free' },
      { role: '하의', brand: 'LOOP', name: '업사이클 카고 팬츠', size: '31' },
      { role: '액세서리', brand: 'SOIL', name: '리사이클 나일론 크로스백' },
    ],
    likes: 733,
    saves: 251,
  },
  {
    id: 'd5',
    title: '무채색 세 가지로만 입기',
    description: '색을 줄이면 소재가 보여요. 니트 질감 하나로 포인트 줬습니다.',
    category: '미니멀',
    author: {
      name: '알렉산드리아 에이든',
      avatarSeed: 'author-alex',
      heightCm: 168,
      weightKg: 54,
      usualTopSize: 'M',
      usualBottomSize: '28',
    },
    postedAt: daysAgo(11),
    seed: 'outfit-5',
    items: [
      { role: '상의', brand: 'H&M', name: '리브니트 집탑 스웨터', size: 'L' },
      { role: '하의', brand: 'LOOP', name: '텐셀 미디 스커트', size: 'M' },
      { role: '신발', brand: 'REWEAVE', name: '코튼 캔버스 스니커즈', size: '245' },
    ],
    likes: 419,
    saves: 132,
  },
  {
    id: 'd6',
    title: '90년대 워크자켓 그대로 입기',
    description: '수선 없이 사이즈만 맞으면 그 시절 핏이 제일 예뻐요.',
    category: '빈티지',
    author: {
      name: '김지훈',
      avatarSeed: 'author-jihoon',
      heightCm: 174,
      weightKg: 68,
      usualTopSize: 'M',
      usualBottomSize: '31',
    },
    postedAt: daysAgo(16),
    seed: 'outfit-6',
    items: [
      { role: '아우터', brand: 'LOOP', name: '데드스톡 데님 자켓', size: 'M' },
      { role: '하의', brand: 'YOJI YAMAMOTO', name: 'WEPON CLOTH CULOTTE PANTS', size: 'M' },
      { role: '신발', brand: 'Autry', name: 'MEDALIST 로우 스니커즈', size: '265' },
    ],
    likes: 892,
    saves: 340,
  },
  {
    id: 'd7',
    title: '키 작아도 와이드 팬츠 입는 법',
    description: '밑위가 높은 걸 고르고 상의를 넣으면 다리가 길어 보여요.',
    category: '데일리',
    author: {
      name: '백은별',
      avatarSeed: 'author-eunbyul',
      heightCm: 163,
      weightKg: 48,
      usualTopSize: 'S',
      usualBottomSize: '26',
    },
    postedAt: daysAgo(21),
    seed: 'outfit-7',
    items: [
      { role: '상의', brand: 'FIELD NOTE', name: '베이직 리브 니트', size: 'S' },
      { role: '하의', brand: 'SOIL', name: '헴프 와이드 팬츠', size: '26' },
      { role: '액세서리', brand: 'SOIL', name: '코르크 소재 벨트' },
    ],
    likes: 1204,
    saves: 502,
  },
  {
    id: 'd8',
    title: '면접용 셋업, 딱딱하지 않게',
    description: '완전한 정장 대신 울 혼방 셋업으로 힘을 뺐어요.',
    category: '오피스',
    author: {
      name: '가람클레어',
      avatarSeed: 'author-garam',
      heightCm: 172,
      weightKg: 61,
      usualTopSize: 'M',
      usualBottomSize: '30',
    },
    postedAt: daysAgo(29),
    seed: 'outfit-8',
    items: [
      { role: '아우터', brand: 'FIELD NOTE', name: '리사이클 울 코트', size: 'M' },
      { role: '상의', brand: 'REWEAVE', name: '오가닉 코튼 오버셔츠', size: 'M' },
      { role: '하의', brand: 'URBANSTOFF', name: '울 혼방 슬랙스', size: '30' },
    ],
    likes: 187,
    saves: 41,
  },
]

/** Every brand mentioned across all posts, for the filter sheet. */
export const postBrands = [...new Set(posts.flatMap((p) => p.items.map((i) => i.brand)))].sort()

export interface HeightRange {
  label: string
  min: number
  max: number
}

export const heightRanges: HeightRange[] = [
  { label: '~165cm', min: 0, max: 165 },
  { label: '165–172cm', min: 165, max: 172 },
  { label: '172–178cm', min: 172, max: 178 },
  { label: '178cm~', min: 178, max: 999 },
]
