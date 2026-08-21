import { BadgeCheck, ChevronRight, FileText, Moon, Trash2 } from 'lucide-react'
import { useState } from 'react'
import Sheet from '../../components/Sheet'
import Toggle from '../../components/Toggle'
import { useProfile } from '../../context/ProfileContext'
import { products } from '../../data/products'
import { useI18n } from '../../i18n'
import { clothingPhoto } from '../../data/placeholder'

const SIGNED_DATE = '2026-03-14'

export default function PrivacyData({ onClose }: { onClose: () => void }) {
  const { t, lang } = useI18n()
  const { profile, updateProfile, setTheme, clearHistory } = useProfile()
  const [doc, setDoc] = useState<null | 'terms' | 'privacy' | 'data'>(null)

  const consentDocs = [
    { key: 'terms' as const, label: t('privacy.consent.terms') },
    { key: 'privacy' as const, label: t('privacy.consent.privacy') },
    { key: 'data' as const, label: t('privacy.consent.data') },
  ]

  const history = profile.history
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is (typeof products)[number] => Boolean(p))

  if (doc) {
    return (
      <Sheet title={consentDocs.find((d) => d.key === doc)!.label} onClose={() => setDoc(null)}>
        <div className="space-y-3 px-5 pt-3 text-sm leading-relaxed text-ink-900">
          <p className="text-xs text-moss-500">{t('privacy.consent.signed', { date: SIGNED_DATE })}</p>
          {DOC_TEXT[lang === 'ko' ? 'ko' : 'en'][doc].map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      </Sheet>
    )
  }

  return (
    <Sheet title={t('privacy.title')} onClose={onClose}>
      {/* Appearance / dark mode */}
      <SectionTitle title={t('privacy.appearance.title')} />
      <Card>
        <div className="flex items-center gap-3 px-4 py-3.5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-moss-100 text-moss-700">
            <Moon size={18} />
          </span>
          <div className="flex-1">
            <p className="text-sm font-medium text-ink-900">{t('privacy.darkmode')}</p>
            <p className="mt-0.5 text-xs text-moss-500">{t('privacy.darkmode.sub')}</p>
          </div>
          <Toggle
            checked={profile.theme === 'dark'}
            onChange={(v) => setTheme(v ? 'dark' : 'light')}
            label={t('privacy.darkmode')}
          />
        </div>
      </Card>

      {/* Identity verification */}
      <SectionTitle title={t('privacy.verify.title')} sub={t('privacy.verify.sub')} />
      <Card>
        <VerifyRow
          label={t('privacy.email')}
          value={profile.email}
          verified={profile.emailVerified}
          verifiedText={t('common.verified')}
          verifyText={t('common.verify')}
          onVerify={() => updateProfile({ emailVerified: true })}
        />
        <div className="border-t border-moss-100" />
        <div className="px-4 py-3">
          <span className="mb-1 block text-xs font-medium text-moss-500">{t('privacy.phone')}</span>
          <div className="flex items-center gap-2">
            <input
              value={profile.phone}
              onChange={(e) => updateProfile({ phone: e.target.value, phoneVerified: false })}
              placeholder="+82 10-0000-0000"
              className="w-full rounded-xl border border-moss-100 bg-white px-3 py-2.5 text-sm text-ink-900 outline-none focus:border-moss-400"
            />
            {profile.phoneVerified ? (
              <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-moss-600">
                <BadgeCheck size={16} />
                {t('common.verified')}
              </span>
            ) : (
              <button
                type="button"
                onClick={() => profile.phone.trim() && updateProfile({ phoneVerified: true })}
                className="shrink-0 rounded-full bg-moss-700 px-3 py-2 text-xs font-semibold text-cream disabled:opacity-40"
                disabled={!profile.phone.trim()}
              >
                {t('common.verify')}
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* Consent & agreements */}
      <SectionTitle title={t('privacy.consent.title')} sub={t('privacy.consent.sub')} />
      <Card>
        {consentDocs.map((d, i) => (
          <button
            key={d.key}
            type="button"
            onClick={() => setDoc(d.key)}
            className={`flex w-full items-center gap-3 px-4 py-3.5 text-left active:bg-moss-50 ${
              i > 0 ? 'border-t border-moss-100' : ''
            }`}
          >
            <FileText size={18} className="text-moss-500" />
            <span className="flex-1">
              <span className="block text-sm font-medium text-ink-900">{d.label}</span>
              <span className="mt-0.5 block text-xs text-moss-500">
                {t('privacy.consent.signed', { date: SIGNED_DATE })}
              </span>
            </span>
            <ChevronRight size={16} className="text-moss-400" />
          </button>
        ))}
      </Card>

      {/* Shipping address */}
      <SectionTitle title={t('privacy.address.title')} />
      <Card>
        <div className="px-4 py-3">
          <span className="mb-1 block text-xs font-medium text-moss-500">{t('privacy.address.address')}</span>
          <input
            value={profile.address}
            onChange={(e) => updateProfile({ address: e.target.value })}
            className="w-full rounded-xl border border-moss-100 bg-white px-3 py-2.5 text-sm text-ink-900 outline-none focus:border-moss-400"
          />
        </div>
        <div className="px-4 pb-3">
          <span className="mb-1 block text-xs font-medium text-moss-500">{t('privacy.address.zip')}</span>
          <input
            value={profile.zip}
            inputMode="numeric"
            onChange={(e) => updateProfile({ zip: e.target.value })}
            className="w-40 rounded-xl border border-moss-100 bg-white px-3 py-2.5 text-sm text-ink-900 outline-none focus:border-moss-400"
          />
        </div>
      </Card>

      {/* Browsing history */}
      <div className="flex items-center justify-between px-5 pb-2 pt-6">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-moss-400">
            {t('privacy.history.title')}
          </h2>
          <p className="mt-1 text-xs text-moss-500">{t('privacy.history.sub')}</p>
        </div>
        {history.length > 0 && (
          <button
            type="button"
            onClick={clearHistory}
            className="flex items-center gap-1 text-xs font-medium text-clay-500"
          >
            <Trash2 size={14} />
            {t('privacy.history.clear')}
          </button>
        )}
      </div>
      {history.length === 0 ? (
        <p className="px-5 pb-2 text-sm text-moss-400">{t('privacy.history.empty')}</p>
      ) : (
        <div className="flex gap-3 overflow-x-auto px-5 pb-2">
          {history.map((p) => (
            <div key={p.id} className="w-24 shrink-0">
              <img
                src={clothingPhoto(p.seed, 240, 300)}
                alt={p.name}
                className="aspect-[4/5] w-full rounded-xl object-cover"
              />
              <p className="mt-1 truncate text-xs text-ink-900">{p.name}</p>
            </div>
          ))}
        </div>
      )}
    </Sheet>
  )
}

function SectionTitle({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="px-5 pb-2 pt-6">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-moss-400">{title}</h2>
      {sub && <p className="mt-1 text-xs text-moss-500">{sub}</p>}
    </div>
  )
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="mx-5 overflow-hidden rounded-2xl bg-white shadow-card">{children}</div>
}

function VerifyRow({
  label,
  value,
  verified,
  verifiedText,
  verifyText,
  onVerify,
}: {
  label: string
  value: string
  verified: boolean
  verifiedText: string
  verifyText: string
  onVerify: () => void
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <div className="min-w-0 flex-1">
        <span className="block text-xs font-medium text-moss-500">{label}</span>
        <span className="block truncate text-sm text-ink-900">{value}</span>
      </div>
      {verified ? (
        <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-moss-600">
          <BadgeCheck size={16} />
          {verifiedText}
        </span>
      ) : (
        <button
          type="button"
          onClick={onVerify}
          className="shrink-0 rounded-full bg-moss-700 px-3 py-2 text-xs font-semibold text-cream"
        >
          {verifyText}
        </button>
      )}
    </div>
  )
}

const DOC_TEXT: Record<'en' | 'ko', Record<'terms' | 'privacy' | 'data', string[]>> = {
  en: {
    terms: [
      '1. Service. Codimoment provides AI styling and wardrobe management. By using the app you agree to these Terms.',
      '2. Accounts. You are responsible for activity on your account and for keeping your credentials secure.',
      '3. Content. Outfits and items you upload remain yours; you grant us a license to display them within the service.',
      '4. Termination. You may close your account anytime; we may suspend accounts that violate these Terms.',
    ],
    privacy: [
      'We collect account, profile, style-survey and usage data to personalize recommendations.',
      'We never sell your personal data. Third-party processors act only on our instructions.',
      'You can request access, correction or deletion of your data at any time from this screen.',
      'Data is retained only as long as necessary or as required by law.',
    ],
    data: [
      'You consent to the collection of your skin tone, body measurements and style preferences.',
      'Purpose: to recommend flattering fits and colors and to estimate CO₂ savings.',
      'This sensitive data is encrypted at rest and processed on your device where possible.',
      'Withdrawing consent stops personalization; you can do so anytime in the Style Survey.',
    ],
  },
  ko: {
    terms: [
      '1. 서비스. 코디모먼트는 AI 스타일링과 옷장 관리를 제공합니다. 앱을 이용하면 본 약관에 동의하는 것으로 봅니다.',
      '2. 계정. 회원은 본인 계정의 활동과 로그인 정보 보안에 책임이 있습니다.',
      '3. 콘텐츠. 업로드한 코디와 아이템의 권리는 회원에게 있으며, 서비스 내 표시를 위한 사용권을 당사에 부여합니다.',
      '4. 해지. 회원은 언제든 계정을 해지할 수 있고, 당사는 약관을 위반한 계정을 정지할 수 있습니다.',
    ],
    privacy: [
      '맞춤 추천을 위해 계정·프로필·스타일 설문·이용 데이터를 수집합니다.',
      '당사는 개인정보를 절대 판매하지 않으며, 수탁 업체는 당사 지시에 따라서만 처리합니다.',
      '이 화면에서 언제든 데이터 열람·정정·삭제를 요청할 수 있습니다.',
      '데이터는 필요한 기간 또는 법정 보존기간 동안만 보관됩니다.',
    ],
    data: [
      '피부 톤, 신체 치수, 스타일 선호 정보의 수집에 동의합니다.',
      '목적: 어울리는 핏·컬러 추천 및 CO₂ 절감량 추정.',
      '민감정보는 저장 시 암호화되며 가능한 경우 기기 내에서 처리됩니다.',
      '동의를 철회하면 맞춤 추천이 중단되며, 스타일 설문에서 언제든 철회할 수 있습니다.',
    ],
  },
}
