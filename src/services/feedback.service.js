import api from './http/client.js'
import unwrapApiResponse from './http/unwrapApiResponse.js'

export async function createFeedback(data) {
  const formData = new FormData()
  if (data.reportId != null) {
    formData.append('reportId', data.reportId)
  }
  formData.append('type', data.type)
  formData.append('content', data.content)
  if (data.rating != null) {
    formData.append('rating', String(data.rating))
  }

  const response = await api.post('/api/citizen/complaints', formData)
  return unwrapApiResponse(response.data)
}

export async function getCitizenFeedbacks(params) {
  const { data } = await api.get('/api/citizen/complaints', { params })
  return unwrapApiResponse(data)
}

export async function getCitizenFeedbackById(id) {
  const list = await getCitizenFeedbacks({ _: Date.now() })
  const numericId = Number(id)
  return Array.isArray(list) ? list.find((item) => item.id === numericId) ?? null : null
}

export async function getEnterpriseFeedbacks(params) {
  const { data } = await api.get('/api/enterprise/feedbacks', { params })
  return unwrapApiResponse(data)
}

export async function getEnterpriseFeedbackById(id) {
  const { data } = await api.get(`/api/enterprise/feedbacks/${id}`)
  return unwrapApiResponse(data)
}

export async function resolveEnterpriseFeedback(id, payload) {
  const { data } = await api.post(`/api/enterprise/feedbacks/${id}/resolve`, payload)
  return unwrapApiResponse(data)
}

export async function getAdminFeedbacks(params) {
  const { data } = await api.get('/api/admin/complaints', { params })
  return unwrapApiResponse(data)
}

export async function getAdminFeedbackById(id) {
  const { data } = await api.get(`/api/admin/complaints/${id}`)
  return unwrapApiResponse(data)
}

export async function resolveAdminFeedback(id, payload) {
  const { data } = await api.post(`/api/admin/complaints/${id}/resolve`, payload)
  return unwrapApiResponse(data)
}
