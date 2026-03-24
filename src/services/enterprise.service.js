import api from './http/client.js'
import unwrapApiResponse from './http/unwrapApiResponse.js'

export async function getEnterpriseReportsPending() {
  const { data } = await api.get('/api/enterprise/waste-reports/pending')
  return unwrapApiResponse(data)
}

export async function getEnterpriseReports() {
  const { data } = await api.get('/api/enterprise/waste-reports')
  return unwrapApiResponse(data)
}

export async function getEnterpriseWasteReportById(id) {
  if (id == null) throw new Error('Report ID is required')
  const { data } = await api.get(`/api/enterprise/waste-reports/${encodeURIComponent(id)}`)
  return unwrapApiResponse(data)
}

export async function getEnterpriseReportsWasteVolume(params) {
  const { data } = await api.get('/api/enterprise/reports/waste-volume', { params })
  return unwrapApiResponse(data)
}

export async function getEnterpriseReportsGeneral(params) {
  const { data } = await api.get('/api/enterprise/reports/general', { params })
  return unwrapApiResponse(data)
}

export async function getEnterpriseReportsCitizens(params) {
  const { data } = await api.get('/api/enterprise/reports/citizens', { params })
  return unwrapApiResponse(data)
}

export async function acceptWasteReport({ reportCode, estimatedWeight }) {
  if (!reportCode) throw new Error('Report Code is required')
  const body = estimatedWeight != null ? { estimatedWeight } : {}
  const { data } = await api.post(
    `/api/enterprise/requests/accept/${encodeURIComponent(reportCode)}`,
    body
  )
  return unwrapApiResponse(data)
}

export async function rejectWasteReport({ reportCode, reason }) {
  if (!reportCode) throw new Error('Report Code is required')
  const body = reason ? { reason } : {}
  const { data } = await api.post(
    `/api/enterprise/requests/reject/${encodeURIComponent(reportCode)}`,
    body
  )
  return unwrapApiResponse(data)
}

export async function assignCollectorToRequest({ requestId, collectorId }) {
  if (requestId == null) throw new Error('Request ID is required')
  if (collectorId == null) throw new Error('Collector ID is required')
  const { data } = await api.post(`/api/enterprise/requests/${encodeURIComponent(requestId)}/assign-collector`, {
    collectorId,
  })
  return unwrapApiResponse(data)
}

export async function assignCollectorByReportCode({ reportCode, collectorId }) {
  if (!reportCode) throw new Error('Report Code is required')
  if (collectorId == null) throw new Error('Collector ID is required')
  const { data } = await api.post(
    `/api/enterprise/requests/reports/${encodeURIComponent(reportCode)}/assign-collector`,
    { collectorId }
  )
  return unwrapApiResponse(data)
}


export async function createCollector({
  email,
  password,
  fullName,
  phone,
  employeeCode,
  vehicleType,
  vehiclePlate,
}) {
  const { data } = await api.post('/api/enterprise/collectors', {
    email,
    phone: phone || undefined,
    password,
    fullName,
    employeeCode: employeeCode || undefined,
    vehicleType,
    vehiclePlate,
  })
  return unwrapApiResponse(data)
}

export async function getEnterpriseCollectors() {
  const { data } = await api.get('/api/enterprise/collectors')
  return unwrapApiResponse(data)
}

export async function getEligibleCollectorsForRequest(requestId) {
  if (requestId == null) throw new Error('Request ID is required')
  const { data } = await api.get(
    `/api/enterprise/requests/${encodeURIComponent(requestId)}/eligible-collectors`
  )
  return unwrapApiResponse(data)
}

export async function getEnterpriseRequestReportDetail(requestId) {
  if (requestId == null) throw new Error('Request ID is required')
  const { data } = await api.get(
    `/api/enterprise/requests/${encodeURIComponent(requestId)}/report-detail`
  )
  return unwrapApiResponse(data)
}

