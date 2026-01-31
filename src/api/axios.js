import axios from 'axios'

const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL
const normalizedBaseUrl = typeof configuredBaseUrl === 'string' ? configuredBaseUrl.trim() : ''
const baseURL = import.meta.env.DEV ? '' : normalizedBaseUrl

const api = axios.create({
  baseURL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const url = String(config?.url || '')
  const isAuthRequest = url.includes('/api/auth/')
  const token = localStorage.getItem('token')
  if (!isAuthRequest && token && !config.headers?.Authorization) {
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

    return Promise.reject(new Error(message))
  }
)

export default api

