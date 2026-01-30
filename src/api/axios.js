import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token && !config.headers?.Authorization) {
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
    const message =
      data?.message ||
      data?.error ||
      (typeof data === 'string' ? data : null) ||
      (status ? `Request failed (${status})` : null) ||
      error?.message ||
      'Request failed'

    return Promise.reject(new Error(message))
  }
)

export default api

