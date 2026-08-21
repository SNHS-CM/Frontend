import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { ApiError, assetUrl, relativeUrl } from '../api/client'
import * as profileApi from '../api/profile'
import type { ApiProfile } from '../api/types'
import { useAuth } from './AuthContext'

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
  id: string
  name: string
  gender: string // i18n key id, e.g. 'gender.female'
  bio: string
  photo: string // absolute URL, data URL, or '' (falls back to initial)
  bannerColor: string // hex color for the profile banner
  bannerImage: string // absolute URL or '' (takes precedence over bannerColor)
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
  id: '',
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
  /** True when changes are being persisted to the backend. */
  online: boolean
  /** Set when a write could not reach the server; the change stayed local. */
  syncError: string | null
  updateProfile: (patch: Partial<ProfileState>) => void
  updateSurvey: (patch: Partial<SurveyData>) => void
  updateNotif: (patch: Partial<NotifSettings>) => void
  applyStyleKeywords: (keywords: string[]) => void
  setTheme: (theme: Theme) => void
  clearHistory: () => void
  uploadPhoto: (file: File) => Promise<void>
  removePhoto: () => Promise<void>
  saveBanner: (banner: { bannerColor?: string; bannerImage?: string }) => Promise<void>
  uploadBannerImage: (file: File) => Promise<void>
}

const ProfileContext = createContext<ProfileContextValue | null>(null)
const STORAGE_KEY = 'codimoment.profile'

/** Fields PATCH /api/profile/me accepts. Everything else has its own endpoint
 *  or is server-owned (stats, verification flags). */
const PATCHABLE = ['name', 'gender', 'bio', 'phone', 'address', 'zip'] as const

function fromApi(dto: ApiProfile): ProfileState {
  return {
    id: dto.id,
    name: dto.name,
    gender: dto.gender,
    bio: dto.bio,
    photo: assetUrl(dto.photo),
    bannerColor: dto.bannerColor,
    bannerImage: assetUrl(dto.bannerImage),
    theme: dto.theme,
    email: dto.email,
    emailVerified: dto.emailVerified,
    phone: dto.phone,
    phoneVerified: dto.phoneVerified,
    address: dto.address,
    zip: dto.zip,
    styleKeywords: dto.styleKeywords,
    survey: dto.survey,
    notif: dto.notif,
    history: dto.history,
    totalItems: dto.totalItems,
    outfits: dto.outfits,
    co2SavedKg: dto.co2SavedKg,
    ecoPoints: dto.ecoPoints,
  }
}

