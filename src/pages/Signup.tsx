import { ArrowLeft, Check, CloudOff, Leaf } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ApiError } from '../api/client'
import StatusBar from '../components/StatusBar'
import { useAuth } from '../context/AuthContext'
import { useI18n } from '../i18n'
import { Field } from './Login'

export default function Signup() {
  const { t } = useI18n()
  const { signup, status } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [agreePrivacy, setAgreePrivacy] = useState(false)
  const [agreeData, setAgreeData] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const allAgreed = agreeTerms && agreePrivacy && agreeData
  const toggleAll = () => {
    const next = !allAgreed
    setAgreeTerms(next)
    setAgreePrivacy(next)
    setAgreeData(next)
  }

  // The backend enforces the same rules; checking here avoids a round trip.
  const passwordOk = password.length >= 8 && /[a-zA-Z]/.test(password) && /\d/.test(password)
  const canSubmit =
    name.trim() !== '' && email.trim() !== '' && passwordOk && agreeTerms && agreePrivacy && !busy

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    setBusy(true)
    setError('')
    try {
      await signup({
        email: email.trim(),
        password,
        name: name.trim(),
        agreeTerms,
        agreePrivacy,
        agreeData,
      })
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
          {t('auth.signup.title')}
        </h1>
        <p className="mt-2 text-sm text-moss-500">{t('auth.signup.sub')}</p>

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
          <Field label={t('auth.name')} value={name} onChange={setName} autoComplete="name" />
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
            autoComplete="new-password"
            value={password}
            onChange={setPassword}
            hint={t('auth.password.rule')}
          />

          {/* Consent — terms and privacy are required by the API. */}
          <div className="!mt-6 overflow-hidden rounded-2xl bg-white shadow-card">
            <button
              type="button"
              onClick={toggleAll}
              className="flex w-full items-center gap-3 border-b border-moss-100 px-4 py-3.5 text-left"
            >
              <Box checked={allAgreed} />
              <span className="flex-1 text-sm font-semibold text-ink-900">
                {t('auth.consent.all')}
              </span>
            </button>
            <ConsentRow
              label={t('auth.consent.terms')}
              required={t('auth.consent.required')}
              checked={agreeTerms}
              onToggle={() => setAgreeTerms((v) => !v)}
            />
            <ConsentRow
              label={t('auth.consent.privacy')}
              required={t('auth.consent.required')}
              checked={agreePrivacy}
              onToggle={() => setAgreePrivacy((v) => !v)}
            />
            <ConsentRow
              label={t('auth.consent.data')}
              required={t('auth.consent.optional')}
              checked={agreeData}
              onToggle={() => setAgreeData((v) => !v)}
            />
          </div>

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
            {busy ? t('auth.signup.busy') : t('auth.signup.submit')}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-moss-500">
          {t('auth.signup.hasAccount')}{' '}
          <Link to="/login" className="font-semibold text-moss-700 underline">
            {t('auth.login.submit')}
          </Link>
        </p>
      </div>
    </div>
  )
}

function Box({ checked }: { checked: boolean }) {
  return (
    <span
      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
        checked ? 'border-moss-600 bg-moss-600 text-cream' : 'border-moss-200 bg-white'
      }`}
    >
      {checked && <Check size={13} strokeWidth={3} />}
    </span>
  )
}

function ConsentRow({
  label,
  required,
  checked,
  onToggle,
}: {
  label: string
  required: string
  checked: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center gap-3 border-b border-moss-100 px-4 py-3 text-left last:border-b-0"
    >
      <Box checked={checked} />
      <span className="flex-1 text-sm text-ink-900">{label}</span>
      <span className="text-[11px] text-moss-400">{required}</span>
    </button>
  )
}
