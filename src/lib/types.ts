export type AssetCategory =
  | 'real_estate'
  | 'mf_equity'
  | 'mf_debt'
  | 'nps'
  | 'epf'
  | 'ppf'
  | 'stocks'
  | 'bonds'
  | 'gold'
  | 'fd'
  | 'crypto'
  | 'cash'

export type LiabilityType =
  | 'home_loan'
  | 'car_loan'
  | 'personal_loan'
  | 'education_loan'
  | 'credit_card'
  | 'other'

export interface Asset {
  id: string
  name: string
  category: AssetCategory
  currentValue: number
  monthlyContribution: number
  expectedReturn: number
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface Liability {
  id: string
  name: string
  type: LiabilityType
  outstanding: number
  interestRate: number
  emi: number
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface ProfileSettings {
  displayName: string
  currentAge: number
  retirementAge: number
  monthlyExpenses: number
  inflationRate: number
  postRetirementReturn: number
  yearsInRetirement: number
}

export interface AppState {
  assets: Asset[]
  liabilities: Liability[]
  profile: ProfileSettings
}
