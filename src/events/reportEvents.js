const CHANNEL_NAME = 'cwcrs_reports_channel'

const submittedListeners = new Set()
const updatedListeners = new Set()
const deletedListeners = new Set()
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
    if (msg.type === 'report_updated') {
      for (const fn of updatedListeners) fn(msg.payload)
      return
    }
    if (msg.type === 'report_deleted') {
      for (const fn of deletedListeners) fn(msg.payload)
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

export function publishReportUpdated(report) {
  const payload = report ?? null
  const msg = { type: 'report_updated', payload }

  for (const fn of updatedListeners) fn(payload)
  if (bc) bc.postMessage(msg)
}

export function subscribeReportUpdated(handler) {
  updatedListeners.add(handler)
  return () => updatedListeners.delete(handler)
}

export function publishReportDeleted(reportId) {
  const payload = reportId ? String(reportId) : null
  const msg = { type: 'report_deleted', payload }

  for (const fn of deletedListeners) fn(payload)
  if (bc) bc.postMessage(msg)
}

export function subscribeReportDeleted(handler) {
  deletedListeners.add(handler)
  return () => deletedListeners.delete(handler)
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

