import { MapPin, Image } from "lucide-react";
import StatusPill from "../../ui/StatusPill.jsx";
import { normalizeReportStatus, reportStatusToPillVariant } from "../../lib/reportStatus.js";

function reportAddress(report) {
  if (!report) return "—";
  const a =
    (typeof report.address === "string" && report.address.trim()) ||
    (typeof report.reportedAddress === "string" && report.reportedAddress.trim()) ||
    (typeof report.location?.address === "string" && report.location.address.trim()) ||
    "";
  if (a) return a;
  const lat = report.latitude ?? report.lat;
  const lng = report.longitude ?? report.lng;
  if (lat != null && lng != null && Number.isFinite(Number(lat)) && Number.isFinite(Number(lng))) {
    return `${Number(lat).toFixed(5)}, ${Number(lng).toFixed(5)}`;
  }
  return "—";
}

function reportImages(report) {
  const raw = report?.images ?? report?.imageUrls ?? report?.collectedImages ?? report?.photos ?? report?.photoUrls;
  if (Array.isArray(raw)) return raw.filter(Boolean).map(String);
  if (typeof raw === "string" && raw.trim()) return raw.split(",").map((s) => s.trim()).filter(Boolean);
  return [];
}

function reportCreatedAt(report) {
  return report?.createdAt ?? report?.reportedAt ?? report?.created_at ?? report?.collectedAt ?? null;
}

function reportCodeLabel(report) {
  if (!report) return "—";
  const c = report.reportCode ?? report.code;
  if (c != null && String(c).trim()) return String(c).trim();
  if (report.id != null) return `WR${String(report.id).padStart(3, "0")}`;
  return "—";
}

function formatCardTimestamp(value) {
  if (!value) return "—";
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleString("en-GB", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return "—";
  }
}

function wasteItemRowsFromReport(base) {
  if (!base || typeof base !== "object") return [];
  const wasteItemsRaw = Array.isArray(base.wasteItems) ? base.wasteItems : [];
  const itemsRaw = Array.isArray(base.items) ? base.items : [];
  const categoriesRaw = Array.isArray(base.categories) ? base.categories : [];
  const fromRaw = (list) =>
    (Array.isArray(list) ? list : [])
      .map((it) => {
        const name = it?.categoryName ?? it?.name ?? "";
        const n = typeof name === "string" ? name.trim() : String(name || "").trim();
        const q = it?.quantity ?? it?.suggestedQuantity ?? it?.estimatedWeight ?? it?.weight ?? null;
        const num = typeof q === "number" ? q : Number(q);
        const unit = it?.unit ?? it?.wasteUnit ?? "kg";
        if (!n || !Number.isFinite(num)) return null;
        return { name: n, estimatedWeight: num, unit: unit ? String(unit).trim() : "kg" };
      })
      .filter(Boolean);
  if (wasteItemsRaw.length) return fromRaw(wasteItemsRaw);
  if (itemsRaw.length) return fromRaw(itemsRaw);
  return fromRaw(categoriesRaw);
}

function wasteTypeLabelsFallback(base) {
  if (!base || typeof base !== "object") return [];
  const typesRaw = Array.isArray(base.types) ? base.types.filter(Boolean).map(String) : [];
  const categoriesRaw = Array.isArray(base.categories) ? base.categories : [];
  const fromCat = categoriesRaw
    .map((c) => {
      const nm = c?.name ?? c?.categoryName;
      return nm ? String(nm).trim() : "";
    })
    .filter(Boolean);
  const wasteType = typeof base.wasteType === "string" ? base.wasteType.trim() : "";
  if (typesRaw.length) return typesRaw;
  if (fromCat.length) return fromCat;
  return wasteType ? [wasteType] : [];
}

function classificationRateFromReport(report) {
  if (!report || typeof report !== "object") return null;
  const raw =
    report.verificationRate ??
    report.verification_rate ??
    report.classificationRate ??
    report.classification_rate ??
    report.sortingRate ??
    report.sorting_rate ??
    null;
  if (raw == null || raw === "") return null;
  const n = typeof raw === "number" ? raw : Number(raw);
  if (!Number.isFinite(n)) {
    const s = String(raw).trim();
    return s || null;
  }
  return n;
}

