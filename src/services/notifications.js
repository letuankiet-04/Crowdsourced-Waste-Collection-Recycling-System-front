import api from './http/client.js'
import unwrapApiResponse from './http/unwrapApiResponse.js'

export function subscribeNotifications() {
  return () => {}
}

export async function getNotifications(userId) {
  try {
    const params = userId != null ? { userId } : undefined
    const { data } = await api.get('/api/notifications', { params })
    const result = unwrapApiResponse(data)
    return Array.isArray(result) ? result : []
  } catch {
    return []
  }
}

export async function markAsRead(id) {
  if (!id) return { success: false }
  try {
    const { data } = await api.patch(`/api/notifications/${id}/read`)
    return unwrapApiResponse(data) ?? { success: true }
  } catch {
    return { success: false }
  }
}

export async function getUnreadCount(userId) {
  const list = await getNotifications(userId)
  return list.filter((n) => !n?.isRead).length
}

export async function createNotification(notification) {
  try {
    const { data } = await api.post('/api/notifications', notification ?? {})
    return unwrapApiResponse(data)
  } catch {
    return null
  }
}
