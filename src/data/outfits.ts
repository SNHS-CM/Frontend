export type GarmentType = 'top' | 'bottom'

export interface Garment {
  id: string
  type: GarmentType
  /** 화면에 보이는 옷 이름 */
  name: string
  /** 색상 이름 (색 매칭 표시/필터용) */
  color: string
  /**
   * 사진 경로 (import.meta.glob으로 모듈 URL 변환 후 할당)
   * 비워두면 사진 대신 emoji가 표시됩니다.
   */
  image?: string
  /** 사진이 없을 때 대신 보여줄 이모지 */
  emoji: string
  /** AI 색 매칭 점수 (0~100) */
  match: number
}

// Vite를 통해 assets/outfit 폴더의 이미지를 동적으로 불러옵니다.
// 경로 예시: '../assets/outfit/t1.png'
const uploadImages = import.meta.glob('../assets/outfit/*.{png,jpg,jpeg}', {
  eager: true,
  import: 'default',
}) as Record<string, string>

/**
 * garment id(예: 't1')에 대응하는 이미지 경로를 찾아 반환합니다.
 * '../assets/outfit/t1.png', '../assets/outfit/t1.jpg' 등을 자동으로 매칭합니다.
 */
function getGarmentImage(id: string): string | undefined {
  const matchedKey = Object.keys(uploadImages).find((path) => {
    const filename = path.split('/').pop()?.split('.')[0]
    return filename === id
  })

  return matchedKey ? uploadImages[matchedKey] : undefined
}

export const tops: Garment[] = [
  { id: 't1', type: 'top', name: 'long Tee', color: '검정', emoji: '👕', match: 92, image: getGarmentImage('t1') },
  { id: 't2', type: 'top', name: 'short Tee', color: '다크 브라운', emoji: '👕', match: 88, image: getGarmentImage('t2') },
  { id: 't3', type: 'top', name: 'long Tee', color: '아이보리', emoji: '👕', match: 85, image: getGarmentImage('t3') },
]

export const bottoms: Garment[] = [
  { id: 'b1', type: 'bottom', name: 'black Jeans', color: '츄리닝', emoji: '👖', match: 87, image: getGarmentImage('b1') },
  { id: 'b2', type: 'bottom', name: 'grey Jeans', color: '스카이', emoji: '👖', match: 91, image: getGarmentImage('b2') },
  { id: 'b3', type: 'bottom', name: 'Indigo Jeans', color: '맨들맨들', emoji: '👖', match: 84, image: getGarmentImage('b3') },
]

/** 처음 화면에 표시할 기본 코디 */
export const defaultOutfit = {
  topId: 't1',
  bottomId: 'b1',
}

/** 선택된 상·하의로 전체 색 매칭 점수를 계산 */
export function outfitMatch(top: Garment, bottom: Garment) {
  return Math.round((top.match + bottom.match) / 2)
}

/**
 * 상의 id + 하의 id 조합으로 코디의 고유 키를 만듭니다.
 * 북마크(즐겨찾기)를 "조합 단위"로 저장할 때 이 키를 사용합니다.
 */
export function outfitKey(topId: string, bottomId: string) {
  return `${topId}_${bottomId}`
}