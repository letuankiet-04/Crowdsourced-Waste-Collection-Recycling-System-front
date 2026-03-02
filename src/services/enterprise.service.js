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
  const { data } = await api.post(`/api/enterprise/requests/${requestId}/assign`, {
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

export async function getEnterpriseCollectors() {
  const { data } = await api.get('/api/enterprise/collectors')
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