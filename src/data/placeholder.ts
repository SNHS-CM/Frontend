/** 사진이 없을 때 쓰는 플레이스홀더 이미지.
 *
 *  picsum 은 무작위 풍경 사진을 주기 때문에 옷 앱 화면과 전혀 맞지 않았다.
 *  loremflickr 는 키워드로 주제를 고를 수 있고, `lock` 이 같으면 언제나 같은
 *  사진을 돌려주므로 새로고침해도 카드 사진이 바뀌지 않는다.
 *
 *  실제 사진(업로드본, `src/assets/**` 에 넣은 파일)이 있으면 언제나 그쪽이
 *  먼저다. 여기 있는 함수들은 마지막 폴백이다.
 */

const HOST = 'https://loremflickr.com'

/** 문자열 seed 를 안정적인 양수로. 같은 seed 는 항상 같은 사진이 된다. */
function lockOf(seed: string): number {
  let hash = 0
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0
  }
  return Math.abs(hash) % 100_000
}

function photo(keywords: string, seed: string, w: number, h: number) {
  return `${HOST}/${w}/${h}/${keywords}?lock=${lockOf(seed)}`
}

/** 옷 한 점 — 상품 카드, 판매글 썸네일. */
export const clothingPhoto = (seed: string, w = 600, h = 800) =>
  photo('fashion,clothing,apparel', seed, w, h)

/** 사람이 입고 있는 착장 — 디스커버 코디. */
export const outfitPhoto = (seed: string, w = 600, h = 800) =>
  photo('fashion,outfit,streetstyle', seed, w, h)

/** 프로필 사진. */
export const avatarPhoto = (seed: string, size = 100) =>
  photo('portrait,person', seed, size, size)
