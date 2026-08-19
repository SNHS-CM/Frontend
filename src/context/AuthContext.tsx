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
import { fetchMe, login as loginRequest, signup as signupRequest } from '../api/profile'
import type { SignupInput as SignupPayload } from '../api/profile'
import type { ApiProfile } from '../api/types'

/** How the app is currently talking to the backend.
 *
 *  `offline` is not an error state: when the server cannot be reached at all the
 *  app keeps working against localStorage, so the profile screen stays usable
 *  without a running backend. Only a reachable server that rejects us puts the
 *  app in `guest`, which is what sends the user to the login screen.
 */
export type AuthStatus = 'checking' | 'authenticated' | 'guest' | 'offline'

interface AuthContextValue {
  status: AuthStatus
  /** Profile fetched during the session check — the seed for ProfileContext. */
  initialProfile: ApiProfile | null
  online: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (input: SignupPayload) => Promise<void>
  logout: () => void
  /** Re-run the session check, e.g. after starting the backend. */
  refresh: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('checking')
  const [initialProfile, setInitialProfile] = useState<ApiProfile | null>(null)
  const [nonce, setNonce] = useState(0)

  useEffect(() => {
    let cancelled = false

    const check = async () => {
      setStatus('checking')
      try {
        const profile = await fetchMe()
        if (cancelled) return
        setInitialProfile(profile)
        setStatus('authenticated')
      } catch (error) {
        if (cancelled) return
        if (error instanceof ApiError && error.isOffline) {
          setStatus('offline')
          return
        }
        // The token is missing or rejected. Confirm the server is actually up
        // before sending the user to a login screen they could not use.
        setToken(null)
        setInitialProfile(null)
        const reachable = await ping()
        if (cancelled) return
        setStatus(reachable ? 'guest' : 'offline')
      }
    }

    void check()
    return () => {
      cancelled = true
    }
  }, [nonce])

  const login = useCallback(async (email: string, password: string) => {
    const { accessToken } = await loginRequest(email, password)
    setToken(accessToken)
    const profile = await fetchMe()
    setInitialProfile(profile)
    setStatus('authenticated')
  }, [])

  const signup = useCallback(async (input: SignupPayload) => {
    const { accessToken } = await signupRequest(input)
    setToken(accessToken)
    const profile = await fetchMe()
    setInitialProfile(profile)
    setStatus('authenticated')
  }, [])

  const logout = useCallback(() => {
    setToken(null)
    setInitialProfile(null)
    setStatus('guest')
  }, [])

  const refresh = useCallback(() => setNonce((n) => n + 1), [])

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      initialProfile,
      online: status === 'authenticated',
      login,
      signup,
      logout,
      refresh,
    }),
    [status, initialProfile, login, signup, logout, refresh],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
