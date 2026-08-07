import {
  Bug,
  ChevronRight,
  CreditCard,
  Headphones,
  MessageCircle,
  MoreHorizontal,
  ShieldAlert,
  Truck,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import Sheet from '../../components/Sheet'
import { useI18n } from '../../i18n'

type CatKey = 'purchase' | 'shipping' | 'privacy' | 'bug' | 'report' | 'other'

const CATS: { key: CatKey; icon: typeof Bug; labelKey: string }[] = [
  { key: 'purchase', icon: CreditCard, labelKey: 'help.cat.purchase' },
  { key: 'shipping', icon: Truck, labelKey: 'help.cat.shipping' },
  { key: 'privacy', icon: ShieldAlert, labelKey: 'help.cat.privacy' },
  { key: 'bug', icon: Bug, labelKey: 'help.cat.bug' },
  { key: 'report', icon: ShieldAlert, labelKey: 'help.cat.report' },
  { key: 'other', icon: MoreHorizontal, labelKey: 'help.cat.other' },
]

export default function HelpSupport({ onClose }: { onClose: () => void }) {
  const { t, lang } = useI18n()
  const [cat, setCat] = useState<CatKey | null>(null)
  const [chat, setChat] = useState<'idle' | 'connecting' | 'connected'>('idle')

  useEffect(() => {
    if (chat !== 'connecting') return
    const id = setTimeout(() => setChat('connected'), 1400)
    return () => clearTimeout(id)
  }, [chat])

  const back = () => {
    if (cat) {
      setCat(null)
      setChat('idle')
    } else {
      onClose()
    }
  }

  if (!cat) {
    return (
      <Sheet title={t('help.title')} onClose={back}>
        <div className="px-5 pt-2">
          <p className="text-sm text-moss-500">{t('help.sub')}</p>
        </div>
        <div className="mx-5 mt-4 divide-y divide-moss-100 overflow-hidden rounded-2xl bg-white shadow-card">
          {CATS.map(({ key, icon: Icon, labelKey }) => (
            <button
              key={key}
              type="button"
              onClick={() => setCat(key)}
              className="flex w-full items-center gap-3 px-4 py-4 text-left active:bg-moss-50"
            >
              <Icon size={18} className="text-moss-600" />
              <span className="flex-1 text-sm font-medium text-ink-900">{t(labelKey)}</span>
              <ChevronRight size={16} className="text-moss-400" />
            </button>
          ))}
        </div>
      </Sheet>
    )
  }

  const advice = ADVICE[lang === 'ko' ? 'ko' : 'en'][cat]

  return (
    <Sheet title={t(`help.cat.${cat}`)} onClose={back}>
      <div className="px-5 pt-3">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-moss-400">
          {t('help.advice')}
        </h2>
        <ul className="mt-3 space-y-2">
          {advice.map((a, i) => (
            <li key={i} className="flex gap-3 rounded-2xl bg-white p-4 text-sm text-ink-900 shadow-card">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-moss-100 text-xs font-semibold text-moss-700">
                {i + 1}
              </span>
              <span className="leading-relaxed">{a}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="px-5 pt-6">
        <div className="rounded-2xl bg-moss-700 p-5 text-cream shadow-card">
          {chat === 'connected' ? (
            <div className="flex items-start gap-3">
              <Headphones size={22} className="text-clay-200" />
              <p className="text-sm leading-relaxed">{t('help.connected')}</p>
            </div>
          ) : (
            <>
              <p className="text-sm font-semibold">{t('help.stillStuck')}</p>
              <p className="mt-1 text-xs text-sand-100/80">{t('help.stillStuck.sub')}</p>
              <button
                type="button"
                disabled={chat === 'connecting'}
                onClick={() => setChat('connecting')}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-clay-500 py-3 text-sm font-semibold text-cream active:bg-clay-600 disabled:opacity-70"
              >
                <MessageCircle size={16} />
                {chat === 'connecting' ? t('help.connecting') : t('help.liveChat')}
              </button>
            </>
          )}
        </div>
      </div>
    </Sheet>
  )
}

const ADVICE: Record<'en' | 'ko', Record<CatKey, string[]>> = {
  en: {
    purchase: [
      'Check that your card details and billing address are correct in Privacy & Data.',
      'Some items sell out fast — refresh the product page to confirm stock.',
      'Try switching networks or reopening the app if payment keeps failing.',
    ],
    shipping: [
      'Standard delivery takes 2–5 business days after dispatch.',
      'Track your parcel from Order history once it ships.',
      'Make sure your shipping address and postal code are up to date.',
    ],
    privacy: [
      'You can view, correct or delete your data anytime in Privacy & Data.',
      'Withdraw survey consent from the Style Survey to stop personalization.',
      'Read the full agreements under Consent & agreements.',
    ],
    bug: [
      'Update to the latest app version and restart the app.',
      'Clear the cache if screens fail to load.',
      'Tell us the device and steps to reproduce so we can fix it fast.',
    ],
    report: [
      'Open the user’s profile and use Report to flag abuse.',
      'Include screenshots and a short description of what happened.',
      'For urgent safety issues, connect to a live agent below.',
    ],
    other: [
      'Search this help center for your topic.',
      'Browse FAQs for quick answers.',
      'Still stuck? Start a live chat and we’ll help directly.',
    ],
  },
  ko: {
    purchase: [
      '개인정보 및 데이터에서 카드 정보와 청구 주소가 정확한지 확인하세요.',
      '일부 인기 상품은 금방 품절돼요. 상품 페이지를 새로고침해 재고를 확인하세요.',
      '결제가 계속 실패하면 네트워크를 바꾸거나 앱을 다시 열어보세요.',
    ],
    shipping: [
      '일반 배송은 발송 후 영업일 기준 2~5일 걸려요.',
      '발송되면 주문 내역에서 배송 조회를 할 수 있어요.',
      '배송지 주소와 우편번호가 최신인지 확인하세요.',
    ],
    privacy: [
      '개인정보 및 데이터에서 언제든 데이터를 열람·정정·삭제할 수 있어요.',
      '맞춤 추천을 멈추려면 스타일 설문에서 동의를 철회하세요.',
      '동의 및 약관에서 전문을 확인할 수 있어요.',
    ],
    bug: [
      '앱을 최신 버전으로 업데이트한 뒤 다시 시작해 보세요.',
      '화면이 안 뜨면 캐시를 삭제해 보세요.',
      '사용 기기와 재현 방법을 알려주시면 빠르게 고칠 수 있어요.',
    ],
    report: [
      '해당 사용자의 프로필에서 신고 기능으로 악성 행위를 알려주세요.',
      '스크린샷과 상황 설명을 함께 첨부해 주세요.',
      '긴급한 안전 문제는 아래에서 실시간 상담원에게 연결하세요.',
    ],
    other: [
      '도움말 센터에서 원하는 주제를 검색해 보세요.',
      'FAQ에서 빠른 답변을 확인하세요.',
      '그래도 해결되지 않으면 실시간 상담으로 바로 도와드릴게요.',
    ],
  },
}
