import axios from 'axios'
import ApiError from './ApiError.js'
import resolveApiBaseUrl from './baseUrl.js'

const baseURL = resolveApiBaseUrl()

const api = axios.create({
  baseURL,
  headers: {
    Accept: 'application/json',
  },
})

function readStoredToken() {
  if (typeof window === 'undefined') return null
  const raw = window.sessionStorage.getItem('token') || window.localStorage.getItem('token')
  if (typeof raw !== 'string') return null
  const trimmed = raw.trim()
  if (!trimmed) return null
  if (trimmed.toLowerCase() === 'undefined' || trimmed.toLowerCase() === 'null') return null
  return trimmed
}

function clearStoredAuth() {
  if (typeof window === 'undefined') return
  window.sessionStorage.removeItem('token')
  window.sessionStorage.removeItem('user')
  window.localStorage.removeItem('token')
  window.localStorage.removeItem('user')
}

api.interceptors.request.use((config) => {
  const url = String(config?.url || '')
  const isTokenlessAuthRequest = url.includes('/api/auth/login') || url.includes('/api/auth/register')
  const token = readStoredToken()

  if (typeof FormData !== 'undefined' && config?.data instanceof FormData) {
    config.headers = config.headers ?? {}
    delete config.headers['Content-Type']
    delete config.headers['content-type']
  }

  const hasAuthHeader =
    Boolean(config.headers?.Authorization) || Boolean(config.headers?.authorization)

  if (!isTokenlessAuthRequest && token && !hasAuthHeader) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status
    const data = error?.response?.data
    const requestUrl = String(error?.config?.url || '')
    const isNetworkError = !error?.response && String(error?.message).toLowerCase().includes('network')
    const isLoginRequest = requestUrl.includes('/api/auth/login')
    const isRegisterRequest = requestUrl.includes('/api/auth/register')

    if (status === 401 && !isLoginRequest && !isRegisterRequest && typeof window !== 'undefined') {
      const pathname = String(window.location?.pathname || '')
      const isOnAuthPage = pathname.startsWith('/auth/')
      clearStoredAuth()
      if (!isOnAuthPage) {
        window.location.assign('/auth/login')
      }
    }

    const message =
      data?.message ||
      data?.error ||
      (typeof data === 'string' ? data : null) ||
      (status === 401 && isLoginRequest ? 'Invalid email or password.' : null) ||
      (status ? `Request failed (${status})` : null) ||
      (isNetworkError ? 'Unable to reach the server. Please check your connection and try again.' : null) ||
      error?.message ||
      'Request failed'

    return Promise.reject(new ApiError(message, { status, data, url: requestUrl }))
  }
)

export default api
