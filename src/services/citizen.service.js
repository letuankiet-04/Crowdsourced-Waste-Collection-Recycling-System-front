import api from './http/client.js'
import unwrapApiResponse from './http/unwrapApiResponse.js'

export async function getCitizenDashboard() {
  const { data } = await api.get('/api/citizen/dashboard')
  return unwrapApiResponse(data)
}
