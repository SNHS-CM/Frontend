import { ChevronLeft } from 'lucide-react'
import type { ReactNode } from 'react'
import StatusBar from './StatusBar'

export default function Sheet({
  title,
  onClose,
  children,
  footer,
}: {
  title: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <div className="absolute inset-0 z-30 flex animate-[sheetIn_0.28s_ease-out] flex-col bg-sand-50">
      <StatusBar />
      <header className="flex items-center gap-2 px-3 pb-3 pt-1">
        <button
          type="button"
          onClick={onClose}
          aria-label="Back"
          className="flex h-9 w-9 items-center justify-center rounded-full text-ink-900 active:bg-moss-100"
        >
          <ChevronLeft size={22} />
        </button>
        <h1 className="font-display text-lg font-medium text-ink-900">{title}</h1>
      </header>

      <div className="flex-1 overflow-y-auto overscroll-contain pb-6">{children}</div>

      {footer && (
        <div className="border-t border-moss-100 bg-sand-50 px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
          {footer}
        </div>
      )}
    </div>
  )
}
