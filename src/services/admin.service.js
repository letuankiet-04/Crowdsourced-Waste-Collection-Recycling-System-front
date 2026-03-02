import api from './http/client.js'
import unwrapApiResponse from './http/unwrapApiResponse.js'

export async function getAdminAccounts() {
  const { data } = await api.get('/api/admin/accounts')
  return unwrapApiResponse(data)
}