/** Normalize enterprise collector report payloads (camelCase + common snake_case from API). */
export function normalizeEnterpriseCollectorReport(raw) {
  if (raw == null || typeof raw !== 'object') return raw
  const r = raw
  const imageUrls =
    r.imageUrls ??
    r.image_urls ??
    r.images ??
    (Array.isArray(r.imageUrlList) ? r.imageUrlList : undefined)
  const latitude = r.latitude ?? r.lat ?? r.location?.latitude ?? r.location?.lat
  const longitude = r.longitude ?? r.lng ?? r.location?.longitude ?? r.location?.lng
  return {
    ...r,
    id: r.id ?? r.collectorReportId ?? r.collector_report_id,
    reportCode: r.reportCode ?? r.report_code,
    collectionRequestId:
      r.collectionRequestId ??
      r.collection_request_id ??
      r.collectionRequest?.id ??
      r.collection_request?.id,
    collectorId: r.collectorId ?? r.collector_id,
    status: r.status,
    verificationRate: r.verificationRate ?? r.verification_rate,
    collectorNote: r.collectorNote ?? r.collector_note,
    totalPoint: r.totalPoint ?? r.total_point,
    collectedAt: r.collectedAt ?? r.collected_at,
    latitude,
    longitude,
    createdAt: r.createdAt ?? r.created_at,
    imageUrls: Array.isArray(imageUrls) ? imageUrls : r.imageUrls,
  }
}

export async function getCollectorReports(params) {
  const { data } = await api.get('/api/enterprise/collector-reports', { params })
  const unwrapped = unwrapApiResponse(data)
  const rows = Array.isArray(unwrapped) ? unwrapped : unwrapped?.items ?? unwrapped?.content ?? []
  if (!Array.isArray(rows)) return unwrapped
  return rows.map((row) => normalizeEnterpriseCollectorReport(row))
}

export async function getCollectorReportDetail(reportId) {
  if (reportId == null || String(reportId).trim() === '') throw new Error('Report ID is required')
  const key = String(reportId).trim()
  try {
    const { data } = await api.get(`/api/enterprise/collector-reports/${encodeURIComponent(key)}`)
    return normalizeEnterpriseCollectorReport(unwrapApiResponse(data))
  } catch (err) {
    try {
      const list = await getCollectorReports()
      const hit =
        (Array.isArray(list) ? list : []).find((r) => String(r?.id) === key) ??
        (Array.isArray(list) ? list : []).find((r) => String(r?.reportCode ?? '') === key)
      if (hit) return normalizeEnterpriseCollectorReport(hit)
    } catch {
      void 0
    }
    throw err
  }
}

export async function rewardCollectorReport({ reportId, verificationRate }) {
  if (reportId == null || String(reportId).trim() === '') throw new Error('Report ID is required')
  const rateNum = typeof verificationRate === 'number' ? verificationRate : Number(verificationRate)
  if (!Number.isFinite(rateNum)) throw new Error('verificationRate is required')
  const key = String(reportId).trim()
  const { data } = await api.post(
    `/api/enterprise/collector-reports/${encodeURIComponent(key)}/reward`,
    { verificationRate: rateNum }
  )
  return unwrapApiResponse(data)
}

export async function createEnterprisePointAdjustment({
  collectionRequestId,
  citizenId,
  points,
  description,
}) {
  if (collectionRequestId == null || String(collectionRequestId).trim() === '') {
    throw new Error('collectionRequestId is required')
  }
  const pts = typeof points === 'number' ? points : Number(points)
  if (!Number.isFinite(pts)) throw new Error('points is required')
  const body = {
    collectionRequestId: Number(collectionRequestId),
    points: Math.trunc(pts),
    description: description ? String(description) : undefined,
    citizenId: citizenId != null && String(citizenId).trim() !== '' ? Number(citizenId) : undefined,
  }
  const { data } = await api.post('/api/enterprise/points/adjustments', body)
  return unwrapApiResponse(data)
}

export async function updateEnterprisePointAdjustment(id, { points, description }) {
  if (id == null || String(id).trim() === '') throw new Error('Adjustment ID is required')
  const pts = typeof points === 'number' ? points : Number(points)
  if (!Number.isFinite(pts)) throw new Error('points is required')
  const { data } = await api.put(`/api/enterprise/points/adjustments/${encodeURIComponent(String(id).trim())}`, {
    points: Math.trunc(pts),
    description: description ? String(description) : undefined,
  })
  return unwrapApiResponse(data)
}

export async function deleteEnterprisePointAdjustment(id) {
  if (id == null || String(id).trim() === '') throw new Error('Adjustment ID is required')
  const { data } = await api.delete(
    `/api/enterprise/points/adjustments/${encodeURIComponent(String(id).trim())}`
  )
  return unwrapApiResponse(data)
}
