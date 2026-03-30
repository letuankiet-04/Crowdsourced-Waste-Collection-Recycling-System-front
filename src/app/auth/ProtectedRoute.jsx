import { Navigate } from 'react-router-dom'
import { PATHS } from '../routes/paths.js'
import { useEffect } from 'react'
import { getMyProfileByRole } from '../../services/auth.service.js'
import { isSuspendedAccount, normalizeRole } from '../../shared/lib/accountStatus.js'

function clearAuth() {
  if (typeof window === 'undefined') return
  window.sessionStorage.removeItem('token')
  window.sessionStorage.removeItem('user')
  window.localStorage.removeItem('token')
  window.localStorage.removeItem('user')
}

export default function ProtectedRoute({ children, role }) {
  const token =
    typeof window !== 'undefined'
      ? window.sessionStorage.getItem('token') || window.localStorage.getItem('token')
      : null

  let user = null
  try {
    const rawUser =
      typeof window !== 'undefined'
        ? window.sessionStorage.getItem('user') || window.localStorage.getItem('user')
        : null
    user = rawUser ? JSON.parse(rawUser) : null
  } catch {
    user = null
  }

  const hasAuth = Boolean(token && user)
  const userRole = hasAuth ? normalizeRole(user?.role) ?? '' : ''
  const allowedRoles = Array.isArray(role)
    ? role.map((r) => normalizeRole(String(r)) ?? String(r).toLowerCase())
    : typeof role === 'string'
      ? [normalizeRole(role) ?? role.toLowerCase()]
      : null
  const roleMismatch = Boolean(hasAuth && allowedRoles && !allowedRoles.includes(userRole))
  const suspended = Boolean(hasAuth && isSuspendedAccount(user))

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!hasAuth) return
    if (roleMismatch) return
    if (suspended) return
    if (!userRole) return
    if (!['citizen', 'enterprise', 'collector'].includes(userRole)) return

    let cancelled = false
    void (async () => {
      try {
        const profile = await getMyProfileByRole(userRole)
        if (cancelled) return

        const mergedUser = profile && typeof profile === 'object' ? { ...user, ...profile } : user
        if (isSuspendedAccount(profile) || isSuspendedAccount(mergedUser)) {
          clearAuth()
          window.location.assign(PATHS.auth.login)
          return
        }

        if (profile && typeof profile === 'object') {
          const activeStorage = window.sessionStorage.getItem('token') ? window.sessionStorage : window.localStorage
          const serialized = JSON.stringify(mergedUser)
          activeStorage.setItem('user', serialized)
          try {
            window.dispatchEvent(new StorageEvent('storage', { key: 'user', newValue: serialized }))
          } catch {
            window.dispatchEvent(new Event('storage'))
          }
        }
      } catch {
        void 0
      }
    })()

    return () => {
      cancelled = true
    }
  }, [hasAuth, roleMismatch, suspended, userRole, user, token])

  if (!hasAuth) {
    return <Navigate to={PATHS.auth.login} replace />
  }

  if (roleMismatch) {
    return <Navigate to={PATHS.unauthorized} replace />
  }

  if (suspended) {
    clearAuth()
    return <Navigate to={PATHS.auth.login} replace />
  }

  return children
}
