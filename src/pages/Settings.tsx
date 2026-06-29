import { useRef, useState } from 'react'
import { useApp } from '../state/AppContext'
import { exportToJSON, importFromJSON } from '../lib/storage'

export default function SettingsPage() {
  const { state, replaceState, loadSample, reset, updateProfile } = useApp()
  const [importError, setImportError] = useState<string | null>(null)
  const [imported, setImported] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const onExport = () => {
    const blob = new Blob([exportToJSON(state)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const ts = new Date().toISOString().slice(0, 10)
    a.href = url
    a.download = `mymoney-backup-${ts}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const onImport = (file: File) => {
    setImportError(null)
    setImported(null)
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const next = importFromJSON(String(reader.result || ''))
        replaceState(next)
        setImported(`Imported ${next.assets.length} assets and ${next.liabilities.length} liabilities.`)
      } catch (e) {
        setImportError(e instanceof Error ? e.message : 'Could not parse file')
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="space-y-5">
      <div className="card">
        <h2 className="text-lg font-semibold text-ink-900 mb-1">Profile</h2>
        <p className="text-sm text-ink-500 mb-4">A friendly name shown in the dashboard greeting.</p>
        <label className="label">Display name</label>
        <input
          className="input md:w-72"
          value={state.profile.displayName}
          onChange={(e) => updateProfile({ displayName: e.target.value })}
        />
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-ink-900 mb-1">Backup & restore</h2>
        <p className="text-sm text-ink-500 mb-4">Your data lives only in this browser's local storage. Use export to take a backup or move it.</p>
        <div className="flex flex-wrap gap-2">
          <button className="btn-primary" onClick={onExport}>Export to JSON</button>
          <button className="btn-outline" onClick={() => fileRef.current?.click()}>Import from JSON</button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) onImport(f)
              e.target.value = ''
            }}
          />
        </div>
        {importError && <p className="text-sm text-rose-700 mt-3">⚠ {importError}</p>}
        {imported && <p className="text-sm text-emerald-700 mt-3">✓ {imported}</p>}
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-ink-900 mb-1">Demo data</h2>
        <p className="text-sm text-ink-500 mb-4">Reset to sample portfolio, or start blank.</p>
        <div className="flex flex-wrap gap-2">
          <button
            className="btn-outline"
            onClick={() => {
              if (confirm('Replace current data with sample portfolio?')) loadSample()
            }}
          >
            Load sample portfolio
          </button>
          <button
            className="btn-danger"
            onClick={() => {
              if (confirm('Erase everything? This cannot be undone.')) reset()
            }}
          >
            Clear all data
          </button>
        </div>
      </div>

      <div className="card text-sm text-ink-500">
        <h3 className="text-base font-semibold text-ink-800 mb-2">About</h3>
        <p>
          <strong>My Money</strong> is a private personal-finance tracker. All your data is kept in your
          browser's localStorage — nothing is sent to any server.
        </p>
      </div>
    </div>
  )
}
