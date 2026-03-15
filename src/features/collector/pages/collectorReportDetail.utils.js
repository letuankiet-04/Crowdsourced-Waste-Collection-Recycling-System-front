export function buildCollectorReport({ id, task, createReport }) {
  if (!id) return null;
  const base = createReport?.report ?? createReport?.data ?? createReport ?? null;

  const address =
    (typeof base?.address === "string" && base.address.trim()) ||
    (typeof base?.reportedAddress === "string" && base.reportedAddress.trim()) ||
    (typeof base?.location?.address === "string" && base.location.address.trim()) ||
    (typeof task?.location === "string" && task.location.trim()) ||
    (typeof task?.location?.address === "string" && task.location.address.trim()) ||
    (typeof task?.address === "string" && task.address.trim()) ||
    (typeof task?.collectedAddress === "string" && task.collectedAddress.trim()) ||
    null;

  const latRaw =
    base?.latitude ??
    base?.lat ??
    base?.coords?.lat ??
    base?.location?.lat ??
    base?.location?.latitude ??
    base?.reportedLatitude ??
    task?.latitude ??
    task?.lat ??
    task?.coords?.lat ??
    (task?.location && typeof task.location === "object" ? task.location.latitude : undefined) ??
    null;
  const lngRaw =
    base?.longitude ??
    base?.lng ??
    base?.coords?.lng ??
    base?.location?.lng ??
    base?.location?.longitude ??
    base?.reportedLongitude ??
    task?.longitude ??
    task?.lng ??
    task?.coords?.lng ??
    (task?.location && typeof task.location === "object" ? task.location.longitude : undefined) ??
    null;
  const lat = Number(latRaw);
  const lng = Number(lngRaw);
  const coords = Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;

  const imagesRaw = base?.images ?? base?.imageUrls ?? base?.image_urls ?? base?.imageUrl ?? null;
  const images = Array.isArray(imagesRaw)
    ? imagesRaw.filter(Boolean).map(String)
    : typeof imagesRaw === "string" && imagesRaw.trim()
      ? imagesRaw
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

  const wasteItemsRaw = Array.isArray(base?.wasteItems) ? base.wasteItems : [];
  const itemsRaw = Array.isArray(base?.items) ? base.items : [];
  const categoriesRaw = Array.isArray(base?.categories) ? base.categories : [];

  const wasteItemsFromRaw = (list) =>
    (Array.isArray(list) ? list : [])
      .map((it) => {
        const name = it?.categoryName ?? it?.name ?? "";
        const n = typeof name === "string" ? name.trim() : String(name || "").trim();
        const q = it?.suggestedQuantity ?? it?.quantity ?? it?.estimatedWeight ?? it?.weight ?? null;
        const num = typeof q === "number" ? q : Number(q);
        const unit = it?.wasteUnit ?? it?.unit ?? "kg";
        if (!n || !Number.isFinite(num)) return null;
        return { name: n, unit: unit ? String(unit).toLowerCase() : "kg", estimatedWeight: num };
      })
      .filter(Boolean);

  const wasteItems =
    wasteItemsRaw.length ? wasteItemsFromRaw(wasteItemsRaw) : itemsRaw.length ? wasteItemsFromRaw(itemsRaw) : wasteItemsFromRaw(categoriesRaw);

  const typesRaw = Array.isArray(base?.types) ? base.types.filter(Boolean).map(String) : [];
  const wasteType = typeof base?.wasteType === "string" ? base.wasteType.trim() : "";
  const categoryTypes = categoriesRaw.map((c) => (c?.name ? String(c.name).trim() : "")).filter(Boolean);
  const types = typesRaw.length ? typesRaw : categoryTypes.length ? categoryTypes : wasteType ? [wasteType] : [];

  return {
    id,
    reportCode: base?.wasteReportCode ?? base?.reportCode ?? base?.code ?? task?.requestCode ?? null,
    status: task?.status ?? null,
    createdAt: task?.createdAt ?? task?.assignedAt ?? task?.updatedAt ?? null,
    updatedAt: task?.updatedAt ?? null,
    address,
    coords,
    images,
    types,
    wasteItems,
  };
}

export function buildSyntheticCollectorTask({ requestId, tasksData, historyData }) {
  const tasks = Array.isArray(tasksData) ? tasksData : [];
  const foundTask = tasks.find((t) => Number(t?.id) === requestId) ?? null;
  if (foundTask) return foundTask;

  const history = Array.isArray(historyData) ? historyData : [];
  const foundHistory =
    history.find((h) => Number(h?.collectionRequestId) === requestId) ?? history.find((h) => Number(h?.id) === requestId) ?? null;
  if (!foundHistory) return null;

  return {
    id: foundHistory.collectionRequestId ?? requestId,
    requestCode: foundHistory.requestCode ?? null,
    status: foundHistory.status ?? null,
    createdAt: foundHistory.updatedAt ?? foundHistory.startedAt ?? null,
    updatedAt: foundHistory.updatedAt ?? null,
  };
}

