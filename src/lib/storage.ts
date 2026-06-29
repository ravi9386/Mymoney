import type { Asset, Liability, AppState, ProfileSettings } from './types'
import { DEFAULT_PROFILE } from './constants'

const STORAGE_KEY = 'mymoney.state.v1'

const SAMPLE_ASSETS: Asset[] = [
  {
    id: 'sample-mf-1',
    name: 'Equity SIP — Nifty 50 Index Fund',
    category: 'mf_equity',
    currentValue: 850000,
    monthlyContribution: 25000,
    expectedReturn: 12,
    notes: 'Monthly SIP since 2020',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'sample-epf-1',
    name: 'EPF — Employer linked',
    category: 'epf',
    currentValue: 1250000,
    monthlyContribution: 14000,
    expectedReturn: 8.25,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'sample-ppf-1',
    name: 'PPF — SBI',
    category: 'ppf',
    currentValue: 480000,
    monthlyContribution: 12500,
    expectedReturn: 7.1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'sample-re-1',
    name: 'Apartment — Whitefield',
    category: 'real_estate',
    currentValue: 9500000,
    monthlyContribution: 0,
    expectedReturn: 7,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'sample-stk-1',
    name: 'Direct Stocks Portfolio',
    category: 'stocks',
    currentValue: 620000,
    monthlyContribution: 10000,
    expectedReturn: 13,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'sample-gold-1',
    name: 'Sovereign Gold Bond',
    category: 'gold',
    currentValue: 320000,
    monthlyContribution: 0,
    expectedReturn: 8,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'sample-fd-1',
    name: 'Emergency Fund — HDFC FD',
    category: 'fd',
    currentValue: 500000,
    monthlyContribution: 0,
    expectedReturn: 7,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'sample-cash-1',
    name: 'Savings Account',
    category: 'cash',
    currentValue: 150000,
    monthlyContribution: 0,
    expectedReturn: 3.5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

const SAMPLE_LIABILITIES: Liability[] = [
  {
    id: 'sample-hl-1',
    name: 'Home Loan — HDFC',
    type: 'home_loan',
    outstanding: 4200000,
    interestRate: 8.5,
    emi: 38500,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

function defaultState(): AppState {
  return {
    assets: SAMPLE_ASSETS,
    liabilities: SAMPLE_LIABILITIES,
    profile: { ...DEFAULT_PROFILE }
  }
}

export function loadState(): AppState {
  if (typeof window === 'undefined') return defaultState()
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultState()
    const parsed = JSON.parse(raw) as Partial<AppState>
    return {
      assets: parsed.assets ?? [],
      liabilities: parsed.liabilities ?? [],
      profile: { ...DEFAULT_PROFILE, ...(parsed.profile ?? {}) }
    }
  } catch {
    return defaultState()
  }
}

export function saveState(state: AppState): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function clearState(): void {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(STORAGE_KEY)
}

export function loadSampleData(): AppState {
  return defaultState()
}

export function resetToEmpty(): AppState {
  return {
    assets: [],
    liabilities: [],
    profile: { ...DEFAULT_PROFILE }
  }
}

export function exportToJSON(state: AppState): string {
  return JSON.stringify(state, null, 2)
}

export function importFromJSON(json: string): AppState {
  const parsed = JSON.parse(json) as Partial<AppState>
  if (!parsed || typeof parsed !== 'object') throw new Error('Invalid file')
  return {
    assets: Array.isArray(parsed.assets) ? parsed.assets : [],
    liabilities: Array.isArray(parsed.liabilities) ? parsed.liabilities : [],
    profile: { ...DEFAULT_PROFILE, ...(parsed.profile ?? {}) }
  }
}

export function newId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}
