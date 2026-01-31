const REPORTS_KEY = 'cwcrs_mock_reports'
const MAX_REPORTS = 50

function safeParse(json, fallback) {
  try {
    const parsed = JSON.parse(json)
    return parsed ?? fallback
  } catch {
    return fallback
  }
}

export function getMockReports() {
  if (typeof window === 'undefined') return []
  const raw = window.localStorage.getItem(REPORTS_KEY)
  const list = safeParse(raw, [])
  return Array.isArray(list) ? list : []
}

export function addMockReport(report) {
  if (typeof window === 'undefined') return []
  const prev = getMockReports()
  const next = [report, ...prev].slice(0, MAX_REPORTS)
  window.localStorage.setItem(REPORTS_KEY, JSON.stringify(next))
  return next
}

