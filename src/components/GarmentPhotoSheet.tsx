/** 옷 사진 한 장으로 옷장에 등록하는 시트.
 *
 *  서버가 사진에서 뽑아 준 초안을 그대로 보여주고, 사용자가 확인·수정한 뒤
 *  등록한다. 인식이 틀릴 수 있으므로 자동으로 저장하지 않는다.
 */

import { Sparkles } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { analyzeGarmentPhoto } from '../api/ai'
import { ApiError, assetUrl } from '../api/client'
import { createGarment } from '../api/outfits'
import type { ApiGarmentDraft } from '../api/types'
import Sheet from './Sheet'
import { useI18n } from '../i18n'

export default function GarmentPhotoSheet({
  file,
  onClose,
  onCreated,
}: {
  file: File
  onClose: () => void
  onCreated: () => void
}) {
  const { t } = useI18n()
  const [draft, setDraft] = useState<ApiGarmentDraft | null>(null)
  const [note, setNote] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(true)
  const [saving, setSaving] = useState(false)

  // 미리보기는 업로드가 끝나기 전에도 보여 준다.
  const previewUrl = useRef(URL.createObjectURL(file))
  useEffect(() => {
    const url = previewUrl.current
    return () => URL.revokeObjectURL(url)
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    setBusy(true)
    analyzeGarmentPhoto(file, controller.signal)
      .then((res) => {
        if (controller.signal.aborted) return
        setDraft(res.draft)
        setNote(res.note)
        setError(null)
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return
        if (err instanceof DOMException && err.name === 'AbortError') return
        setError(err instanceof ApiError ? err.message : t('ai.error.generic'))
      })
      .finally(() => {
        if (!controller.signal.aborted) setBusy(false)
      })

    return () => controller.abort()
  }, [file, t])

  const submit = async () => {
    if (!draft) return
    setSaving(true)
    setError(null)
    try {
      await createGarment({
        type: draft.type,
        name: draft.name.trim(),
        color: draft.color,
        colorHex: draft.colorHex,
        style: draft.style,
        fit: draft.fit,
        emoji: draft.emoji,
        matchScore: draft.matchScore,
        co2SavedKg: draft.co2SavedKg,
        imageUrl: draft.imageUrl,
      })
      onCreated()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('ai.error.generic'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet
      title={t('ai.garment.title')}
      onClose={onClose}
      footer={
        draft && (
          <button
            type="button"
            onClick={submit}
            disabled={saving || draft.name.trim() === ''}
            className="w-full rounded-full bg-moss-700 py-3.5 text-sm font-semibold text-cream active:bg-moss-800 disabled:opacity-40"
          >
            {saving ? t('ai.garment.saving') : t('ai.garment.save')}
          </button>
        )
      }
    >
      <div className="px-5">
        <div className="flex justify-center rounded-2xl bg-white p-4 shadow-card">
          <img
            src={draft ? assetUrl(draft.imageUrl) : previewUrl.current}
            alt=""
            className="max-h-56 w-auto object-contain"
          />
        </div>

        {busy && (
          <p className="mt-4 flex items-center justify-center gap-1.5 text-sm text-moss-500">
            <Sparkles size={15} className="animate-pulse" />
            {t('ai.garment.analyzing')}
          </p>
        )}

        {error && (
          <p role="alert" className="mt-4 rounded-xl bg-clay-100 px-3 py-2 text-xs text-clay-600">
            {error}
          </p>
        )}

        {!busy && !error && !draft && (
          <p className="mt-4 rounded-xl bg-clay-100 px-3 py-2 text-xs text-clay-600">
            {note || t('ai.garment.notFound')}
          </p>
        )}

        {draft && (
          <>
            <label className="mt-4 block">
              <span className="mb-1 block text-xs font-medium text-moss-500">
                {t('ai.garment.name')}
              </span>
              <input
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                className="w-full rounded-xl border border-moss-100 bg-white px-4 py-3 text-sm text-ink-900 outline-none focus:border-moss-400"
              />
            </label>

            <div className="mt-3 overflow-hidden rounded-2xl bg-white shadow-card">
              <Row label={t('ai.garment.type')} value={t(`outfit.type.${draft.type}`)} />
              <Row label={t('ai.garment.color')} value={draft.color} swatch={draft.colorHex} />
              <Row label={t('ai.garment.material')} value={draft.material} />
              <Row label={t('ai.garment.style')} value={`${draft.style} · ${draft.fit}`} />
              <Row
                label={t('ai.garment.co2')}
                value={t('ai.garment.co2Value', { kg: draft.co2SavedKg.toFixed(1) })}
              />
            </div>

            {note && (
              <p className="mt-3 flex items-start gap-1.5 rounded-xl bg-moss-50 px-3 py-2.5 text-xs leading-relaxed text-moss-600">
                <Sparkles size={13} className="mt-0.5 shrink-0" />
                {note}
              </p>
            )}

            <p className="mt-3 text-center text-[11px] text-moss-400">{t('ai.garment.hint')}</p>
          </>
        )}
      </div>
    </Sheet>
  )
}

function Row({ label, value, swatch }: { label: string; value: string; swatch?: string }) {
  return (
    <div className="flex items-center gap-3 border-b border-moss-100 px-4 py-3 last:border-b-0">
      <span className="w-16 shrink-0 text-xs text-moss-500">{label}</span>
      {swatch && (
        <span
          className="h-4 w-4 shrink-0 rounded-full border border-moss-200"
          style={{ backgroundColor: swatch }}
        />
      )}
      <span className="flex-1 text-sm text-ink-900">{value}</span>
    </div>
  )
}
