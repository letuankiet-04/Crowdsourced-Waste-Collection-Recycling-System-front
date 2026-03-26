import api from './http/client.js'
import unwrapApiResponse from './http/unwrapApiResponse.js'

function getClientName() {
  if (typeof window === 'undefined' || !window.navigator) return 'unknown_client'
  const ua = window.navigator.userAgent || ''
  if (ua.includes('Edg')) return 'Edge'
  if (ua.includes('Chrome')) return 'Chrome'
  if (ua.includes('Firefox')) return 'Firefox'
  if (ua.includes('Safari')) return 'Safari'
  if (ua.includes('Mac')) return 'Mac'
  return 'WebClient'
}

function createClientSession() {
  let uuid = null
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      uuid = crypto.randomUUID()
    }
  } catch {
    uuid = null
  }
  const clientName = getClientName()
  const baseId = uuid || `cs_${Date.now()}_${Math.random().toString(16).slice(2)}`
  return `${clientName}_${baseId}`
}

function generateRandomToken(length = 6) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export async function runEkycCccdFlow({ frontFile, backFile }) {
  if (!(frontFile instanceof File) || !(backFile instanceof File)) {
    throw new Error('Missing ID Card images')
  }
  const form = new FormData()
  form.append('front', frontFile)
  form.append('back', backFile)
  form.append('clientSession', createClientSession())
  form.append('token', generateRandomToken(6))
  form.append('enhance', 'true')

  const { data } = await api.post('/api/auth/ekyc/flow', form)
  return unwrapApiResponse(data)
}
