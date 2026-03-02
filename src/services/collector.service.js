import api from './http/client.js'
import unwrapApiResponse from './http/unwrapApiResponse.js'

const COLLECTIONS_BASE = '/api/collector/collections'

export async function getCollectorDashboard() {
  const { data } = await api.get('/api/collector/dashboard')
  return unwrapApiResponse(data)
}

export async function getCollectorTasks({ status, all } = {}) {
  const params = {}
  if (status) params.status = status
  if (typeof all === 'boolean') params.all = all
  const { data } = await api.get(`${COLLECTIONS_BASE}/tasks`, { params })
  return unwrapApiResponse(data)
}

export async function getCollectorWorkHistory({ status } = {}) {
  const params = {}
  if (status) params.status = status
  const { data } = await api.get(`${COLLECTIONS_BASE}/work_history`, { params })
  return unwrapApiResponse(data)
}

export async function acceptCollectorTask(requestId) {
  const { data } = await api.post(`${COLLECTIONS_BASE}/${requestId}/accept`)
  return unwrapApiResponse(data)
}

export async function startCollectorTask(requestId) {
  const { data } = await api.post(`${COLLECTIONS_BASE}/${requestId}/start`)
  return unwrapApiResponse(data)
}

export async function markCollectorCollected(requestId) {
  const { data } = await api.post(`${COLLECTIONS_BASE}/${requestId}/collected`)
  return unwrapApiResponse(data)
}

export async function rejectCollectorTask(requestId, reason) {
  const { data } = await api.post(`${COLLECTIONS_BASE}/${requestId}/reject`, { reason })
  return unwrapApiResponse(data)
}

export async function updateCollectorTaskStatus(requestId, status) {
  const { data } = await api.patch(`${COLLECTIONS_BASE}/${requestId}/status`, { status })
  return unwrapApiResponse(data)
}

export async function getCollectorCreateReport(requestId) {
  const { data } = await api.get(`${COLLECTIONS_BASE}/${requestId}/create_report`)
  return unwrapApiResponse(data)
}

export async function completeCollectorTask(
  requestId,
  { images, categoryIds, quantities, collectorNote, latitude, longitude } = {}
) {
  const formData = new FormData()

  const imgList = Array.isArray(images) ? images : []
  imgList.forEach((file) => formData.append('images', file))

  const catList = Array.isArray(categoryIds) ? categoryIds : []
  catList.forEach((id) => formData.append('categoryIds', String(id)))

  const qtyList = Array.isArray(quantities) ? quantities : []
  qtyList.forEach((q) => formData.append('quantities', String(q)))

  formData.append('collectorNote', collectorNote ?? '')
  formData.append('latitude', String(latitude ?? ''))
  formData.append('longitude', String(longitude ?? ''))

  const { data } = await api.post(`${COLLECTIONS_BASE}/${requestId}/complete`, formData)
  return unwrapApiResponse(data)
}

export async function getCollectorReportByCollectionRequest(requestId) {
  const { data } = await api.get(`${COLLECTIONS_BASE}/${requestId}/report`)
  return unwrapApiResponse(data)
}

export async function getMyCollectionTasks() {
  return getCollectorTasks()
}

export async function updateCollectionStatus({ id, status }) {
  return updateCollectorTaskStatus(id, status)
}
