import { ArrowLeft, CloudOff, Leaf } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ApiError } from '../api/client'
import StatusBar from '../components/StatusBar'
import { useAuth } from '../context/AuthContext'
import { useI18n } from '../i18n'

export default function Login() {
  const { t } = useI18n()
  const { login, status } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const canSubmit = email.trim() !== '' && password !== '' && !busy

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    setBusy(true)
    setError('')
    try {
      await login(email.trim(), password)
      navigate('/home', { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('auth.error.generic'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-full flex-col pb-10">
      <StatusBar />

      <header className="flex items-center gap-1 px-4 pt-2">
        <button
          type="button"
          onClick={() => navigate('/onboarding')}
          aria-label="뒤로가기"
          className="flex h-9 w-9 items-center justify-center rounded-full text-ink-900"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex items-center gap-1.5 text-sm font-semibold text-moss-700">
          <Leaf size={18} />
          REWEAVE
        </div>
      </header>

      <div className="flex flex-1 flex-col px-6 pt-6">
        <h1 className="font-display text-3xl font-medium leading-tight text-ink-900">
          {t('auth.login.title')}
        </h1>
        <p className="mt-2 text-sm text-moss-500">{t('auth.login.sub')}</p>

        {status === 'offline' && (
          <div className="mt-6 flex items-start gap-2 rounded-2xl bg-clay-100 px-4 py-3 text-clay-600">
            <CloudOff size={15} className="mt-0.5 shrink-0" />
            <div className="text-xs leading-relaxed">
              <p>{t('auth.local.notice')}</p>
              <p className="mt-1 font-medium">{t('auth.local.devHint')}</p>
            </div>
          </div>
        )}

        <form onSubmit={submit} className="mt-8 space-y-3">
          <Field
            label={t('auth.email')}
            type="email"
            autoComplete="email"
            value={email}
            onChange={setEmail}
            placeholder="you@example.com"
          />
          <Field
            label={t('auth.password')}
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={setPassword}
            placeholder="••••••••"
          />

          {error && (
            <p role="alert" className="whitespace-pre-line text-xs text-clay-500">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            className="!mt-6 w-full rounded-full bg-moss-700 py-3.5 text-sm font-semibold text-cream transition-opacity active:bg-moss-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {busy ? t('auth.login.busy') : t('auth.login.submit')}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-moss-500">
          {t('auth.login.noAccount')}{' '}
          <Link to="/signup" className="font-semibold text-moss-700 underline">
            {t('auth.signup.submit')}
          </Link>
        </p>
      </div>
    </div>
  )
}

export function Field({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  autoComplete,
  hint,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  placeholder?: string
  autoComplete?: string
  hint?: string
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-moss-500">{label}</span>
      <input
        type={type}
        value={value}
        autoComplete={autoComplete}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-moss-100 bg-white px-4 py-3 text-sm text-ink-900 outline-none focus:border-moss-400"
      />
      {hint && <span className="mt-1 block text-[11px] text-moss-400">{hint}</span>}
    </label>
  )
}
