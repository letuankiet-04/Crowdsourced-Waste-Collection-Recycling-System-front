const CHANNEL_NAME = 'cwcrs_reports_channel'
const STORAGE_EVENT_KEY = 'cwcrs_reports_event'

const listeners = new Set()

let bc = null
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  bc = new BroadcastChannel(CHANNEL_NAME)
  bc.onmessage = (ev) => {
    const msg = ev?.data
    if (!msg || msg.type !== 'report_submitted') return
    for (const fn of listeners) fn(msg.payload)
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (ev) => {
    if (ev.key !== STORAGE_EVENT_KEY || !ev.newValue) return
    try {
      const msg = JSON.parse(ev.newValue)
      if (msg?.type !== 'report_submitted') return
      for (const fn of listeners) fn(msg.payload)
    } catch {
      return
    }
  })
}

export function publishReportSubmitted(report) {
  const payload = report ?? null
  const msg = { type: 'report_submitted', payload }

  for (const fn of listeners) fn(payload)
  if (bc) bc.postMessage(msg)

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_EVENT_KEY, JSON.stringify({ ...msg, t: Date.now() }))
  }
}

export function subscribeReportSubmitted(handler) {
  listeners.add(handler)
  return () => listeners.delete(handler)
}

