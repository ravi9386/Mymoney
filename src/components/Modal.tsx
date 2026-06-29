import { useEffect } from 'react'
import type { ReactNode } from 'react'

interface Props {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
  width?: 'sm' | 'md' | 'lg'
}

export default function Modal({ open, title, onClose, children, width = 'md' }: Props) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null
  const widthClass = width === 'sm' ? 'max-w-md' : width === 'lg' ? 'max-w-3xl' : 'max-w-xl'

  return (
    <div className="fixed inset-0 z-40 flex items-end md:items-center justify-center bg-black/40 p-0 md:p-4">
      <div className={`bg-white w-full ${widthClass} rounded-t-2xl md:rounded-2xl shadow-2xl border border-ink-100 max-h-[92vh] overflow-y-auto`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-ink-100 sticky top-0 bg-white rounded-t-2xl">
          <h3 className="text-lg font-semibold text-ink-900">{title}</h3>
          <button onClick={onClose} aria-label="Close" className="text-ink-500 hover:text-ink-800 text-xl leading-none">
            ×
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}
