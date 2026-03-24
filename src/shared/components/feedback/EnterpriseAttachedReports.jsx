import { useEffect, useMemo, useState } from "react";
import { MapPin, Image } from "lucide-react";
import StatusPill from "../../ui/StatusPill.jsx";
import { normalizeReportStatus, reportStatusToPillVariant } from "../../lib/reportStatus.js";

const reverseGeocodeCache = new Map();

function toCoords(lat, lng) {
  const la = typeof lat === "number" ? lat : Number(lat);
  const ln = typeof lng === "number" ? lng : Number(lng);
  if (!Number.isFinite(la) || !Number.isFinite(ln)) return null;
  return { lat: la, lng: ln };
}

function coordsFromReport(report) {
  if (!report || typeof report !== "object") return null;
  const lat = report.latitude ?? report.lat ?? report.coords?.lat ?? report.location?.latitude ?? report.location?.lat ?? null;
  const lng = report.longitude ?? report.lng ?? report.coords?.lng ?? report.location?.longitude ?? report.location?.lng ?? null;
  return toCoords(lat, lng);
}

function formatCoords(coords) {
  const lat = coords?.lat ?? null;
  const lng = coords?.lng ?? null;
  if (!Number.isFinite(Number(lat)) || !Number.isFinite(Number(lng))) return "";
  return `${Number(lat).toFixed(5)}, ${Number(lng).toFixed(5)}`;
}

function reportAddressCandidate(report) {
  if (!report || typeof report !== "object") return null;
  const a =
    (typeof report.address === "string" && report.address.trim()) ||
    (typeof report.reportedAddress === "string" && report.reportedAddress.trim()) ||
    (typeof report.location?.address === "string" && report.location.address.trim()) ||
    "";
  return a ? a : null;
}

