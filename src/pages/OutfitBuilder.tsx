import { Bookmark, Sparkles } from 'lucide-react'
import { useMemo, useState } from 'react'
import StatusBar from '../components/StatusBar'
import {
  bottoms,
  defaultOutfit,
  outfitKey,
  outfitMatch,
  tops,
  type Garment,
} from '../data/outfits'

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
  garment: Garment
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
  garment: Garment
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
        {garment.match}%
      </span>
    </button>
  )
}

export default function OutfitBuilder() {
  const [topId, setTopId] = useState(defaultOutfit.topId)
  const [bottomId, setBottomId] = useState(defaultOutfit.bottomId)
  // 북마크는 단일 bool이 아니라 "코디 조합 키"들의 집합으로 관리합니다.
  const [favorites, setFavorites] = useState<Set<string>>(() => new Set())

  const top = useMemo(() => tops.find((t) => t.id === topId) ?? tops[0], [topId])
  const bottom = useMemo(() => bottoms.find((b) => b.id === bottomId) ?? bottoms[0], [bottomId])
  const match = outfitMatch(top, bottom)

  // 현재 선택된 조합의 키 — 이 키가 favorites에 있는지로 북마크 여부를 판단합니다.
  const currentKey = outfitKey(top.id, bottom.id)
  const isSaved = favorites.has(currentKey)

  const toggleFavorite = () => {
    setFavorites((prev) => {
      const next = new Set(prev)
      if (next.has(currentKey)) next.delete(currentKey)
      else next.add(currentKey)
      return next
    })
  }

  const saveOutfit = () => {
    setFavorites((prev) => new Set(prev).add(currentKey))
  }

  return (
    <div className="pb-28">
      <StatusBar />

      <header className="px-5 pb-4 pt-2">
        <h1 className="font-display text-2xl font-medium text-ink-900">Outfit Builder</h1>
        <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-moss-600">
          <Sparkles size={16} />
          {match}% Color Match
        </p>
      </header>

      {/* 코디 미리보기 */}
      <div className="mx-5 rounded-3xl bg-white p-5 shadow-card">
        <div className="flex items-center justify-center py-4">
          <GarmentVisual garment={top} imgClass="max-h-44 w-auto" emojiClass="text-[5.5rem]" />
        </div>
        <div className="flex items-center justify-center py-4">
          <GarmentVisual garment={bottom} imgClass="max-h-44 w-auto" emojiClass="text-[5.5rem]" />
        </div>

        <div className="mt-3 border-t border-moss-100 pt-4">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs text-moss-500">Current Outfit</p>
              <p className="mt-0.5 text-base font-medium text-ink-900">
                {top.name} + {bottom.name}
              </p>
            </div>
            <button
              type="button"
              onClick={toggleFavorite}
              aria-label="코디 북마크"
              aria-pressed={isSaved}
              className="text-moss-600 transition-transform duration-200 ease-out active:scale-90"
            >
              <Bookmark size={22} className={isSaved ? 'fill-moss-600' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* 추천 상의 */}
      <section className="mt-6 px-5">
        <h2 className="mb-3 text-base font-semibold text-ink-900">Suggested Tops</h2>
        <div className="grid grid-cols-3 gap-3">
          {tops.map((g) => (
            <SuggestionCard
              key={g.id}
              garment={g}
              selected={g.id === topId}
              onSelect={() => setTopId(g.id)}
            />
          ))}
        </div>
      </section>

      {/* 추천 하의 */}
      <section className="mt-5 px-5">
        <h2 className="mb-3 text-base font-semibold text-ink-900">Suggested Bottoms</h2>
        <div className="grid grid-cols-3 gap-3">
          {bottoms.map((g) => (
            <SuggestionCard
              key={g.id}
              garment={g}
              selected={g.id === bottomId}
              onSelect={() => setBottomId(g.id)}
            />
          ))}
        </div>
      </section>

      <div className="mt-6 px-5">
        <button
          type="button"
          onClick={saveOutfit}
          className="w-full rounded-2xl bg-moss-500 py-4 text-center text-base font-medium text-cream shadow-card transition-transform duration-200 ease-out active:scale-[0.98]"
        >
          {isSaved ? 'Saved ✓' : 'Save Outfit'}
        </button>
      </div>
    </div>
  )
}
