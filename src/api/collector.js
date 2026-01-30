import api from './axios.js'

export async function getCollectorDashboard() {
  const { data } = await api.get('/api/collector/dashboard')
  return data
}

export async function getMyCollectionTasks() {
  const { data } = await api.get('/api/collector/collections/my-tasks')
  return data
}

export async function updateCollectionStatus({ id, status }) {
  const { data } = await api.patch(`/api/collector/collections/${id}/status`, null, {
    params: { status },
  })
  return data
}
