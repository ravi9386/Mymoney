import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useState } from 'react'

const NAV = [
  { to: '/', label: 'Dashboard', icon: '◆' },
  { to: '/assets', label: 'Assets', icon: '◧' },
  { to: '/liabilities', label: 'Liabilities', icon: '◨' },
  { to: '/projections', label: 'Projections', icon: '↗' },
  { to: '/retirement', label: 'Retirement', icon: '☼' },
  { to: '/settings', label: 'Settings', icon: '⚙' }
]

export default function Layout() {
  const loc = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen flex">
      <aside className="hidden md:flex md:flex-col w-64 shrink-0 border-r border-ink-100 bg-white">
        <Brand />
        <nav className="flex-1 px-3 pb-4 space-y-1">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === '/'}
              className={({ isActive }) =>
                `nav-link ${isActive ? 'nav-link-active' : ''}`
              }
            >
              <span className="w-5 text-center text-base">{n.icon}</span>
              <span>{n.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="p-4 text-[11px] text-ink-400 leading-relaxed border-t border-ink-100">
          Data stays in your browser. Nothing is uploaded.
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden flex items-center justify-between px-4 h-14 bg-white border-b border-ink-100">
          <div className="flex items-center gap-2">
            <Logo />
            <span className="font-bold text-ink-900">My Money</span>
          </div>
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="text-ink-700 text-2xl leading-none"
            aria-label="Toggle menu"
          >
            ☰
          </button>
        </header>
        {mobileOpen && (
          <nav className="md:hidden px-3 py-2 border-b border-ink-100 bg-white grid grid-cols-3 gap-1">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.to === '/'}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `nav-link justify-center ${isActive ? 'nav-link-active' : ''}`
                }
              >
                <span>{n.icon}</span>
                <span className="text-xs">{n.label}</span>
              </NavLink>
            ))}
          </nav>
        )}

        <main className="flex-1 p-4 md:p-8 max-w-6xl w-full mx-auto">
          <PageHeading path={loc.pathname} />
          <Outlet />
        </main>
        <footer className="px-6 py-4 text-center text-xs text-ink-400">
          My Money · personal finance tracker · v0.1
        </footer>
      </div>
    </div>
  )
}

function PageHeading({ path }: { path: string }) {
  const item = NAV.find((n) => (n.to === '/' ? path === '/' : path.startsWith(n.to)))
  if (!item) return null
  return (
    <div className="mb-6">
      <h1 className="text-2xl md:text-3xl font-bold text-ink-900">{item.label}</h1>
    </div>
  )
}

function Brand() {
  return (
    <div className="px-5 py-5 flex items-center gap-2 border-b border-ink-100">
      <Logo />
      <div>
        <div className="font-extrabold text-ink-900 text-lg leading-tight">My Money</div>
        <div className="text-[11px] text-ink-400 -mt-0.5">net worth · projections · retirement</div>
      </div>
    </div>
  )
}

function Logo() {
  return (
    <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-brand-600 text-white">
      <svg width="20" height="20" viewBox="0 0 64 64" fill="none">
        <path d="M16 44V20l16 14L48 20v24" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  )
}
