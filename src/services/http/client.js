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

api.interceptors.request.use((config) => {
  const url = String(config?.url || '')
  const isTokenlessAuthRequest = url.includes('/api/auth/login') || url.includes('/api/auth/register')
  const token = typeof window !== 'undefined' ? window.sessionStorage.getItem('token') : null

  if (typeof FormData !== 'undefined' && config?.data instanceof FormData) {
    config.headers = config.headers ?? {}
    delete config.headers['Content-Type']
    delete config.headers['content-type']
  }

  if (!isTokenlessAuthRequest && token && !config.headers?.Authorization) {
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
