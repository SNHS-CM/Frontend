/** 디스커버 필터 시트의 선택지.
 *
 *  브랜드는 실제로 올라온 코디에서 뽑는 값이라 서버가 준 것을 써야 맞다.
 *  못 받으면 `data/posts.ts` 의 시드에서 뽑은 상수로 돌아간다 (오프라인 모드).
 */

import { useEffect, useState } from 'react'
import * as discoverApi from '../api/discover'
import {
  heightRanges as localHeightRanges,
  outfitCategories as localCategories,
  postBrands as localBrands,
  type HeightRange,
  type OutfitCategory,
} from '../data/posts'

interface DiscoverFilterOptions {
  categories: OutfitCategory[]
  brands: string[]
  heightRanges: HeightRange[]
}

const LOCAL: DiscoverFilterOptions = {
  categories: localCategories,
  brands: localBrands,
  heightRanges: localHeightRanges,
}

export function useDiscoverFilters(): DiscoverFilterOptions {
  const [options, setOptions] = useState<DiscoverFilterOptions>(LOCAL)

  useEffect(() => {
    const controller = new AbortController()
    discoverApi
      .getFilters(controller.signal)
      .then((res) => {
        if (controller.signal.aborted) return
        setOptions({
          categories: res.categories,
          // 글이 하나도 없으면 브랜드도 빈 배열이다. 그때는 시트에 아무것도
          // 안 그리는 게 맞다 — 시드 브랜드를 보여주면 눌러도 결과가 없다.
          brands: res.brands,
          heightRanges: res.heightRanges.map((r) => ({
            label: r.label,
            min: r.min,
            max: r.max,
          })),
        })
      })
      .catch(() => {
        // 서버가 조용하면 상수를 그대로 쓴다.
      })
    return () => controller.abort()
  }, [])

  return options
}
