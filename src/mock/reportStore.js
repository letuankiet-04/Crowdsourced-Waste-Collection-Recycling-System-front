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
  const raw = window.sessionStorage.getItem(REPORTS_KEY)
  const list = safeParse(raw, [])
  return Array.isArray(list) ? list : []
}

export function addMockReport(report) {
  if (typeof window === 'undefined') return []
  const prev = getMockReports()
  const next = [report, ...prev].slice(0, MAX_REPORTS)
  window.sessionStorage.setItem(REPORTS_KEY, JSON.stringify(next))
  return next
}

export function updateMockReport(nextReport) {
  if (typeof window === 'undefined') return []
  if (!nextReport || !nextReport.id) return getMockReports()
  const prev = getMockReports()
  const next = prev.map((r) => (r && r.id === nextReport.id ? nextReport : r)).slice(0, MAX_REPORTS)
  window.sessionStorage.setItem(REPORTS_KEY, JSON.stringify(next))
  return next
}

export function deleteMockReport(reportId) {
  if (typeof window === 'undefined') return []
  const id = reportId ? String(reportId) : ''
  if (!id) return getMockReports()
  const prev = getMockReports()
  const next = prev.filter((r) => !(r && r.id === id))
  window.sessionStorage.setItem(REPORTS_KEY, JSON.stringify(next))
  return next
}

export function clearMockReports() {
  if (typeof window === 'undefined') return []
  window.sessionStorage.removeItem(REPORTS_KEY)
  return []
}

