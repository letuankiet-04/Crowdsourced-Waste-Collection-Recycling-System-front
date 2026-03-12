import api from './http/client.js'
import unwrapApiResponse from './http/unwrapApiResponse.js'

export async function getAdminAccounts(params) {
  const { data } = await api.get('/api/admin/accounts', { params })
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
