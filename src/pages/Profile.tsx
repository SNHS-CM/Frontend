import {
  Bell,
  Bookmark,
  Check,
  ChevronRight,
  CloudOff,
  Globe,
  HelpCircle,
  Info,
  Leaf,
  LogOut,
  MessageCircle,
  Pencil,
  Shield,
  Shirt,
  Sparkles,
} from 'lucide-react'
import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import StatusBar from '../components/StatusBar'
import { useAuth } from '../context/AuthContext'
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
  const { t } = useI18n()
  const { profile, updateProfile, uploadPhoto, syncError } = useProfile()
  const { status, logout, refresh } = useAuth()
  const [panel, setPanel] = useState<Panel>(null)
  const [editingName, setEditingName] = useState(false)
  const [nameDraft, setNameDraft] = useState(profile.name)
  const avatarInput = useRef<HTMLInputElement>(null)

  const stats = [
    { label: t('profile.totalItems'), value: String(profile.totalItems), icon: Shirt },
    { label: t('profile.outfits'), value: String(profile.outfits), icon: Sparkles },
    { label: t('profile.co2Saved'), value: `${profile.co2SavedKg.toFixed(1)} kg`, icon: Leaf },
  ]

  // Rows that open an in-page panel.
  const settingsMenu: { label: string; icon: typeof Bell; panel: Panel }[] = [
    { label: t('menu.styleSurvey'), icon: Sparkles, panel: 'survey' },
    { label: t('menu.language'), icon: Globe, panel: 'language' },
    { label: t('menu.notifications'), icon: Bell, panel: 'notifications' },
    { label: t('menu.privacy'), icon: Shield, panel: 'privacy' },
    { label: t('menu.help'), icon: HelpCircle, panel: 'help' },
    { label: t('menu.about'), icon: Info, panel: 'about' },
  ]

  // Rows that navigate to another route.
  const linkMenu = [
    { label: t('menu.saved'), icon: Bookmark, to: '/saved' },
    { label: t('menu.chats'), icon: MessageCircle, to: '/chat' },
  ]

  const pickAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    void uploadPhoto(file)
    // Allow re-picking the same file.
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

      <header className="flex items-center gap-2 px-5 pb-3 pt-2">
        <h1 className="flex-1 font-display text-2xl font-medium text-ink-900">
          {t('profile.title')}
        </h1>
        {status === 'offline' && (
          <button
            type="button"
            onClick={refresh}
            title={t('auth.offline.note')}
            className="flex items-center gap-1.5 rounded-full bg-clay-100 px-3 py-1.5 text-[11px] font-medium text-clay-600"
          >
            <CloudOff size={13} />
            {t('auth.offline.badge')}
          </button>
        )}
      </header>

      {syncError && (
        <p role="alert" className="mx-5 mb-3 rounded-xl bg-clay-100 px-3 py-2 text-xs text-clay-600">
          {t('auth.syncError', { message: syncError })}
        </p>
      )}

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

      {/* Shortcuts to other screens */}
      <div className="mx-5 mt-5 divide-y divide-moss-100 overflow-hidden rounded-2xl bg-moss-50">
        {linkMenu.map(({ label, icon: Icon, to }) => (
          <Link key={to} to={to} className="flex w-full items-center gap-3 px-4 py-3.5 text-left">
            <Icon size={18} className="text-moss-600" />
            <span className="flex-1 text-sm text-ink-900">{label}</span>
            <ChevronRight size={16} className="text-moss-400" />
          </Link>
        ))}
      </div>

      {/* Settings panels */}
      <p className="mx-5 mt-5 mb-2 text-xs font-medium text-moss-500">{t('profile.settings')}</p>
      <div className="mx-5 divide-y divide-moss-100 overflow-hidden rounded-2xl bg-moss-50">
        {settingsMenu.map(({ label, icon: Icon, panel: target }) => (
          <button
            key={label}
            type="button"
            onClick={() => setPanel(target)}
            className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
          >
            <Icon size={18} className="text-moss-600" />
            <span className="flex-1 text-sm text-ink-900">{label}</span>
            <ChevronRight size={16} className="text-moss-400" />
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

      {status === 'authenticated' && (
        <button
          type="button"
          onClick={logout}
          className="mx-5 mt-4 flex w-[calc(100%-2.5rem)] items-center gap-3 rounded-2xl bg-moss-50 px-4 py-3.5 text-left"
        >
          <LogOut size={18} className="text-clay-500" />
          <span className="flex-1 text-sm text-clay-500">{t('auth.logout')}</span>
        </button>
      )}

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
