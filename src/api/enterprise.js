import api from './axios.js'

function unwrapApiResponse(data) {
  if (data && typeof data === 'object' && 'result' in data) return data.result
  return data
}

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
