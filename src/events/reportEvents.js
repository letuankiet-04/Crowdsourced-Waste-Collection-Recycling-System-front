const CHANNEL_NAME = 'cwcrs_reports_channel'

const submittedListeners = new Set()
const clearedListeners = new Set()

let bc = null
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  bc = new BroadcastChannel(CHANNEL_NAME)
  bc.onmessage = (ev) => {
    const msg = ev?.data
    if (!msg) return
    if (msg.type === 'report_submitted') {
      for (const fn of submittedListeners) fn(msg.payload)
      return
    }
    if (msg.type === 'reports_cleared') {
      for (const fn of clearedListeners) fn()
    }
  }
}

export function publishReportSubmitted(report) {
  const payload = report ?? null
  const msg = { type: 'report_submitted', payload }

  for (const fn of submittedListeners) fn(payload)
  if (bc) bc.postMessage(msg)
}

export function subscribeReportSubmitted(handler) {
  submittedListeners.add(handler)
  return () => submittedListeners.delete(handler)
}

export function publishReportsCleared() {
  const msg = { type: 'reports_cleared', payload: null }

  for (const fn of clearedListeners) fn()
  if (bc) bc.postMessage(msg)
}

export function subscribeReportsCleared(handler) {
  clearedListeners.add(handler)
  return () => clearedListeners.delete(handler)
}

