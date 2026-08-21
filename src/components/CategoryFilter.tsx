import { ChevronDown, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useCatalogOptions } from '../hooks/useCatalogOptions'
import type { Category, ProductColor } from '../data/products'

export interface CategoryFilterValue {
  categories: Category[]
  colors: ProductColor[]
}

export const emptyCategoryFilter: CategoryFilterValue = { categories: [], colors: [] }

export function categoryFilterCount(v: CategoryFilterValue) {
  return v.categories.length + v.colors.length
}

type SectionKey = 'type' | 'color'

function toggleIn<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
}

function summarize(selected: string[]) {
  if (selected.length === 0) return '전체'
  if (selected.length === 1) return selected[0]
  return `${selected[0]} 외 ${selected.length - 1}`
}

/**
 * 디스커버 필터와 같은 바텀시트. "카테고리" 버튼을 눌러야 뜨고,
 * 옷 종류 / 색상 란은 그 안에서 각각 접었다 펼 수 있습니다.
 * 적용하기를 눌러야 실제로 반영되고, 닫으면 되돌립니다.
 */
export default function CategoryFilter({
  open,
  value,
  onClose,
  onApply,
}: {
  open: boolean
  value: CategoryFilterValue
  onClose: () => void
  onApply: (next: CategoryFilterValue) => void
}) {
  // 선택지는 서버에서 받고, 못 받으면 상수로 폴백한다.
  const { categories, colors: productColors } = useCatalogOptions()
  const [draft, setDraft] = useState<CategoryFilterValue>(value)
  const [openSection, setOpenSection] = useState<SectionKey | null>('type')

  // Re-sync whenever the sheet is reopened, so a cancelled edit is discarded.
  useEffect(() => {
    if (open) {
      setDraft(value)
      setOpenSection('type')
    }
  }, [open, value])

  if (!open) return null

  const toggleSection = (key: SectionKey) =>
    setOpenSection((prev) => (prev === key ? null : key))

  return (
    <div className="absolute inset-0 z-30 flex flex-col justify-end">
      <button
        type="button"
        aria-label="필터 닫기"
        onClick={onClose}
        className="absolute inset-0 bg-moss-900/40 backdrop-blur-[1px]"
      />

      <div className="relative max-h-[80%] overflow-y-auto rounded-t-3xl bg-sand-50 pb-6 pt-4 shadow-card">
        <div className="mb-2 flex items-center justify-between px-5">
          <h2 className="font-display text-lg font-medium text-ink-900">카테고리</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="flex h-8 w-8 items-center justify-center rounded-full text-moss-600"
          >
            <X size={18} />
          </button>
        </div>

        <SectionRow
          label="옷 종류"
          summary={summarize(draft.categories)}
          count={draft.categories.length}
          open={openSection === 'type'}
          onToggle={() => toggleSection('type')}
        >
          {categories.map((c) => (
            <OptionChip
              key={c}
              label={c}
              active={draft.categories.includes(c)}
              onClick={() => setDraft((d) => ({ ...d, categories: toggleIn(d.categories, c) }))}
            />
          ))}
        </SectionRow>

        <SectionRow
          label="색상"
          summary={summarize(draft.colors)}
          count={draft.colors.length}
          swatches={productColors.filter((c) => draft.colors.includes(c.name)).map((c) => c.hex)}
          open={openSection === 'color'}
          onToggle={() => toggleSection('color')}
          last
        >
          {productColors.map(({ name, hex }) => (
            <OptionChip
              key={name}
              label={name}
              active={draft.colors.includes(name)}
              onClick={() => setDraft((d) => ({ ...d, colors: toggleIn(d.colors, name) }))}
              swatch={hex}
            />
          ))}
        </SectionRow>

        <div className="mt-5 flex gap-2 px-5">
          <button
            type="button"
            onClick={() => setDraft(emptyCategoryFilter)}
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

function SectionRow({
  label,
  summary,
  count,
  swatches,
  open,
  onToggle,
  last,
  children,
}: {
  label: string
  summary: string
  count: number
  swatches?: string[]
  open: boolean
  onToggle: () => void
  last?: boolean
  children: React.ReactNode
}) {
  return (
    <div className={last ? '' : 'border-b border-moss-100'}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center gap-2 px-5 py-3 text-left"
      >
        <span className="text-sm font-medium text-ink-900">{label}</span>
        {count > 0 && (
          <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-moss-700 px-1 text-[10px] font-bold text-cream">
            {count}
          </span>
        )}

        <span className="ml-auto flex items-center gap-1.5">
          {swatches && swatches.length > 0 && (
            <span className="flex -space-x-1">
              {swatches.slice(0, 4).map((hex) => (
                <span
                  key={hex}
                  className="h-3.5 w-3.5 rounded-full ring-1 ring-black/10"
                  style={{ backgroundColor: hex }}
                />
              ))}
            </span>
          )}
          <span
            className={`max-w-28 truncate text-xs ${
              count > 0 ? 'font-medium text-moss-700' : 'text-moss-500'
            }`}
          >
            {summary}
          </span>
          <ChevronDown
            size={16}
            className={`shrink-0 text-moss-400 transition-transform ${open ? 'rotate-180' : ''}`}
          />
        </span>
      </button>

      {open && <div className="flex flex-wrap gap-1.5 px-5 pb-3.5">{children}</div>}
    </div>
  )
}

function OptionChip({
  label,
  active,
  onClick,
  swatch,
}: {
  label: string
  active: boolean
  onClick: () => void
  swatch?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex items-center gap-1.5 rounded-full text-xs font-medium transition-colors ${
        swatch ? 'py-1 pl-1 pr-2.5' : 'px-3 py-1.5'
      } ${active ? 'bg-moss-700 text-cream' : 'bg-moss-100 text-moss-700'}`}
    >
      {swatch && (
        <span
          className="h-4 w-4 shrink-0 rounded-full ring-1 ring-black/10"
          style={{ backgroundColor: swatch }}
        />
      )}
      {label}
    </button>
  )
}
