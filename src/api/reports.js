import api from './axios.js'

export async function createReport({ types, address, weight, notes, coords, images } = {}) {
  const files = Array.isArray(images) ? images : []
  const hasFiles = files.length > 0

  if (hasFiles) {
    const form = new FormData()
    form.append('types', JSON.stringify(Array.isArray(types) ? types : []))
    if (address != null) form.append('address', String(address))
    if (weight != null) form.append('weight', String(weight))
    if (notes != null) form.append('notes', String(notes))
    if (coords?.lat != null) form.append('lat', String(coords.lat))
    if (coords?.lng != null) form.append('lng', String(coords.lng))
    for (const file of files) form.append('images', file)

    const { data } = await api.post('/api/reports', form)
    return data
  }

  const { data } = await api.post('/api/reports', {
    types: Array.isArray(types) ? types : [],
    address: address ?? '',
    weight: weight ?? '',
    notes: notes ?? '',
    coords: coords ?? null,
  })
  return data
}

