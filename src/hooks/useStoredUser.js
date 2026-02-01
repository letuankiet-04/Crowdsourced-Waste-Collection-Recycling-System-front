import { useCallback, useEffect, useMemo, useState } from "react";

function readStoredUser() {
  const raw = typeof window !== 'undefined' ? window.sessionStorage.getItem("user") : null;
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export default function useStoredUser() {
  const [user, setUser] = useState(() => readStoredUser());

  useEffect(() => {
    function handleStorage(e) {
      if (e.key === "user") setUser(readStoredUser());
    }

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const displayName = useMemo(() => {
    if (!user) return "Loading...";
    return user.username ?? user.name ?? user.email ?? "Loading...";
  }, [user]);

  const roleLabel = useMemo(() => {
    if (!user) return "Loading...";
    return user.role ?? "Loading...";
  }, [user]);

  const clearAuth = useCallback(() => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    setUser(null);
  }, []);

  return { user, displayName, roleLabel, clearAuth };
}

