import api from './http/client.js'
import unwrapApiResponse from './http/unwrapApiResponse.js'

function decodeBase64Url(input) {
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')
  const binary = atob(padded)
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0))
  const text = new TextDecoder().decode(bytes)
  return text
}

export function parseJwt(token) {
  if (!token) return null
  const parts = String(token).split('.')
  if (parts.length < 2) return null
  try {
    return JSON.parse(decodeBase64Url(parts[1]))
  } catch {
    return null
  }
}

export function getRoleFromJwt(token) {
  const payload = parseJwt(token)
  const scope = typeof payload?.scope === 'string' ? payload.scope : ''
  const roleEntry = scope.split(/\s+/).find((entry) => entry.startsWith('ROLE_'))
  if (!roleEntry) return null
  return roleEntry.slice('ROLE_'.length).toLowerCase()
}

export function buildStoredUserFromToken(token, extra = null) {
  const payload = parseJwt(token)
  const role = getRoleFromJwt(token)
  const scope = typeof payload?.scope === 'string' ? payload.scope : ''
  const email = typeof payload?.sub === 'string' ? payload.sub : null

  const tokenName =
    typeof payload?.fullName === 'string'
      ? payload.fullName
      : typeof payload?.full_name === 'string'
        ? payload.full_name
        : typeof payload?.name === 'string'
          ? payload.name
          : typeof payload?.preferred_username === 'string'
            ? payload.preferred_username
            : null
  const fullNameCandidate =
    typeof extra?.fullName === 'string'
      ? extra.fullName
      : typeof extra?.name === 'string'
        ? extra.name
        : tokenName
  const fullName = typeof fullNameCandidate === 'string' ? fullNameCandidate.trim() || null : null
  const name = fullName

  return {
    email,
    fullName,
    name,
    role,
    scope,
  }
}

export async function login({ email, password }) {
  const { data } = await api.post('/api/auth/login', { email, password })
  const result = unwrapApiResponse(data)
  if (!result?.token) throw new Error('Login failed')
  return result
}

export async function register({ name, email, password }) {
  const { data } = await api.post('/api/auth/register', {
    fullName: name,
    email,
    password,
  })
  const result = unwrapApiResponse(data)
  if (!result?.token) throw new Error('Signup failed')
  return result
}

export async function logout() {
  await api.post('/api/auth/logout')
}

export async function updateProfile(userData) {
  const { data } = await api.put('/api/users/profile', userData ?? {})
  return unwrapApiResponse(data)
}

export async function changePassword({ currentPassword, newPassword }) {
  const { data } = await api.post('/api/users/change-password', {
    currentPassword,
    newPassword,
  })
  return unwrapApiResponse(data)
}
