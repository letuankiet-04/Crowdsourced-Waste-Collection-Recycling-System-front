export function buildCollectorReport({ id, task, createReport }) {
  if (!id) return null;
  const coords =
    createReport?.latitude != null && createReport?.longitude != null
      ? { lat: Number(createReport.latitude), lng: Number(createReport.longitude) }
      : null;
  const items = Array.isArray(createReport?.items) ? createReport.items : [];
  const wasteItems = items
    .map((it) => {
      const name = it?.categoryName ? String(it.categoryName) : null;
      const estimatedWeight = it?.suggestedQuantity != null ? Number(it.suggestedQuantity) : NaN;
      if (!name || !Number.isFinite(estimatedWeight)) return null;
      return { name, unit: it?.wasteUnit ? String(it.wasteUnit).toLowerCase() : "kg", estimatedWeight };
    })
    .filter(Boolean);

  return {
    id,
    reportCode: createReport?.wasteReportCode ?? task?.requestCode ?? null,
    status: task?.status ?? null,
    createdAt: task?.createdAt ?? task?.assignedAt ?? task?.updatedAt ?? null,
    updatedAt: task?.updatedAt ?? null,
    address: createReport?.address ?? null,
    coords,
    images: Array.isArray(createReport?.imageUrls) ? createReport.imageUrls : [],
    types: createReport?.wasteType ? [String(createReport.wasteType)] : [],
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

