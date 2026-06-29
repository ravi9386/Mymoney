import type { ReactNode } from 'react'

interface Props {
  label: string
  value: ReactNode
  hint?: ReactNode
  accent?: 'brand' | 'blue' | 'amber' | 'rose' | 'neutral'
}

const accentMap: Record<NonNullable<Props['accent']>, string> = {
  brand:   'border-l-4 border-brand-500',
  blue:    'border-l-4 border-sky-500',
  amber:   'border-l-4 border-amber-500',
  rose:    'border-l-4 border-rose-500',
  neutral: 'border-l-4 border-ink-300'
}

export default function StatCard({ label, value, hint, accent = 'neutral' }: Props) {
  return (
    <div className={`card ${accentMap[accent]}`}>
      <div className="stat-label">{label}</div>
      <div className="stat-value mt-1">{value}</div>
      {hint && <div className="text-xs text-ink-500 mt-1">{hint}</div>}
    </div>
  )
}
