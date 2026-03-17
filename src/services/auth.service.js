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

function extractToken(payload) {
  if (!payload || typeof payload !== 'object') return null
  const direct =
    payload.token ??
    payload.accessToken ??
    payload.access_token ??
    payload.jwt ??
    payload.idToken ??
    payload.id_token ??
    null
  if (typeof direct !== 'string') return null
  let token = direct.trim()
  if (!token) return null
  token = token.replace(/^bearer\s+/i, '').trim()
  return token || null
}

function normalizeAuthPayload(rawBody) {
  const candidates = []
  const primary = unwrapApiResponse(rawBody)
  candidates.push(primary)

  if (rawBody && typeof rawBody === 'object') {
    if ('data' in rawBody) candidates.push(rawBody.data)
    if ('result' in rawBody) candidates.push(rawBody.result)
  }

  for (const c of candidates) {
    if (!c || typeof c !== 'object') continue
    const directToken = extractToken(c)
    const dataToken = extractToken(c?.data)
    const resultToken = extractToken(c?.result)
    const userToken = extractToken(c?.user)

    const token = directToken ?? dataToken ?? resultToken ?? userToken
    if (!token) continue

    const basePayload =
      directToken ? c : dataToken ? c.data : resultToken ? c.result : userToken ? c.user : c
    if (!basePayload || typeof basePayload !== 'object') continue

    const userFields = basePayload?.user && typeof basePayload.user === 'object' ? basePayload.user : null
    const normalized = { ...(userFields ?? {}), ...(basePayload ?? {}), token }
    delete normalized.user
    delete normalized.accessToken
    delete normalized.access_token
    delete normalized.jwt
    delete normalized.idToken
    delete normalized.id_token
    return normalized
  }

  return null
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
  const jwtRole = getRoleFromJwt(token)
  const extraRole =
    typeof extra?.role === 'string'
      ? extra.role
      : typeof extra?.roles === 'string'
        ? extra.roles
        : null
  const role = extraRole ? String(extraRole).toLowerCase() : jwtRole
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
  const normalized = normalizeAuthPayload(data)
  if (!normalized?.token) throw new Error('Login failed')
  return normalized
}

export async function register({ name, email, password }) {
  const { data } = await api.post('/api/auth/register', {
    fullName: name,
    email,
    password,
  })
  const normalized = normalizeAuthPayload(data)
  if (!normalized?.token) throw new Error('Signup failed')
  return normalized
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
