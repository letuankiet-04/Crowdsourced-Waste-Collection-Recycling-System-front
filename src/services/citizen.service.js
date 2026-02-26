import api from './http/client.js'
import unwrapApiResponse from './http/unwrapApiResponse.js'

export async function getCitizenDashboard() {
  const { data } = await api.get('/api/citizen/dashboard')
  return unwrapApiResponse(data)
}

export async function getCitizenPoints() {
  const { data } = await api.get('/api/citizen/points')
  return unwrapApiResponse(data)
}

export async function getCitizenPointsHistory(params) {
  const { data } = await api.get('/api/citizen/points/history', { params })
  return unwrapApiResponse(data)
}
