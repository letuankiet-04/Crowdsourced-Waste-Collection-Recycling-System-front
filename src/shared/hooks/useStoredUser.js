import { useCallback, useEffect, useMemo, useState } from "react";

function readStoredUser() {
  const raw =
    typeof window !== 'undefined'
      ? window.sessionStorage.getItem("user") || window.localStorage.getItem("user")
      : null;
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function getEmailLocalPart(email) {
  if (typeof email !== 'string') return null
  const trimmed = email.trim()
  if (!trimmed) return null
  const atIndex = trimmed.indexOf('@')
  if (atIndex <= 0) return null
  return trimmed.slice(0, atIndex)
}

function firstNonEmptyString(...values) {
  for (const value of values) {
    if (typeof value !== 'string') continue
    const trimmed = value.trim()
    if (trimmed) return trimmed
  }
  return null
}

export default function useStoredUser() {
  const [user, setUser] = useState(() => readStoredUser());

  useEffect(() => {
    function handleStorage(e) {
      if (!e || e.key == null || e.key === "user") setUser(readStoredUser());
    }

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const displayName = useMemo(() => {
    if (!user) return "Loading...";
    return (
      firstNonEmptyString(user.fullName, user.name, user.username) ??
      firstNonEmptyString(getEmailLocalPart(user.email)) ??
      "Loading..."
    )
  }, [user]);

  const roleLabel = useMemo(() => {
    if (!user) return "Loading...";
    return user.role ?? "Loading...";
  }, [user]);

  const clearAuth = useCallback(() => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }, []);

  return { user, displayName, roleLabel, clearAuth };
}

