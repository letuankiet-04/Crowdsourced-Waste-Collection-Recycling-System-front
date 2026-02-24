export function normalizeReportStatus(status) {
  if (status == null) return "Pending";
  const normalized = String(status).trim().toLowerCase();
  
  if (!normalized) return "Pending";
  if (normalized === "new" || normalized === "pending") return "Pending";
  if (normalized === "accepted") return "Accepted";
  if (normalized === "assigned") return "Assigned";
  if (normalized === "rejected") return "Rejected";
  if (normalized === "on_the_way" || normalized === "ontheway" || normalized === "on the way") return "On The Way";
  if (normalized === "collected" || normalized === "resolved") return "Collected";
  
  // Return capitalized first letter for others
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

export function reportStatusToPillVariant(status) {
  const s = String(status).toLowerCase();
  if (s === "accepted" || s === "collected" || s === "resolved" || s === "assigned") return "green";
  if (s === "rejected") return "red";
  if (s === "on the way" || s === "ontheway" || s === "on_the_way") return "blue";
  return "yellow";
}
