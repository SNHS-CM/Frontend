import {
  Bell,
  ChevronRight,
  Gift,
  HelpCircle,
  LogOut,
  MapPin,
  Package,
  Recycle,
  Repeat,
  Heart,
} from 'lucide-react'
import StatusBar from '../components/StatusBar'

const stats = [
  { label: '누적 탄소 절감', value: '48.2kg', icon: Recycle },
  { label: '리세일 판매', value: '6건', icon: Repeat },
  { label: '기부한 옷', value: '3벌', icon: Gift },
]

const menu = [
  { label: '주문 내역', icon: Package },
  { label: '배송지 관리', icon: MapPin },
  { label: '위시리스트', icon: Heart },
  { label: '리세일 등록', icon: Repeat },
  { label: '알림 설정', icon: Bell },
  { label: '고객센터', icon: HelpCircle },
]

export default function Profile() {
  return (
    <div className="pb-24">
      <StatusBar />

      <header className="px-5 pb-2 pt-2">
        <h1 className="font-display text-xl font-medium text-ink-900">마이페이지</h1>
      </header>

      <div className="mx-5 flex items-center gap-3 rounded-2xl bg-moss-100 p-4">
        <img
          src="https://picsum.photos/seed/profile-avatar/120/120"
          alt="프로필 사진"
          className="h-14 w-14 rounded-full object-cover"
        />
        <div>
          <p className="font-medium text-ink-900">지니 님</p>
          <p className="text-xs text-moss-500">kite@hanagukit.top</p>
        </div>
      </div>

      <div className="mx-5 mt-4 grid grid-cols-3 gap-2">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="flex flex-col items-center gap-1 rounded-2xl bg-moss-700 py-4 text-sand-50">
            <Icon size={18} />
            <p className="text-sm font-semibold">{value}</p>
            <p className="text-center text-[10px] leading-tight text-sand-100/75">{label}</p>
          </div>
        ))}
      </div>

      <div className="mx-5 mt-5 divide-y divide-moss-100 overflow-hidden rounded-2xl bg-moss-50">
        {menu.map(({ label, icon: Icon }) => (
          <button
            key={label}
            type="button"
            className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
          >
            <Icon size={18} className="text-moss-600" />
            <span className="flex-1 text-sm text-ink-900">{label}</span>
            <ChevronRight size={16} className="text-moss-400" />
          </button>
        ))}
      </div>

      <button
        type="button"
        className="mx-5 mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-moss-200 py-3.5 text-sm font-medium text-moss-600"
      >
        <LogOut size={16} />
        로그아웃
      </button>
    </div>
  )
}
