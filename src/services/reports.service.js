import api from './http/client.js'
import unwrapApiResponse from './http/unwrapApiResponse.js'

export async function createReport({ types, address, weight, notes, coords, images } = {}) {
  const files = Array.isArray(images) ? images : []
  const firstFile = files.length ? files[0] : null
  const wasteType = Array.isArray(types) && types.length ? String(types[0]) : ''

  const descriptionParts = []
  if (notes != null && String(notes).trim()) descriptionParts.push(String(notes).trim())
  if (address != null && String(address).trim()) descriptionParts.push(`Address: ${String(address).trim()}`)
  if (weight != null && String(weight).trim()) descriptionParts.push(`Estimated weight: ${String(weight).trim()} kg`)
  const description = descriptionParts.join('\n').trim()

  const form = new FormData()
  if (firstFile) form.append('image', firstFile)
  if (coords?.lat != null) form.append('latitude', String(coords.lat))
  if (coords?.lng != null) form.append('longitude', String(coords.lng))
  if (description) form.append('description', description)
  if (wasteType) form.append('wasteType', wasteType)

  const { data } = await api.post('/api/citizen/reports', form)
  return unwrapApiResponse(data)
}

