import { X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { heightRanges, postBrands, type HeightRange } from '../data/posts'

export type SortKey = 'recent' | 'popular'

export interface DiscoverFilters {
  brands: string[]
  height: HeightRange | null
  sort: SortKey
}

export const emptyFilters: DiscoverFilters = { brands: [], height: null, sort: 'recent' }

export function activeFilterCount(f: DiscoverFilters) {
  return f.brands.length + (f.height ? 1 : 0) + (f.sort !== 'recent' ? 1 : 0)
}

export default function DiscoverFilterSheet({
  open,
  value,
  onClose,
  onApply,
}: {
  open: boolean
  value: DiscoverFilters
  onClose: () => void
  onApply: (next: DiscoverFilters) => void
}) {
  const [draft, setDraft] = useState<DiscoverFilters>(value)

  // Re-sync whenever the sheet is reopened, so a cancelled edit is discarded.
  useEffect(() => {
    if (open) setDraft(value)
  }, [open, value])

  if (!open) return null

  const toggleBrand = (brand: string) =>
    setDraft((d) => ({
      ...d,
      brands: d.brands.includes(brand)
        ? d.brands.filter((b) => b !== brand)
        : [...d.brands, brand],
    }))

  return (
    <div className="absolute inset-0 z-30 flex flex-col justify-end">
      <button
        type="button"
        aria-label="필터 닫기"
        onClick={onClose}
        className="absolute inset-0 bg-moss-900/40 backdrop-blur-[1px]"
      />

      <div className="relative max-h-[80%] overflow-y-auto rounded-t-3xl bg-sand-50 px-5 pb-6 pt-4 shadow-card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-medium text-ink-900">필터</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="flex h-8 w-8 items-center justify-center rounded-full text-moss-600"
          >
            <X size={18} />
          </button>
        </div>

        <Section title="정렬">
          <div className="flex gap-2">
            {(
              [
                ['recent', '최신순'],
                ['popular', '인기순'],
              ] as [SortKey, string][]
            ).map(([key, label]) => (
              <Pill
                key={key}
                label={label}
                active={draft.sort === key}
                onClick={() => setDraft((d) => ({ ...d, sort: key }))}
              />
            ))}
          </div>
        </Section>

        <Section title="작성자 키">
          <div className="flex flex-wrap gap-2">
            {heightRanges.map((range) => (
              <Pill
                key={range.label}
                label={range.label}
                active={draft.height?.label === range.label}
                onClick={() =>
                  setDraft((d) => ({
                    ...d,
                    height: d.height?.label === range.label ? null : range,
                  }))
                }
              />
            ))}
          </div>
        </Section>

        <Section title="브랜드">
          <div className="flex flex-wrap gap-2">
            {postBrands.map((brand) => (
              <Pill
                key={brand}
                label={brand}
                active={draft.brands.includes(brand)}
                onClick={() => toggleBrand(brand)}
              />
            ))}
          </div>
        </Section>

        <div className="mt-6 flex gap-2">
          <button
            type="button"
            onClick={() => setDraft(emptyFilters)}
            className="flex-1 rounded-full border border-moss-200 py-3 text-sm font-medium text-moss-600"
          >
            초기화
          </button>
          <button
            type="button"
            onClick={() => {
              onApply(draft)
              onClose()
            }}
            className="flex-[2] rounded-full bg-clay-500 py-3 text-sm font-semibold text-cream active:bg-clay-600"
          >
            적용하기
          </button>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <p className="mb-2 text-xs font-medium text-moss-600">{title}</p>
      {children}
    </div>
  )
}

function Pill({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3.5 py-2 text-xs font-medium transition-colors ${
        active ? 'bg-moss-700 text-cream' : 'bg-moss-100 text-moss-700'
      }`}
    >
      {label}
    </button>
  )
}
