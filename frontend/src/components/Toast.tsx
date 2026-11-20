import { CheckCircle2, CircleAlert, X } from 'lucide-react'
import { useEffect } from 'react'
import { cn } from '../lib/utils'
import type { ToastState } from '../types'

type ToastProps = {
  toast: ToastState | null
  onClose: () => void
}

export function Toast({ toast, onClose }: ToastProps) {
  useEffect(() => {
    if (!toast) {
      return
    }

    const timeout = setTimeout(() => {
      onClose()
    }, 3000)

    return () => clearTimeout(timeout)
  }, [toast, onClose])

  if (!toast) {
    return null
  }

  const success = toast.type === 'success'
  const Icon = success ? CheckCircle2 : CircleAlert

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-toast-in" aria-live="polite">
      <div
        className={cn(
          'flex items-center gap-3 rounded-lg border px-4 py-3 text-sm',
          success
            ? 'border-success/50 bg-success/15 text-success'
            : 'border-danger/50 bg-danger/15 text-danger',
        )}
      >
        <Icon className="h-4 w-4" />
        <span className="font-medium">{toast.message}</span>
        <button
          type="button"
          onClick={onClose}
          className="rounded p-0.5 text-text-secondary hover:text-text-primary"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
