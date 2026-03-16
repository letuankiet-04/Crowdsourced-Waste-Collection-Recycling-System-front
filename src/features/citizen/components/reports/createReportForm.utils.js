function normalizeWeightInput(value) {
  if (value == null) return "";
  const text = String(value).trim();
  if (!text) return "";
  const direct = Number(text);
  if (Number.isFinite(direct)) return String(direct);
  const match = text.match(/(\d+(\.\d+)?)/);
  return match ? match[1] : "";
}

export function normalizeWasteItemsInput(rawItems, categoryOptions) {
  const options = Array.isArray(categoryOptions) ? categoryOptions : [];
  const byId = new Map(options.map((t) => [Number(t.id), t]));
  const byName = new Map(options.map((t) => [String(t.name ?? "").trim().toLowerCase(), t]));

  const input = Array.isArray(rawItems) ? rawItems : [];
  const normalized = input.map((item) => {
    const candidateId = item?.wasteTypeId ?? item?.id ?? null;
    const id = candidateId === null || candidateId === undefined || candidateId === "" ? null : Number(candidateId);
    const name = String(item?.name ?? "").trim();
    const found = (Number.isFinite(id) ? byId.get(id) : null) ?? (name ? byName.get(name.toLowerCase()) : null) ?? null;

    return {
      wasteTypeId: found ? Number(found.id) : Number.isFinite(id) ? id : null,
      estimatedWeight: normalizeWeightInput(item?.estimatedWeight ?? item?.weight ?? ""),
    };
  });

  return normalized.filter((i) => i.wasteTypeId != null || String(i.estimatedWeight ?? "").trim());
}

export function normalizeLegacyWeightInput(value) {
  return normalizeWeightInput(value);
}

