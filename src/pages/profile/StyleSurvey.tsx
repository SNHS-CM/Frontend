import { Check, Sparkles } from 'lucide-react'
import { useState } from 'react'
import Sheet from '../../components/Sheet'
import { useProfile } from '../../context/ProfileContext'
import { FITS, MAX_STYLES, SKIN_TONES, STYLES, deriveKeywords } from '../../data/survey'
import { useI18n } from '../../i18n'

const STEPS = 5

export default function StyleSurvey({ onClose }: { onClose: () => void }) {
  const { t } = useI18n()
  const { profile, updateSurvey, applyStyleKeywords } = useProfile()
  const [step, setStep] = useState(0)
  const [maxStep, setMaxStep] = useState(0) // furthest step reached, for progress-bar jumps
  const [draft, setDraft] = useState(profile.survey)

  const set = (patch: Partial<typeof draft>) => setDraft((d) => ({ ...d, ...patch }))
  const keywords = deriveKeywords(draft.styles, draft.fit)
  const isResult = step === STEPS - 1

  const toggleStyle = (token: string) =>
    setDraft((d) => {
      if (d.styles.includes(token)) return { ...d, styles: d.styles.filter((s) => s !== token) }
      if (d.styles.length >= MAX_STYLES) return d
      return { ...d, styles: [...d.styles, token] }
    })

  // Each step must be answered before moving on.
  const canProceed =
    (step === 0 && !!draft.skinTone) ||
    (step === 1 && draft.styles.length >= 1) ||
    (step === 2 && !!draft.height.trim() && !!draft.weight.trim() && !!draft.age.trim()) ||
    (step === 3 && !!draft.fit) ||
    step === 4

  const goNext = () => {
    if (!canProceed) return
    const n = step + 1
    setStep(n)
    setMaxStep((m) => Math.max(m, n))
  }

  const apply = () => {
    updateSurvey(draft)
    applyStyleKeywords(keywords)
    onClose()
  }

  const footer = isResult ? (
    <button
      type="button"
      onClick={apply}
      className="w-full rounded-full bg-clay-500 py-3.5 text-sm font-semibold text-cream active:bg-clay-600"
    >
      {t('survey.result.apply')}
    </button>
  ) : (
    <button
      type="button"
      disabled={!canProceed}
      onClick={goNext}
      className="w-full rounded-full bg-moss-700 py-3.5 text-sm font-semibold text-cream transition-opacity active:bg-moss-800 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {t('common.next')}
    </button>
  )

  return (
    <Sheet title={t('survey.title')} onClose={onClose} footer={footer}>
      <div className="px-5 pt-1">
        {/* progress — tap a segment to jump back to an earlier step */}
        <div className="-my-2 flex items-center gap-1.5">
          {Array.from({ length: STEPS }).map((_, i) => {
            const reachable = i <= maxStep
            return (
              <button
                key={i}
                type="button"
                disabled={!reachable}
                onClick={() => reachable && setStep(i)}
                aria-label={t('survey.step', { n: i + 1, m: STEPS })}
                aria-current={i === step}
                className="flex-1 cursor-pointer py-2 disabled:cursor-default"
              >
                <span
                  className={`block h-1.5 rounded-full ${
                    i <= step ? 'bg-moss-500' : reachable ? 'bg-moss-200' : 'bg-moss-100'
                  }`}
                />
              </button>
            )
          })}
        </div>
        <p className="mt-2 text-xs text-moss-500">
          {t('survey.step', { n: step + 1, m: STEPS })}
        </p>
      </div>

      {step === 0 && (
        <Section title={t('survey.skin.title')} sub={t('survey.skin.sub')}>
          <div className="grid grid-cols-2 gap-2">
            {SKIN_TONES.map((s) => {
              const active = draft.skinTone === s.id
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => set({ skinTone: s.id })}
                  className={`flex items-center gap-2.5 rounded-2xl border p-3 text-left text-sm ${
                    active
                      ? 'border-moss-500 bg-moss-50 font-medium text-ink-900'
                      : 'border-moss-100 bg-white text-ink-900'
                  }`}
                >
                  <span
                    className="h-6 w-6 shrink-0 rounded-full ring-1 ring-black/10"
                    style={{ backgroundColor: s.swatch }}
                  />
                  <span className="leading-tight">{t(s.labelKey)}</span>
                </button>
              )
            })}
          </div>
        </Section>
      )}

      {step === 1 && (
        <Section
          title={t('survey.style.title')}
          sub={`${t('survey.style.sub')} · ${draft.styles.length}/${MAX_STYLES}`}
        >
          <div className="grid grid-cols-2 gap-2">
            {STYLES.map((s) => {
              const active = draft.styles.includes(s.token)
              const atMax = !active && draft.styles.length >= MAX_STYLES
              return (
                <button
                  key={s.token}
                  type="button"
                  onClick={() => toggleStyle(s.token)}
                  disabled={atMax}
                  className={`flex items-center gap-2 rounded-2xl border p-3.5 text-left text-sm transition-colors ${
                    active
                      ? 'border-moss-500 bg-moss-50 font-semibold text-ink-900'
                      : 'border-moss-100 bg-white text-ink-900'
                  } ${atMax ? 'opacity-40' : ''}`}
                >
                  <span aria-hidden>{s.emoji}</span>
                  <span className="flex-1">{s.token}</span>
                  {active && <Check size={16} className="text-moss-600" />}
                </button>
              )
            })}
          </div>
        </Section>
      )}

      {step === 2 && (
        <Section title={t('survey.body.title')} sub={t('survey.body.sub')}>
          <div className="space-y-3">
            <NumberField
              label={t('survey.body.height')}
              value={draft.height}
              onChange={(v) => set({ height: v })}
            />
            <NumberField
              label={t('survey.body.weight')}
              value={draft.weight}
              onChange={(v) => set({ weight: v })}
            />
            <NumberField
              label={t('survey.body.age')}
              value={draft.age}
              onChange={(v) => set({ age: v })}
            />
          </div>
        </Section>
      )}

      {step === 3 && (
        <Section title={t('survey.fit.title')} sub={t('survey.fit.sub')}>
          <div className="space-y-2">
            {FITS.map((f) => {
              const active = draft.fit === f.token
              return (
                <button
                  key={f.token}
                  type="button"
                  onClick={() => set({ fit: f.token })}
                  className={`flex w-full items-center gap-3 rounded-2xl border p-4 text-left ${
                    active ? 'border-moss-500 bg-moss-50' : 'border-moss-100 bg-white'
                  }`}
                >
                  <span className="flex-1">
                    <span className="block text-sm font-semibold text-ink-900">{f.token}</span>
                    <span className="mt-0.5 block text-xs text-moss-500">{t(f.descKey)}</span>
                  </span>
                  {active && <Check size={18} className="text-moss-600" />}
                </button>
              )
            })}
          </div>
        </Section>
      )}

      {isResult && (
        <Section title={t('survey.result.title')} sub={t('survey.result.sub')}>
          <div className="rounded-2xl bg-moss-700 p-5 text-cream shadow-card">
            <Sparkles size={22} className="text-clay-200" />
            <div className="mt-3 flex flex-wrap gap-2">
              {keywords.map((k) => (
                <span
                  key={k}
                  className="rounded-full bg-moss-600 px-3 py-1.5 text-sm font-medium text-cream"
                >
                  {k}
                </span>
              ))}
            </div>
          </div>
          <p className="mt-3 text-xs text-moss-500">{t('survey.result.note')}</p>
        </Section>
      )}
    </Sheet>
  )
}

function Section({
  title,
  sub,
  children,
}: {
  title: string
  sub: string
  children: React.ReactNode
}) {
  return (
    <div className="px-5 pt-5">
      <h2 className="font-display text-xl font-medium text-ink-900">{title}</h2>
      <p className="mt-1 text-sm text-moss-500">{sub}</p>
      <div className="mt-4">{children}</div>
    </div>
  )
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-moss-500">{label}</span>
      <input
        type="number"
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-moss-100 bg-white px-4 py-3 text-sm text-ink-900 outline-none focus:border-moss-400"
      />
    </label>
  )
}
