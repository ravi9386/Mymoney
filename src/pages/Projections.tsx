import { useMemo, useState } from 'react'
import { useApp } from '../state/AppContext'
import { CATEGORY_META, CATEGORY_ORDER } from '../lib/constants'
import { projectByYear, futureValueOfAsset, summarize } from '../lib/calculations'
import { formatINR, formatINRCompact } from '../lib/format'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Line, LineChart
} from 'recharts'
import StatCard from '../components/StatCard'

export default function ProjectionsPage() {
  const { state } = useApp()
  const { assets, liabilities, profile } = state
  const [years, setYears] = useState(20)
  const [extraSip, setExtraSip] = useState(0)
  const [returnAdj, setReturnAdj] = useState(0)

  const adjustedAssets = useMemo(
    () =>
      assets.map((a) => ({
        ...a,
        expectedReturn: Math.max(0, a.expectedReturn + returnAdj),
        monthlyContribution: a.monthlyContribution + (a.category === 'mf_equity' ? extraSip : 0)
      })),
    [assets, extraSip, returnAdj]
  )

  const projection = useMemo(
    () => projectByYear(adjustedAssets, years, profile.currentAge),
    [adjustedAssets, years, profile.currentAge]
  )

  const usedCategories = useMemo(() => {
    const set = new Set(assets.map((a) => a.category))
    return CATEGORY_ORDER.filter((c) => set.has(c))
  }, [assets])

  const stackedData = projection.map((p) => {
    const row: Record<string, number | undefined> = { year: p.year, age: p.age }
    for (const c of usedCategories) {
      row[c] = p.byCategory[c] || 0
    }
    row.total = p.total
    return row
  })

  const summary = summarize(adjustedAssets, liabilities)
  const finalPoint = projection[projection.length - 1]
  const projectedNetWorth = (finalPoint?.total ?? 0) - summary.totalLiabilities

  const perAsset = adjustedAssets
    .map((a) => ({
      id: a.id,
      name: a.name,
      category: CATEGORY_META[a.category].label,
      color: CATEGORY_META[a.category].color,
      now: a.currentValue,
      future: futureValueOfAsset(a, years)
    }))
    .sort((a, b) => b.future - a.future)

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          label={`Net worth in ${years}y`}
          value={formatINRCompact(projectedNetWorth)}
          hint={formatINR(projectedNetWorth)}
          accent="brand"
        />
        <StatCard
          label="Growth multiple"
          value={summary.netWorth > 0 ? `${((projectedNetWorth / Math.max(1, summary.netWorth))).toFixed(1)}×` : '—'}
          hint={`From ${formatINRCompact(summary.netWorth)} today`}
          accent="blue"
        />
        <StatCard
          label="Age at horizon"
          value={`${profile.currentAge + years}`}
          hint={`Currently ${profile.currentAge}`}
          accent="amber"
        />
      </div>

      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h2 className="text-lg font-semibold text-ink-900">Scenario</h2>
          <div className="flex flex-wrap gap-4 text-sm">
            <SliderField
              label={`Horizon: ${years} years`}
              min={1}
              max={40}
              step={1}
              value={years}
              onChange={setYears}
            />
            <SliderField
              label={`Extra equity SIP: ₹${extraSip.toLocaleString('en-IN')}/mo`}
              min={0}
              max={100000}
              step={1000}
              value={extraSip}
              onChange={setExtraSip}
              width="md"
            />
            <SliderField
              label={`Return adjustment: ${returnAdj >= 0 ? '+' : ''}${returnAdj}%`}
              min={-5}
              max={5}
              step={0.5}
              value={returnAdj}
              onChange={setReturnAdj}
            />
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-ink-900 mb-4">Stacked projection by category</h2>
        {assets.length === 0 ? (
          <p className="text-sm text-ink-500">Add some assets to see projections.</p>
        ) : (
          <div className="h-80">
            <ResponsiveContainer>
              <AreaChart data={stackedData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" tickFormatter={(y) => `+${y}y`} fontSize={11} />
                <YAxis tickFormatter={(v) => formatINRCompact(v)} fontSize={11} width={70} />
                <Tooltip
                  formatter={(v: number, name: string) => [formatINR(v), CATEGORY_META[name as keyof typeof CATEGORY_META]?.label || name]}
                  labelFormatter={(l) => `Year +${l}`}
                />
                <Legend
                  formatter={(value) => CATEGORY_META[value as keyof typeof CATEGORY_META]?.label || value}
                  wrapperStyle={{ fontSize: 11 }}
                />
                {usedCategories.map((c) => (
                  <Area
                    key={c}
                    type="monotone"
                    dataKey={c}
                    stackId="1"
                    stroke={CATEGORY_META[c].color}
                    fill={CATEGORY_META[c].color}
                    fillOpacity={0.85}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-ink-900 mb-4">Net worth trajectory</h2>
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={stackedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" tickFormatter={(y) => `+${y}y`} fontSize={11} />
                <YAxis tickFormatter={(v) => formatINRCompact(v)} fontSize={11} width={70} />
                <Tooltip
                  formatter={(v: number) => [formatINR(v), 'Total assets']}
                  labelFormatter={(l) => `Year +${l}`}
                />
                <Line type="monotone" dataKey="total" stroke="#138846" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card overflow-x-auto">
          <h2 className="text-lg font-semibold text-ink-900 mb-4">Per-asset future value ({years}y)</h2>
          {perAsset.length === 0 ? (
            <p className="text-sm text-ink-500">No assets yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-xs uppercase tracking-wide text-ink-500 border-b border-ink-100">
                <tr>
                  <th className="py-2 px-2 text-left">Asset</th>
                  <th className="py-2 px-2 text-right">Now</th>
                  <th className="py-2 px-2 text-right">In {years}y</th>
                  <th className="py-2 px-2 text-right">×</th>
                </tr>
              </thead>
              <tbody>
                {perAsset.map((row) => (
                  <tr key={row.id} className="border-b border-ink-50">
                    <td className="py-2 px-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ background: row.color }} />
                        <div>
                          <div className="font-medium text-ink-900">{row.name}</div>
                          <div className="text-[11px] text-ink-400">{row.category}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-2 px-2 text-right tabular-nums text-ink-700">{formatINRCompact(row.now)}</td>
                    <td className="py-2 px-2 text-right tabular-nums font-semibold text-emerald-700">{formatINRCompact(row.future)}</td>
                    <td className="py-2 px-2 text-right tabular-nums text-ink-500">
                      {row.now > 0 ? `${(row.future / row.now).toFixed(1)}×` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

function SliderField({
  label, min, max, step, value, onChange, width = 'sm'
}: {
  label: string; min: number; max: number; step: number; value: number;
  onChange: (n: number) => void; width?: 'sm' | 'md'
}) {
  const w = width === 'md' ? 'w-56' : 'w-44'
  return (
    <label className={`block ${w}`}>
      <span className="text-[11px] uppercase tracking-wide text-ink-500 font-medium">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-brand-600 mt-1"
      />
    </label>
  )
}
