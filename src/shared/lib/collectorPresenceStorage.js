const COLLECTOR_PRESENCE_KEY = "collector_presence";

export function readCollectorPresence() {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem(COLLECTOR_PRESENCE_KEY);
  if (!raw) return null;
  const normalized = String(raw).trim().toLowerCase();
  if (normalized === "online") return true;
  if (normalized === "offline") return false;
  return null;
}

export function writeCollectorPresence(nextOnline) {
  if (typeof window === "undefined") return;
  const value = nextOnline ? "online" : "offline";
  window.sessionStorage.setItem(COLLECTOR_PRESENCE_KEY, value);
}

export function clearCollectorPresence() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(COLLECTOR_PRESENCE_KEY);
}
