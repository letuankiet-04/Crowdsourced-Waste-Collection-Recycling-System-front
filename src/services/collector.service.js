import api from './http/client.js'
import unwrapApiResponse from './http/unwrapApiResponse.js'

const COLLECTIONS_BASE = '/api/collector/collections'

export async function getCollectorDashboard() {
  const { data } = await api.get('/api/collector/dashboard')
  return unwrapApiResponse(data)
}

export async function getCollectorLeaderboard({ month, year } = {}) {
  const params = {}
  if (Number.isFinite(Number(month))) params.month = Number(month)
  if (Number.isFinite(Number(year))) params.year = Number(year)
  const { data } = await api.get('/api/collector/leaderboard', { params })
  const unwrapped = unwrapApiResponse(data)
  return Array.isArray(unwrapped) ? unwrapped : []
}

export async function getCollectorTasks({ status, all } = {}) {
  const params = {}
  if (status) params.status = status
  if (typeof all === 'boolean') params.all = all
  const { data } = await api.get(`${COLLECTIONS_BASE}/tasks`, { params })
  return unwrapApiResponse(data)
}

export async function getCollectorTaskDetail(requestId) {
  const { data } = await api.get(`${COLLECTIONS_BASE}/tasks/${requestId}`)
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

export async function getCollectorFullData() {
  const [dashboard, tasks, history] = await Promise.all([
    getCollectorDashboard(),
    getCollectorTasks({ all: true }),
    getCollectorWorkHistory(),
  ])

  return {
    dashboard,
    tasks: Array.isArray(tasks) ? tasks : [],
    history: Array.isArray(history) ? history : [],
  }
}

export async function getMyCollectionTasks() {
  return getCollectorTasks()
}

export async function updateCollectionStatus({ id, status }) {
  return updateCollectorTaskStatus(id, status)
}

export async function updateCollectorPresence({ status, availability, online } = {}) {
  const desired =
    typeof status === 'string'
      ? status
      : typeof availability === 'string'
        ? availability
        : typeof online === 'boolean'
          ? online
            ? 'ONLINE'
            : 'OFFLINE'
          : null

  if (!desired) throw new Error('Missing collector status')

  const candidates = [
    { url: '/api/collector/status', body: { status: desired } },
    { url: '/api/collector/presence', body: { status: desired } },
    { url: '/api/collector/availability', body: { availability: desired } },
    { url: '/api/collector/availability', body: { status: desired } },
  ]

  let lastError = null
  for (const c of candidates) {
    try {
      const { data } = await api.patch(c.url, c.body)
      return unwrapApiResponse(data)
    } catch (err) {
      lastError = err
      const statusCode = err?.status
      if (statusCode === 404 || statusCode === 405) continue
      throw err
    }
  }

  throw lastError ?? new Error('Unable to update collector status')
}
