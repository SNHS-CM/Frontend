import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { ApiError, ping, setToken } from '../api/client'
import {
  DEV_ACCOUNT,
  canStoreLocalAccounts,
  createLocalAccount,
  loadLocalSession,
  saveLocalSession,
  verifyLocalAccount,
  type LocalIdentity,
} from '../api/localAuth'
import { fetchMe, login as loginRequest, signup as signupRequest } from '../api/profile'
import type { SignupInput as SignupPayload } from '../api/profile'
import type { ApiProfile } from '../api/types'
import { useI18n } from '../i18n'

/** How the app is currently talking to the backend.
 *
 *  `offline` is not an error state: when the server cannot be reached at all the
 *  app keeps working against localStorage, so every screen stays usable without
 *  a running backend. Only a reachable server that rejects us puts the app in
 *  `guest`.
 */
export type AuthStatus = 'checking' | 'authenticated' | 'guest' | 'offline'

interface AuthContextValue {
  status: AuthStatus
  /** Profile fetched during the session check — the seed for ProfileContext. */
  initialProfile: ApiProfile | null
  /** Who is signed in through the offline fallback, if anyone. */
  localIdentity: LocalIdentity | null
  /** True for a real session *or* an offline one — what the router gates on. */
  signedIn: boolean
  online: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (input: SignupPayload) => Promise<void>
  /** Enter local mode as the dev account, without typing credentials. */
  browseOffline: () => void
  logout: () => void
  /** Re-run the session check, e.g. after starting the backend. */
  refresh: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { t } = useI18n()
  const [status, setStatus] = useState<AuthStatus>('checking')
  const [initialProfile, setInitialProfile] = useState<ApiProfile | null>(null)
  const [localIdentity, setLocalIdentity] = useState<LocalIdentity | null>(null)
  const [nonce, setNonce] = useState(0)

  useEffect(() => {
    let cancelled = false

    const check = async () => {
      setStatus('checking')
      try {
        const profile = await fetchMe()
        if (cancelled) return
        // A real session wins over anything the offline fallback left behind.
        saveLocalSession(null)
        setLocalIdentity(null)
        setInitialProfile(profile)
        setStatus('authenticated')
      } catch (error) {
        if (cancelled) return
        if (error instanceof ApiError && error.isOffline) {
          setLocalIdentity(loadLocalSession())
          setStatus('offline')
          return
        }
        // The token is missing or rejected. Confirm the server is actually up
        // before sending the user to a login screen they could not use.
        setToken(null)
        setInitialProfile(null)
        const reachable = await ping()
        if (cancelled) return
        if (reachable) {
          // The server can answer, so the local shortcut must not grant access.
          saveLocalSession(null)
          setLocalIdentity(null)
          setStatus('guest')
        } else {
          setLocalIdentity(loadLocalSession())
          setStatus('offline')
        }
      }
    }

    void check()
    return () => {
      cancelled = true
    }
  }, [nonce])

  const enterLocal = useCallback((identity: LocalIdentity) => {
    saveLocalSession(identity)
    setLocalIdentity(identity)
    setInitialProfile(null)
    setStatus('offline')
  }, [])

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const { accessToken } = await loginRequest(email, password)
        setToken(accessToken)
        const profile = await fetchMe()
        saveLocalSession(null)
        setLocalIdentity(null)
        setInitialProfile(profile)
        setStatus('authenticated')
      } catch (error) {
        // 서버가 꺼져 있을 때만 로컬 계정으로 대신 들어간다.
        if (!(error instanceof ApiError && error.isOffline)) throw error

        const identity = await verifyLocalAccount(email, password)
        if (!identity) throw new ApiError(0, t('auth.local.loginFailed'))
        enterLocal(identity)
      }
    },
    [enterLocal, t],
  )

  const signup = useCallback(
    async (input: SignupPayload) => {
      try {
        const { accessToken } = await signupRequest(input)
        setToken(accessToken)
        const profile = await fetchMe()
        saveLocalSession(null)
        setLocalIdentity(null)
        setInitialProfile(profile)
        setStatus('authenticated')
      } catch (error) {
        if (!(error instanceof ApiError && error.isOffline)) throw error
        if (!canStoreLocalAccounts()) throw new ApiError(0, t('auth.local.unsupported'))

        const identity = await createLocalAccount(input.email, input.password, input.name)
        if (!identity) throw new ApiError(0, t('auth.local.duplicate'))
        enterLocal(identity)
      }
    },
    [enterLocal, t],
  )

  const browseOffline = useCallback(() => {
    enterLocal({ email: DEV_ACCOUNT.email, name: DEV_ACCOUNT.name })
  }, [enterLocal])

  const logout = useCallback(() => {
    setToken(null)
    saveLocalSession(null)
    setInitialProfile(null)
    setLocalIdentity(null)
    // Offline stays offline — the server is still unreachable either way.
    setStatus((s) => (s === 'offline' ? 'offline' : 'guest'))
  }, [])

  const refresh = useCallback(() => setNonce((n) => n + 1), [])

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      initialProfile,
      localIdentity,
      signedIn: status === 'authenticated' || localIdentity !== null,
      online: status === 'authenticated',
      login,
      signup,
      browseOffline,
      logout,
      refresh,
    }),
    [status, initialProfile, localIdentity, login, signup, browseOffline, logout, refresh],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
