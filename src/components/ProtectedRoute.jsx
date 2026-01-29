import { Navigate } from 'react-router-dom'
import { PATHS } from '../routes/paths.js'

export default function ProtectedRoute({ children, role }) {
  const token = localStorage.getItem('token')

  let user = null
  try {
    const rawUser = localStorage.getItem('user')
    user = rawUser ? JSON.parse(rawUser) : null
  } catch {
    user = null
  }

  if (!token || !user) {
    return <Navigate to={PATHS.auth.login} replace />
  }

  const userRole =
    typeof user?.role === 'string' ? user.role.toLowerCase() : ''
  const allowedRoles = Array.isArray(role)
    ? role.map((r) => String(r).toLowerCase())
    : typeof role === 'string'
      ? [role.toLowerCase()]
      : null

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to={PATHS.unauthorized} replace />
  }

  return children
}
