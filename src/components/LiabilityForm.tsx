import { useState } from 'react'
import { LIABILITY_META, LIABILITY_ORDER } from '../lib/constants'
import type { Liability, LiabilityType } from '../lib/types'

interface Props {
  initial?: Liability | null
  onSubmit: (data: Omit<Liability, 'id' | 'createdAt' | 'updatedAt'>) => void
  onCancel: () => void
}

export default function LiabilityForm({ initial, onSubmit, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? '')
  const [type, setType] = useState<LiabilityType>(initial?.type ?? 'home_loan')
  const [outstanding, setOutstanding] = useState(initial?.outstanding?.toString() ?? '')
  const [interestRate, setInterestRate] = useState(initial?.interestRate?.toString() ?? '8.5')
  const [emi, setEmi] = useState(initial?.emi?.toString() ?? '')
  const [notes, setNotes] = useState(initial?.notes ?? '')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    onSubmit({
      name: name.trim(),
      type,
      outstanding: parseFloat(outstanding) || 0,
      interestRate: parseFloat(interestRate) || 0,
      emi: parseFloat(emi) || 0,
      notes: notes.trim() || undefined
    })
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="label">Loan name</label>
          <input
            className="input"
            placeholder="e.g. HDFC Home Loan, Bajaj Personal Loan"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            required
          />
        </div>

        <div>
          <label className="label">Type</label>
          <select className="input" value={type} onChange={(e) => setType(e.target.value as LiabilityType)}>
            {LIABILITY_ORDER.map((k) => (
              <option key={k} value={k}>{LIABILITY_META[k].label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Outstanding amount (₹)</label>
          <input
            className="input tabular-nums"
            type="number"
            min={0}
            step="any"
            value={outstanding}
            onChange={(e) => setOutstanding(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="label">Interest rate (%)</label>
          <input
            className="input tabular-nums"
            type="number"
            min={0}
            step="0.01"
            value={interestRate}
            onChange={(e) => setInterestRate(e.target.value)}
          />
        </div>

        <div>
          <label className="label">Monthly EMI (₹)</label>
          <input
            className="input tabular-nums"
            type="number"
            min={0}
            step="any"
            value={emi}
            onChange={(e) => setEmi(e.target.value)}
          />
        </div>

        <div className="md:col-span-2">
          <label className="label">Notes (optional)</label>
          <textarea
            className="input min-h-[70px]"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" className="btn-outline" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn-primary">{initial ? 'Save changes' : 'Add liability'}</button>
      </div>
    </form>
  )
}
