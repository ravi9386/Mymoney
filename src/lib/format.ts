const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0
})

const numberFormatter = new Intl.NumberFormat('en-IN', {
  maximumFractionDigits: 0
})

export function formatINR(value: number): string {
  if (!Number.isFinite(value)) return '—'
  return inrFormatter.format(Math.round(value))
}

export function formatINRCompact(value: number): string {
  if (!Number.isFinite(value)) return '—'
  const abs = Math.abs(value)
  const sign = value < 0 ? '-' : ''
  if (abs >= 1_00_00_000) return `${sign}₹${(abs / 1_00_00_000).toFixed(2)} Cr`
  if (abs >= 1_00_000)    return `${sign}₹${(abs / 1_00_000).toFixed(2)} L`
  if (abs >= 1_000)       return `${sign}₹${(abs / 1_000).toFixed(1)} K`
  return `${sign}₹${numberFormatter.format(Math.round(abs))}`
}

export function formatPercent(value: number, digits = 1): string {
  return `${value.toFixed(digits)}%`
}

export function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return '—'
  return numberFormatter.format(Math.round(value))
}
