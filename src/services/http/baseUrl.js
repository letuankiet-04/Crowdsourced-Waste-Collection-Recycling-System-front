export default function resolveApiBaseUrl() {
  const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL
  const normalizedBaseUrl = typeof configuredBaseUrl === 'string' ? configuredBaseUrl.trim() : ''

  const forcedProxyRaw = import.meta.env.VITE_USE_API_PROXY
  const forcedProxy = String(forcedProxyRaw || '').trim().toLowerCase() === 'true'

  const forcedDirectRaw = import.meta.env.VITE_USE_DIRECT_API
  const forcedDirect = String(forcedDirectRaw || '').trim().toLowerCase() === 'true'
  const isLocalhost =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname === '[::1]')

  if (import.meta.env.DEV || forcedProxy || (isLocalhost && !forcedDirect)) return ''
  return normalizedBaseUrl || ''
}