function formatClassificationLevel(rate) {
  if (rate == null) return "—";
  if (typeof rate === "string") return rate;
  const n = Math.max(0, Math.min(100, Math.round(Number(rate))));
  const level = n < 33 ? "Thấp" : n < 67 ? "Trung bình" : "Cao";
  return `${n}% — ${level}`;
}

function collectorStatusVariant(status) {
  const u = String(status || "").toUpperCase();
  if (u === "FAILED" || u === "REJECTED") return "red";
  if (u === "COMPLETED" || u === "VERIFIED" || u === "COLLECTED") return "green";
  return "yellow";
}

function PhotoStrip({ urls, label }) {
  const max = 3;
  const list = (urls || []).filter(Boolean).slice(0, max);
  const cells = [];
  for (let i = 0; i < max; i++) {
    cells.push(list[i] ? { type: "img", url: list[i] } : { type: "empty" });
  }
  return (
    <div>
      <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500">{label}</div>
      <div className="mt-2 flex gap-2">
        {cells.map((cell, idx) =>
          cell.type === "img" ? (
            <a
              key={idx}
              href={cell.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block h-[88px] w-[88px] shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-100"
            >
              <img src={cell.url} alt="" className="h-full w-full object-cover" loading="lazy" />
            </a>
          ) : (
            <div
              key={idx}
              className="flex h-[88px] w-[88px] shrink-0 items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 text-gray-400"
            >
              <Image className="h-7 w-7" aria-hidden />
            </div>
          )
        )}
      </div>
    </div>
  );
}

function WasteTypesBlock({ report }) {
  const rows = wasteItemRowsFromReport(report);
  const typeOnly = wasteTypeLabelsFallback(report);
  return (
    <div>
      <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Loại rác</div>
      {rows.length > 0 ? (
        <div className="mt-2 overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full text-xs">
            <thead className="bg-gray-50 text-left text-gray-600">
              <tr>
                <th className="px-2 py-1.5 font-semibold">Tên loại</th>
                <th className="px-2 py-1.5 font-semibold">KL ước tính</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {rows.map((it, idx) => (
                <tr key={`${it.name}-${idx}`}>
                  <td className="px-2 py-1.5 text-gray-900">{it.name}</td>
                  <td className="px-2 py-1.5 text-gray-800">
                    {it.estimatedWeight} {String(it.unit || "kg").toLowerCase()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : typeOnly.length > 0 ? (
        <ul className="mt-2 list-inside list-disc text-sm text-gray-800">
          {typeOnly.map((t, i) => (
            <li key={`${t}-${i}`}>{t}</li>
          ))}
        </ul>
      ) : (
        <div className="mt-2 text-sm text-gray-400">—</div>
      )}
    </div>
  );
}

function InfoPair({ idLabel, idValue, timeLabel, timeValue }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <div className="rounded-lg bg-sky-50/90 px-3 py-2.5 ring-1 ring-sky-100/80">
        <div className="text-[10px] font-bold uppercase tracking-wide text-sky-800/80">{idLabel}</div>
        <div className="mt-0.5 text-sm font-semibold text-sky-950">{idValue}</div>
      </div>
      <div className="rounded-lg bg-sky-50/90 px-3 py-2.5 ring-1 ring-sky-100/80">
        <div className="text-[10px] font-bold uppercase tracking-wide text-sky-800/80">{timeLabel}</div>
        <div className="mt-0.5 text-sm font-semibold text-sky-950">{timeValue}</div>
      </div>
    </div>
  );
}

export default function EnterpriseAttachedReports({
  citizen,
  collector,
  loading,
  fallbackWasteId,
  onViewCitizen,
  onViewCollector,
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-6">
        <div className="h-[320px] animate-pulse rounded-2xl border border-gray-100 bg-gradient-to-br from-violet-50/80 to-gray-50" />
        <div className="h-[320px] animate-pulse rounded-2xl border border-gray-100 bg-gradient-to-br from-violet-50/80 to-gray-50" />
      </div>
    );
  }

  const citizenId = citizen?.id ?? fallbackWasteId;
  const citizenCode = reportCodeLabel(citizen);
  const citizenTs = formatCardTimestamp(reportCreatedAt(citizen));
  const citizenAddr = reportAddress(citizen);
  const citizenPhotos = reportImages(citizen);

  const collectorId = collector?.id;
  const collectorCode = reportCodeLabel(collector);
  const collectorTs = formatCardTimestamp(reportCreatedAt(collector));
  const collectionPoint =
    collector?.collectionPoint ??
    collector?.stationName ??
    collector?.collectionStation ??
    collector?.enterpriseName ??
    reportAddress(collector);
  const collectorPhotos = reportImages(collector);

  const citizenStatusPill = citizen ? (
    <StatusPill variant={reportStatusToPillVariant(citizen.status)}>
      {normalizeReportStatus(citizen.status)}
    </StatusPill>
  ) : (
    <StatusPill variant="gray">—</StatusPill>
  );

  const collectorStatusPill = collector ? (
    <StatusPill variant={collectorStatusVariant(collector.status)}>
      {normalizeReportStatus(collector.status)}
    </StatusPill>
  ) : (
    <StatusPill variant="gray">—</StatusPill>
  );

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-6">
      {/* Citizen */}
      <div className="overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-sm">
        <div className="border-b border-violet-100/90 bg-violet-50/80 pl-1">
          <div className="border-l-4 border-l-emerald-500 px-4 py-3.5">
            <div className="text-sm font-bold text-gray-900">Citizen&apos;s Report</div>
          </div>
        </div>
        <div className="relative p-5">
              <div className="absolute right-5 top-5">{citizenStatusPill}</div>
              <div className="pr-24">
                <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Report code</div>
                <div className="mt-1 text-2xl font-bold tracking-tight text-emerald-600">{citizenCode}</div>
              </div>
              <div className="mt-4 space-y-4">
                <InfoPair
                  idLabel="ID"
                  idValue={citizenId != null ? `Report #${citizenId}` : "—"}
                  timeLabel="Timestamp"
                  timeValue={citizenTs}
                />
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Location</div>
                  <div className="mt-1.5 flex gap-2 text-sm leading-snug text-gray-800">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                    <span>{citizenAddr}</span>
                  </div>
                </div>
                <PhotoStrip urls={citizenPhotos} label="Attached photos" />
                <WasteTypesBlock report={citizen} />
              </div>
              {citizenId != null && onViewCitizen ? (
                <button
                  type="button"
                  onClick={() => onViewCitizen(citizenId)}
                  className="mt-4 text-xs font-semibold text-emerald-700 underline-offset-2 hover:underline"
                >
                  Xem chi tiết waste report
                </button>
              ) : null}
        </div>
      </div>

      {/* Collector */}
      <div className="overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-sm">
        <div className="border-b border-violet-100/90 bg-violet-50/80 pl-1">
          <div className="border-l-4 border-l-amber-800 px-4 py-3.5">
            <div className="text-sm font-bold text-gray-900">Collector&apos;s Report</div>
          </div>
        </div>
        <div className="relative p-5">
              <div className="absolute right-5 top-5">{collectorStatusPill}</div>
              <div className="pr-24">
                <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Report code</div>
                <div className="mt-1 text-2xl font-bold tracking-tight text-amber-800">{collectorCode}</div>
              </div>
              <div className="mt-4 space-y-4">
                <InfoPair
                  idLabel="ID"
                  idValue={collectorId != null ? `Report #${collectorId}` : "—"}
                  timeLabel="Timestamp"
                  timeValue={collectorTs}
                />
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                    Collection point
                  </div>
                  <div className="mt-1.5 flex gap-2 text-sm leading-snug text-gray-800">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-amber-800" aria-hidden />
                    <span>{collectionPoint || "—"}</span>
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                    Mức độ phân loại
                  </div>
                  <div className="mt-1 text-sm text-gray-900">
                    {formatClassificationLevel(classificationRateFromReport(collector))}
                  </div>
                </div>
                <PhotoStrip urls={collectorPhotos} label="Proof of work" />
                <WasteTypesBlock report={collector} />
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                    Ghi chú collector
                  </div>
                  <div className="mt-1 min-h-[1.25rem] whitespace-pre-wrap text-sm text-gray-800">
                    {typeof collector?.collectorNote === "string" ? collector.collectorNote : ""}
                  </div>
                </div>
              </div>
              {collectorId != null && onViewCollector ? (
                <button
                  type="button"
                  onClick={() => onViewCollector(collectorId)}
                  className="mt-4 text-xs font-semibold text-amber-900 underline-offset-2 hover:underline"
                >
                  Xem chi tiết collector report
                </button>
              ) : null}
        </div>
      </div>
    </div>
  );
}
