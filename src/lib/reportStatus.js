export function normalizeReportStatus(status) {
  if (status == null) return "pending";
  const normalized = String(status).trim().toLowerCase();
  if (!normalized) return "pending";
  if (normalized === "new") return "pending";
  if (normalized === "on_the_way") return "on the way";
  if (normalized === "ontheway") return "on the way";
  return normalized;
}

export function reportStatusToPillVariant(status) {
  const s = normalizeReportStatus(status);
  if (s === "accepted" || s === "collected") return "green";
  if (s === "rejected") return "red";
  if (s === "on the way") return "blue";
  return "yellow";
}
