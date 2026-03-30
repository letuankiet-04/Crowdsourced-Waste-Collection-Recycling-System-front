import api from './http/client.js'
import unwrapApiResponse from './http/unwrapApiResponse.js'

export async function getAdminAccounts(params) {
  const { data } = await api.get('/api/admin/accounts', { params })
  return unwrapApiResponse(data)
}

export async function getAdminAccountById(userId) {
  const { data } = await api.get(`/api/admin/accounts/${userId}`)
  return unwrapApiResponse(data)
}

export async function createCitizenAccount(payload) {
  const { data } = await api.post('/api/admin/accounts/citizens', payload)
  return unwrapApiResponse(data)
}

export async function createCollectorAccount(payload) {
  const { data } = await api.post('/api/admin/accounts/collectors', payload)
  return unwrapApiResponse(data)
}

export async function createEnterpriseAccount(payload) {
  const { data } = await api.post('/api/admin/accounts/enterprises', payload)
  return unwrapApiResponse(data)
}

export async function suspendAdminAccount(userId) {
  const { data } = await api.patch(`/api/admin/accounts/${userId}/suspend`)
  return unwrapApiResponse(data)
}

export async function activateAdminAccount(userId) {
  const { data } = await api.patch(`/api/admin/accounts/${userId}/activate`)
  return unwrapApiResponse(data)
}

export async function updateAdminAccount(userId, payload) {
  const { data } = await api.patch(`/api/admin/accounts/${userId}`, payload)
  return unwrapApiResponse(data)
}

export async function deleteAdminAccount(userId) {
  const { data } = await api.delete(`/api/admin/accounts/${userId}`)
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

export async function getAdminCollectedWasteByUnit(period) {
  const params = period ? { period } : undefined
  const { data } = await api.get('/api/admin/analytics/collected-waste-by-unit', { params })
  return unwrapApiResponse(data)
}
