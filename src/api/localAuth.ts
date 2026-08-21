/** 백엔드 없이 동작하는 로컬 계정 저장소.
 *
 *  서버에 연결할 수 없을 때만 쓰인다. 서버가 살아 있으면 언제나 실제 API 가 이기고,
 *  여기 있는 값은 쳐다보지도 않는다. 진짜 인증이 아니라 오프라인 개발용 대체 수단이므로
 *  이걸로 보호되는 것은 아무것도 없다.
 */

const ACCOUNTS_KEY = 'codimoment.localAccounts'
const SESSION_KEY = 'codimoment.localSession'

/** 백엔드 `app/dev_account.py` 와 같은 개발용 자격 증명.
 *  문서에 공개된 값이라 해시 없이 그대로 비교한다. */
export const DEV_ACCOUNT = {
  email: 'test@test.com',
  password: '1234',
  name: '테스트 계정',
} as const

export interface LocalIdentity {
  email: string
  name: string
}

interface StoredAccount extends LocalIdentity {
  /** SHA-256(email:password) — 오프라인에서 만든 계정만 갖는다. */
  digest: string
}

const normalize = (email: string) => email.trim().toLowerCase()

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // private browsing / storage disabled
  }
}

/** `crypto.subtle` 은 보안 컨텍스트(https 또는 localhost)에서만 있다.
 *  없으면 비밀번호를 평문으로 남기지 않기 위해 오프라인 가입을 막는다. */
export function canStoreLocalAccounts(): boolean {
  return typeof crypto !== 'undefined' && typeof crypto.subtle !== 'undefined'
}

async function digest(email: string, password: string): Promise<string> {
  const bytes = new TextEncoder().encode(`${normalize(email)}:${password}`)
  const hash = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(hash), (b) => b.toString(16).padStart(2, '0')).join('')
}

/** 자격 증명이 맞으면 신원을, 아니면 null 을 돌려준다. */
export async function verifyLocalAccount(
  email: string,
  password: string,
): Promise<LocalIdentity | null> {
  const id = normalize(email)
  if (id === DEV_ACCOUNT.email && password === DEV_ACCOUNT.password) {
    return { email: DEV_ACCOUNT.email, name: DEV_ACCOUNT.name }
  }
  if (!canStoreLocalAccounts()) return null

  const account = read<StoredAccount[]>(ACCOUNTS_KEY, []).find((a) => a.email === id)
  if (!account) return null
  return (await digest(id, password)) === account.digest
    ? { email: account.email, name: account.name }
    : null
}

export function localAccountExists(email: string): boolean {
  const id = normalize(email)
  return id === DEV_ACCOUNT.email || read<StoredAccount[]>(ACCOUNTS_KEY, []).some((a) => a.email === id)
}

/** 오프라인 가입. 이메일이 이미 쓰이고 있으면 null 을 돌려준다. */
export async function createLocalAccount(
  email: string,
  password: string,
  name: string,
): Promise<LocalIdentity | null> {
  const id = normalize(email)
  if (localAccountExists(id)) return null

  const account: StoredAccount = { email: id, name, digest: await digest(id, password) }
  write(ACCOUNTS_KEY, [...read<StoredAccount[]>(ACCOUNTS_KEY, []), account])
  return { email: account.email, name: account.name }
}

// --- 세션 --------------------------------------------------------------------
// 새로고침해도 온보딩부터 다시 시작하지 않도록 마지막 로컬 로그인을 기억한다.

export function loadLocalSession(): LocalIdentity | null {
  const identity = read<LocalIdentity | null>(SESSION_KEY, null)
  return identity && identity.email ? identity : null
}

export function saveLocalSession(identity: LocalIdentity | null) {
  if (identity) return write(SESSION_KEY, identity)
  try {
    localStorage.removeItem(SESSION_KEY)
  } catch {
    // ignore storage errors
  }
}
