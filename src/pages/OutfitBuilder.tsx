import { Bookmark, CloudOff, Leaf, Sparkles } from 'lucide-react'
import StatusBar from '../components/StatusBar'
import { useAuth } from '../context/AuthContext'
import { useOutfitBuilder, type BuilderGarment } from '../hooks/useOutfitBuilder'
import { useI18n } from '../i18n'

/** 옷이 살짝 떠 있는 듯한 은은한 그림자 (blur 14 · y+6 · opacity 0.16) */
const FLOAT_SHADOW = 'drop-shadow-[0_6px_14px_rgba(35,32,25,0.16)]'

/**
 * 의류 이미지(또는 사진이 없으면 이모지)를 배경 없이 표시합니다.
 * 컨테이너에 배경색을 두지 않아 투명 PNG가 자연스럽게 떠 보입니다.
 */
function GarmentVisual({
  garment,
  imgClass = '',
  emojiClass = '',
}: {
  garment: BuilderGarment
  imgClass?: string
  emojiClass?: string
}) {
  if (garment.image) {
    return (
      <img
        src={garment.image}
        alt={garment.name}
        loading="lazy"
        className={`object-contain ${FLOAT_SHADOW} ${imgClass}`}
      />
    )
  }
  return (
    <span aria-label={garment.name} className={`${FLOAT_SHADOW} ${emojiClass}`}>
      {garment.emoji}
    </span>
  )
}

function SuggestionCard({
  garment,
  selected,
  onSelect,
}: {
  garment: BuilderGarment
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`flex aspect-square flex-col justify-between rounded-2xl bg-white p-2.5 shadow-card transition-transform duration-200 ease-out hover:scale-[1.03] active:scale-95 ${
        selected ? 'ring-2 ring-moss-600' : 'ring-1 ring-transparent'
      }`}
    >
      <div className="flex flex-1 items-center justify-center overflow-hidden">
        <GarmentVisual garment={garment} imgClass="max-h-[80%] w-4/5" emojiClass="text-4xl" />
      </div>
      <span className="flex items-center gap-1 text-xs font-medium text-moss-600">
        <Sparkles size={13} />
        {garment.matchScore}%
      </span>
    </button>
  )
}

function Rack({
  title,
  garments,
  selectedId,
  onSelect,
  hint,
}: {
  title: string
  garments: BuilderGarment[]
  selectedId: string | null
  onSelect: (id: string) => void
  hint?: string
}) {
  if (garments.length === 0) return null
  return (
    <section className="mt-5 px-5">
      <h2 className="mb-3 flex items-baseline gap-2 text-base font-semibold text-ink-900">
        {title}
        {hint && <span className="text-xs font-normal text-moss-500">{hint}</span>}
      </h2>
      <div className="grid grid-cols-3 gap-3">
        {garments.map((g) => (
          <SuggestionCard
            key={g.id}
            garment={g}
            selected={g.id === selectedId}
            onSelect={() => onSelect(g.id)}
          />
        ))}
      </div>
    </section>
  )
}

