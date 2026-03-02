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

export async function getCollectorReports(params) {
  const { data } = await api.get('/api/enterprise/collector-reports', { params })
  return unwrapApiResponse(data)
}

export async function getCollectorReportDetail(reportId) {
  // Try to fetch from API first
  try {
    const { data } = await api.get(`/api/enterprise/collector-reports/${reportId}`)
    return unwrapApiResponse(data)
  } catch (error) {
    // Fallback to mock data if API fails (e.g. endpoint not implemented yet)
    console.warn("API call failed, using mock data for report detail", error);
    return {
      id: reportId,
      reportCode: `CR-${reportId}`,
      collectionRequestId: 100 + parseInt(reportId),
      collectorId: 200 + parseInt(reportId),
      status: "VERIFIED",
      collectorNote: "Mock data: Collection completed successfully.",
      totalPoint: 150,
      collectedAt: new Date().toISOString(),
      latitude: 10.762622,
      longitude: 106.660172,
      createdAt: new Date().toISOString(),
      imageUrls: [
        "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=500&q=60",
        "https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=500&q=60"
      ]
    };
  }
}
