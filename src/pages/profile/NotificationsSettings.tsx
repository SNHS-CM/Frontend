import { Bell, ChevronDown, Heart, Leaf, Megaphone } from 'lucide-react'
import { useState } from 'react'
import Sheet from '../../components/Sheet'
import Toggle from '../../components/Toggle'
import { useProfile } from '../../context/ProfileContext'
import { useI18n } from '../../i18n'

export default function NotificationsSettings({ onClose }: { onClose: () => void }) {
  const { t, lang } = useI18n()
  const { profile, updateNotif } = useProfile()
  const { notif } = profile
  const [showLog, setShowLog] = useState(false)

  const categories = [
    {
      key: 'marketing' as const,
      icon: Megaphone,
      title: t('notif.marketing.title'),
      sub: t('notif.marketing.sub'),
    },
    {
      key: 'social' as const,
      icon: Heart,
      title: t('notif.social.title'),
      sub: t('notif.social.sub'),
    },
    { key: 'eco' as const, icon: Leaf, title: t('notif.eco.title'), sub: t('notif.eco.sub') },
  ]

  const log =
    lang === 'ko'
      ? [
          { icon: Leaf, text: '이번 주 탄소 2.1kg을 절감했어요 🌱', time: '2시간 전' },
          { icon: Heart, text: '민지님이 회원님의 코디를 좋아해요', time: '어제' },
          { icon: Megaphone, text: '가을 신상 20% 할인 시작!', time: '3일 전' },
          { icon: Leaf, text: '에코 포인트 25 EP가 적립되었어요', time: '5일 전' },
        ]
      : [
          { icon: Leaf, text: 'You saved 2.1 kg of CO₂ this week 🌱', time: '2h ago' },
          { icon: Heart, text: 'Minji liked your outfit', time: 'Yesterday' },
          { icon: Megaphone, text: 'Autumn arrivals — 20% off starts now!', time: '3d ago' },
          { icon: Leaf, text: 'You earned 25 Eco Points', time: '5d ago' },
        ]

  return (
    <Sheet title={t('notif.title')} onClose={onClose}>
      {/* Push consent */}
      <div className="px-5 pt-3">
        <div className="rounded-2xl bg-white p-4 shadow-card">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-moss-100 text-moss-700">
              <Bell size={18} />
            </span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-ink-900">{t('notif.push.title')}</p>
              <p className="mt-0.5 text-xs text-moss-500">{t('notif.push.sub')}</p>
            </div>
          </div>

          <p className="mt-4 text-sm font-medium text-ink-900">{t('notif.push.q')}</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => updateNotif({ push: true })}
              className={`rounded-xl py-2.5 text-sm font-semibold ${
                notif.push
                  ? 'bg-moss-600 text-cream'
                  : 'bg-moss-50 text-moss-500'
              }`}
            >
              {t('common.yes')}
            </button>
            <button
              type="button"
              onClick={() => updateNotif({ push: false })}
              className={`rounded-xl py-2.5 text-sm font-semibold ${
                !notif.push
                  ? 'bg-moss-700 text-cream'
                  : 'bg-moss-50 text-moss-500'
              }`}
            >
              {t('common.no')}
            </button>
          </div>
          <p className="mt-2 text-xs text-moss-400">
            {notif.push ? t('notif.push.onNote') : t('notif.push.offNote')}
          </p>
        </div>
      </div>

      {/* Categories */}
      <h2 className="px-5 pb-2 pt-6 text-xs font-semibold uppercase tracking-wide text-moss-400">
        {t('notif.categories')}
      </h2>
      <div className="mx-5 divide-y divide-moss-100 overflow-hidden rounded-2xl bg-white shadow-card">
        {categories.map(({ key, icon: Icon, title, sub }) => (
          <div key={key} className="flex items-center gap-3 px-4 py-3.5">
            <Icon size={18} className="text-moss-500" />
            <div className="flex-1">
              <p className="text-sm font-medium text-ink-900">{title}</p>
              <p className="mt-0.5 text-xs text-moss-500">{sub}</p>
            </div>
            <Toggle
              checked={notif.push && notif[key]}
              disabled={!notif.push}
              onChange={(v) => updateNotif({ [key]: v })}
              label={title}
            />
          </div>
        ))}
      </div>
      {!notif.push && (
        <p className="px-5 pt-2 text-xs text-clay-500">{t('notif.disabledNote')}</p>
      )}

      {/* Log */}
      <div className="px-5 pt-6">
        <button
          type="button"
          onClick={() => setShowLog((s) => !s)}
          className="flex w-full items-center justify-between rounded-2xl bg-white px-4 py-3.5 text-sm font-medium text-ink-900 shadow-card"
        >
          {showLog ? t('notif.log.hide') : t('notif.log.show')}
          <ChevronDown
            size={18}
            className={`text-moss-400 transition-transform ${showLog ? 'rotate-180' : ''}`}
          />
        </button>

        {showLog && (
          <div className="mt-2 divide-y divide-moss-100 overflow-hidden rounded-2xl bg-white shadow-card">
            {log.map((entry, i) => (
              <div key={i} className="flex items-start gap-3 px-4 py-3">
                <entry.icon size={16} className="mt-0.5 text-moss-500" />
                <p className="flex-1 text-sm text-ink-900">{entry.text}</p>
                <span className="whitespace-nowrap text-[11px] text-moss-400">{entry.time}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Sheet>
  )
}
