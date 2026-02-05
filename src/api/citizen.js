import api from './axios.js'
import unwrapApiResponse from './unwrapApiResponse.js'

export async function getCitizenDashboard() {
  const { data } = await api.get('/api/citizen/dashboard')
  return unwrapApiResponse(data)
}
