import api from './axios.js'

export async function getEnterpriseRequests() {
  const { data } = await api.get('/api/enterprise/requests')
  return data
}

export async function assignCollectorToRequest({ requestId, collectorId }) {
  const { data } = await api.post(`/api/enterprise/requests/${requestId}/assign`, null, {
    params: { collectorId },
  })
  return data
}