function loadLocal(): ProfileState {
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
  const { status, initialProfile, localIdentity, signedIn } = useAuth()
  const online = status === 'authenticated'

  const [profile, setProfile] = useState<ProfileState>(() =>
    initialProfile ? fromApi(initialProfile) : loadLocal(),
  )
  const [syncError, setSyncError] = useState<string | null>(null)

  // Keep the latest state readable from async callbacks without re-subscribing.
  const profileRef = useRef(profile)
  profileRef.current = profile

  // Adopt the profile the session check fetched (login, signup, reconnect).
  useEffect(() => {
    if (initialProfile) setProfile(fromApi(initialProfile))
  }, [initialProfile])

  // Offline sessions have no server profile, so carry over at least the identity
  // the user signed in with instead of showing the built-in demo account's.
  useEffect(() => {
    if (!localIdentity) return
    setProfile((p) =>
      p.name === localIdentity.name && p.email === localIdentity.email
        ? p
        : { ...p, name: localIdentity.name, email: localIdentity.email },
    )
  }, [localIdentity])

  // Signing out must not leave the previous account's profile on the device —
  // the local-mode fallback would otherwise persist and re-show it.
  const wasSignedIn = useRef(signedIn)
  useEffect(() => {
    // A re-check (`refresh`) passes through `checking`; that is not a sign-out.
    if (status === 'checking') return
    const was = wasSignedIn.current
    wasSignedIn.current = signedIn
    if (was && !signedIn) {
      try {
        localStorage.removeItem(STORAGE_KEY)
      } catch {
        // ignore storage errors
      }
      setProfile(DEFAULT)
      setSyncError(null)
    }
  }, [status, signedIn])

  // Offline and guest sessions persist locally, exactly as before.
  useEffect(() => {
    if (online) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
    } catch {
      // ignore storage errors
    }
  }, [profile, online])

  // Apply the color theme to the document root so CSS variables flip app-wide.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', profile.theme)
  }, [profile.theme])

  /** Run a write against the server. The local state has already been updated
   *  optimistically, so a failure only needs to surface a message — the user's
   *  edit is never silently dropped. */
  const sync = useCallback(
    async (run: () => Promise<void>) => {
      if (!online) return
      try {
        await run()
        setSyncError(null)
      } catch (error) {
        const message =
          error instanceof ApiError ? error.message : '변경사항을 저장하지 못했습니다.'
        setSyncError(message)
      }
    },
    [online],
  )

  // Text fields are edited keystroke by keystroke (the address and phone inputs
  // in Privacy & Data call updateProfile on every change), so the PATCH is
  // debounced and the pending fields coalesced into one request.
  const pendingPatch = useRef<profileApi.ProfilePatch>({})
  const patchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const flushPatch = useCallback(() => {
    if (patchTimer.current) {
      clearTimeout(patchTimer.current)
      patchTimer.current = null
    }
    const body = pendingPatch.current
    pendingPatch.current = {}
    if (Object.keys(body).length === 0) return

    void sync(async () => {
      const updated = await profileApi.patchProfile(body)
      // Adopt only what the server owns. The text the user typed is left alone,
      // otherwise a reply that raced ahead of the next keystroke would undo it.
      setProfile((p) => ({
        ...p,
        emailVerified: updated.emailVerified,
        phoneVerified: updated.phoneVerified,
        totalItems: updated.totalItems,
        outfits: updated.outfits,
        co2SavedKg: updated.co2SavedKg,
        ecoPoints: updated.ecoPoints,
      }))
    })
  }, [sync])

  const updateProfile = useCallback(
    (patch: Partial<ProfileState>) => {
      setProfile((p) => ({ ...p, ...patch }))
      if (!online) return

      let queued = false
      for (const key of PATCHABLE) {
        const value = patch[key]
        if (typeof value === 'string') {
          pendingPatch.current[key] = value
          queued = true
        }
      }
      if (!queued) return

      if (patchTimer.current) clearTimeout(patchTimer.current)
      patchTimer.current = setTimeout(flushPatch, 600)
    },
    [online, flushPatch],
  )

  // Do not lose the last keystrokes when the screen goes away.
  useEffect(() => () => flushPatch(), [flushPatch])

  const updateSurvey = useCallback(
    (patch: Partial<SurveyData>) => {
      const next = { ...profileRef.current.survey, ...patch }
      setProfile((p) => ({ ...p, survey: next }))

      void sync(async () => {
        const result = await profileApi.saveSurvey(next)
        setProfile((p) => ({
          ...p,
          survey: result.survey,
          styleKeywords: result.styleKeywords,
        }))
      })
    },
    [sync],
  )

  const updateNotif = useCallback(
    (patch: Partial<NotifSettings>) => {
      setProfile((p) => ({ ...p, notif: { ...p.notif, ...patch } }))
      void sync(async () => {
        const notif = await profileApi.patchNotif(patch)
        setProfile((p) => ({ ...p, notif }))
      })
    },
    [sync],
  )

  const applyStyleKeywords = useCallback(
    (keywords: string[]) => {
      setProfile((p) => ({ ...p, styleKeywords: keywords }))
      void sync(async () => {
        await profileApi.setStyleKeywords(keywords)
      })
    },
    [sync],
  )

  const setTheme = useCallback(
    (theme: Theme) => {
      setProfile((p) => ({ ...p, theme }))
      void sync(async () => {
        await profileApi.setTheme(theme)
      })
    },
    [sync],
  )

  const clearHistory = useCallback(() => {
    setProfile((p) => ({ ...p, history: [] }))
    void sync(async () => {
      await profileApi.clearHistory()
    })
  }, [sync])

  // --- media ---------------------------------------------------------------
  // Uploads need the server. Offline we keep the existing data-URL behavior so
  // the screen still previews the picked image.

  const readAsDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result))
      reader.onerror = () => reject(reader.error)
      reader.readAsDataURL(file)
    })

  const uploadPhoto = useCallback(
    async (file: File) => {
      if (!online) {
        setProfile((p) => ({ ...p, photo: '' }))
        const dataUrl = await readAsDataUrl(file)
        setProfile((p) => ({ ...p, photo: dataUrl }))
        return
      }
      await sync(async () => {
        const { photo } = await profileApi.uploadPhoto(file)
        setProfile((p) => ({ ...p, photo: assetUrl(photo) }))
      })
    },
    [online, sync],
  )

  const removePhoto = useCallback(async () => {
    setProfile((p) => ({ ...p, photo: '' }))
    await sync(async () => {
      await profileApi.removePhoto()
    })
  }, [sync])

  const saveBanner = useCallback(
    async (banner: { bannerColor?: string; bannerImage?: string }) => {
      setProfile((p) => ({ ...p, ...banner }))
      await sync(async () => {
        const saved = await profileApi.saveBanner({
          ...banner,
          ...(banner.bannerImage !== undefined
            ? { bannerImage: relativeUrl(banner.bannerImage) }
            : {}),
        })
        setProfile((p) => ({
          ...p,
          bannerColor: saved.bannerColor,
          bannerImage: assetUrl(saved.bannerImage),
        }))
      })
    },
    [sync],
  )

  const uploadBannerImage = useCallback(
    async (file: File) => {
      if (!online) {
        const dataUrl = await readAsDataUrl(file)
        setProfile((p) => ({ ...p, bannerImage: dataUrl }))
        return
      }
      await sync(async () => {
        const saved = await profileApi.uploadBannerImage(file)
        setProfile((p) => ({
          ...p,
          bannerColor: saved.bannerColor,
          bannerImage: assetUrl(saved.bannerImage),
        }))
      })
    },
    [online, sync],
  )

  const value = useMemo<ProfileContextValue>(
    () => ({
      profile,
      online,
      syncError,
      updateProfile,
      updateSurvey,
      updateNotif,
      applyStyleKeywords,
      setTheme,
      clearHistory,
      uploadPhoto,
      removePhoto,
      saveBanner,
      uploadBannerImage,
    }),
    [
      profile,
      online,
      syncError,
      updateProfile,
      updateSurvey,
      updateNotif,
      applyStyleKeywords,
      setTheme,
      clearHistory,
      uploadPhoto,
      removePhoto,
      saveBanner,
      uploadBannerImage,
    ],
  )

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
}

export function useProfile() {
  const ctx = useContext(ProfileContext)
  if (!ctx) throw new Error('useProfile must be used within ProfileProvider')
  return ctx
}