export default function OutfitBuilder() {
  const { t } = useI18n()
  const { status, refresh } = useAuth()
  const {
    loading,
    saving,
    error,
    dismissError,
    tops,
    bottoms,
    shoes,
    top,
    bottom,
    shoe,
    selectTop,
    selectBottom,
    selectShoes,
    preview,
    matchScore,
    isBookmarked,
    save,
    toggleBookmark,
  } = useOutfitBuilder()

  if (loading) {
    return (
      <div className="pb-28">
        <StatusBar />
        <p className="px-5 pt-10 text-sm text-moss-500">{t('outfit.loading')}</p>
      </div>
    )
  }

  const chosen = [top, bottom, shoe].filter((g): g is BuilderGarment => g !== null)

  return (
    <div className="pb-28">
      <StatusBar />

      <header className="px-5 pb-4 pt-2">
        <div className="flex items-center gap-2">
          <h1 className="flex-1 font-display text-2xl font-medium text-ink-900">
            {t('outfit.title')}
          </h1>
          {status === 'offline' && (
            <button
              type="button"
              onClick={refresh}
              title={t('auth.offline.note')}
              className="flex items-center gap-1.5 rounded-full bg-clay-100 px-3 py-1.5 text-[11px] font-medium text-clay-600"
            >
              <CloudOff size={13} />
              {t('auth.offline.badge')}
            </button>
          )}
        </div>
        <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-moss-600">
          <Sparkles size={16} />
          {t('outfit.colorMatch', { n: matchScore })}
        </p>
      </header>

      {error && (
        <button
          type="button"
          onClick={dismissError}
          className="mx-5 mb-3 block w-[calc(100%-2.5rem)] rounded-xl bg-clay-100 px-3 py-2 text-left text-xs text-clay-600"
        >
          {error}
        </button>
      )}

      {chosen.length === 0 ? (
        <p className="mx-5 rounded-2xl bg-white px-4 py-6 text-center text-sm text-moss-500 shadow-card">
          {t('outfit.empty')}
        </p>
      ) : (
        /* 코디 미리보기 */
        <div className="mx-5 rounded-3xl bg-white p-5 shadow-card">
          {chosen.map((g) => (
            <div key={g.id} className="flex items-center justify-center py-4">
              <GarmentVisual garment={g} imgClass="max-h-44 w-auto" emojiClass="text-[5.5rem]" />
            </div>
          ))}

          <div className="mt-3 border-t border-moss-100 pt-4">
            <div className="flex items-end justify-between">
              <div className="min-w-0">
                <p className="text-xs text-moss-500">{t('outfit.current')}</p>
                <p className="mt-0.5 truncate text-base font-medium text-ink-900">
                  {chosen.map((g) => g.name).join(' + ')}
                </p>
              </div>
              <button
                type="button"
                onClick={toggleBookmark}
                disabled={saving || !top || !bottom}
                aria-label={t('outfit.bookmark')}
                aria-pressed={isBookmarked}
                className="text-moss-600 transition-transform duration-200 ease-out active:scale-90 disabled:opacity-40"
              >
                <Bookmark size={22} className={isBookmarked ? 'fill-moss-600' : ''} />
              </button>
            </div>

            {/* 서버가 계산한 절감 CO₂ / 에코 포인트 */}
            {preview?.ecoPoints != null && preview.co2SavedKg != null && (
              <p className="mt-3 flex items-center gap-1.5 rounded-xl bg-moss-50 px-3 py-2 text-xs text-moss-600">
                <Leaf size={14} />
                {t('outfit.reward', {
                  kg: preview.co2SavedKg.toFixed(1),
                  n: preview.ecoPoints,
                })}
              </p>
            )}
          </div>
        </div>
      )}

      <Rack
        title={t('outfit.tops')}
        garments={tops}
        selectedId={top?.id ?? null}
        onSelect={selectTop}
      />
      <Rack
        title={t('outfit.bottoms')}
        garments={bottoms}
        selectedId={bottom?.id ?? null}
        onSelect={selectBottom}
      />
      <Rack
        title={t('outfit.shoes')}
        garments={shoes}
        selectedId={shoe?.id ?? null}
        onSelect={selectShoes}
        hint={t('common.optional')}
      />

      <div className="mt-6 px-5">
        <button
          type="button"
          onClick={save}
          disabled={saving || !top || !bottom}
          className="w-full rounded-2xl bg-moss-500 py-4 text-center text-base font-medium text-cream shadow-card transition-transform duration-200 ease-out active:scale-[0.98] disabled:opacity-50"
        >
          {saving ? t('outfit.saving') : isBookmarked ? t('outfit.saved') : t('outfit.save')}
        </button>
      </div>
    </div>
  )
}
