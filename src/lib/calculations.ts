import type { Asset, Liability, ProfileSettings } from './types'

export interface NetWorthSummary {
  totalAssets: number
  totalLiabilities: number
  netWorth: number
  liquid: number
  monthlyInflow: number
}

export function summarize(assets: Asset[], liabilities: Liability[]): NetWorthSummary {
  const totalAssets = assets.reduce((sum, a) => sum + (a.currentValue || 0), 0)
  const totalLiabilities = liabilities.reduce((sum, l) => sum + (l.outstanding || 0), 0)
  const monthlyInflow = assets.reduce((sum, a) => sum + (a.monthlyContribution || 0), 0)
  const liquid = assets
    .filter((a) => a.category === 'cash' || a.category === 'fd' || a.category === 'mf_debt')
    .reduce((sum, a) => sum + (a.currentValue || 0), 0)
  return {
    totalAssets,
    totalLiabilities,
    netWorth: totalAssets - totalLiabilities,
    liquid,
    monthlyInflow
  }
}

/**
 * Future value of a single asset:
 *  - Lump-sum grows at annual rate, compounded yearly.
 *  - SIP (monthly) contributions compounded monthly at (rate/12).
 */
export function futureValueOfAsset(asset: Asset, years: number): number {
  const r = (asset.expectedReturn || 0) / 100
  const lumpFV = (asset.currentValue || 0) * Math.pow(1 + r, years)
  const monthlyRate = r / 12
  const months = Math.max(0, Math.round(years * 12))
  const c = asset.monthlyContribution || 0
  const sipFV =
    monthlyRate === 0
      ? c * months
      : c * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate)
  return lumpFV + sipFV
}

export function totalFutureValue(assets: Asset[], years: number): number {
  return assets.reduce((sum, a) => sum + futureValueOfAsset(a, years), 0)
}

export interface ProjectionPoint {
  year: number
  age?: number
  total: number
  byCategory: Record<string, number>
}

export function projectByYear(
  assets: Asset[],
  yearsHorizon: number,
  currentAge?: number
): ProjectionPoint[] {
  const points: ProjectionPoint[] = []
  for (let y = 0; y <= yearsHorizon; y++) {
    const byCategory: Record<string, number> = {}
    let total = 0
    for (const a of assets) {
      const fv = futureValueOfAsset(a, y)
      total += fv
      byCategory[a.category] = (byCategory[a.category] || 0) + fv
    }
    points.push({
      year: y,
      age: typeof currentAge === 'number' ? currentAge + y : undefined,
      total,
      byCategory
    })
  }
  return points
}

/** Corpus needed at retirement to support N years of expenses, with inflation. */
export function retirementCorpusNeeded(profile: ProfileSettings): number {
  const yearsToRetire = Math.max(0, profile.retirementAge - profile.currentAge)
  const inflation = profile.inflationRate / 100
  const postR = profile.postRetirementReturn / 100
  const realRate = (1 + postR) / (1 + inflation) - 1
  const monthlyExpenseAtRetirement = profile.monthlyExpenses * Math.pow(1 + inflation, yearsToRetire)
  const annualExpenseAtRetirement = monthlyExpenseAtRetirement * 12
  const n = profile.yearsInRetirement
  if (Math.abs(realRate) < 1e-9) return annualExpenseAtRetirement * n
  return annualExpenseAtRetirement * ((1 - Math.pow(1 + realRate, -n)) / realRate)
}

export interface RetirementOutcome {
  yearsToRetire: number
  corpusNeeded: number
  projectedCorpus: number
  shortfall: number
  onTrack: boolean
  earliestRetirementAge: number | null
  monthlySipNeededToCloseGap: number
}

export function evaluateRetirement(
  assets: Asset[],
  liabilities: Liability[],
  profile: ProfileSettings
): RetirementOutcome {
  const yearsToRetire = Math.max(0, profile.retirementAge - profile.currentAge)
  const corpusNeeded = retirementCorpusNeeded(profile)
  const totalLiabilitiesAtRetire = liabilities.reduce((sum, l) => sum + l.outstanding, 0)
  const projectedAssets = totalFutureValue(assets, yearsToRetire)
  const projectedCorpus = projectedAssets - Math.max(0, totalLiabilitiesAtRetire * 0)
  const shortfall = corpusNeeded - projectedCorpus
  const onTrack = shortfall <= 0

  let earliest: number | null = null
  for (let age = profile.currentAge; age <= 80; age++) {
    const y = age - profile.currentAge
    const fv = totalFutureValue(assets, y)
    const corpusAtAge = retirementCorpusNeeded({ ...profile, retirementAge: age })
    if (fv >= corpusAtAge) {
      earliest = age
      break
    }
  }

  let monthlySipNeeded = 0
  if (!onTrack && yearsToRetire > 0) {
    const weighted = weightedReturn(assets) / 100
    const months = yearsToRetire * 12
    const monthlyRate = weighted / 12
    if (monthlyRate <= 0) {
      monthlySipNeeded = shortfall / months
    } else {
      const factor = ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate)
      monthlySipNeeded = shortfall / factor
    }
  }

  return {
    yearsToRetire,
    corpusNeeded,
    projectedCorpus,
    shortfall: Math.max(0, shortfall),
    onTrack,
    earliestRetirementAge: earliest,
    monthlySipNeededToCloseGap: Math.max(0, monthlySipNeeded)
  }
}

export function weightedReturn(assets: Asset[]): number {
  const total = assets.reduce((s, a) => s + a.currentValue, 0)
  if (total <= 0) return 9
  const w = assets.reduce((s, a) => s + a.currentValue * a.expectedReturn, 0)
  return w / total
}

export interface AllocationSlice {
  category: string
  value: number
  share: number
}

export function allocationByCategory(assets: Asset[]): AllocationSlice[] {
  const totals: Record<string, number> = {}
  for (const a of assets) {
    totals[a.category] = (totals[a.category] || 0) + a.currentValue
  }
  const total = Object.values(totals).reduce((s, v) => s + v, 0) || 1
  return Object.entries(totals).map(([category, value]) => ({
    category,
    value,
    share: value / total
  }))
}
