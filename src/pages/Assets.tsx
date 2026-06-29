import { useMemo, useState } from 'react'
import { useApp } from '../state/AppContext'
import { CATEGORY_META, CATEGORY_ORDER } from '../lib/constants'
import type { Asset, AssetCategory } from '../lib/types'
import { formatINR, formatINRCompact, formatPercent } from '../lib/format'
import { futureValueOfAsset, summarize } from '../lib/calculations'
import AssetForm from '../components/AssetForm'
import Modal from '../components/Modal'

export default function AssetsPage() {
  const { state, addAsset, updateAsset, deleteAsset } = useApp()
  const { assets } = state
  const [filter, setFilter] = useState<'all' | AssetCategory>('all')
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState<Asset | null>(null)
  const [showAdd, setShowAdd] = useState(false)

  const summary = summarize(assets, state.liabilities)

  const filtered = useMemo(() => {
    return assets
      .filter((a) => (filter === 'all' ? true : a.category === filter))
      .filter((a) =>
        query.trim()
          ? a.name.toLowerCase().includes(query.toLowerCase()) ||
            CATEGORY_META[a.category].label.toLowerCase().includes(query.toLowerCase())
          : true
      )
      .sort((a, b) => b.currentValue - a.currentValue)
  }, [assets, filter, query])

  const grandTotal = filtered.reduce((s, a) => s + a.currentValue, 0)

  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            className={`chip border ${filter === 'all' ? 'bg-brand-50 border-brand-200 text-brand-800' : 'border-ink-200 text-ink-600 hover:bg-ink-50'}`}
            onClick={() => setFilter('all')}
          >
            All ({assets.length})
          </button>
          {CATEGORY_ORDER.map((c) => {
            const count = assets.filter((a) => a.category === c).length
            if (count === 0) return null
            const meta = CATEGORY_META[c]
            return (
              <button
                key={c}
                className={`chip border ${filter === c ? 'bg-brand-50 border-brand-200 text-brand-800' : 'border-ink-200 text-ink-600 hover:bg-ink-50'}`}
                onClick={() => setFilter(c)}
                title={meta.description}
              >
                <span className="w-2 h-2 rounded-full" style={{ background: meta.color }} />
                {meta.label} ({count})
              </button>
            )
          })}
        </div>
        <div className="flex items-center gap-2">
          <input
            className="input md:w-64"
            placeholder="Search assets"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className="btn-primary whitespace-nowrap" onClick={() => setShowAdd(true)}>
            + Add asset
          </button>
        </div>
      </div>

      <div className="card overflow-x-auto">
        {filtered.length === 0 ? (
          <div className="text-center py-14">
            <div className="text-3xl mb-2">💼</div>
            <p className="text-ink-600 mb-4">
              {assets.length === 0
                ? 'No assets yet. Add your first holding to start tracking.'
                : 'No assets match this filter.'}
            </p>
            {assets.length === 0 && (
              <button className="btn-primary" onClick={() => setShowAdd(true)}>+ Add asset</button>
            )}
          </div>
        ) : (
          <table className="w-full text-sm min-w-[720px]">
            <thead className="text-xs uppercase tracking-wide text-ink-500 border-b border-ink-100">
              <tr>
                <th className="py-3 px-3 text-left">Holding</th>
                <th className="py-3 px-3 text-left">Category</th>
                <th className="py-3 px-3 text-right">Current value</th>
                <th className="py-3 px-3 text-right">Monthly add</th>
                <th className="py-3 px-3 text-right">Return</th>
                <th className="py-3 px-3 text-right">In 10y</th>
                <th className="py-3 px-3 text-right">% of portfolio</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => {
                const meta = CATEGORY_META[a.category]
                const fv10 = futureValueOfAsset(a, 10)
                const share = summary.totalAssets ? (a.currentValue / summary.totalAssets) * 100 : 0
                return (
                  <tr key={a.id} className="border-b border-ink-50 table-row">
                    <td className="py-3 px-3">
                      <div className="font-medium text-ink-900">{a.name}</div>
                      {a.notes && <div className="text-[11px] text-ink-400 truncate max-w-xs">{a.notes}</div>}
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ background: meta.color }} />
                        <span className="text-ink-700">{meta.label}</span>
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right tabular-nums font-medium text-ink-900">{formatINR(a.currentValue)}</td>
                    <td className="py-3 px-3 text-right tabular-nums text-ink-700">{a.monthlyContribution ? formatINR(a.monthlyContribution) : '—'}</td>
                    <td className="py-3 px-3 text-right tabular-nums text-ink-700">{formatPercent(a.expectedReturn)}</td>
                    <td className="py-3 px-3 text-right tabular-nums text-emerald-700">{formatINRCompact(fv10)}</td>
                    <td className="py-3 px-3 text-right tabular-nums text-ink-700">{share.toFixed(1)}%</td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <button className="text-brand-700 hover:underline mr-3 text-xs font-medium" onClick={() => setEditing(a)}>
                        Edit
                      </button>
                      <button
                        className="text-rose-600 hover:underline text-xs font-medium"
                        onClick={() => {
                          if (confirm(`Delete "${a.name}"?`)) deleteAsset(a.id)
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr className="bg-ink-50 font-semibold">
                <td className="py-3 px-3" colSpan={2}>Total ({filtered.length})</td>
                <td className="py-3 px-3 text-right tabular-nums">{formatINR(grandTotal)}</td>
                <td colSpan={5}></td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>

      <Modal
        open={showAdd}
        title="Add asset"
        onClose={() => setShowAdd(false)}
        width="lg"
      >
        <AssetForm
          onSubmit={(data) => {
            addAsset(data)
            setShowAdd(false)
          }}
          onCancel={() => setShowAdd(false)}
        />
      </Modal>

      <Modal
        open={!!editing}
        title="Edit asset"
        onClose={() => setEditing(null)}
        width="lg"
      >
        {editing && (
          <AssetForm
            initial={editing}
            onSubmit={(data) => {
              updateAsset(editing.id, data)
              setEditing(null)
            }}
            onCancel={() => setEditing(null)}
          />
        )}
      </Modal>
    </div>
  )
}
