function collectRejectedCollectorTokensFromValue(value, emails, ids, depth = 0) {
  if (value == null) return;
  if (depth > 4) return;

  if (Array.isArray(value)) {
    value.forEach((v) => collectRejectedCollectorTokensFromValue(v, emails, ids, depth + 1));
    return;
  }

  if (typeof value === "string") {
    const s = value.trim();
    if (!s) return;
    if (s.includes("@")) {
      emails.add(s.toLowerCase());
      return;
    }
    if (/^[a-z0-9_-]{1,80}$/i.test(s)) ids.add(s);
    return;
  }

  if (typeof value === "number") {
    if (Number.isFinite(value)) ids.add(String(value));
    return;
  }

  if (typeof value !== "object") return;

  const emailKeys = ["email", "mail", "collectorEmail", "collector_email", "emailAddress", "email_address"];
  emailKeys.forEach((k) => {
    if (value?.[k] == null) return;
    collectRejectedCollectorTokensFromValue(value[k], emails, ids, depth + 1);
  });

  const idKeys = ["id", "_id", "collectorId", "collector_id", "collectorID", "collector_id"];
  idKeys.forEach((k) => {
    if (value?.[k] == null) return;
    collectRejectedCollectorTokensFromValue(value[k], emails, ids, depth + 1);
  });

  Object.entries(value).forEach(([key, val]) => {
    const k = String(key).toLowerCase();
    if (!k.includes("reject")) return;
    if (k.includes("collector") || k.includes("assignee") || k.includes("email") || k.includes("id")) {
      collectRejectedCollectorTokensFromValue(val, emails, ids, depth + 1);
    }
  });
}

export function getRejectedCollectorsFromReport(r) {
  const emails = new Set();
  const ids = new Set();

  const candidates = [
    r,
    r?.collectionRequest,
    r?.collection_request,
    r?.collection,
    r?.request,
    r?.task,
    r?.collectionTask,
    r?.collection_task,
    r?.collectionRequest?.task,
    r?.collectionRequest?.request,
  ].filter(Boolean);

  candidates.forEach((c) => collectRejectedCollectorTokensFromValue(c, emails, ids));

  const rejectedCollectorEmails =
    r?.rejectedCollectorEmails ??
    r?.rejectedCollectorsEmails ??
    r?.rejectedCollectorsEmail ??
    r?.rejectedByEmails ??
    r?.collectorRejectedEmails ??
    null;
  collectRejectedCollectorTokensFromValue(rejectedCollectorEmails, emails, ids);

  const rejectedCollectorIds =
    r?.rejectedCollectorIds ??
    r?.rejectedCollectorsIds ??
    r?.rejectedCollectorId ??
    r?.rejectedByCollectorIds ??
    r?.collectorRejectedIds ??
    null;
  collectRejectedCollectorTokensFromValue(rejectedCollectorIds, emails, ids);

  const rejectedCollectors = r?.rejectedCollectors ?? null;
  collectRejectedCollectorTokensFromValue(rejectedCollectors, emails, ids);

  return { emails: [...emails], ids: [...ids] };
}

export function resolveEnterpriseReport({ id, reportOverride, reportData, stateReport }) {
  const base = reportOverride ?? reportData ?? (stateReport?.id && String(stateReport.id) === id ? stateReport : null);
  if (!base) return null;

  const address =
    (typeof base?.address === "string" && base.address.trim()) ||
    (typeof base?.reportedAddress === "string" && base.reportedAddress.trim()) ||
    (typeof base?.location?.address === "string" && base.location.address.trim()) ||
    "";

  const lat = base?.latitude ?? base?.lat ?? base?.coords?.lat ?? base?.location?.lat ?? base?.reportedLatitude ?? null;
  const lng = base?.longitude ?? base?.lng ?? base?.coords?.lng ?? base?.location?.lng ?? base?.reportedLongitude ?? null;
  const coords =
    lat != null && lng != null && Number.isFinite(Number(lat)) && Number.isFinite(Number(lng)) ? { lat: Number(lat), lng: Number(lng) } : null;

  const reportCode = String(base?.reportCode ?? base?.code ?? "").trim() || null;
  const requestIdRaw = base?.collectionRequestId ?? base?.requestId ?? base?.collection_request_id ?? null;
  const collectionRequestId =
    requestIdRaw === null || requestIdRaw === undefined || requestIdRaw === ""
      ? null
      : typeof requestIdRaw === "number"
        ? requestIdRaw
        : Number.isFinite(Number(requestIdRaw))
          ? Number(requestIdRaw)
          : requestIdRaw;

  const submitBy =
    (typeof base?.submitBy === "string" && base.submitBy.trim()) ||
    (typeof base?.submit_by === "string" && base.submit_by.trim()) ||
    (typeof base?.createdByName === "string" && base.createdByName.trim()) ||
    null;

  const notes = (typeof base?.notes === "string" && base.notes.trim()) || (typeof base?.description === "string" && base.description.trim()) || "";

  const imagesRaw = base?.images ?? null;
  const images = Array.isArray(imagesRaw)
    ? imagesRaw.filter(Boolean).map(String)
    : Array.isArray(base?.imageUrls)
      ? base.imageUrls.filter(Boolean).map(String)
      : typeof imagesRaw === "string" && imagesRaw.trim()
        ? imagesRaw
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [];

  const typesRaw = Array.isArray(base?.types) ? base.types.filter(Boolean).map(String) : [];
  const categoriesRaw = Array.isArray(base?.categories) ? base.categories : [];
  const categoriesTypes = categoriesRaw.map((c) => (c?.name ? String(c.name).trim() : "")).filter(Boolean);
  const wasteType = typeof base?.wasteType === "string" ? base.wasteType.trim() : "";
  const types = typesRaw.length ? typesRaw : categoriesTypes.length ? categoriesTypes : wasteType ? [wasteType] : [];

  const wasteItemsRaw = Array.isArray(base?.wasteItems) ? base.wasteItems : [];
  const wasteItems = wasteItemsRaw.length
    ? wasteItemsRaw
    : categoriesRaw
        .map((c) => {
          const name = c?.name ? String(c.name).trim() : "";
          const q = c?.quantity;
          const num = typeof q === "number" ? q : Number(q);
          const unit = c?.unit ? String(c.unit).trim() : "";
          if (!name || !Number.isFinite(num)) return null;
          return { name, estimatedWeight: num, unit };
        })
        .filter(Boolean);

  return {
    ...base,
    id: base?.id ?? id,
    address,
    coords,
    reportCode,
    collectionRequestId,
    notes,
    images,
    types,
    wasteItems,
    submitBy,
  };
}

