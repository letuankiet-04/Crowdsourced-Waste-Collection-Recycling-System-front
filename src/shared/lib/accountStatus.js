export function normalizeRole(role) {
  if (typeof role !== 'string') return null
  const trimmed = role.trim()
  if (!trimmed) return null
  const normalized = trimmed.toLowerCase()
  if (normalized.startsWith('role_')) return normalized.slice('role_'.length) || null
  return normalized
}

export function isSuspendedAccount(payload) {
  if (!payload || typeof payload !== 'object') return false
  if (payload.suspended === true || payload.isSuspended === true) return true
  const candidates = [
    payload.status,
    payload.state,
    payload.availability,
    payload.accountStatus,
    payload.userStatus,
    payload.collectorStatus,
    payload.collector_status,
    payload.collectorState,
  ]
  return candidates.some((value) => typeof value === 'string' && value.toLowerCase().includes('suspend'))
}
