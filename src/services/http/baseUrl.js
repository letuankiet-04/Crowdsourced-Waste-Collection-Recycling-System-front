export default function resolveApiBaseUrl() {
  const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL
  const normalizedBaseUrl = typeof configuredBaseUrl === 'string' ? configuredBaseUrl.trim() : ''

  const forcedProxyRaw = import.meta.env.VITE_USE_API_PROXY
  const forcedProxy = String(forcedProxyRaw || '').trim().toLowerCase() === 'true'

  if (import.meta.env.DEV || forcedProxy) return ''
  return normalizedBaseUrl || ''
}
