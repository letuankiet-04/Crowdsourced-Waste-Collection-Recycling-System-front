import api from './axios.js'

export async function getCitizenDashboard() {
  const { data } = await api.get('/api/citizen/dashboard')
  return data
}
