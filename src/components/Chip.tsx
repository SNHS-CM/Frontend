export default function Chip({
  label,
  active,
  onClick,
}: {
  label: string
  active?: boolean
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
        active
          ? 'bg-moss-700 text-cream'
          : 'bg-moss-100 text-moss-700 hover:bg-moss-200'
      }`}
    >
      {label}
    </button>
  )
}
