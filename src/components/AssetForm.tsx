import { useState } from 'react'
import { CATEGORY_META, CATEGORY_ORDER } from '../lib/constants'
import type { Asset, AssetCategory } from '../lib/types'

interface Props {
  initial?: Asset | null
  onSubmit: (data: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>) => void
  onCancel: () => void
}

export default function AssetForm({ initial, onSubmit, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? '')
  const [category, setCategory] = useState<AssetCategory>(initial?.category ?? 'mf_equity')
  const [currentValue, setCurrentValue] = useState<string>(initial?.currentValue?.toString() ?? '')
  const [monthlyContribution, setMonthlyContribution] = useState<string>(
    initial?.monthlyContribution?.toString() ?? '0'
  )
  const [expectedReturn, setExpectedReturn] = useState<string>(
    (initial?.expectedReturn ?? CATEGORY_META[initial?.category ?? 'mf_equity'].defaultReturn).toString()
  )
  const [notes, setNotes] = useState(initial?.notes ?? '')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    onSubmit({
      name: name.trim(),
      category,
      currentValue: parseFloat(currentValue) || 0,
      monthlyContribution: parseFloat(monthlyContribution) || 0,
      expectedReturn: parseFloat(expectedReturn) || 0,
      notes: notes.trim() || undefined
    })
  }

  const onCategoryChange = (next: AssetCategory) => {
    setCategory(next)
    if (!initial) setExpectedReturn(CATEGORY_META[next].defaultReturn.toString())
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="label">Holding name</label>
          <input
            className="input"
            placeholder="e.g. SBI Bluechip Fund, Apartment in Pune"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            required
          />
        </div>

        <div>
          <label className="label">Category</label>
          <select
            className="input"
            value={category}
            onChange={(e) => onCategoryChange(e.target.value as AssetCategory)}
          >
            {CATEGORY_ORDER.map((k) => (
              <option key={k} value={k}>
                {CATEGORY_META[k].label}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-ink-400 mt-1">{CATEGORY_META[category].description}</p>
        </div>

        <div>
          <label className="label">Current value (₹)</label>
          <input
            className="input tabular-nums"
            type="number"
            min={0}
            step="any"
            placeholder="0"
            value={currentValue}
            onChange={(e) => setCurrentValue(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="label">Monthly contribution (₹)</label>
          <input
            className="input tabular-nums"
            type="number"
            min={0}
            step="any"
            placeholder="0"
            value={monthlyContribution}
            onChange={(e) => setMonthlyContribution(e.target.value)}
          />
          <p className="text-[11px] text-ink-400 mt-1">SIP / EPF deduction / planned add-on. Use 0 for one-time.</p>
        </div>

        <div>
          <label className="label">Expected annual return (%)</label>
          <input
            className="input tabular-nums"
            type="number"
            step="0.1"
            value={expectedReturn}
            onChange={(e) => setExpectedReturn(e.target.value)}
          />
          <p className="text-[11px] text-ink-400 mt-1">
            Default {CATEGORY_META[category].defaultReturn}% — override if you have a better estimate.
          </p>
        </div>

        <div className="md:col-span-2">
          <label className="label">Notes (optional)</label>
          <textarea
            className="input min-h-[70px]"
            placeholder="Tagging, folio number, broker, anything to remember"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" className="btn-outline" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn-primary">
          {initial ? 'Save changes' : 'Add asset'}
        </button>
      </div>
    </form>
  )
}
