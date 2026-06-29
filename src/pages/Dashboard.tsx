import { Link } from 'react-router-dom'
import { useApp } from '../state/AppContext'
import { summarize, allocationByCategory, totalFutureValue, evaluateRetirement } from '../lib/calculations'
import { CATEGORY_META } from '../lib/constants'
import { formatINR, formatINRCompact, formatPercent } from '../lib/format'
import StatCard from '../components/StatCard'
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts'

export default function Dashboard() {
  const { state } = useApp()
  const { assets, liabilities, profile } = state
  const summary = summarize(assets, liabilities)
  const allocation = allocationByCategory(assets)
  const retire = evaluateRetirement(assets, liabilities, profile)

  const fv10 = totalFutureValue(assets, 10)
  const fv20 = totalFutureValue(assets, 20)

  const topAssets = [...assets].sort((a, b) => b.currentValue - a.currentValue).slice(0, 5)
  const groupTotals = groupByGroup(allocation)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Net Worth"
          value={formatINRCompact(summary.netWorth)}
          hint={formatINR(summary.netWorth)}
          accent="brand"
        />
        <StatCard
          label="Total Assets"
          value={formatINRCompact(summary.totalAssets)}
          hint={`${assets.length} holding${assets.length === 1 ? '' : 's'}`}
          accent="blue"
        />
        <StatCard
          label="Liabilities"
          value={formatINRCompact(summary.totalLiabilities)}
          hint={`${liabilities.length} loan${liabilities.length === 1 ? '' : 's'}`}
          accent="rose"
        />
        <StatCard
          label="Monthly Investing"
          value={formatINRCompact(summary.monthlyInflow)}
          hint="Sum of SIP / contributions"
          accent="amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-ink-900">Asset Allocation</h2>
            <Link to="/assets" className="text-sm text-brand-700 hover:underline">Manage assets →</Link>
          </div>
          {assets.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid md:grid-cols-2 gap-6 items-center">
              <div className="h-64">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={allocation}
                      dataKey="value"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={85}
                      paddingAngle={2}
                    >
                      {allocation.map((s) => (
                        <Cell key={s.category} fill={CATEGORY_META[s.category as keyof typeof CATEGORY_META]?.color || '#94a3b8'} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number, _n, item: any) => [
                        formatINR(value),
                        CATEGORY_META[item.payload.category as keyof typeof CATEGORY_META]?.label || item.payload.category
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="space-y-2">
                {[...allocation]
                  .sort((a, b) => b.value - a.value)
                  .slice(0, 8)
                  .map((s) => {
                    const meta = CATEGORY_META[s.category as keyof typeof CATEGORY_META]
                    return (
                      <li key={s.category} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: meta?.color || '#94a3b8' }} />
                          <span className="text-ink-700">{meta?.label || s.category}</span>
                        </div>
                        <div className="text-ink-900 font-medium tabular-nums">
                          {formatINRCompact(s.value)} <span className="text-ink-400 font-normal">· {formatPercent(s.share * 100)}</span>
                        </div>
                      </li>
                    )
                  })}
              </ul>
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-ink-900 mb-4">Allocation by Group</h2>
          {groupTotals.length === 0 ? (
            <p className="text-sm text-ink-400">Add assets to see groupings.</p>
          ) : (
            <div className="h-64">
              <ResponsiveContainer>
                <BarChart data={groupTotals} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tickFormatter={(v) => formatINRCompact(v)} fontSize={11} />
                  <YAxis dataKey="group" type="category" width={80} fontSize={12} />
                  <Tooltip formatter={(v: number) => formatINR(v)} />
                  <Bar dataKey="value" fill="#138846" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-ink-900 mb-1">Projected Net Worth</h2>
          <p className="text-xs text-ink-500 mb-3">Including ongoing monthly SIP / contributions.</p>
          <div className="grid grid-cols-2 gap-3">
            <Mini label="In 10 years" value={formatINRCompact(fv10 - summary.totalLiabilities)} />
            <Mini label="In 20 years" value={formatINRCompact(fv20 - summary.totalLiabilities)} />
          </div>
          <Link to="/projections" className="mt-4 inline-block text-sm text-brand-700 hover:underline">Open projections →</Link>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-ink-900 mb-1">Retirement Readiness</h2>
          {retire.onTrack ? (
            <div className="text-emerald-700 text-sm font-medium mt-2">
              ✓ On track for retirement at {profile.retirementAge}
            </div>
          ) : (
            <div className="text-amber-700 text-sm font-medium mt-2">
              {retire.shortfall > 0 ? `Shortfall of ${formatINRCompact(retire.shortfall)}` : 'Tight — review plan'}
            </div>
          )}
          <div className="mt-3 grid grid-cols-2 gap-3">
            <Mini label="Corpus needed" value={formatINRCompact(retire.corpusNeeded)} />
            <Mini
              label="Earliest possible"
              value={retire.earliestRetirementAge ? `Age ${retire.earliestRetirementAge}` : '—'}
            />
          </div>
          <Link to="/retirement" className="mt-4 inline-block text-sm text-brand-700 hover:underline">Plan retirement →</Link>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-ink-900 mb-3">Top holdings</h2>
          {topAssets.length === 0 ? (
            <p className="text-sm text-ink-400">No assets yet.</p>
          ) : (
            <ul className="space-y-2">
              {topAssets.map((a) => {
                const meta = CATEGORY_META[a.category]
                return (
                  <li key={a.id} className="flex items-center justify-between text-sm">
                    <div className="min-w-0">
                      <div className="font-medium text-ink-800 truncate">{a.name}</div>
                      <div className="text-[11px] text-ink-400">{meta.label}</div>
                    </div>
                    <div className="text-right tabular-nums">
                      <div className="font-semibold text-ink-900">{formatINRCompact(a.currentValue)}</div>
                      <div className="text-[11px] text-ink-400">{formatPercent(a.expectedReturn)}</div>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-ink-50 px-3 py-2.5">
      <div className="text-[11px] text-ink-500 uppercase tracking-wide">{label}</div>
      <div className="text-base font-semibold text-ink-900 tabular-nums">{value}</div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="text-center py-10">
      <div className="text-3xl mb-2">📊</div>
      <p className="text-ink-600 mb-3">No assets yet. Add your first holding to see your net worth.</p>
      <Link to="/assets" className="btn-primary">Add an asset</Link>
    </div>
  )
}

function groupByGroup(allocation: { category: string; value: number }[]) {
  const groups: Record<string, number> = {}
  for (const a of allocation) {
    const meta = CATEGORY_META[a.category as keyof typeof CATEGORY_META]
    const g = meta?.group || 'Other'
    groups[g] = (groups[g] || 0) + a.value
  }
  return Object.entries(groups)
    .map(([group, value]) => ({ group, value }))
    .sort((a, b) => b.value - a.value)
}
