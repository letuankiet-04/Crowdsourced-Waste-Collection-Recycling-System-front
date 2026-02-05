import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import CollectorLayout from "./layout/CollectorLayout.jsx";
import ReportDetail from "../../../components/layout/Report_Detail.jsx";
import { getMockReports, updateMockReport } from "../../../mock/reportStore.js";
import { publishReportUpdated, subscribeReportDeleted, subscribeReportUpdated, subscribeReportsCleared } from "../../../events/reportEvents.js";
import { normalizeReportStatus, reportStatusToPillVariant } from "../../../lib/reportStatus.js";
import StatusPill from "../../../components/ui/StatusPill.jsx";
import { Card, CardBody, CardHeader, CardTitle } from "../../../components/ui/Card.jsx";
import Button from "../../../components/ui/Button.jsx";
import { PATHS } from "../../../routes/paths.js";
import { CheckCircle2, Truck, X } from "lucide-react";
import useStoredUser from "../../../hooks/useStoredUser.js";
import ValidationError from "../../../components/ui/ValidationError.jsx";
import ImageUploader from "../../../components/ui/ImageUploader.jsx";
import MapPicker from "../../../components/MapPicker.jsx";

function fileToDataUrl(file) {
  return new Promise((resolve) => {
    if (!file) return resolve(null);
    if (typeof FileReader === "undefined") return resolve(null);
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : null);
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

export default function CollectorReportDetail() {
  const { user } = useStoredUser();
  const { reportId } = useParams();
  const location = useLocation();
  const id = reportId ? String(reportId) : "";
  const stateReport = location?.state?.report ?? null;

  const storedReport = useMemo(() => {
    if (!id) return null;
    const list = getMockReports();
    if (!Array.isArray(list)) return null;
    return list.find((r) => r && r.id === id) ?? null;
  }, [id]);

  const [reportOverride, setReportOverride] = useState(null);

  useEffect(() => {
    const unsubUpdated = subscribeReportUpdated((nextReport) => {
      if (!nextReport || !nextReport.id) return;
      if (nextReport.id !== id) return;
      setReportOverride(nextReport);
    });
    const unsubDeleted = subscribeReportDeleted((deletedId) => {
      if (!deletedId) return;
      if (deletedId !== id) return;
      setReportOverride(null);
    });
    const unsubCleared = subscribeReportsCleared(() => setReportOverride(null));
    return () => {
      unsubUpdated();
      unsubDeleted();
      unsubCleared();
    };
  }, [id]);

  const report =
    reportOverride?.id === id ? reportOverride : stateReport?.id && String(stateReport.id) === id ? stateReport : storedReport;
  const status = normalizeReportStatus(report?.status);
  const collectorEmail = user?.email ?? null;
  const assignedEmails = Array.isArray(report?.assignedCollectors) ? report.assignedCollectors.map((c) => c?.email).filter(Boolean) : [];
  const legacyEmail = report?.assignedCollector?.email ?? report?.assignedCollectorEmail ?? report?.collectorEmail ?? null;
  const effectiveEmails = assignedEmails.length ? assignedEmails : legacyEmail ? [legacyEmail] : [];
  const isAssignedToMe = !effectiveEmails.length || (collectorEmail && effectiveEmails.includes(collectorEmail));

  // Actions based on status
  // accepted -> on the way
  // on the way -> collected
  const canStart = isAssignedToMe && status === "accepted";
  const canCollect = isAssignedToMe && status === "on the way";

  const wasteTypes = useMemo(() => {
    const raw = report?.types;
    const list = Array.isArray(raw) ? raw.filter(Boolean).map(String) : [];
    return list.length ? list : ["Organic", "Recyclable", "Hazardous"];
  }, [report]);

  const [collectOpen, setCollectOpen] = useState(false);
  const [weightsByType, setWeightsByType] = useState({});
  const [collectError, setCollectError] = useState("");
  const [collectedImages, setCollectedImages] = useState([]);
  const [collectedAddress, setCollectedAddress] = useState("");
  const [collectedCoords, setCollectedCoords] = useState(null);
  const [addrLoading, setAddrLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [geoError, setGeoError] = useState("");
  const sourceRef = useRef(null);

  function openCollectDialog() {
    if (!report || !canCollect) return;
    const existing = report?.collectedWeights && typeof report.collectedWeights === "object" ? report.collectedWeights : {};
    const initial = {};
    wasteTypes.forEach((t) => {
      const v = existing?.[t];
      if (v === 0) initial[t] = "0";
      else if (v === null || v === undefined || v === "") initial[t] = "";
      else initial[t] = String(v);
    });
    setWeightsByType(initial);
    setCollectError("");
    setCollectedImages([]);
    setCollectedAddress(typeof report?.address === "string" ? report.address : "");
    setCollectedCoords(report?.coords ?? null);
    setAddrLoading(false);
    setGpsLoading(false);
    setGeoError("");
    sourceRef.current = "system";
    setCollectOpen(true);
  }

  useEffect(() => {
    if (!collectOpen) return;
    if (sourceRef.current !== "address") return;
    if (!collectedAddress || collectedAddress.trim().length < 3) return;
    setAddrLoading(true);
    setGeoError("");
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(collectedAddress)}`);
        if (r.ok) {
          const data = await r.json();
          if (Array.isArray(data) && data.length) {
            const first = data[0];
            setCollectedCoords({ lat: parseFloat(first.lat), lng: parseFloat(first.lon) });
          } else {
            setGeoError("Address not found");
          }
        } else {
          setGeoError("Address lookup failed");
        }
      } catch {
        setGeoError("Network error during address lookup");
      } finally {
        setAddrLoading(false);
      }
    }, 500);
    return () => clearTimeout(t);
  }, [collectOpen, collectedAddress]);

  async function submitCollected() {
    if (!report || !canCollect) return;
    if (!collectedImages.length) {
      setCollectError("Please upload at least one collection photo.");
      return;
    }
    if (!collectedCoords) {
      setCollectError("Please choose a collection location using GPS, map, or address.");
      return;
    }
    if (!collectedAddress || collectedAddress.trim().length < 3) {
      setCollectError("Please enter the collection address.");
      return;
    }
    if (geoError) {
      setCollectError(geoError);
      return;
    }

    const parsed = {};
    let total = 0;
    for (const t of wasteTypes) {
      const raw = weightsByType?.[t];
      const value = raw === "" || raw === null || raw === undefined ? NaN : Number(raw);
      if (!Number.isFinite(value) || value < 0) {
        setCollectError(`Please enter a valid weight for ${t}.`);
        return;
      }
      parsed[t] = value;
      total += value;
    }

    if (total <= 0) {
      setCollectError("Total collected weight must be greater than 0.");
      return;
    }

    const now = new Date().toISOString();
    const collectedImageUrls = (await Promise.all(collectedImages.map(fileToDataUrl))).filter(Boolean);
    if (!collectedImageUrls.length) {
      setCollectError("Unable to read the uploaded images. Please try again.");
      return;
    }
    const next = {
      ...report,
      status: "collected",
      collectedAt: now,
      collectedBy: collectorEmail ?? report?.collectedBy ?? null,
      collectedWeights: parsed,
      collectedTotalWeight: total,
      collectedAddress: collectedAddress.trim(),
      collectedCoords,
      collectedImages: collectedImageUrls,
      updatedAt: now,
    };
    updateMockReport(next);
    publishReportUpdated(next);
    setReportOverride(next);
    setCollectOpen(false);
  }

  return (
    <CollectorLayout>
      <div className="space-y-8">
        <ReportDetail
          report={report}
          backTo={PATHS.collector.dashboard}
          title="Task Detail"
          description={id ? `Viewing task: ${id}` : "Viewing task"}
          backLabel="Back to dashboard"
        />

        <Card className="overflow-hidden bg-gradient-to-br from-blue-50/70 via-white to-white">
            <CardHeader className="py-6 px-8">
            <div className="min-w-0">
              <CardTitle className="text-2xl">Update Status</CardTitle>
              <div className="mt-1 text-sm text-gray-600">
                Update the status of this collection task as you progress.
              </div>
            </div>
            <div className="flex items-center gap-3">
               <StatusPill variant={reportStatusToPillVariant(status)}>{status}</StatusPill>
            </div>
          </CardHeader>
          <CardBody className="p-8">
             {!isAssignedToMe ? (
              <div className="mb-4 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                This task is assigned to a different collector.
              </div>
            ) : null}
             <div className="flex flex-wrap justify-end gap-3">
                {canStart && (
                    <Button
                    size="lg"
                    className="rounded-full bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => {
                        if (!report) return;
                        const next = { ...report, status: "on the way", updatedAt: new Date().toISOString() };
                        updateMockReport(next);
                        publishReportUpdated(next);
                        setReportOverride(next);
                    }}
                    >
                    <Truck className="h-5 w-5" aria-hidden="true" />
                    Accept Task
                    </Button>
                )}
                 {canCollect && (
                    <Button
                    size="lg"
                    className="rounded-full bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => {
                        openCollectDialog();
                    }}
                    >
                    <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                    Mark as Collected
                    </Button>
                )}
                {!canStart && !canCollect && status !== "collected" && (
                    <div className="text-gray-500">No actions available for this status.</div>
                )}
                 {status === "collected" && (
                    <div className="flex items-center gap-2 text-green-700 font-medium">
                        <CheckCircle2 className="h-5 w-5" />
                        Task Completed
                    </div>
                )}
             </div>
          </CardBody>
        </Card>

        {collectOpen ? (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8"
            role="dialog"
            aria-modal="true"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setCollectOpen(false);
            }}
          >
            <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-black/5 max-h-[calc(100vh-4rem)] flex flex-col">
              <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-gray-100">
                <div className="min-w-0">
                  <div className="text-lg font-semibold text-gray-900">Mark as Collected</div>
                  <div className="mt-1 text-sm text-gray-600">Upload photos, confirm location, and enter the real collected weight.</div>
                </div>
                <button
                  type="button"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full text-gray-600 hover:bg-gray-50"
                  onClick={() => setCollectOpen(false)}
                  aria-label="Close"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              <div className="px-6 py-6 space-y-6 overflow-auto">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="text-sm text-gray-700">
                    Report: <span className="font-semibold text-gray-900">{report?.id ?? "-"}</span>
                  </div>
                  <StatusPill variant={reportStatusToPillVariant(status)}>{status}</StatusPill>
                </div>

                <ValidationError message={collectError} />

                <div className="space-y-3">
                  <div className="text-sm font-semibold text-gray-900">Collection Photos</div>
                  <ImageUploader title={null} max={6} multiple addLabel="+ Add Photo" onFilesChange={setCollectedImages} />
                </div>

                <div className="space-y-3">
                  <div className="text-sm font-semibold text-gray-900">Collection Location</div>
                  <div className="flex items-center gap-2">
                    <input
                      value={collectedAddress}
                      onChange={(e) => {
                        sourceRef.current = "address";
                        setCollectedAddress(e.target.value);
                        setCollectError("");
                      }}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                      placeholder="Address"
                    />
                    <button
                      type="button"
                      disabled={gpsLoading}
                      onClick={async () => {
                        setGeoError("");
                        setGpsLoading(true);
                        sourceRef.current = "gps";
                        try {
                          const pos = await new Promise((resolve, reject) =>
                            navigator.geolocation
                              ? navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 10000 })
                              : reject(new Error("Geolocation not supported"))
                          );
                          const next = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                          setCollectedCoords(next);
                          const r = await fetch(
                            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${next.lat}&lon=${next.lng}`
                          );
                          if (r.ok) {
                            const data = await r.json();
                            sourceRef.current = "system";
                            setCollectedAddress(data.display_name || "");
                          }
                        } catch {
                          setGeoError("Unable to get current location");
                        } finally {
                          setGpsLoading(false);
                        }
                      }}
                      className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 font-medium transition border ${
                        gpsLoading ? "border-gray-200 text-gray-400" : "border-gray-300 text-gray-700 hover:bg-gray-50 active:scale-[0.98]"
                      }`}
                    >
                      {gpsLoading ? "Locating..." : "Use current location"}
                    </button>
                  </div>
                  {addrLoading ? <div className="text-sm text-gray-500">Finding location...</div> : null}
                  {geoError ? <div className="text-sm text-red-600">{geoError}</div> : null}
                  <MapPicker
                    value={collectedCoords}
                    onChange={async (c) => {
                      setGeoError("");
                      sourceRef.current = "map";
                      setCollectedCoords(c);
                      setCollectError("");
                      try {
                        const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${c.lat}&lon=${c.lng}`);
                        if (r.ok) {
                          const data = await r.json();
                          sourceRef.current = "system";
                          setCollectedAddress(data.display_name || "");
                        }
                      } catch {
                        setGeoError("Unable to resolve address for the selected location");
                      }
                    }}
                  />
                </div>

                <div className="space-y-3">
                  {wasteTypes.map((t) => {
                    const id = `collected-weight-${t}`;
                    const value = weightsByType?.[t] ?? "";
                    return (
                      <div key={t} className="grid gap-2">
                        <label htmlFor={id} className="text-sm font-medium text-slate-800">
                          {t} real weight (kg)
                        </label>
                        <input
                          id={id}
                          name={id}
                          type="number"
                          min="0"
                          step="0.01"
                          value={value}
                          onChange={(e) => {
                            const nextValue = e.target.value;
                            setWeightsByType((prev) => ({ ...(prev || {}), [t]: nextValue }));
                            setCollectError("");
                          }}
                          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-3 pr-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200"
                          placeholder="0.00"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-3 px-6 py-5 border-t border-gray-100">
                <Button variant="outline" size="sm" className="rounded-full" onClick={() => setCollectOpen(false)}>
                  Cancel
                </Button>
                <Button size="sm" className="rounded-full bg-green-600 hover:bg-green-700 text-white" onClick={submitCollected}>
                  <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                  Confirm Collected
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </CollectorLayout>
  );
}
