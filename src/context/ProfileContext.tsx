import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'

export interface SurveyData {
  skinTone: string | null // i18n key id, e.g. 'skin.asian'
  styles: string[] // English tokens, up to 3, e.g. ['Minimal', 'Street']
  height: string
  weight: string
  age: string
  fit: string | null // English token, e.g. 'Regular Fit'
}

export interface NotifSettings {
  push: boolean // master push consent (yes/no)
  marketing: boolean
  social: boolean
  eco: boolean
}

export type Theme = 'light' | 'dark'

export interface ProfileState {
  name: string
  gender: string // i18n key id, e.g. 'gender.female'
  bio: string
  photo: string // data URL or '' (falls back to initial)
  bannerColor: string // hex color for the profile banner
  bannerImage: string // data URL or '' (takes precedence over bannerColor)
  theme: Theme
  email: string
  emailVerified: boolean
  phone: string
  phoneVerified: boolean
  address: string
  zip: string
  styleKeywords: string[] // English fashion tokens shown under the name
  survey: SurveyData
  notif: NotifSettings
  history: string[] // recently viewed product ids
  // stats
  totalItems: number
  outfits: number
  co2SavedKg: number
  ecoPoints: number
}

const DEFAULT: ProfileState = {
  name: 'Alex Chen',
  gender: 'gender.na',
  bio: '',
  photo: '',
  bannerColor: '#566d38',
  bannerImage: '',
  theme: 'light',
  email: 'alex.chen@example.com',
  emailVerified: true,
  phone: '',
  phoneVerified: false,
  address: '',
  zip: '',
  styleKeywords: ['Minimal', 'Casual', 'Regular Fit'],
  survey: {
    skinTone: null,
    styles: ['Minimal'],
    height: '',
    weight: '',
    age: '',
    fit: 'Regular Fit',
  },
  notif: { push: true, marketing: false, social: true, eco: true },
  history: ['p3', 'p1', 'p7', 'p5', 'p2'],
  totalItems: 24,
  outfits: 18,
  co2SavedKg: 12.4,
  ecoPoints: 385,
}

interface ProfileContextValue {
  profile: ProfileState
  updateProfile: (patch: Partial<ProfileState>) => void
  updateSurvey: (patch: Partial<SurveyData>) => void
  updateNotif: (patch: Partial<NotifSettings>) => void
  applyStyleKeywords: (keywords: string[]) => void
  setTheme: (theme: Theme) => void
  clearHistory: () => void
}

const ProfileContext = createContext<ProfileContextValue | null>(null)
const STORAGE_KEY = 'codimoment.profile'

function load(): ProfileState {
  if (typeof localStorage === 'undefined') return DEFAULT
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT
    const parsed = JSON.parse(raw)
    // shallow-merge so newly added fields keep their defaults
    return {
      ...DEFAULT,
      ...parsed,
      survey: { ...DEFAULT.survey, ...parsed.survey },
      notif: { ...DEFAULT.notif, ...parsed.notif },
    }
  } catch {
    return DEFAULT
  }
}

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<ProfileState>(load)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
    } catch {
      // ignore storage errors
    }
  }, [profile])

  // Apply the color theme to the document root so CSS variables flip app-wide.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', profile.theme)
  }, [profile.theme])

  const updateProfile = (patch: Partial<ProfileState>) =>
    setProfile((p) => ({ ...p, ...patch }))

  const updateSurvey = (patch: Partial<SurveyData>) =>
    setProfile((p) => ({ ...p, survey: { ...p.survey, ...patch } }))

  const updateNotif = (patch: Partial<NotifSettings>) =>
    setProfile((p) => ({ ...p, notif: { ...p.notif, ...patch } }))

  const applyStyleKeywords = (keywords: string[]) =>
    setProfile((p) => ({ ...p, styleKeywords: keywords }))

  const setTheme = (theme: Theme) => setProfile((p) => ({ ...p, theme }))

  const clearHistory = () => setProfile((p) => ({ ...p, history: [] }))

  return (
    <ProfileContext.Provider
      value={{
        profile,
        updateProfile,
        updateSurvey,
        updateNotif,
        applyStyleKeywords,
        setTheme,
        clearHistory,
      }}
    >
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfile() {
  const ctx = useContext(ProfileContext)
  if (!ctx) throw new Error('useProfile must be used within ProfileProvider')
  return ctx
}
