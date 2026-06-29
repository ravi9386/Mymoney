import { useMemo } from 'react'
import { useApp } from '../state/AppContext'
import { evaluateRetirement, projectByYear, retirementCorpusNeeded, weightedReturn } from '../lib/calculations'
import { formatINR, formatINRCompact, formatPercent } from '../lib/format'
import StatCard from '../components/StatCard'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts'

export default function RetirementPage() {
  const { state, updateProfile } = useApp()
  const { assets, liabilities, profile } = state

  const horizonYears = Math.max(profile.retirementAge - profile.currentAge + profile.yearsInRetirement, 5)
  const out = evaluateRetirement(assets, liabilities, profile)
  const blended = weightedReturn(assets)

  const projection = useMemo(() => projectByYear(assets, horizonYears, profile.currentAge),
    [assets, horizonYears, profile.currentAge])

  const chartData = projection.map((p) => ({
    age: p.age,
    year: p.year,
    corpus: p.total,
    needed: retirementCorpusNeeded({ ...profile, retirementAge: p.age ?? profile.retirementAge })
  }))

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          label="Status"
          value={out.onTrack ? <span className="text-emerald-700">On track ✓</span> : <span className="text-amber-700">Shortfall</span>}
          hint={`At age ${profile.retirementAge}, in ${out.yearsToRetire} years`}
          accent={out.onTrack ? 'brand' : 'amber'}
        />
        <StatCard
          label="Corpus needed"
          value={formatINRCompact(out.corpusNeeded)}
          hint={`${profile.yearsInRetirement} years of post-retirement income`}
          accent="blue"
        />
        <StatCard
          label="Projected corpus"
          value={formatINRCompact(out.projectedCorpus)}
          hint={`@ blended ${formatPercent(blended)} return`}
          accent="neutral"
        />
        <StatCard
          label="Earliest retire age"
          value={out.earliestRetirementAge ? `${out.earliestRetirementAge}` : '—'}
          hint={out.earliestRetirementAge ? 'Given current trajectory' : 'Not achievable in 50 yrs'}
          accent={out.earliestRetirementAge ? 'brand' : 'rose'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-ink-900">Corpus vs. requirement</h2>
            <div className="text-xs text-ink-500">Crossover = freedom point</div>
          </div>
          {assets.length === 0 ? (
            <p className="text-sm text-ink-500">Add assets to see your retirement curve.</p>
          ) : (
            <div className="h-80">
              <ResponsiveContainer>
                <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="g-corpus" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#138846" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#138846" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="g-needed" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#dc2626" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#dc2626" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="age" tickFormatter={(a) => `${a}`} fontSize={11} />
                  <YAxis tickFormatter={(v) => formatINRCompact(v)} fontSize={11} width={70} />
                  <Tooltip
                    formatter={(v: number, n: string) => [formatINR(v), n === 'corpus' ? 'Projected corpus' : 'Corpus required']}
                    labelFormatter={(a) => `Age ${a}`}
                  />
                  <ReferenceLine x={profile.retirementAge} stroke="#475569" strokeDasharray="4 4" label={{ value: `Retire @ ${profile.retirementAge}`, fontSize: 11, fill: '#475569', position: 'top' }} />
                  {out.earliestRetirementAge && (
                    <ReferenceLine x={out.earliestRetirementAge} stroke="#16a34a" strokeDasharray="4 4" label={{ value: `Earliest ${out.earliestRetirementAge}`, fontSize: 11, fill: '#16a34a', position: 'top' }} />
                  )}
                  <Area dataKey="corpus" type="monotone" stroke="#138846" strokeWidth={2.5} fill="url(#g-corpus)" />
                  <Area dataKey="needed" type="monotone" stroke="#dc2626" strokeWidth={2} fill="url(#g-needed)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="card space-y-4">
          <h2 className="text-lg font-semibold text-ink-900">Your assumptions</h2>
          <NumberRow
            label="Current age"
            value={profile.currentAge}
            suffix="yrs"
            min={18} max={80}
            onChange={(v) => updateProfile({ currentAge: v })}
          />
          <NumberRow
            label="Target retirement age"
            value={profile.retirementAge}
            suffix="yrs"
            min={profile.currentAge + 1} max={85}
            onChange={(v) => updateProfile({ retirementAge: v })}
          />
          <NumberRow
            label="Monthly expenses today"
            value={profile.monthlyExpenses}
            prefix="₹"
            min={0} max={2000000} step={1000}
            onChange={(v) => updateProfile({ monthlyExpenses: v })}
          />
          <NumberRow
            label="Inflation"
            value={profile.inflationRate}
            suffix="%"
            min={0} max={15} step={0.5}
            onChange={(v) => updateProfile({ inflationRate: v })}
          />
          <NumberRow
            label="Return post-retirement"
            value={profile.postRetirementReturn}
            suffix="%"
            min={0} max={15} step={0.5}
            onChange={(v) => updateProfile({ postRetirementReturn: v })}
          />
          <NumberRow
            label="Years in retirement"
            value={profile.yearsInRetirement}
            suffix="yrs"
            min={5} max={50}
            onChange={(v) => updateProfile({ yearsInRetirement: v })}
          />
        </div>
      </div>

      {!out.onTrack && out.shortfall > 0 && (
        <div className="card border-l-4 border-amber-400 bg-amber-50/50">
          <h3 className="text-base font-semibold text-amber-900 mb-1">Closing the gap</h3>
          <p className="text-sm text-amber-900/90">
            You need <strong>{formatINRCompact(out.shortfall)}</strong> more by age {profile.retirementAge}.
            Adding an SIP of <strong>{formatINRCompact(out.monthlySipNeededToCloseGap)} / month</strong>
            {' '}at a blended return of {formatPercent(blended)} should cover it.
          </p>
        </div>
      )}

      <div className="card">
        <h3 className="text-base font-semibold text-ink-900 mb-2">How this is calculated</h3>
        <ul className="text-sm text-ink-600 space-y-1 list-disc pl-5">
          <li>Each asset compounds at its expected return; monthly contributions compound monthly.</li>
          <li>Required corpus = present-value of inflation-adjusted post-retirement expenses for {profile.yearsInRetirement} years at {profile.postRetirementReturn}% return and {profile.inflationRate}% inflation.</li>
          <li>"Earliest retirement age" is the first age where projected corpus ≥ required corpus.</li>
          <li>All inputs are tweakable — change them on the right and the chart updates live.</li>
        </ul>
      </div>
    </div>
  )
}

function NumberRow({
  label, value, onChange, prefix, suffix, min = 0, max = 100, step = 1
}: {
  label: string; value: number; onChange: (n: number) => void;
  prefix?: string; suffix?: string; min?: number; max?: number; step?: number;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      <div className="flex items-center gap-2">
        {prefix && <span className="text-ink-500 text-sm">{prefix}</span>}
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="input tabular-nums"
        />
        {suffix && <span className="text-ink-500 text-sm">{suffix}</span>}
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-brand-600 mt-1"
      />
    </div>
  )
}
