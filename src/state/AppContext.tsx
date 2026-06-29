import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { Asset, Liability, AppState, ProfileSettings } from '../lib/types'
import { loadState, saveState, newId, loadSampleData, resetToEmpty } from '../lib/storage'

interface AppContextValue {
  state: AppState
  addAsset: (a: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateAsset: (id: string, patch: Partial<Asset>) => void
  deleteAsset: (id: string) => void
  addLiability: (l: Omit<Liability, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateLiability: (id: string, patch: Partial<Liability>) => void
  deleteLiability: (id: string) => void
  updateProfile: (patch: Partial<ProfileSettings>) => void
  replaceState: (next: AppState) => void
  loadSample: () => void
  reset: () => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => loadState())

  useEffect(() => {
    saveState(state)
  }, [state])

  const value = useMemo<AppContextValue>(() => ({
    state,
    addAsset: (a) => {
      const now = new Date().toISOString()
      const asset: Asset = { id: newId('a'), createdAt: now, updatedAt: now, ...a }
      setState((s) => ({ ...s, assets: [asset, ...s.assets] }))
    },
    updateAsset: (id, patch) =>
      setState((s) => ({
        ...s,
        assets: s.assets.map((a) =>
          a.id === id ? { ...a, ...patch, updatedAt: new Date().toISOString() } : a
        )
      })),
    deleteAsset: (id) =>
      setState((s) => ({ ...s, assets: s.assets.filter((a) => a.id !== id) })),
    addLiability: (l) => {
      const now = new Date().toISOString()
      const liability: Liability = { id: newId('l'), createdAt: now, updatedAt: now, ...l }
      setState((s) => ({ ...s, liabilities: [liability, ...s.liabilities] }))
    },
    updateLiability: (id, patch) =>
      setState((s) => ({
        ...s,
        liabilities: s.liabilities.map((l) =>
          l.id === id ? { ...l, ...patch, updatedAt: new Date().toISOString() } : l
        )
      })),
    deleteLiability: (id) =>
      setState((s) => ({ ...s, liabilities: s.liabilities.filter((l) => l.id !== id) })),
    updateProfile: (patch) =>
      setState((s) => ({ ...s, profile: { ...s.profile, ...patch } })),
    replaceState: (next) => setState(next),
    loadSample: () => setState(loadSampleData()),
    reset: () => setState(resetToEmpty())
  }), [state])

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
