import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function SectionHeader({
  title,
  subtitle,
  to,
}: {
  title: string
  subtitle?: string
  to?: string
}) {
  return (
    <div className="flex items-end justify-between px-5">
      <div>
        <h2 className="font-display text-lg font-medium text-ink-900">{title}</h2>
        {subtitle && <p className="text-xs text-moss-500">{subtitle}</p>}
      </div>
      {to && (
        <Link to={to} className="flex items-center gap-0.5 text-xs font-medium text-moss-600">
          전체보기
          <ChevronRight size={14} />
        </Link>
      )}
    </div>
  )
}
