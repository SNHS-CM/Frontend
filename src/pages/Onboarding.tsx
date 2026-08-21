import { CloudOff, Leaf } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import StatusBar from '../components/StatusBar'
import { outfitPhoto } from '../data/placeholder'
import { useAuth } from '../context/AuthContext'
import { useI18n } from '../i18n'

const slides = [
  {
    seed: 'onboard-1',
    title: '당신의 선택이\n지구를 바꿉니다',
    body: '친환경 소재로 만든 데일리 룩을 만나보세요.',
  },
  {
    seed: 'onboard-2',
    title: '투명한\n공급망',
    body: '모든 제품의 원산지와 탄소발자국을 확인하세요.',
  },
  {
    seed: 'onboard-3',
    title: '순환되는\n옷장',
    body: '리세일과 리페어로 옷의 수명을 늘려보세요.',
  },
]

export default function Onboarding() {
  const [step, setStep] = useState(0)
  const navigate = useNavigate()
  const { t } = useI18n()
  const { status, signedIn, demo, browseOffline } = useAuth()

  const isLast = step === slides.length - 1
  const slide = slides[step]

  return (
    <div className="relative flex h-full flex-col text-cream">
      <img
        src={outfitPhoto(slide.seed, 860, 1600)}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-moss-900/60 via-moss-900/20 to-moss-900/95" />

      <div className="relative z-10 flex h-full flex-col">
        <StatusBar light />

        <div className="flex items-center justify-between px-6 pt-2">
          <div className="flex items-center gap-1.5 text-sm font-semibold">
            <Leaf size={18} />
            REWEAVE
          </div>
          {!isLast && (
            <button
              type="button"
              onClick={() => navigate(signedIn ? '/home' : '/login')}
              className="text-sm text-sand-100/80"
            >
              건너뛰기
            </button>
          )}
        </div>

        <div className="mt-auto space-y-6 px-6 pb-8">
          <div className="flex gap-1.5">
            {slides.map((s, i) => (
              <span
                key={s.seed}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  i <= step ? 'bg-clay-400' : 'bg-sand-50/25'
                }`}
              />
            ))}
          </div>

          <h1 className="whitespace-pre-line font-display text-3xl font-medium leading-tight">
            {slide.title}
          </h1>
          <p className="text-sm text-sand-100/85">{slide.body}</p>

          <button
            type="button"
            onClick={() => {
              if (!isLast) return setStep((s) => s + 1)
              navigate(signedIn ? '/home' : '/signup')
            }}
            className="w-full rounded-full bg-clay-500 py-3.5 text-sm font-semibold text-cream active:bg-clay-600"
          >
            {isLast ? (signedIn ? '시작하기' : t('auth.signup.submit')) : '다음'}
          </button>

          {isLast && !signedIn && (
            <p className="!mt-4 text-center text-sm text-sand-100/80">
              {t('auth.signup.hasAccount')}{' '}
              <Link to="/login" className="font-semibold text-cream underline">
                {t('auth.login.submit')}
              </Link>
            </p>
          )}

          {/* 서버가 꺼져 있어도 계정 없이 바로 볼 수 있는 길을 남겨 둔다. */}
          {isLast && status === 'offline' && !signedIn && (
            <button
              type="button"
              onClick={() => {
                browseOffline()
                navigate('/home', { replace: true })
              }}
              title={t(demo ? 'demo.note' : 'auth.offline.note')}
              className="!mt-4 mx-auto flex w-fit items-center gap-1.5 rounded-full bg-sand-50/25 px-3 py-1.5 text-[11px] font-medium text-sand-100/80"
            >
              <CloudOff size={13} />
              {demo
                ? t('demo.browse')
                : `${t('auth.offline.badge')} · ${t('auth.offline.browse')}`}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
