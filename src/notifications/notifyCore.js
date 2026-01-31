import { createContext } from 'react'

export const NotifyContext = createContext(null)

export function notifyPromise(notifyApi, promise, opts = {}) {
  const normalizeMessage = (v) => (typeof v === 'function' ? v() : v)
  const errorMessageFrom = (err) => err?.message || String(err)

  const loadingTitle = normalizeMessage(opts.loadingTitle ?? 'Working...')
  const loadingMessage = normalizeMessage(opts.loadingMessage ?? '')
  const id = notifyApi.notify({ variant: 'loading', title: loadingTitle, message: loadingMessage, durationMs: 0 })

  const durationMs = typeof opts.durationMs === 'number' ? opts.durationMs : 3500

  return Promise.resolve(promise)
    .then((res) => {
      const successTitle = typeof opts.successTitle === 'function' ? opts.successTitle(res) : opts.successTitle ?? 'Done'
      const successMessage = typeof opts.successMessage === 'function' ? opts.successMessage(res) : opts.successMessage ?? ''
      notifyApi.update(id, { variant: 'success', title: successTitle, message: successMessage })
      if (durationMs > 0) setTimeout(() => notifyApi.dismiss(id), durationMs)
      return res
    })
    .catch((err) => {
      const errorTitle = typeof opts.errorTitle === 'function' ? opts.errorTitle(err) : opts.errorTitle ?? 'Error'
      const errorMessage =
        typeof opts.errorMessage === 'function' ? opts.errorMessage(err) : opts.errorMessage ?? errorMessageFrom(err)
      notifyApi.update(id, { variant: 'error', title: errorTitle, message: errorMessage })
      if (durationMs > 0) setTimeout(() => notifyApi.dismiss(id), durationMs)
      throw err
    })
}

