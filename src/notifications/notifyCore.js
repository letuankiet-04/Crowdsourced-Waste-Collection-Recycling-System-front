import { createContext } from 'react'

export const NotifyContext = createContext(null)

function resolveText(value, arg) {
  if (typeof value === 'function') return value(arg)
  if (value === null || value === undefined) return ''
  return String(value)
}

export async function notifyPromise(handlers, promise, opts = {}) {
  const notify = handlers?.notify
  const update = handlers?.update
  const dismiss = handlers?.dismiss

  const id = notify?.({
    variant: 'loading',
    title: resolveText(opts.loadingTitle, null) || 'Loading',
    message: resolveText(opts.loadingMessage, null),
    durationMs: 0,
  })

  try {
    const result = await Promise.resolve(promise)
    if (id && update) {
      update(id, {
        variant: 'success',
        title: resolveText(opts.successTitle, result) || 'Success',
        message: resolveText(opts.successMessage, result),
      })
      const durationMs = typeof opts.successDurationMs === 'number' ? opts.successDurationMs : 3500
      if (durationMs > 0 && dismiss) window.setTimeout(() => dismiss(id), durationMs)
    }
    return result
  } catch (err) {
    if (id && update) {
      update(id, {
        variant: 'error',
        title: resolveText(opts.errorTitle, err) || 'Error',
        message: resolveText(opts.errorMessage, err) || (err?.message ? String(err.message) : ''),
      })
      const durationMs = typeof opts.errorDurationMs === 'number' ? opts.errorDurationMs : 4500
      if (durationMs > 0 && dismiss) window.setTimeout(() => dismiss(id), durationMs)
    }
    throw err
  }
}
