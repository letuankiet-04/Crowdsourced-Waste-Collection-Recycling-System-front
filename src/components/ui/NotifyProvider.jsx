import { useCallback, useMemo, useRef, useState } from 'react'
import { NotifyContext, notifyPromise } from '../../notifications/notifyCore.js'

function generateId() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`
}

function getVariantStyles(variant) {
  switch (variant) {
    case 'success':
      return {
        container: 'border-emerald-200 bg-emerald-50 text-emerald-950',
        badge: 'bg-emerald-600',
        title: 'text-emerald-950',
        message: 'text-emerald-900/80',
      }
    case 'error':
      return {
        container: 'border-red-200 bg-red-50 text-red-950',
        badge: 'bg-red-600',
        title: 'text-red-950',
        message: 'text-red-900/80',
      }
    case 'warning':
      return {
        container: 'border-amber-200 bg-amber-50 text-amber-950',
        badge: 'bg-amber-600',
        title: 'text-amber-950',
        message: 'text-amber-900/80',
      }
    case 'loading':
      return {
        container: 'border-slate-200 bg-white text-slate-950',
        badge: 'bg-slate-900',
        title: 'text-slate-950',
        message: 'text-slate-700',
      }
    case 'info':
    default:
      return {
        container: 'border-slate-200 bg-slate-50 text-slate-950',
        badge: 'bg-slate-900',
        title: 'text-slate-950',
        message: 'text-slate-700',
      }
  }
}

function ToastStack({ toasts, onDismiss }) {
  return (
    <div className="fixed right-4 top-4 z-50 w-[380px] max-w-[calc(100vw-2rem)] space-y-3">
      {toasts.map((t) => {
        const styles = getVariantStyles(t.variant)
        const isAlert = t.variant === 'error'
        return (
          <div
            key={t.id}
            role={isAlert ? 'alert' : 'status'}
            aria-live={isAlert ? 'assertive' : 'polite'}
            className={`relative overflow-hidden rounded-2xl border shadow-sm ${styles.container}`}
          >
            <div className="flex items-start gap-3 p-4">
              <div className={`mt-0.5 h-2.5 w-2.5 rounded-full ${styles.badge}`} />
              <div className="min-w-0 flex-1">
                {t.title ? <div className={`text-sm font-semibold ${styles.title}`}>{t.title}</div> : null}
                {t.message ? <div className={`mt-1 text-sm ${styles.message}`}>{t.message}</div> : null}
              </div>
              <button
                type="button"
                onClick={() => onDismiss(t.id)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-black/10 bg-white/40 text-black/70 transition hover:bg-white/70 hover:text-black active:scale-[0.98]"
                aria-label="Dismiss notification"
                title="Dismiss"
              >
                ×
              </button>
            </div>
            {t.variant === 'loading' ? (
              <div className="h-1 w-full bg-black/5">
                <div className="h-full w-1/2 animate-pulse bg-black/20" />
              </div>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}

export function NotifyProvider({ children, maxToasts = 4 }) {
  const [toasts, setToasts] = useState([])
  const timersRef = useRef(new Map())

  const dismiss = useCallback((id) => {
    const t = timersRef.current.get(id)
    if (t) {
      clearTimeout(t)
      timersRef.current.delete(id)
    }
    setToasts((prev) => prev.filter((x) => x.id !== id))
  }, [])

  const update = useCallback((id, patch) => {
    setToasts((prev) => prev.map((x) => (x.id === id ? { ...x, ...patch } : x)))
  }, [])

  const notify = useCallback(
    ({ variant = 'info', title = '', message = '', durationMs } = {}) => {
      const id = generateId()
      const normalizedDurationMs =
        typeof durationMs === 'number' ? durationMs : variant === 'loading' ? 0 : 3500

      setToasts((prev) => {
        const next = [{ id, variant, title, message }, ...prev]
        return next.slice(0, maxToasts)
      })

      if (normalizedDurationMs > 0) {
        const timer = setTimeout(() => dismiss(id), normalizedDurationMs)
        timersRef.current.set(id, timer)
      }

      return id
    },
    [dismiss, maxToasts]
  )

  const api = useMemo(() => {
    return {
      notify,
      dismiss,
      update,
      info: (title, message, durationMs) => notify({ variant: 'info', title, message, durationMs }),
      success: (title, message, durationMs) => notify({ variant: 'success', title, message, durationMs }),
      warning: (title, message, durationMs) => notify({ variant: 'warning', title, message, durationMs }),
      error: (title, message, durationMs) => notify({ variant: 'error', title, message, durationMs }),
      loading: (title, message) => notify({ variant: 'loading', title, message, durationMs: 0 }),
      promise: (promise, opts) => notifyPromise({ notify, update, dismiss }, promise, opts),
    }
  }, [dismiss, notify, update])

  return (
    <NotifyContext.Provider value={api}>
      {children}
      <ToastStack toasts={toasts} onDismiss={dismiss} />
    </NotifyContext.Provider>
  )
}
