import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import EnterpriseLayout from "../layouts/EnterpriseLayout.jsx";
import PageHeader from "../../../shared/ui/PageHeader.jsx";
import { Card, CardBody, CardHeader, CardTitle } from "../../../shared/ui/Card.jsx";
import Button from "../../../shared/ui/Button.jsx";
import StatusPill from "../../../shared/ui/StatusPill.jsx";
import TextField from "../../../shared/ui/TextField.jsx";
import ConfirmDialog from "../../../shared/ui/ConfirmDialog.jsx";
import useNotify from "../../../shared/hooks/useNotify.js";
import {
  getCollectorReportDetail,
  getEnterpriseReports,
  getEnterpriseRequestReportDetail,
  normalizeEnterpriseCollectorReport,
  rewardCollectorReport,
} from "../../../services/enterprise.service.js";
import { PATHS } from "../../../app/routes/paths.js";
import GoongMapView from "../../../shared/components/maps/GoongMapView.jsx";

const reverseGeocodeCache = new Map();

function toCoords(lat, lng) {
  const la = typeof lat === "number" ? lat : Number(lat);
  const ln = typeof lng === "number" ? lng : Number(lng);
  if (!Number.isFinite(la) || !Number.isFinite(ln)) return null;
  return { lat: la, lng: ln };
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

function coordsFrom(source) {
  if (!source || typeof source !== "object") return null;
  const lat =
    source.latitude ??
    source.lat ??
    source.location?.latitude ??
    source.location?.lat ??
    null;
  const lng =
    source.longitude ??
    source.lng ??
    source.location?.longitude ??
    source.location?.lng ??
    null;
  return toCoords(lat, lng);
}

function formatCoords(coords) {
  if (!coords) return "";
  const lat = Number(coords.lat);
  const lng = Number(coords.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return "";
  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}

function computeTotalPoints(base) {
  const direct = base?.totalPoint ?? base?.totalPoints ?? base?.point ?? null;
  const directNum = typeof direct === "number" ? direct : Number(direct);
  if (Number.isFinite(directNum) && directNum > 0) return Math.round(directNum);

  const categories = Array.isArray(base?.categories) ? base.categories : [];
  let sum = 0;
  for (const c of categories) {
    const p = c?.pointPerUnit ?? c?.point_per_unit ?? c?.point ?? null;
    const q = c?.quantity ?? c?.qty ?? null;
    const pn = typeof p === "number" ? p : Number(p);
    const qn = typeof q === "number" ? q : Number(q);
    if (!Number.isFinite(pn) || !Number.isFinite(qn)) continue;
    sum += pn * qn;
  }
  if (Number.isFinite(sum) && sum > 0) return Math.round(sum);
  if (Number.isFinite(directNum) && directNum >= 0) return Math.round(directNum);
  return 0;
}

function computeEstimatedAwardPoints(categories, verificationRate) {
  const rateNum = typeof verificationRate === "number" ? verificationRate : Number(verificationRate);
  if (!Number.isFinite(rateNum)) return 0;
  const safe = Array.isArray(categories) ? categories : [];
  let sum = 0;
  for (const c of safe) {
    const p = c?.pointPerUnit ?? c?.point_per_unit ?? c?.point ?? null;
    const q = c?.quantity ?? c?.qty ?? null;
    const pn = typeof p === "number" ? p : Number(p);
    const qn = typeof q === "number" ? q : Number(q);
    if (!Number.isFinite(pn) || !Number.isFinite(qn)) continue;
    const basePoints = Math.trunc(pn * qn);
    const adjusted = Math.trunc(basePoints * (rateNum / 100));
    sum += adjusted;
  }
  return Number.isFinite(sum) && sum > 0 ? sum : 0;
}

export default function EnterpriseCollectorReportDetail() {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const notify = useNotify();
  const [report, setReport] = useState(null);
  const [wasteReport, setWasteReport] = useState(null);
  const [reportedAddressResolved, setReportedAddressResolved] = useState(null);
  const [collectedAddressResolved, setCollectedAddressResolved] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [verificationRateInput, setVerificationRateInput] = useState("100");
  const [rewardConfirmOpen, setRewardConfirmOpen] = useState(false);
  const [rewardSubmitting, setRewardSubmitting] = useState(false);
  const [rewardResult, setRewardResult] = useState(null);

  useEffect(() => {
    if (reportId) {
      fetchReport(reportId);
    }
  }, [reportId]);

  const fetchReport = async (id) => {
    try {
      setLoading(true);
      setError(null);
      setWasteReport(null);
      setReportedAddressResolved(null);
      setCollectedAddressResolved(null);
      setVerificationRateInput("100");
      setRewardResult(null);

      const collector = await getCollectorReportDetail(id);
      setReport(collector);

      const requestId = collector?.collectionRequestId;
      if (requestId != null && String(requestId).trim() !== "") {
        let wr = null;
        try {
          const reqDetail = await getEnterpriseRequestReportDetail(requestId);
          const cr = reqDetail?.collectorReport ? normalizeEnterpriseCollectorReport(reqDetail.collectorReport) : null;
          wr = reqDetail?.wasteReport ?? null;
          if (cr) setReport(cr);
          if (wr) setWasteReport(wr);
        } catch {
          void 0;
        }
        if (!wr) {
          try {
            const list = await getEnterpriseReports();
            const rows = Array.isArray(list) ? list : list?.items ?? list?.content ?? [];
            const hit = (Array.isArray(rows) ? rows : []).find(
              (r) => String(r?.collectionRequestId ?? r?.collection_request_id ?? "") === String(requestId)
            );
            if (hit) setWasteReport(hit);
          } catch {
            void 0;
          }
        }
      }
    } catch (err) {
      console.error("Failed to fetch report detail:", err);
      setError("Failed to load report details.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusVariant = (status) => {
    const s = String(status).toUpperCase();
    switch (s) {
      case "COMPLETED": return "green";
      case "FAILED": return "red";
      default: return "yellow";
    }
  };

  const reportedCoords = coordsFrom(wasteReport);
  const collectedCoords = coordsFrom(report);
  const reportedLat = reportedCoords?.lat ?? null;
  const reportedLng = reportedCoords?.lng ?? null;
  const collectedLat = collectedCoords?.lat ?? null;
  const collectedLng = collectedCoords?.lng ?? null;
  const totalPoints = computeTotalPoints(report);
  const categories = Array.isArray(report?.categories) ? report.categories : [];
  const reportedImages = Array.isArray(wasteReport?.imageUrls) ? wasteReport.imageUrls : [];
  const collectedImages = Array.isArray(report?.imageUrls) ? report.imageUrls : [];
  const alreadyRewarded = Number(report?.totalPoint ?? 0) > 0;
  const rateNum = Number(verificationRateInput);
  const rateSafe = Number.isFinite(rateNum) ? Math.min(Math.max(rateNum, 0), 100) : null;
  const estimatedAwardPoints = computeEstimatedAwardPoints(categories, rateSafe);
  const reportedRawAddress =
    wasteReport?.address ??
    wasteReport?.reportedAddress ??
    wasteReport?.reported_address ??
    wasteReport?.location?.address ??
    null;

  useEffect(() => {
    let cancelled = false;
    if (reportedRawAddress && String(reportedRawAddress).trim()) {
      setReportedAddressResolved(String(reportedRawAddress).trim());
      return () => {
        cancelled = true;
      };
    }
    if (!Number.isFinite(Number(reportedLat)) || !Number.isFinite(Number(reportedLng))) {
      return () => {
        cancelled = true;
      };
    }
    void (async () => {
      const addr = await reverseGeocodeAddress({ lat: reportedLat, lng: reportedLng });
      if (cancelled) return;
      if (addr) setReportedAddressResolved(addr);
    })();
    return () => {
      cancelled = true;
    };
  }, [reportedRawAddress, reportedLat, reportedLng]);

  useEffect(() => {
    let cancelled = false;
    if (!Number.isFinite(Number(collectedLat)) || !Number.isFinite(Number(collectedLng))) {
      return () => {
        cancelled = true;
      };
    }
    void (async () => {
      const addr = await reverseGeocodeAddress({ lat: collectedLat, lng: collectedLng });
      if (cancelled) return;
      if (addr) setCollectedAddressResolved(addr);
    })();
    return () => {
      cancelled = true;
    };
  }, [collectedLat, collectedLng]);

  if (loading) {
    return (
      <EnterpriseLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-gray-500">Loading report details...</div>
        </div>
      </EnterpriseLayout>
    );
  }

  if (error || !report) {
    return (
      <EnterpriseLayout>
        <div className="space-y-8">
           <PageHeader
            title="Report Not Found"
            description="The requested collector report could not be loaded."
            right={
              <Button variant="outline" onClick={() => navigate(PATHS.enterprise.collectorReports)}>
                Back to Reports
              </Button>
            }
          />
          <Card>
            <CardBody className="p-8">
              <div className="text-red-600">{error || "Report not found."}</div>
            </CardBody>
          </Card>
        </div>
      </EnterpriseLayout>
    );
  }

  const fallbackReported = wasteReport?.address || formatCoords(reportedCoords) || "-";
  const fallbackCollected = formatCoords(collectedCoords) || (collectedCoords ? "Location from GPS" : "-");
  const reportedAddress = reportedAddressResolved || fallbackReported;
  const collectedAddress = collectedAddressResolved || fallbackCollected;
  const mapPoints = [
    reportedCoords ? { coords: reportedCoords, label: "Reported location" } : null,
    collectedCoords ? { coords: collectedCoords, label: "Collected location" } : null,
  ].filter(Boolean);
  const hasAnyPhotos = reportedImages.length || collectedImages.length;

  async function handleReward() {
    if (!report || rewardSubmitting || alreadyRewarded) return;
    if (rateSafe == null) {
      notify.error("Missing verification rate", "Please enter a verification rate from 0 to 100.");
      return;
    }
    const key = report?.id ?? reportId;
    if (key == null || String(key).trim() === "") {
      notify.error("Missing report ID", "Unable to identify the collector report to reward.");
      return;
    }

    setRewardSubmitting(true);
    try {
      const res = await notify.promise(
        rewardCollectorReport({ reportId: key, verificationRate: rateSafe }),
        {
          loadingTitle: "Rewarding points...",
          loadingMessage: "Submitting reward confirmation.",
          successTitle: "Points rewarded",
          successMessage: (r) =>
            `Citizen received ${r?.points ?? 0} points (rate ${r?.verificationRate ?? rateSafe}%).`,
          errorTitle: "Reward failed",
          errorMessage: (err) => err?.message || "Unable to reward points for this report.",
        }
      );
      setRewardResult(res || null);
      setReport((prev) =>
        prev ? { ...prev, totalPoint: res?.points ?? prev.totalPoint, status: "COMPLETED" } : prev
      );
      if (res?.verificationRate != null) setVerificationRateInput(String(res.verificationRate));
      try {
        const latest = await getCollectorReportDetail(key);
        if (latest) setReport(latest);
      } catch {
        void 0;
      }
    } catch (e) {
      notify.error("Reward failed", e?.message || "Unable to reward points for this report.");
    } finally {
      setRewardSubmitting(false);
      setRewardConfirmOpen(false);
    }
  }

  return (
    <EnterpriseLayout>
      <div className="space-y-8">
        <PageHeader
          title={`Collector Report ${report.reportCode || report.id}`}
          description="Detailed view of the collector's submission."
          right={
            <Button variant="outline" onClick={() => navigate(PATHS.enterprise.collectorReports)}>
              Back to Reports
            </Button>
          }
        />

        <Card>
          <CardHeader className="py-6 px-8">
            <CardTitle className="text-2xl">Collection Report</CardTitle>
          </CardHeader>
          <CardBody className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="space-y-10">
                <div className="space-y-6">
                  <div className="text-sm font-semibold text-gray-900">Report Information</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Report ID</div>
                      <div className="mt-1 text-gray-900">{report.id}</div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Report Code</div>
                      <div className="mt-1 text-gray-900">{report.reportCode || "-"}</div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Status</div>
                      <div className="mt-1">
                        <StatusPill variant={getStatusVariant(report.status)}>{report.status}</StatusPill>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Total Points</div>
                      <div className="mt-1 text-gray-900 font-medium">{totalPoints}</div>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Collector Note</div>
                    <div className="mt-1 text-gray-900 whitespace-pre-wrap p-3 bg-gray-50 rounded-lg text-sm border border-gray-100">
                      {report.collectorNote || "No notes provided."}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="text-sm font-semibold text-gray-900">Collected Categories</div>
                  <div className="overflow-x-auto rounded-2xl border border-gray-200">
                    <table className="min-w-full text-left">
                      <thead className="bg-gray-50/60">
                        <tr className="text-xs uppercase tracking-wider text-gray-500">
                          <th className="px-6 py-4 font-bold">Name</th>
                          <th className="px-6 py-4 font-bold">Quantity</th>
                          <th className="px-6 py-4 font-bold">Unit</th>
                          <th className="px-6 py-4 font-bold text-right">Point / Unit</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 bg-white">
                        {categories.length ? (
                          categories.map((c) => (
                            <tr key={c?.id ?? `${c?.name ?? "cat"}-${String(c?.unit ?? "")}`}>
                              <td className="px-6 py-5 text-sm font-semibold text-gray-900">{c?.name ?? "-"}</td>
                              <td className="px-6 py-5 text-sm text-gray-600">{c?.quantity ?? "-"}</td>
                              <td className="px-6 py-5 text-sm text-gray-600">{c?.unit ?? "-"}</td>
                              <td className="px-6 py-5 text-sm text-right text-gray-600">{c?.pointPerUnit ?? "-"}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td className="px-6 py-6 text-sm text-gray-600" colSpan={4}>
                              No collected categories found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="text-sm font-semibold text-gray-900">Timestamps & IDs</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Collected At</div>
                      <div className="mt-1 text-gray-900">
                        {report.collectedAt ? new Date(report.collectedAt).toLocaleString() : "-"}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Created At</div>
                      <div className="mt-1 text-gray-900">
                        {report.createdAt ? new Date(report.createdAt).toLocaleString() : "-"}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Collector ID</div>
                      <div className="mt-1 text-gray-900">{report.collectorId}</div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Collection Request ID</div>
                      <div className="mt-1 text-gray-900">{report.collectionRequestId}</div>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-6 space-y-6">
                  <div className="text-sm font-semibold text-gray-900">Verification & Reward</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <TextField
                      label="Verification rate (%)"
                      type="number"
                      value={verificationRateInput}
                      onChange={(e) => setVerificationRateInput(e.target.value)}
                      placeholder="0 - 100"
                      disabled={alreadyRewarded || rewardSubmitting}
                      inputClassName="text-gray-900"
                    />
                    <div>
                      <div className="text-sm font-medium text-slate-800">Estimated points to award</div>
                      <div className="mt-2 text-2xl font-semibold text-gray-900">{estimatedAwardPoints}</div>
                      <div className="mt-1 text-xs text-gray-500">
                        Based on collected categories × pointPerUnit × rate
                      </div>
                    </div>
                  </div>

                  {alreadyRewarded ? (
                    <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                      This report has been rewarded. Total points:{" "}
                      <span className="font-semibold">{report.totalPoint}</span>
                    </div>
                  ) : rewardResult ? (
                    <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                      Rewarded <span className="font-semibold">{rewardResult.points}</span> points (rate{" "}
                      <span className="font-semibold">{rewardResult.verificationRate}</span>%).
                    </div>
                  ) : null}

                  <div className="flex items-center justify-end gap-3">
                    <Button
                      className="rounded-full"
                      disabled={alreadyRewarded || rewardSubmitting}
                      onClick={() => setRewardConfirmOpen(true)}
                    >
                      Confirm & Reward
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-10">
                <div className="space-y-6">
                  <div className="text-sm font-semibold text-gray-900">Location</div>
                  <div className="space-y-6">
                    <div>
                      <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Reported Address</div>
                      <div className="mt-1 text-gray-900">{reportedAddress || "-"}</div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Collected Address</div>
                      <div className="mt-1 text-gray-900">{collectedAddress || "-"}</div>
                    </div>
                    {mapPoints.length ? (
                      <div>
                        <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Map</div>
                        <div className="mt-3 overflow-hidden rounded-2xl border border-gray-200">
                          <GoongMapView points={mapPoints} />
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="text-sm font-semibold text-gray-900">Photos</div>
                  {hasAnyPhotos ? (
                    <div className="space-y-6">
                      {reportedImages.length ? (
                        <div>
                          <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Reported Photos</div>
                          <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-4">
                            {reportedImages.map((src, idx) => (
                              <img
                                key={`${src}-${idx}`}
                                src={src}
                                alt={`Report photo ${idx + 1}`}
                                className="w-full h-40 object-cover rounded-xl border border-gray-100"
                                loading="lazy"
                              />
                            ))}
                          </div>
                        </div>
                      ) : null}

                      {collectedImages.length ? (
                        <div>
                          <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Collected Photos</div>
                          <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-4">
                            {collectedImages.map((src, idx) => (
                              <img
                                key={`${src}-${idx}`}
                                src={src}
                                alt={`Collected photo ${idx + 1}`}
                                className="w-full h-40 object-cover rounded-xl border border-gray-100"
                                loading="lazy"
                              />
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <div className="text-gray-600 text-sm">No photos attached.</div>
                  )}
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      <ConfirmDialog
        open={rewardConfirmOpen}
        title="Confirm reward points?"
        description={
          rateSafe == null
            ? "Please enter a verification rate (0 - 100) before confirming."
            : `This will reward ${estimatedAwardPoints} points to the citizen (verification rate: ${rateSafe}%).`
        }
        confirmText={rewardSubmitting ? "Processing..." : "Confirm & Reward"}
        cancelText="Cancel"
        confirmDisabled={alreadyRewarded || rewardSubmitting || rateSafe == null}
        confirmClassName="bg-emerald-700 hover:bg-emerald-600"
        onClose={() => setRewardConfirmOpen(false)}
        onConfirm={() => void handleReward()}
      />
    </EnterpriseLayout>
  );
}

