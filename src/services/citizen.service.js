import api from './http/client.js'
import unwrapApiResponse from './http/unwrapApiResponse.js'

export async function getCitizenDashboard() {
  const { data } = await api.get('/api/citizen/dashboard')
  return unwrapApiResponse(data)
}

export async function getCitizenRewardHistory({ startDate, endDate } = {}) {
  const params = {}
  if (startDate) params.startDate = startDate
  if (endDate) params.endDate = endDate
  const { data } = await api.get('/api/citizen/rewards/history', { params })
  return unwrapApiResponse(data)
}
