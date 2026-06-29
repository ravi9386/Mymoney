import { useState } from 'react'
import { useApp } from '../state/AppContext'
import { LIABILITY_META } from '../lib/constants'
import type { Liability } from '../lib/types'
import { formatINR, formatINRCompact, formatPercent } from '../lib/format'
import Modal from '../components/Modal'
import LiabilityForm from '../components/LiabilityForm'

export default function LiabilitiesPage() {
  const { state, addLiability, updateLiability, deleteLiability } = useApp()
  const { liabilities } = state
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState<Liability | null>(null)

  const total = liabilities.reduce((s, l) => s + l.outstanding, 0)
  const monthlyEmi = liabilities.reduce((s, l) => s + (l.emi || 0), 0)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-500">Track all outstanding loans & credit. Net worth = assets − liabilities.</p>
        <button className="btn-primary" onClick={() => setShowAdd(true)}>+ Add liability</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Tile label="Total liabilities" value={formatINRCompact(total)} hint={formatINR(total)} />
        <Tile label="Monthly EMI burden" value={formatINRCompact(monthlyEmi)} hint={`${liabilities.length} loan${liabilities.length === 1 ? '' : 's'}`} />
        <Tile
          label="Weighted interest"
          value={total > 0
            ? `${(liabilities.reduce((s, l) => s + l.outstanding * l.interestRate, 0) / total).toFixed(2)}%`
            : '—'}
          hint="Across all outstanding"
        />
      </div>

      <div className="card overflow-x-auto">
        {liabilities.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-3xl mb-2">🏷️</div>
            <p className="text-ink-600 mb-3">No liabilities tracked. Add one to see net worth correctly.</p>
            <button className="btn-primary" onClick={() => setShowAdd(true)}>+ Add liability</button>
          </div>
        ) : (
          <table className="w-full text-sm min-w-[600px]">
            <thead className="text-xs uppercase tracking-wide text-ink-500 border-b border-ink-100">
              <tr>
                <th className="py-3 px-3 text-left">Loan</th>
                <th className="py-3 px-3 text-left">Type</th>
                <th className="py-3 px-3 text-right">Outstanding</th>
                <th className="py-3 px-3 text-right">Rate</th>
                <th className="py-3 px-3 text-right">EMI</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {liabilities.map((l) => {
                const meta = LIABILITY_META[l.type]
                return (
                  <tr key={l.id} className="border-b border-ink-50 table-row">
                    <td className="py-3 px-3">
                      <div className="font-medium text-ink-900">{l.name}</div>
                      {l.notes && <div className="text-[11px] text-ink-400 truncate max-w-xs">{l.notes}</div>}
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ background: meta.color }} />
                        <span className="text-ink-700">{meta.label}</span>
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right tabular-nums font-medium text-rose-700">{formatINR(l.outstanding)}</td>
                    <td className="py-3 px-3 text-right tabular-nums text-ink-700">{formatPercent(l.interestRate, 2)}</td>
                    <td className="py-3 px-3 text-right tabular-nums text-ink-700">{l.emi ? formatINR(l.emi) : '—'}</td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <button className="text-brand-700 hover:underline mr-3 text-xs font-medium" onClick={() => setEditing(l)}>Edit</button>
                      <button
                        className="text-rose-600 hover:underline text-xs font-medium"
                        onClick={() => { if (confirm(`Delete "${l.name}"?`)) deleteLiability(l.id) }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={showAdd} title="Add liability" onClose={() => setShowAdd(false)} width="lg">
        <LiabilityForm
          onSubmit={(data) => { addLiability(data); setShowAdd(false) }}
          onCancel={() => setShowAdd(false)}
        />
      </Modal>

      <Modal open={!!editing} title="Edit liability" onClose={() => setEditing(null)} width="lg">
        {editing && (
          <LiabilityForm
            initial={editing}
            onSubmit={(data) => { updateLiability(editing.id, data); setEditing(null) }}
            onCancel={() => setEditing(null)}
          />
        )}
      </Modal>
    </div>
  )
}

function Tile({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="card">
      <div className="stat-label">{label}</div>
      <div className="text-2xl font-bold text-ink-900 mt-1 tabular-nums">{value}</div>
      {hint && <div className="text-xs text-ink-500 mt-1">{hint}</div>}
    </div>
  )
}
