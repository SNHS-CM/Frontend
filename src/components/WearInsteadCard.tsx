/** 상품 상세의 '사지 말고 입기'.
 *
 *  이 앱의 온보딩 세 번째 장이 "순환되는 옷장" 이다. 그 문장을 기능으로 만든 것으로,
 *  사려는 옷을 옷장의 조합으로 대신할 수 있는지 물어본다.
 *
 *  대체할 수 없으면 서버가 그렇게 답하고, 그때는 사도 괜찮다고 말한다. 억지로
 *  안 어울리는 조합을 들이밀면 사용자가 이 기능을 다시 믿지 않는다.
 */

import { Leaf, Recycle } from 'lucide-react'
import { useState } from 'react'
import { wearInstead } from '../api/ai'
import { ApiError } from '../api/client'
import type { ApiWearInstead } from '../api/types'
import { useI18n } from '../i18n'

export default function WearInsteadCard({ productId }: { productId: string }) {
  const { t } = useI18n()
  const [result, setResult] = useState<ApiWearInstead | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const ask = async () => {
    setBusy(true)
    setError(null)
    try {
      setResult(await wearInstead(productId))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('ai.error.generic'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="rounded-2xl bg-moss-700 p-4 text-cream shadow-card">
      <div className="flex items-center gap-2">
        <Recycle size={17} />
        <h2 className="flex-1 text-sm font-semibold">{t('ai.eco.title')}</h2>
      </div>
      <p className="mt-1.5 text-xs leading-relaxed text-sand-100/85">{t('ai.eco.sub')}</p>

      {!result && (
        <button
          type="button"
          onClick={ask}
          disabled={busy}
          className="mt-3 w-full rounded-full bg-cream py-2.5 text-xs font-semibold text-moss-800 active:opacity-90 disabled:opacity-50"
        >
          {busy ? t('ai.eco.checking') : t('ai.eco.check')}
        </button>
      )}

      {error && (
        <p role="alert" className="mt-3 rounded-xl bg-clay-100 px-3 py-2 text-xs text-clay-600">
          {error}
        </p>
      )}

      {result?.canSubstitute && result.look && (
        <div className="mt-3 rounded-xl bg-sand-50/12 p-3">
          <p className="text-xs font-semibold">{result.look.title}</p>
          <p className="mt-0.5 text-[11px] text-sand-100/85">
            {result.look.garmentNames.join(' + ')}
          </p>
          <p className="mt-1.5 text-[11px] leading-relaxed text-sand-100/85">
            {result.look.reason}
          </p>

          <p className="mt-2.5 flex items-center gap-1.5 border-t border-sand-50/20 pt-2.5 text-[11px] font-medium">
            <Leaf size={13} />
            {t('ai.eco.saved', {
              kg: result.co2AvoidedKg.toFixed(1),
              n: result.ecoPoints,
            })}
          </p>
        </div>
      )}

      {result && !result.canSubstitute && (
        <p className="mt-3 rounded-xl bg-sand-50/12 px-3 py-2.5 text-[11px] leading-relaxed text-sand-100/90">
          {result.message}
        </p>
      )}

      {result?.canSubstitute && result.message && (
        <p className="mt-2 text-[11px] leading-relaxed text-sand-100/85">{result.message}</p>
      )}
    </section>
  )
}
