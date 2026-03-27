export function mapWasteCategoryOptions(cats) {
  const list = Array.isArray(cats) ? cats : [];
  return list.map((c) => ({
    id: Number(c.id),
    name: String(c.name ?? "").trim(),
    unit: c.unit ?? null,
    pointPerUnit: c.pointPerUnit ?? null,
  }));
}

export function buildCitizenReportDetail(apiReport, reportId, collectorReport) {
  if (!apiReport) return null;
  const reportCodeRaw = apiReport?.reportCode ?? apiReport?.code ?? apiReport?.report_code ?? null;
  const reportCode =
    reportCodeRaw != null && String(reportCodeRaw).trim() !== "" ? String(reportCodeRaw).trim() : null;
  const categories = Array.isArray(apiReport?.categories) ? apiReport.categories : [];
  const images = Array.isArray(apiReport?.images) ? apiReport.images : [];
  const description =
    (typeof apiReport?.description === "string" && apiReport.description.trim()) ||
    (typeof apiReport?.notes === "string" && apiReport.notes.trim()) ||
    "";
  const address =
    (typeof apiReport?.address === "string" && apiReport.address.trim()) ||
    (typeof apiReport?.reportedAddress === "string" && apiReport.reportedAddress.trim()) ||
    (typeof apiReport?.location?.address === "string" && apiReport.location.address.trim()) ||
    "";
  const lat =
    apiReport?.latitude ??
    apiReport?.lat ??
    apiReport?.coords?.lat ??
    apiReport?.location?.lat ??
    apiReport?.reportedLatitude ??
    null;
  const lng =
    apiReport?.longitude ??
    apiReport?.lng ??
    apiReport?.coords?.lng ??
    apiReport?.location?.lng ??
    apiReport?.reportedLongitude ??
    null;
  const coords =
    lat != null && lng != null && Number.isFinite(Number(lat)) && Number.isFinite(Number(lng)) ? { lat: Number(lat), lng: Number(lng) } : null;

  const collectedLat = collectorReport?.latitude ?? null;
  const collectedLng = collectorReport?.longitude ?? null;
  const collectedCoords =
    collectedLat != null &&
    collectedLng != null &&
    Number.isFinite(Number(collectedLat)) &&
    Number.isFinite(Number(collectedLng))
      ? { lat: Number(collectedLat), lng: Number(collectedLng) }
      : null;

  return {
    id: apiReport?.id ?? reportId,
    reportCode,
    status: apiReport?.status ?? null,
    createdAt: apiReport?.createdAt ?? null,
    description,
    address,
    coords,
    images,
    collectedCoords,
    wasteItems: categories
      .map((c) => {
        const name = c?.name ? String(c.name) : "";
        const unit = c?.unit ?? null;
        const q = typeof c?.quantity === "number" ? c.quantity : Number(c?.quantity);
        return name && Number.isFinite(q) ? { name, unit, estimatedWeight: q } : null;
      })
      .filter(Boolean),
  };
}

