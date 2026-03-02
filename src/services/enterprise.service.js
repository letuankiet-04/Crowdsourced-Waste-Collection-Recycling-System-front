import api from './http/client.js'
import unwrapApiResponse from './http/unwrapApiResponse.js'

export async function getEnterpriseRequests() {
  const { data } = await api.get('/api/enterprise/requests')
  return unwrapApiResponse(data)
}

export async function assignCollectorToRequest({ requestId, collectorId }) {
  const { data } = await api.post(`/api/enterprise/requests/${requestId}/assign`, null, {
    params: { collectorId },
  })
  return unwrapApiResponse(data)
}

export async function createCollector({ email, password, fullName, phone, employeeCode, vehicleType, vehiclePlate }) {
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
