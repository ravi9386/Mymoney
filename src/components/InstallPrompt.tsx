import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent
  const isIOSDevice = /iPad|iPhone|iPod/.test(ua)
  // iPadOS 13+ reports as Mac. Treat touch Macs as iOS for the install hint.
  const isIPadOS = ua.includes('Macintosh') && 'ontouchend' in document
  return isIOSDevice || isIPadOS
}

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false
  // iOS exposes navigator.standalone; everyone else uses display-mode media query.
  const nav = navigator as Navigator & { standalone?: boolean }
  return (
    nav.standalone === true ||
    window.matchMedia?.('(display-mode: standalone)').matches ||
    window.matchMedia?.('(display-mode: fullscreen)').matches
  )
}

const DISMISSED_KEY = 'mymoney.install.dismissed'

export default function InstallPrompt() {
  const [show, setShow] = useState(false)
  const [iosHint, setIosHint] = useState(false)
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    if (isStandalone()) return
    if (typeof window === 'undefined') return
    if (window.localStorage.getItem(DISMISSED_KEY)) return

    const onPrompt = (e: Event) => {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
      setShow(true)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)

    // iOS has no beforeinstallprompt — show a one-time hint after a beat.
    if (isIOS()) {
      const t = setTimeout(() => {
        setIosHint(true)
        setShow(true)
      }, 1500)
      return () => {
        clearTimeout(t)
        window.removeEventListener('beforeinstallprompt', onPrompt)
      }
    }

    return () => window.removeEventListener('beforeinstallprompt', onPrompt)
  }, [])

  if (!show) return null

  const dismiss = () => {
    setShow(false)
    try { window.localStorage.setItem(DISMISSED_KEY, '1') } catch {}
  }

  const install = async () => {
    if (!deferred) return
    try {
      await deferred.prompt()
      await deferred.userChoice
    } finally {
      dismiss()
    }
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 px-3 pb-3 pointer-events-none">
      <div className="mx-auto max-w-xl pointer-events-auto rounded-2xl bg-white border border-ink-200 shadow-card p-4 flex items-center gap-3">
        <div className="shrink-0 w-11 h-11 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center text-2xl">
          📱
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-ink-900">Install My Money</div>
          {iosHint ? (
            <div className="text-xs text-ink-600 leading-snug mt-0.5">
              Tap <span className="inline-block px-1 rounded bg-ink-100">Share</span> →
              <span className="ml-1">Add to Home Screen</span> for a full-screen app icon.
            </div>
          ) : (
            <div className="text-xs text-ink-600 leading-snug mt-0.5">
              Get a home-screen icon and full-screen experience.
            </div>
          )}
        </div>
        {!iosHint && (
          <button className="btn-primary px-3 py-1.5 text-sm" onClick={install}>
            Install
          </button>
        )}
        <button
          aria-label="Dismiss"
          onClick={dismiss}
          className="text-ink-400 hover:text-ink-700 text-lg leading-none px-2"
        >
          ×
        </button>
      </div>
    </div>
  )
}
