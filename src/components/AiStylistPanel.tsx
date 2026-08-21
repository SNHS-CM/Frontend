/** 아웃핏 빌더의 AI 스타일리스트.
 *
 *  두 가지를 한다 — 지금 고른 조합을 평가하고, 옷장에서 다른 조합을 제안한다.
 *  둘 다 **가진 옷 안에서만** 답한다. 새로 사라는 제안은 하지 않는다.
 *
 *  여기 나오는 점수는 빌더 헤더의 점수와 다를 수 있다. 헤더 쪽은 옷마다 저장된
 *  점수의 평균이라 조합 자체를 보지 않는다.
 */

import { ArrowRight, Sparkles } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { reviewOutfit, suggestOutfits } from '../api/ai'
import { ApiError } from '../api/client'
import type { ApiOutfitReview, ApiSuggestedOutfit } from '../api/types'
import type { BuilderGarment } from '../hooks/useOutfitBuilder'
import { useI18n } from '../i18n'

export interface OutfitSelection {
  topId: string
  bottomId: string
  shoesId: string | null
}

type Mode = 'review' | 'suggest'

export default function AiStylistPanel({
  top,
  bottom,
  shoe,
  garments,
  onApply,
}: {
  top: BuilderGarment | null
  bottom: BuilderGarment | null
  shoe: BuilderGarment | null
  garments: BuilderGarment[]
  onApply: (selection: OutfitSelection) => void
}) {
  const { t } = useI18n()
  const [mode, setMode] = useState<Mode | null>(null)
  const [review, setReview] = useState<ApiOutfitReview | null>(null)
  const [suggestions, setSuggestions] = useState<ApiSuggestedOutfit[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const ready = top !== null && bottom !== null
  const comboKey = `${top?.id ?? ''}|${bottom?.id ?? ''}|${shoe?.id ?? ''}`

  // 옷을 갈아 끼우면 지난 평가는 더 이상 이 조합의 것이 아니다.
  useEffect(() => {
    setReview(null)
    if (mode === 'review') setMode(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comboKey])

  const run = useCallback(
    async (next: Mode) => {
      if (!top || !bottom) return
      setBusy(true)
      setError(null)
      setMode(next)
      try {
        if (next === 'review') {
          setReview(await reviewOutfit({ topId: top.id, bottomId: bottom.id, shoesId: shoe?.id ?? null }))
        } else {
          const res = await suggestOutfits({ limit: 3 })
          setSuggestions(res.outfits)
        }
      } catch (err) {
        setMode(null)
        setError(err instanceof ApiError ? err.message : t('ai.error.generic'))
      } finally {
        setBusy(false)
      }
    },
    [top, bottom, shoe, t],
  )

  const nameOf = (id: string) => garments.find((g) => g.id === id)?.name ?? ''

  const applySwap = () => {
    if (!review?.swap || !top || !bottom) return
    const { slot, garmentId } = review.swap
    onApply({
      topId: slot === 'top' ? garmentId : top.id,
      bottomId: slot === 'bottom' ? garmentId : bottom.id,
      shoesId: slot === 'shoes' ? garmentId : (shoe?.id ?? null),
    })
  }

  return (
    <section className="mx-5 mt-4 rounded-3xl bg-white p-4 shadow-card">
      <div className="flex items-center gap-1.5">
        <Sparkles size={16} className="text-moss-600" />
        <h2 className="flex-1 text-sm font-semibold text-ink-900">{t('ai.stylist.title')}</h2>
      </div>

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => run('review')}
          disabled={!ready || busy}
          className="flex-1 rounded-full bg-moss-700 py-2.5 text-xs font-semibold text-cream active:bg-moss-800 disabled:opacity-40"
        >
          {busy && mode === 'review' ? t('ai.stylist.working') : t('ai.stylist.review')}
        </button>
        <button
          type="button"
          onClick={() => run('suggest')}
          disabled={!ready || busy}
          className="flex-1 rounded-full border border-moss-200 py-2.5 text-xs font-medium text-moss-600 disabled:opacity-40"
        >
          {busy && mode === 'suggest' ? t('ai.stylist.working') : t('ai.stylist.suggest')}
        </button>
      </div>

      {error && (
        <p role="alert" className="mt-3 rounded-xl bg-clay-100 px-3 py-2 text-xs text-clay-600">
          {error}
        </p>
      )}

      {mode === 'review' && review && (
        <div className="mt-4">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-3xl font-medium text-ink-900">
              {review.matchScore}
            </span>
            <span className="text-xs text-moss-400">/ 100</span>
            <span className="ml-auto rounded-full bg-moss-100 px-2.5 py-1 text-[11px] font-medium text-moss-700">
              {review.verdict}
            </span>
          </div>

          <p className="mt-2 text-sm leading-relaxed text-moss-600">{review.comment}</p>

          {review.tips.length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {review.tips.map((tip) => (
                <li key={tip} className="flex gap-1.5 text-xs leading-relaxed text-moss-600">
                  <span className="text-moss-400">·</span>
                  {tip}
                </li>
              ))}
            </ul>
          )}

          {review.swap && (
            <button
              type="button"
              onClick={applySwap}
              className="mt-3 flex w-full items-center gap-2 rounded-2xl bg-moss-50 px-3 py-3 text-left active:bg-moss-100"
            >
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-ink-900">
                  {t(`ai.stylist.slot.${review.swap.slot}`)} → {review.swap.garmentName}
                  <span className="ml-1.5 text-moss-500">{review.swap.expectedScore}점</span>
                </p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-moss-500">
                  {review.swap.reason}
                </p>
              </div>
              <ArrowRight size={16} className="shrink-0 text-moss-600" />
            </button>
          )}
        </div>
      )}

      {mode === 'suggest' && (
        <div className="mt-4 space-y-2">
          {suggestions.length === 0 && !busy && (
            <p className="py-4 text-center text-xs text-moss-500">{t('ai.stylist.noSuggestions')}</p>
          )}
          {suggestions.map((outfit) => (
            <button
              key={`${outfit.topId}-${outfit.bottomId}-${outfit.shoesId ?? ''}`}
              type="button"
              onClick={() =>
                onApply({
                  topId: outfit.topId,
                  bottomId: outfit.bottomId,
                  shoesId: outfit.shoesId,
                })
              }
              className="flex w-full items-center gap-2 rounded-2xl bg-moss-50 px-3 py-3 text-left active:bg-moss-100"
            >
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-ink-900">
                  {outfit.title}
                  <span className="ml-1.5 font-normal text-moss-500">{outfit.matchScore}점</span>
                </p>
                <p className="mt-0.5 truncate text-[11px] text-moss-500">
                  {[outfit.topId, outfit.bottomId, outfit.shoesId]
                    .filter((id): id is string => Boolean(id))
                    .map(nameOf)
                    .filter(Boolean)
                    .join(' + ')}
                </p>
                <p className="mt-1 text-[11px] leading-relaxed text-moss-500">{outfit.reason}</p>
              </div>
              <ArrowRight size={16} className="shrink-0 text-moss-600" />
            </button>
          ))}
        </div>
      )}
    </section>
  )
}
