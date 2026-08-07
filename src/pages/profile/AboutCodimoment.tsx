import { Leaf, Mail } from 'lucide-react'
import Sheet from '../../components/Sheet'
import { useI18n } from '../../i18n'

const TEAM = [
  { initial: 'J', name: 'Jiwoo Han', roleEn: 'Product & Design', roleKo: '프로덕트 · 디자인' },
  { initial: 'M', name: 'Minseok Lee', roleEn: 'Frontend', roleKo: '프론트엔드' },
  { initial: 'S', name: 'Sora Kim', roleEn: 'AI Styling', roleKo: 'AI 스타일링' },
  { initial: 'D', name: 'Daniel Park', roleEn: 'Sustainability', roleKo: '지속가능성' },
]

const BUSINESS_EMAIL = 'hello@codimoment.app'

export default function AboutCodimoment({ onClose }: { onClose: () => void }) {
  const { t, lang } = useI18n()

  return (
    <Sheet title={t('about.title')} onClose={onClose}>
      {/* Hero */}
      <div className="px-5 pt-3">
        <div className="rounded-2xl bg-moss-700 p-5 text-cream shadow-card">
          <div className="flex items-center gap-2 font-display text-lg font-medium">
            <Leaf size={20} />
            Codimoment
          </div>
          <p className="mt-2 text-sm text-sand-100/85">{t('about.tagline')}</p>
        </div>
      </div>

      <Block title={t('about.mission.title')}>
        <p className="text-sm leading-relaxed text-ink-900">{t('about.mission.body')}</p>
      </Block>

      <Block title={t('about.team.title')} sub={t('about.team.sub')}>
        <div className="grid grid-cols-2 gap-2">
          {TEAM.map((m) => (
            <div key={m.name} className="flex items-center gap-2.5 rounded-2xl bg-white p-3 shadow-card">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-moss-100 font-display text-sm font-medium text-moss-700">
                {m.initial}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink-900">{m.name}</p>
                <p className="truncate text-xs text-moss-500">{lang === 'ko' ? m.roleKo : m.roleEn}</p>
              </div>
            </div>
          ))}
        </div>
      </Block>

      <Block title={t('about.how.title')}>
        <p className="text-sm leading-relaxed text-ink-900">{t('about.how.body')}</p>
      </Block>

      <Block title={t('about.contact.title')}>
        <a
          href={`mailto:${BUSINESS_EMAIL}`}
          className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-card"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-moss-100 text-moss-700">
            <Mail size={18} />
          </span>
          <span className="text-sm font-medium text-ink-900">{BUSINESS_EMAIL}</span>
        </a>
      </Block>

      <Block title={t('about.company.title')}>
        <div className="overflow-hidden rounded-2xl bg-white shadow-card">
          <InfoRow label={t('about.company.name')} value="Codimoment Inc." />
          <InfoRow label={t('about.company.rep')} value="Jiwoo Han" />
          <InfoRow label={t('about.company.reg')} value="123-45-67890" />
          <InfoRow
            label={t('about.company.address')}
            value={
              lang === 'ko'
                ? '서울특별시 성동구 성수이로 123, 4층'
                : '4F, 123 Seongsui-ro, Seongdong-gu, Seoul, Korea'
            }
            last
          />
        </div>
      </Block>

      <Block title={t('about.legal.title')}>
        <p className="text-sm leading-relaxed text-ink-900">{t('about.legal.body')}</p>
      </Block>

      <p className="px-5 pb-2 pt-4 text-center text-xs text-moss-400">
        {t('about.version')} 1.0.0
      </p>
    </Sheet>
  )
}

function Block({
  title,
  sub,
  children,
}: {
  title: string
  sub?: string
  children: React.ReactNode
}) {
  return (
    <div className="px-5 pt-6">
      <h2 className="font-display text-base font-medium text-ink-900">{title}</h2>
      {sub && <p className="mb-3 mt-0.5 text-xs text-moss-500">{sub}</p>}
      <div className={sub ? '' : 'mt-3'}>{children}</div>
    </div>
  )
}

function InfoRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div className={`flex gap-3 px-4 py-3 ${last ? '' : 'border-b border-moss-100'}`}>
      <span className="w-24 shrink-0 text-xs font-medium text-moss-500">{label}</span>
      <span className="flex-1 text-sm text-ink-900">{value}</span>
    </div>
  )
}
