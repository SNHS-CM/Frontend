import { Check, ChevronRight, Leaf, Pencil, Shirt, Sparkles } from 'lucide-react'
import { useRef, useState } from 'react'
import StatusBar from '../components/StatusBar'
import { useProfile } from '../context/ProfileContext'
import { useI18n } from '../i18n'
import AboutCodimoment from './profile/AboutCodimoment'
import BannerEditor from './profile/BannerEditor'
import HelpSupport from './profile/HelpSupport'
import LanguageSettings from './profile/LanguageSettings'
import NotificationsSettings from './profile/NotificationsSettings'
import PrivacyData from './profile/PrivacyData'
import StyleSurvey from './profile/StyleSurvey'

type Panel =
  | 'survey'
  | 'language'
  | 'notifications'
  | 'privacy'
  | 'help'
  | 'about'
  | 'banner'
  | null

export default function Profile() {
  const { t, lang } = useI18n()
  const { profile, updateProfile } = useProfile()
  const [panel, setPanel] = useState<Panel>(null)
  const [editingName, setEditingName] = useState(false)
  const [nameDraft, setNameDraft] = useState(profile.name)
  const avatarInput = useRef<HTMLInputElement>(null)

  const stats = [
    { label: t('profile.totalItems'), value: String(profile.totalItems), icon: Shirt },
    { label: t('profile.outfits'), value: String(profile.outfits), icon: Sparkles },
    { label: t('profile.co2Saved'), value: `${profile.co2SavedKg.toFixed(1)} kg`, icon: Leaf },
  ]

  const menu: { key: Exclude<Panel, null>; label: string; value?: string }[] = [
    { key: 'survey', label: t('menu.styleSurvey') },
    { key: 'language', label: t('menu.language'), value: lang === 'ko' ? '한국어' : 'English' },
    {
      key: 'notifications',
      label: t('menu.notifications'),
      value: profile.notif.push ? t('common.on') : t('common.off'),
    },
    { key: 'privacy', label: t('menu.privacy') },
    { key: 'help', label: t('menu.help') },
    { key: 'about', label: t('menu.about') },
  ]

  const pickAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => updateProfile({ photo: String(reader.result) })
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const startEditName = () => {
    setNameDraft(profile.name)
    setEditingName(true)
  }
  const commitName = () => {
    const next = nameDraft.trim()
    if (next) updateProfile({ name: next })
    setEditingName(false)
  }

  return (
    <div className="pb-24">
      <StatusBar />

      <header className="px-5 pb-3 pt-2">
        <h1 className="font-display text-2xl font-medium text-ink-900">{t('profile.title')}</h1>
      </header>

      {/* Banner + identity (edit right here on the profile) */}
      <div className="px-5">
        <div
          className="relative h-28 w-full overflow-hidden rounded-2xl bg-cover bg-center ring-1 ring-black/5"
          style={
            profile.bannerImage
              ? { backgroundImage: `url(${profile.bannerImage})` }
              : { backgroundColor: profile.bannerColor }
          }
        >
          <button
            type="button"
            onClick={() => setPanel('banner')}
            aria-label={t('banner.title')}
            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/35 text-[#fff] backdrop-blur-sm"
          >
            <Pencil size={14} />
          </button>
        </div>

        {/* Avatar overlaps the banner */}
        <div className="-mt-10 px-1">
          <div className="relative inline-block">
            {profile.photo ? (
              <img
                src={profile.photo}
                alt=""
                className="h-20 w-20 rounded-full object-cover ring-4 ring-sand-50"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-moss-100 font-display text-3xl font-medium text-moss-700 ring-4 ring-sand-50">
                {profile.name.trim()[0]?.toUpperCase() ?? 'A'}
              </div>
            )}
            <button
              type="button"
              onClick={() => avatarInput.current?.click()}
              aria-label={t('profile.changePhoto')}
              className="absolute -right-0.5 top-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-[#75756e] text-[#fff] ring-2 ring-sand-50"
            >
              <Pencil size={11} />
            </button>
            <input
              ref={avatarInput}
              type="file"
              accept="image/*"
              onChange={pickAvatar}
              className="hidden"
            />
          </div>
        </div>

        {/* Name (tap to edit) + keywords, sit below the banner */}
        <div className="mt-3 px-1">
          {editingName ? (
            <div className="flex items-center gap-2">
              <input
                autoFocus
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                onBlur={commitName}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitName()
                  if (e.key === 'Escape') setEditingName(false)
                }}
                className="w-full min-w-0 border-b-2 border-moss-400 bg-transparent font-display text-xl font-medium text-ink-900 outline-none"
              />
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={commitName}>
                <Check size={18} className="text-moss-600" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={startEditName}
              aria-label={t('profile.editName')}
              className="group flex w-full min-w-0 items-center gap-1.5 text-left"
            >
              <span className="min-w-0 truncate font-display text-xl font-medium text-ink-900">
                {profile.name}
              </span>
              <Pencil size={13} className="shrink-0 text-moss-400" />
            </button>
          )}
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {profile.styleKeywords.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-moss-100 px-2.5 py-1 text-xs font-medium text-moss-700"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-3 gap-3 px-5">
        {stats.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="flex flex-col items-center gap-1.5 rounded-2xl bg-white py-5 shadow-card"
          >
            <Icon size={20} className="text-moss-600" strokeWidth={1.8} />
            <p className="text-lg font-semibold text-ink-900">{value}</p>
            <p className="text-center text-[11px] leading-tight text-moss-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Settings */}
      <h2 className="px-5 pb-3 pt-7 font-display text-lg font-medium text-ink-900">
        {t('profile.settings')}
      </h2>
      <div className="mx-5 divide-y divide-moss-100 overflow-hidden rounded-2xl bg-white shadow-card">
        {menu.map(({ key, label, value }) => (
          <button
            key={key}
            type="button"
            onClick={() => setPanel(key)}
            className="flex w-full items-center gap-3 px-4 py-4 text-left active:bg-moss-50"
          >
            <span className="flex-1">
              <span className="block text-sm font-medium text-ink-900">{label}</span>
              {value && <span className="mt-0.5 block text-xs text-moss-500">{value}</span>}
            </span>
            <ChevronRight size={18} className="text-moss-400" />
          </button>
        ))}
      </div>

      {/* Eco Points */}
      <button
        type="button"
        className="mx-5 mt-4 flex items-center gap-3 rounded-2xl bg-moss-600 px-4 py-4 text-left text-cream shadow-card active:bg-moss-700"
      >
        <Leaf size={22} strokeWidth={1.8} />
        <span className="flex-1">
          <span className="block text-sm font-semibold">{t('ecoPoints.title')}</span>
          <span className="mt-0.5 block text-xs text-sand-100/80">
            {t('ecoPoints.available', { n: profile.ecoPoints })}
          </span>
        </span>
        <ChevronRight size={18} className="text-sand-100/80" />
      </button>

      {/* Sub-screens */}
      {panel === 'survey' && <StyleSurvey onClose={() => setPanel(null)} />}
      {panel === 'language' && <LanguageSettings onClose={() => setPanel(null)} />}
      {panel === 'notifications' && <NotificationsSettings onClose={() => setPanel(null)} />}
      {panel === 'privacy' && <PrivacyData onClose={() => setPanel(null)} />}
      {panel === 'help' && <HelpSupport onClose={() => setPanel(null)} />}
      {panel === 'about' && <AboutCodimoment onClose={() => setPanel(null)} />}
      {panel === 'banner' && <BannerEditor onClose={() => setPanel(null)} />}
    </div>
  )
}
