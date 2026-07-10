import { Signal, Wifi, BatteryFull } from 'lucide-react'

export default function StatusBar({ light }: { light?: boolean }) {
  const color = light ? 'text-sand-50' : 'text-ink-900'
  return (
    <div className={`flex items-center justify-between px-6 pb-1 pt-3 text-xs font-semibold ${color}`}>
      <span>9:41</span>
      <div className="flex items-center gap-1.5">
        <Signal size={14} />
        <Wifi size={14} />
        <BatteryFull size={16} />
      </div>
    </div>
  )
}
