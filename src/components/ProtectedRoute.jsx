import { Navigate } from "react-router-dom";

export default function ProtectedRoute({children, role}) {
  const token = localStorage.getItem("token");

  let user = null;
  try {
    const rawUser = localStorage.getItem("user");
    user = rawUser ? JSON.parse(rawUser) : null;
  } catch {
    user = null;
  }

  if (!token || !user) {
    return <Navigate to="/auth/login" replace />;
  }

  const userRole =
    typeof user?.role === "string" ? user.role.toLowerCase() : "";
  const allowedRoles = Array.isArray(role)
    ? role.map((r) => String(r).toLowerCase())
    : typeof role === "string"
      ? [role.toLowerCase()]
      : null;

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
