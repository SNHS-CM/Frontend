/** Thin fetch wrapper around the Codimoment backend.
 *
 *  Every call goes through `request()` so the bearer token, JSON encoding and
 *  error shape are handled in exactly one place. A failure to reach the server
 *  at all surfaces as `ApiError.isOffline`, which is what makes the app fall
 *  back to local mode instead of showing an error.
 */

const RAW_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8000'

export const API_BASE = RAW_BASE.replace(/\/+$/, '')

const TOKEN_KEY = 'codimoment.token'

export class ApiError extends Error {
  /** HTTP status, or 0 when the server could not be reached. */
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }

  /** The request never reached the server — network down or backend not running. */
  get isOffline() {
    return this.status === 0
  }

  /** The token is missing, expired or rejected. */
  get isUnauthorized() {
    return this.status === 401
  }
}

// --- token ------------------------------------------------------------------

let memoryToken: string | null | undefined

export function getToken(): string | null {
  if (memoryToken === undefined) {
    try {
      memoryToken = localStorage.getItem(TOKEN_KEY)
    } catch {
      memoryToken = null
    }
  }
  return memoryToken
}

export function setToken(token: string | null) {
  memoryToken = token
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    // private browsing / storage disabled — the in-memory token still works
  }
}

// --- urls -------------------------------------------------------------------

/** Resolve a path the API returned (`/media/avatars/x.png`) against the API host.
 *  Data URLs and absolute URLs are passed through untouched. */
export function assetUrl(url: string): string {
  if (!url) return ''
  if (/^(https?:|data:|blob:)/.test(url)) return url
  return `${API_BASE}${url.startsWith('/') ? '' : '/'}${url}`
}

/** Inverse of `assetUrl`: strip our own host back off before sending a media URL
 *  to the server, so the database keeps host-independent paths. */
export function relativeUrl(url: string): string {
  if (!url) return ''
  return url.startsWith(`${API_BASE}/`) ? url.slice(API_BASE.length) : url
}

// --- errors -----------------------------------------------------------------

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

/** FastAPI reports errors as `{detail}` — a string for HTTPException, a list of
 *  field errors for 422. Flatten both into one readable message. */
function messageFrom(data: unknown, fallback: string): string {
  if (data && typeof data === 'object' && 'detail' in data) {
    const detail = (data as { detail: unknown }).detail
    if (typeof detail === 'string') return detail
    if (Array.isArray(detail)) {
      const parts = detail
        .map((item) =>
          item && typeof item === 'object' && 'msg' in item
            ? String((item as { msg: unknown }).msg)
            : null,
        )
        .filter((msg): msg is string => Boolean(msg))
      if (parts.length) return parts.join('\n')
    }
  }
  return fallback
}

// --- request ----------------------------------------------------------------

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
  /** JSON body, or FormData for uploads. */
  body?: unknown
  /** Set false for endpoints that do not need a token (login, signup, health). */
  auth?: boolean
  signal?: AbortSignal
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = true, signal } = options

  const headers: Record<string, string> = {}
  if (auth) {
    const token = getToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }

  let payload: BodyInit | undefined
  if (body instanceof FormData) {
    // Let the browser set the multipart boundary.
    payload = body
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
    payload = JSON.stringify(body)
  }

  let res: Response
  try {
    res = await fetch(`${API_BASE}${path}`, { method, headers, body: payload, signal })
  } catch {
    throw new ApiError(0, '서버에 연결할 수 없습니다.')
  }

  if (res.status === 204) return undefined as T

  const text = await res.text()
  const data = text ? parseJson(text) : null

  if (!res.ok) {
    throw new ApiError(res.status, messageFrom(data, `요청에 실패했습니다 (${res.status})`))
  }
  return data as T
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) => request<T>(path, options),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'POST', body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'PATCH', body }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'PUT', body }),
  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'DELETE' }),
}

/** Cheap reachability probe used to tell "logged out" apart from "server down". */
export async function ping(): Promise<boolean> {
  try {
    await request('/health', { auth: false })
    return true
  } catch {
    return false
  }
}
