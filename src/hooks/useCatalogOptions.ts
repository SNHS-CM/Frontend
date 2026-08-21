/** 옷 종류 / 옷 컬러 선택지.
 *
 *  서버가 내려주면 그것을 쓰고, 못 받으면 `data/products.ts` 의 상수를 쓴다.
 *  선택지를 서버에서 받으면 카탈로그에 새 색이 생겨도 앱을 다시 배포하지 않아도 된다.
 */

import { useEffect, useState } from 'react'
import * as homeApi from '../api/home'
import {
  categories as localCategories,
  productColors as localColors,
  type Category,
  type ProductColor,
} from '../data/products'

interface CatalogOptions {
  categories: Category[]
  colors: { name: ProductColor; hex: string }[]
}

const LOCAL: CatalogOptions = { categories: localCategories, colors: localColors }

export function useCatalogOptions(): CatalogOptions {
  const [options, setOptions] = useState<CatalogOptions>(LOCAL)

  useEffect(() => {
    const controller = new AbortController()
    homeApi
      .getCatalogOptions(controller.signal)
      .then((res) => {
        if (controller.signal.aborted) return
        setOptions({ categories: res.categories, colors: res.colors })
      })
      .catch(() => {
        // 서버가 조용하면 상수를 그대로 쓴다.
      })
    return () => controller.abort()
  }, [])

  return options
}
