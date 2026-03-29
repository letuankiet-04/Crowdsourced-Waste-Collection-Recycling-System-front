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
    const subjectText = String(item.subject ?? item.title ?? "").toUpperCase()
    const t = String(item.type || item.feedbackType || item.complaintType || item.category || "").toUpperCase()
    const collectionRequestId =
      item.collectionRequestId ??
      item.collection_request_id ??
      item.collectionRequestID ??
      item.requestId ??
      item.request_id ??
      null
    const hasCollectionLink = collectionRequestId != null && collectionRequestId !== ""
    const reportId = item.reportId ?? item.report_id ?? item.wasteReportId ?? item.waste_report_id ?? null
    const collectorReportId =
      item.collectorReportId ?? item.collector_report_id ?? item.collectorSubmissionId ?? null
    const hasAnyReportLink =
      (reportId != null && reportId !== "") || (collectorReportId != null && collectorReportId !== "")

    const isCollectionRelated =
      hasCollectionLink ||
      t === "COMPLAINT_COLLECTION" ||
      t.includes("COLLECTION") ||
      subjectText.includes("COMPLAINT_COLLECTION") ||
      subjectText.includes("COLLECTION")

    const isEnterpriseRelated =
      isCollectionRelated ||
      t === "COMPLAINT_REWARD" ||
      t.includes("REWARD") ||
      subjectText.includes("COMPLAINT_REWARD") ||
      subjectText.includes("REWARD")

    if (isEnterpriseRelated) {
      return false
    }

    const isSystemRelated =
      t === "SYSTEM" || t === "COMPLAINT_SYSTEM" || t.includes("SYSTEM") || subjectText.includes("SYSTEM")

    if (!isSystemRelated && (!t || hasAnyReportLink)) {
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
