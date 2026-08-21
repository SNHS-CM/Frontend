/** 홈 화면의 검색 + 카테고리/컬러 필터.
 *
 *  검색어나 필터가 하나라도 있으면 화면이 큐레이션 구획 대신 평평한 그리드로
 *  바뀌는데, 그 목록을 서버가 골라 준다. 오프라인이면 같은 조건을 메모리의
 *  상품 목록에 적용해 화면이 비지 않게 한다.
 */

import { useEffect, useMemo, useState } from 'react'
import { ApiError } from '../api/client'
import * as homeApi from '../api/home'
import { useAuth } from '../context/AuthContext'
import { productFromApi, products, type Product } from '../data/products'
import type { CategoryFilterValue } from '../components/CategoryFilter'

/** 한 단어를 한 번의 요청으로 묶을 만큼 짧게. */
const DEBOUNCE_MS = 250
const PAGE_SIZE = 100

interface ProductSearch {
  items: Product[]
  total: number
  loading: boolean
  error: string | null
}

export function useProductSearch(
  query: string,
  filters: CategoryFilterValue,
  enabled: boolean,
): ProductSearch {
  const { status } = useAuth()
  const online = status === 'authenticated'

  const [serverRows, setServerRows] = useState<{ items: Product[]; total: number } | null>(
    null,
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 빈 선택은 "그 축에는 제한 없음" — 서버와 같은 규칙이다.
  const localRows = useMemo(() => {
    if (!enabled) return []
    const needle = query.trim().toLowerCase()
    return products.filter((p) => {
      const matchesCategory =
        filters.categories.length === 0 || filters.categories.includes(p.category)
      const matchesColor = filters.colors.length === 0 || filters.colors.includes(p.color)
      const matchesQuery = needle
        ? p.name.toLowerCase().includes(needle) || p.brand.toLowerCase().includes(needle)
        : true
      return matchesCategory && matchesColor && matchesQuery
    })
  }, [enabled, query, filters])

  // 배열을 의존성에 그대로 넣으면 매 렌더 새 참조라 요청이 반복된다.
  const categoryKey = filters.categories.join(',')
  const colorKey = filters.colors.join(',')

  useEffect(() => {
    if (!enabled || !online) {
      setServerRows(null)
      setError(null)
      setLoading(false)
      return
    }

    const controller = new AbortController()
    // 타이핑만 지연시킨다. 필터 선택은 바로 반영되는 편이 자연스럽다.
    const delay = query.trim() ? DEBOUNCE_MS : 0

    const timer = setTimeout(() => {
      setLoading(true)
      homeApi
        .listProducts(
          {
            q: query,
            categories: categoryKey ? categoryKey.split(',') : [],
            colors: colorKey ? colorKey.split(',') : [],
            limit: PAGE_SIZE,
          },
          controller.signal,
        )
        .then((page) => {
          if (controller.signal.aborted) return
          setServerRows({ items: page.items.map(productFromApi), total: page.total })
          setError(null)
        })
        .catch((err: unknown) => {
          // 취소된 요청은 지나간 키 입력일 뿐 실패가 아니다.
          if (controller.signal.aborted) return
          setServerRows(null) // 메모리 목록으로 폴백
          setError(err instanceof ApiError ? err.message : '상품을 불러오지 못했어요.')
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false)
        })
    }, delay)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [enabled, online, query, categoryKey, colorKey])

  if (serverRows) {
    return { items: serverRows.items, total: serverRows.total, loading, error }
  }
  return { items: localRows, total: localRows.length, loading, error }
}