async function reverseGeocodeAddress(coords) {
  const lat = Number(coords?.lat);
  const lng = Number(coords?.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  const key = `${lat.toFixed(6)},${lng.toFixed(6)}`;
  if (reverseGeocodeCache.has(key)) return reverseGeocodeCache.get(key) || null;
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(
      lat
    )}&lon=${encodeURIComponent(lng)}`;
    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
        "Accept-Language": "vi",
      },
    });
    const data = await res.json();
    const name = typeof data?.display_name === "string" ? data.display_name.trim() : "";
    reverseGeocodeCache.set(key, name || "");
    return name || null;
  } catch {
    reverseGeocodeCache.set(key, "");
    return null;
  }
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
  const c =
    report.reportCode ??
    report.code ??
    report.report_code ??
    report.wasteReportCode ??
    report.waste_report_code ??
    report.collectorReportCode ??
    report.collector_report_code ??
    null;
  if (c != null && String(c).trim()) return String(c).trim();
  const id = report.id ?? report.reportId ?? report.wasteReportId ?? report.collectorReportId ?? null;
  if (id != null && String(id).trim()) {
    const isCollector =
      report.verificationRate != null ||
      report.verification_rate != null ||
      report.collectorId != null ||
      report.collector_id != null ||
      report.collectorNote != null ||
      report.collector_note != null;
    const prefix = isCollector ? "CRR" : "WR";
    const key = String(id).trim();
    if (/^\d+$/.test(key)) return `${prefix}${key.padStart(6, "0")}`;
    return key;
  }
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

function collectorStatusVariant(status) {
  const u = String(status || "").toUpperCase();
  if (u === "FAILED" || u === "REJECTED") return "red";
  if (u === "COMPLETED") return "emerald";
  if (u === "VERIFIED" || u === "COLLECTED") return "green";
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

function WasteTypesBlock({ report, weightHeader = "Estimated Weight" }) {
  const rows = wasteItemRowsFromReport(report);
  const typeOnly = wasteTypeLabelsFallback(report);
  return (
    <div>
      <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Waste Types</div>
      {rows.length > 0 ? (
        <div className="mt-2 overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full text-xs">
            <thead className="bg-gray-50 text-left text-gray-600">
              <tr>
                <th className="px-2 py-1.5 font-semibold">Type</th>
                <th className="px-2 py-1.5 font-semibold">{weightHeader}</th>
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
  const citizenId = citizen?.id ?? fallbackWasteId;
  const citizenCode = reportCodeLabel(citizen);
  const citizenTs = formatCardTimestamp(reportCreatedAt(citizen));
  const citizenAddrRaw = reportAddressCandidate(citizen);
  const citizenCoords = useMemo(() => coordsFromReport(citizen), [citizen]);
  const citizenCoordsKey = citizenCoords ? `${citizenCoords.lat.toFixed(6)},${citizenCoords.lng.toFixed(6)}` : "";
  const [citizenAddrResolved, setCitizenAddrResolved] = useState({ key: "", value: null });
  useEffect(() => {
    let cancelled = false;
    if (loading) return () => void (cancelled = true);
    if (citizenAddrRaw) return () => void (cancelled = true);
    if (!citizenCoordsKey) {
      return () => {
        cancelled = true;
      };
    }
    void (async () => {
      const [latStr, lngStr] = citizenCoordsKey.split(",");
      const addr = await reverseGeocodeAddress({ lat: Number(latStr), lng: Number(lngStr) });
      if (cancelled) return;
      if (addr) setCitizenAddrResolved({ key: citizenCoordsKey, value: addr });
    })();
    return () => {
      cancelled = true;
    };
  }, [citizenAddrRaw, citizenCoordsKey, loading]);
  const citizenResolvedHit = citizenAddrResolved?.key === citizenCoordsKey ? citizenAddrResolved.value : null;
  const citizenAddrFallback = citizenAddrRaw || (citizenCoords ? formatCoords(citizenCoords) : "—");
  const citizenAddr = citizenAddrRaw || citizenResolvedHit || citizenAddrFallback;
  const citizenPhotos = reportImages(citizen);
  const citizenNoteText = useMemo(() => {
    const raw =
      citizen?.note ??
      citizen?.notes ??
      citizen?.description ??
      citizen?.content ??
      citizen?.detail ??
      citizen?.message ??
      null;
    if (raw == null) return "";
    const s = String(raw).trim();
    return s ? s : "";
  }, [citizen]);

  const collectorId = collector?.id;
  const collectorCode = reportCodeLabel(collector);
  const collectorTs = formatCardTimestamp(reportCreatedAt(collector));
  const collectorCoords = useMemo(() => coordsFromReport(collector), [collector]);
  const collectorAddrRaw = reportAddressCandidate(collector);
  const collectorCoordsKey = collectorCoords ? `${collectorCoords.lat.toFixed(6)},${collectorCoords.lng.toFixed(6)}` : "";
  const collectionPointBase =
    collector?.collectionPoint ??
    collector?.stationName ??
    collector?.collectionStation ??
    collector?.enterpriseName ??
    collectorAddrRaw ??
    null;
  const [collectionPointResolved, setCollectionPointResolved] = useState({ key: "", value: null });
  useEffect(() => {
    let cancelled = false;
    if (loading) return () => void (cancelled = true);
    const baseText = typeof collectionPointBase === "string" ? collectionPointBase.trim() : "";
    if (baseText) return () => void (cancelled = true);
    if (!collectorCoordsKey) {
      return () => {
        cancelled = true;
      };
    }
    void (async () => {
      const [latStr, lngStr] = collectorCoordsKey.split(",");
      const addr = await reverseGeocodeAddress({ lat: Number(latStr), lng: Number(lngStr) });
      if (cancelled) return;
      if (addr) setCollectionPointResolved({ key: collectorCoordsKey, value: addr });
    })();
    return () => {
      cancelled = true;
    };
  }, [collectionPointBase, collectorCoordsKey, loading]);
  const collectionResolvedHit = collectionPointResolved?.key === collectorCoordsKey ? collectionPointResolved.value : null;
  const collectionPointFallback = collectionPointBase || (collectorCoords ? formatCoords(collectorCoords) : "—");
  const collectionPoint = (typeof collectionPointBase === "string" && collectionPointBase.trim())
    ? collectionPointBase.trim()
    : collectionResolvedHit || collectionPointFallback;
  const collectorPhotos = reportImages(collector);
  const collectorNoteText = useMemo(() => {
    const raw = collector?.collectorNote ?? collector?.collector_note ?? collector?.note ?? collector?.notes ?? null;
    if (raw == null) return "";
    const s = String(raw).trim();
    return s ? s : "";
  }, [collector]);

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

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-6">
        <div className="h-[320px] animate-pulse rounded-2xl border border-gray-100 bg-gradient-to-br from-violet-50/80 to-gray-50" />
        <div className="h-[320px] animate-pulse rounded-2xl border border-gray-100 bg-gradient-to-br from-violet-50/80 to-gray-50" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-6">
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
            <InfoPair idLabel="ID" idValue={citizenId != null ? `Report #${citizenId}` : "—"} timeLabel="Timestamp" timeValue={citizenTs} />
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Location</div>
              <div className="mt-1.5 flex gap-2 text-sm leading-snug text-gray-800">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                <span>{citizenAddr}</span>
              </div>
            </div>
            <PhotoStrip urls={citizenPhotos} label="Attached photos" />
            <WasteTypesBlock report={citizen} />
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Citizen Note</div>
              <div className="mt-1 min-h-[1.25rem] whitespace-pre-wrap text-sm text-gray-800">
                {citizenNoteText || "No notes provided."}
              </div>
            </div>
          </div>
          {citizenId != null && onViewCitizen ? (
            <button
              type="button"
              onClick={() => onViewCitizen(citizenId)}
              className="mt-4 text-xs font-semibold text-emerald-700 underline-offset-2 hover:underline"
            >
              View waste report details
            </button>
          ) : null}
        </div>
      </div>

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
            <InfoPair idLabel="ID" idValue={collectorId != null ? `Report #${collectorId}` : "—"} timeLabel="Timestamp" timeValue={collectorTs} />
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Collection point</div>
              <div className="mt-1.5 flex gap-2 text-sm leading-snug text-gray-800">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-amber-800" aria-hidden />
                <span>{collectionPoint || "—"}</span>
              </div>
            </div>
            <PhotoStrip urls={collectorPhotos} label="Proof of work" />
            <WasteTypesBlock report={collector} weightHeader="Actual Weight" />
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Collector Note</div>
              <div className="mt-1 min-h-[1.25rem] whitespace-pre-wrap text-sm text-gray-800">
                {collectorNoteText || "No notes provided."}
              </div>
            </div>
          </div>
          {collectorId != null && onViewCollector ? (
            <button
              type="button"
              onClick={() => onViewCollector(collectorId)}
              className="mt-4 text-xs font-semibold text-amber-900 underline-offset-2 hover:underline"
            >
              View collector report details
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
