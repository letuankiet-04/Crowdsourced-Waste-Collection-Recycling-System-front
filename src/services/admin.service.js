import api from './http/client.js'
import unwrapApiResponse from './http/unwrapApiResponse.js'

export async function getAdminAccounts(params) {
  const { data } = await api.get('/api/admin/accounts', { params })
  return unwrapApiResponse(data)
}

/**
 * Create a new user account for a specific role via admin endpoints.
 *
 * Mapping (theo API backend):
 * - citizen    → POST /api/admin/accounts/citizens
 * - collector  → POST /api/admin/accounts/collectors
 * - enterprise → POST /api/admin/accounts/enterprises
 *
 * @param {{ fullName: string, email: string, phone?: string, password: string, role: 'citizen' | 'collector' | 'enterprise' }} payload
 * @returns {Promise<unknown>}
 */
export async function createAdminAccount(payload) {
  const role = String(payload.role || '').toLowerCase()

  let pathSegment
  switch (role) {
    case 'citizen':
      pathSegment = 'citizens'
      break
    case 'collector':
      pathSegment = 'collectors'
      break
    case 'enterprise':
      pathSegment = 'enterprises'
      break
    default:
      throw new Error('Unsupported role for admin account creation')
  }

  const body = {
    fullName: payload.fullName,
    email: payload.email,
    phone: payload.phone ?? null,
    password: payload.password,
  }

  if (role === 'collector') {
    body.enterpriseId = payload.enterpriseId ?? null
    body.vehicleType = payload.vehicleType ?? null
    body.vehiclePlate = payload.vehiclePlate ?? null
  }

  if (role === 'enterprise') {
    // Backend yêu cầu enterpriseName cho role ENTERPRISE
    // Nếu không truyền riêng, dùng luôn fullName làm enterpriseName.
    body.enterpriseName = payload.enterpriseName ?? payload.fullName
  }
  const { data } = await api.post(`/api/admin/accounts/${pathSegment}`, body)
  return unwrapApiResponse(data)
}

export async function getAdminSystemAnalytics(params) {
  const { data } = await api.get('/api/admin/analytics/system', { params })
  return unwrapApiResponse(data)
}

export async function getAdminCollectedWeightChart(year) {
  const { data } = await api.get('/api/admin/analytics/collected-weight', { params: { year } })
  return unwrapApiResponse(data)
}

export async function getAdminCollectedWeightDailyChart(year, month) {
  const { data } = await api.get('/api/admin/analytics/collected-weight/daily', { params: { year, month } })
  return unwrapApiResponse(data)
}

export async function getAdminCollectedWasteByUnit() {
  const { data } = await api.get('/api/admin/analytics/collected-waste-by-unit')
  return unwrapApiResponse(data)
}

export async function getAdminCollectorLeaderboard(params) {
  const { data } = await api.get('/api/admin/analytics/leaderboard/collectors', { params })
  return unwrapApiResponse(data)
}

export async function getAdminCitizenLeaderboard(params) {
  const { data } = await api.get('/api/admin/analytics/leaderboard/citizens', { params })
  return unwrapApiResponse(data)
}
