/** Thin fetch wrapper around the Codimoment backend.
 *
 *  Every call goes through `request()` so the bearer token, JSON encoding and
 *  error shape are handled in exactly one place. A failure to reach the server
 *  at all surfaces as `ApiError.isOffline`, which is what makes the app fall
 *  back to local mode instead of showing an error.
 */

// 값을 **비워 두면** 백엔드 없이 도는 데모 모드다 (`VITE_API_BASE=`).
// 변수를 아예 두지 않으면 로컬 개발 기본값을 쓴다. `??` 는 undefined 만 걸러내므로
// 빈 문자열은 그대로 남고, 그게 데모 모드 신호가 된다.
const RAW_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8000'

export const API_BASE = RAW_BASE.replace(/\/+$/, '')

/** 백엔드가 설정돼 있는지. false 면 요청을 아예 만들지 않는다.
 *
 *  빈 주소로 두면 모든 요청이 프론트와 같은 출처로 나가서, 정적 호스팅이 404 를
 *  돌려주고 "요청에 실패했습니다 (404)" 만 뜬다. 그럴 바에는 처음부터 나가지 않는
 *  편이 낫다 — 실패한 요청도, 콘솔 오류도, 기다림도 없다. */
export const HAS_BACKEND = API_BASE !== ''

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

  // 데모 모드 — 요청을 만들지 않는다. 호출하는 쪽은 서버가 꺼져 있을 때와 똑같이
  // 처리하므로, 화면은 전부 로컬 데이터로 그려진다.
  if (!HAS_BACKEND) throw new ApiError(0, '데모 모드예요. 변경사항은 이 기기에만 저장돼요.')

  let res: Response
  try {
    res = await fetch(`${API_BASE}${path}`, { method, headers, body: payload, signal })
  } catch (error) {
    // 호출 쪽이 취소한 요청은 서버 장애가 아니다. 그대로 던져 구분할 수 있게 한다.
    if (error instanceof DOMException && error.name === 'AbortError') throw error
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
  if (!HAS_BACKEND) return false
  try {
    await request('/health', { auth: false })
    return true
  } catch {
    return false
  }
}
