import api from './axios.js'

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

export function buildStoredUserFromToken(token) {
  const payload = parseJwt(token)
  const role = getRoleFromJwt(token)
  const scope = typeof payload?.scope === 'string' ? payload.scope : ''
  const email = typeof payload?.sub === 'string' ? payload.sub : null

  return {
    email,
    role,
    scope,
  }
}

function unwrapApiResponse(data) {
  if (data && typeof data === 'object' && 'result' in data) return data.result
  return data
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

// Mock update profile function since backend endpoint is missing
export async function updateProfile(userData) {
  // In a real app, this would be:
  // const { data } = await api.put('/api/users/profile', userData);
  // return unwrapApiResponse(data);
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ ...userData });
    }, 800);
  });
}
