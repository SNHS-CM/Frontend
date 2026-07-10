import { Leaf } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import StatusBar from '../components/StatusBar'

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
  const isLast = step === slides.length - 1
  const slide = slides[step]

  return (
    <div className="relative flex h-full flex-col text-sand-50">
      <img
        src={`https://picsum.photos/seed/${slide.seed}/860/1600`}
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
              onClick={() => navigate('/home')}
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
            onClick={() => (isLast ? navigate('/home') : setStep((s) => s + 1))}
            className="w-full rounded-full bg-clay-500 py-3.5 text-sm font-semibold text-sand-50 active:bg-clay-600"
          >
            {isLast ? '시작하기' : '다음'}
          </button>
        </div>
      </div>
    </div>
  )
}
