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

export async function getPendingAdminFeedbackCount() {
  const list = await getAdminFeedbacks({ _: Date.now() })
  if (!Array.isArray(list)) return 0
  return list.filter((item) => {
    // Only count SYSTEM feedbacks
    const t = String(item.type || item.feedbackType || "").toUpperCase()
    if (t === "COMPLAINT_COLLECTION" || t.includes("COLLECTION")) {
      return false
    }
    const hasSystemType = t === "SYSTEM" || t === "COMPLAINT_SYSTEM" || t.includes("SYSTEM")
    const looksSystemByLinkage = !t && item.collectionRequestId == null
    if (!hasSystemType && !looksSystemByLinkage) {
      return false
    }

    const status = String(item?.status || '').toUpperCase()
    if (status === 'REJECT' || status === 'REJECTED') return false
    return status === 'PENDING'
  }).length
}

export async function createCollectorFeedback(data) {
  const formData = new FormData()
  if (data.collectionRequestId != null) {
    formData.append('collectionRequestId', String(data.collectionRequestId))
  }
  formData.append('type', data.type)
  formData.append('content', data.content)
  if (data.rating != null) {
    formData.append('rating', String(data.rating))
  }

  const response = await api.post('/api/collector/feedbacks', formData)
  return unwrapApiResponse(response.data)
}

export async function getCollectorFeedbacks(params) {
  const { data } = await api.get('/api/collector/feedbacks', { params })
  return unwrapApiResponse(data)
}

export async function getCollectorFeedbackById(id) {
  const list = await getCollectorFeedbacks({ _: Date.now() })
  const numericId = Number(id)
  return Array.isArray(list) ? list.find((item) => item.id === numericId) ?? null : null
}
