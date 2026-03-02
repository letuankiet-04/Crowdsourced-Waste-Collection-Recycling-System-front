import api from './http/client.js'
import unwrapApiResponse from './http/unwrapApiResponse.js'

function appendMany(from, key, value) {
  const list = Array.isArray(value) ? value : []
  list.forEach((v) => {
    if(v === null || v === undefined) return
    const s = String(v).trim()
    if(!s) return
    from.append(key, s)
  })
}

function buildReprotFormData({
  images, wasteType, categoryIds, quantities, latude, longitude, address, description
} = {}) {
  const formData = new FormData()

  const files = Array.isArray(images) ? images : []
  files.forEach((file) => {
    if(file) formData.append('images', file)
  })
 
  if(wasteType != null && String(wasteType).trim()) formData.append('wasteType', String(wasteType).trim())
  if(latude != null) formData.append('latitude', String(latude))
  if(longitude != null) formData.append('longitude', String(longitude))
  if(address != null && String(address).trim()) formData.append('address', String(address).trim())
  if(description != null && String(description).trim()) formData.append('description', String(description).trim())
  appendMany(formData, 'categoryIds', categoryIds)
  appendMany(formData, 'quantities', quantities)
  return formData
}

export async function getWasteCategories() {
  const { data } = await api.get('/api/citizen/waste-categories')
  return unwrapApiResponse(data)
}


export async function getMyReports() {
  const { data } = await api.get('/api/citizen/reports')
  return unwrapApiResponse(data)
}

export async function getMyReportById(id) {
  const { data } = await api.get(`/api/citizen/reports/${id}`)
  return unwrapApiResponse(data)
}

export async function getMyReportResult(id) {
  const { data } = await api.get(`/api/citizen/reports/${id}/result`)
  return unwrapApiResponse(data)
}

export async function createReport(reportData) {
  const formData = buildReprotFormData(reportData)
  const { data } = await api.post('/api/citizen/reports', formData)
  return unwrapApiResponse(data)
}

export async function updateReport(id, reportData) {
  const formData = buildReprotFormData(reportData)
  const { data } = await api.put(`/api/citizen/reports/${id}`, formData)
  return unwrapApiResponse(data)
}

export async function deleteReport(id) {
  const { data } = await api.delete(`/api/citizen/reports/${id}`)
  return unwrapApiResponse(data)
}

