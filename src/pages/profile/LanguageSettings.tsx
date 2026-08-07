import { Check, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import Sheet from '../../components/Sheet'
import { LANGUAGES, useI18n } from '../../i18n'

export default function LanguageSettings({ onClose }: { onClose: () => void }) {
  const { t, lang, setLang } = useI18n()
  const [query, setQuery] = useState('')

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return LANGUAGES
    return LANGUAGES.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.native.toLowerCase().includes(q) ||
        l.code.includes(q),
    )
  }, [query])

  return (
    <Sheet title={t('lang.title')} onClose={onClose}>
      <div className="px-5 pt-2">
        <p className="text-sm text-moss-500">{t('lang.sub')}</p>

        <div className="mt-4 flex items-center gap-2 rounded-full bg-white px-4 py-3 shadow-card">
          <Search size={16} className="text-moss-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('lang.search')}
            className="w-full bg-transparent text-sm text-ink-900 outline-none placeholder:text-moss-300"
          />
        </div>
      </div>

      <div className="mx-5 mt-4 divide-y divide-moss-100 overflow-hidden rounded-2xl bg-white shadow-card">
        {results.map((l) => {
          const active = l.code === lang
          return (
            <button
              key={l.code}
              type="button"
              onClick={() => setLang(l.code)}
              className="flex w-full items-center gap-3 px-4 py-3.5 text-left active:bg-moss-50"
            >
              <span className="flex-1">
                <span className="block text-sm font-medium text-ink-900">{l.native}</span>
                <span className="mt-0.5 block text-xs text-moss-500">{l.name}</span>
              </span>
              {active ? (
                <span className="flex items-center gap-1 text-xs font-medium text-moss-600">
                  {t('lang.current')}
                  <Check size={16} />
                </span>
              ) : null}
            </button>
          )
        })}
        {results.length === 0 && (
          <p className="px-4 py-6 text-center text-sm text-moss-400">{t('lang.noResults')}</p>
        )}
      </div>

      <p className="px-5 pt-4 text-xs leading-relaxed text-moss-400">{t('lang.fallbackNote')}</p>
    </Sheet>
  )
}
