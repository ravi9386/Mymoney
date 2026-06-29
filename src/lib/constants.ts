import type { AssetCategory, LiabilityType, ProfileSettings } from './types'

export interface CategoryMeta {
  key: AssetCategory
  label: string
  short: string
  defaultReturn: number
  color: string
  description: string
  group: 'Equity' | 'Debt' | 'Retirement' | 'Real Assets' | 'Liquid' | 'Alternate'
}

export const CATEGORY_META: Record<AssetCategory, CategoryMeta> = {
  real_estate: {
    key: 'real_estate',
    label: 'Real Estate',
    short: 'RE',
    defaultReturn: 7,
    color: '#0f766e',
    description: 'Land, residential or commercial property',
    group: 'Real Assets'
  },
  mf_equity: {
    key: 'mf_equity',
    label: 'Mutual Funds — Equity',
    short: 'MF·E',
    defaultReturn: 12,
    color: '#138846',
    description: 'Equity mutual funds, index funds, ELSS',
    group: 'Equity'
  },
  mf_debt: {
    key: 'mf_debt',
    label: 'Mutual Funds — Debt',
    short: 'MF·D',
    defaultReturn: 7,
    color: '#2563eb',
    description: 'Debt funds, liquid funds, gilt funds',
    group: 'Debt'
  },
  nps: {
    key: 'nps',
    label: 'NPS',
    short: 'NPS',
    defaultReturn: 9,
    color: '#7c3aed',
    description: 'National Pension System (Tier 1 / Tier 2)',
    group: 'Retirement'
  },
  epf: {
    key: 'epf',
    label: 'EPF',
    short: 'EPF',
    defaultReturn: 8.25,
    color: '#9333ea',
    description: 'Employee Provident Fund',
    group: 'Retirement'
  },
  ppf: {
    key: 'ppf',
    label: 'PPF',
    short: 'PPF',
    defaultReturn: 7.1,
    color: '#a855f7',
    description: 'Public Provident Fund (15-year lock-in)',
    group: 'Retirement'
  },
  stocks: {
    key: 'stocks',
    label: 'Stocks',
    short: 'STK',
    defaultReturn: 12,
    color: '#16a34a',
    description: 'Direct equity holdings',
    group: 'Equity'
  },
  bonds: {
    key: 'bonds',
    label: 'Bonds',
    short: 'BND',
    defaultReturn: 7,
    color: '#0284c7',
    description: 'Government / corporate bonds',
    group: 'Debt'
  },
  gold: {
    key: 'gold',
    label: 'Gold',
    short: 'AU',
    defaultReturn: 8,
    color: '#d97706',
    description: 'Physical gold, SGB, gold ETFs / funds',
    group: 'Alternate'
  },
  fd: {
    key: 'fd',
    label: 'Fixed Deposit',
    short: 'FD',
    defaultReturn: 6.5,
    color: '#0ea5e9',
    description: 'Bank fixed and recurring deposits',
    group: 'Debt'
  },
  crypto: {
    key: 'crypto',
    label: 'Crypto',
    short: 'CR',
    defaultReturn: 15,
    color: '#ea580c',
    description: 'Bitcoin, Ethereum and other digital assets',
    group: 'Alternate'
  },
  cash: {
    key: 'cash',
    label: 'Cash & Savings',
    short: 'CSH',
    defaultReturn: 3.5,
    color: '#64748b',
    description: 'Savings account, cash in hand, sweep accounts',
    group: 'Liquid'
  }
}

export const CATEGORY_ORDER: AssetCategory[] = [
  'real_estate',
  'stocks',
  'mf_equity',
  'mf_debt',
  'bonds',
  'fd',
  'nps',
  'epf',
  'ppf',
  'gold',
  'crypto',
  'cash'
]

export interface LiabilityMeta {
  key: LiabilityType
  label: string
  color: string
}

export const LIABILITY_META: Record<LiabilityType, LiabilityMeta> = {
  home_loan:     { key: 'home_loan',     label: 'Home Loan',     color: '#0f766e' },
  car_loan:      { key: 'car_loan',      label: 'Car / Vehicle Loan', color: '#0284c7' },
  personal_loan: { key: 'personal_loan', label: 'Personal Loan', color: '#dc2626' },
  education_loan:{ key: 'education_loan',label: 'Education Loan',color: '#7c3aed' },
  credit_card:   { key: 'credit_card',   label: 'Credit Card',   color: '#f43f5e' },
  other:         { key: 'other',         label: 'Other',         color: '#64748b' }
}

export const LIABILITY_ORDER: LiabilityType[] = [
  'home_loan',
  'car_loan',
  'education_loan',
  'personal_loan',
  'credit_card',
  'other'
]

export const DEFAULT_PROFILE: ProfileSettings = {
  displayName: 'You',
  currentAge: 32,
  retirementAge: 60,
  monthlyExpenses: 60000,
  inflationRate: 6,
  postRetirementReturn: 7,
  yearsInRetirement: 25
}
