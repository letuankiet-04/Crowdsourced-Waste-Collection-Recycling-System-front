import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../components/navigation/Sidebar";
import Navbar from "../components/navigation/CD_Navbar";
import CD_Footer from "../../../shared/layout/CD_Footer.jsx";
import RoleLayout from "../../../shared/layout/RoleLayout.jsx";
import ReportDetail from "../../../shared/layout/Report_Detail.jsx";
import Button from "../../../shared/ui/Button.jsx";
import StatusPill from "../../../shared/ui/StatusPill.jsx";
import { Card, CardBody, CardHeader, CardTitle } from "../../../shared/ui/Card.jsx";
import ConfirmDialog from "../../../shared/ui/ConfirmDialog.jsx";
import useNotify from "../../../shared/hooks/useNotify.js";
import { normalizeReportStatus, reportStatusToPillVariant } from "../../../shared/lib/reportStatus.js";
import { PATHS } from "../../../app/routes/paths.js";
import { deleteReport } from "../../../services/reports.service.js";
import { formatWasteTypeUnit } from "../../../shared/constants/wasteTypes.js";
import useCitizenReportDetail from "../hooks/useCitizenReportDetail.js";
import { buildCitizenReportDetail } from "./citizenReportDetail.utils.js";
import { formatPoints } from "../../../shared/lib/numberFormat.js";

export default function CitizenReportDetail() {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const notify = useNotify();

  const [removeConfirmOpen, setRemoveConfirmOpen] = useState(false);
  const { apiReport, apiResult, collectorReport, loading, categoryOptions } = useCitizenReportDetail({ reportId, notify });

  const report = useMemo(() => {
    return buildCitizenReportDetail(apiReport, reportId, collectorReport);
  }, [apiReport, reportId, collectorReport]);

  const status = normalizeReportStatus(report?.status);
  const canManage = status === "Pending";
  const stepIndex =
    status === "Pending"
      ? 0
      : status === "Accepted"
        ? 1
        : status === "Assigned" || status === "On The Way"
          ? 2
          : status === "Collected"
            ? 3
            : 0;

  const step2 =
    status === "On The Way"
      ? { label: "On The Way", sub: "Collector is on the way." }
      : { label: "Assign Collector", sub: "Awaiting unit assignment" };

  const pointsBreakdown = useMemo(() => {
    const types = Array.isArray(categoryOptions) ? categoryOptions : [];
    const byId = new Map(types.map((t) => [Number(t.id), t]));
    const byName = new Map(types.map((t) => [String(t.name).toLowerCase(), t]));
    const source = Array.isArray(apiReport?.categories) ? apiReport.categories : [];
    if (source.length) {
      return source
        .map((c) => {
          const id = c?.id == null ? null : Number(c.id);
          const found = Number.isFinite(id) ? byId.get(id) : byName.get(String(c?.name ?? "").toLowerCase());
          const qty = typeof c?.quantity === "number" ? c.quantity : Number(c?.quantity);
          if (!found || !Number.isFinite(qty) || qty <= 0 || !Number.isFinite(Number(found.pointPerUnit))) return null;
          return {
            id: Number(found.id),
            name: String(found.name),
            unit: found.unit ?? null,
            qty,
            points: Number(found.pointPerUnit) * qty,
          };
        })
        .filter(Boolean);
    }
    const items = Array.isArray(report?.wasteItems) ? report.wasteItems : [];
    return items
      .map((it) => {
        const found = byName.get(String(it?.name ?? "").toLowerCase());
        const qty = typeof it?.estimatedWeight === "number" ? it.estimatedWeight : Number(it?.estimatedWeight);
        if (!found || !Number.isFinite(qty) || qty <= 0 || !Number.isFinite(Number(found.pointPerUnit))) return null;
        return {
          id: Number(found.id),
          name: String(found.name),
          unit: found.unit ?? null,
          qty,
          points: Number(found.pointPerUnit) * qty,
        };
      })
      .filter(Boolean);
  }, [apiReport, report, categoryOptions]);

  const totalEstimatedPoints = useMemo(
    () => (Array.isArray(pointsBreakdown) ? pointsBreakdown : []).reduce((sum, r) => sum + (Number.isFinite(r?.points) ? r.points : 0), 0),
    [pointsBreakdown]
  );

  const reportInfoExtra = useMemo(() => {
    if (!pointsBreakdown.length) return null;
    return (
      <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-5">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <span>🎁</span>
          </div>
          <div className="font-semibold text-emerald-800">Estimated Reward</div>
        </div>
        <div className="mt-4 space-y-2">
          {pointsBreakdown.map((r) => {
            const unitLabel = r.unit ? formatWasteTypeUnit(r.unit) : "";
            return (
              <div key={r.id} className="flex items-center justify-between text-sm">
                <div className="text-gray-700">
                  {r.name} ({r.qty} {unitLabel})
                </div>
                <div className="font-semibold text-emerald-700">+{formatPoints(r.points)} pts</div>
              </div>
            );
          })}
        </div>
        <div className="my-4 border-t border-emerald-100" />
        <div className="flex items-end justify-between">
          <div className="text-xs font-semibold tracking-wider text-gray-500">TOTAL</div>
          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-bold text-emerald-600">{formatPoints(totalEstimatedPoints)}</div>
            <div className="text-emerald-700 font-semibold">pts</div>
          </div>
        </div>
        <div className="mt-4 rounded-xl bg-white/80 text-emerald-800 border border-emerald-100 p-3 text-xs">
          Points are officially credited after staff verification.
        </div>
      </div>
    );
  }, [pointsBreakdown, totalEstimatedPoints]);

  const collectionDetails = useMemo(() => {
    const cr = collectorReport ?? null;
    const images = Array.isArray(cr?.imageUrls) ? cr.imageUrls.filter(Boolean).map(String) : [];
    const categories = Array.isArray(cr?.categories) ? cr.categories : [];
    const toNumber = (v) => {
      if (v == null) return null;
      const n = typeof v === "number" ? v : Number(v);
      return Number.isFinite(n) ? n : null;
    };
    const reportTotalPoint = toNumber(cr?.totalPoint);
    const resultTotalPoint = toNumber(apiResult?.totalPoint);
    const earnedPoints = resultTotalPoint ?? reportTotalPoint;
    const statusText = status === "Collected" ? "Collection completed." : "Collection details are not available yet.";

    const formatNumber = (n) => {
      const num = typeof n === "number" ? n : Number(n);
      if (!Number.isFinite(num)) return "-";
      const rounded = Math.round(num);
      if (Math.abs(num - rounded) < 1e-9) return String(rounded);
      return num.toFixed(2);
    };

    const rows = categories
      .map((c) => {
        const name = c?.name ? String(c.name).trim() : "";
        if (!name) return null;
        const unit = c?.unit ? String(c.unit) : "";
        const q = typeof c?.quantity === "number" ? c.quantity : Number(c?.quantity);
        const p = typeof c?.pointPerUnit === "number" ? c.pointPerUnit : Number(c?.pointPerUnit);
        const points = Number.isFinite(q) && Number.isFinite(p) ? q * p : null;
        return { key: c?.id ?? `${name}-${unit}`, name, unit, quantity: Number.isFinite(q) ? q : null, pointPerUnit: Number.isFinite(p) ? p : null, points };
      })
      .filter(Boolean);

    const basePoints = rows.reduce((sum, r) => sum + (Number.isFinite(r?.points) ? r.points : 0), 0);
    const enterpriseRateRaw =
      basePoints > 0 && Number.isFinite(earnedPoints) && earnedPoints > 0 ? (earnedPoints / basePoints) * 100 : null;
    const enterpriseRate = enterpriseRateRaw != null ? Math.min(100, Math.max(0, enterpriseRateRaw)) : null;

    return (
      <Card className="overflow-hidden border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-sky-50 shadow-md hover:shadow-xl">
        <CardHeader className="py-6 px-8 border-b border-emerald-100 bg-white/60 backdrop-blur">
          <CardTitle className="text-2xl text-emerald-950">Collection Details</CardTitle>
        </CardHeader>
        <CardBody className="p-8 space-y-8">
          {!cr ? (
            <div className="rounded-2xl border border-emerald-200 bg-white/70 px-5 py-4 text-sm text-emerald-900">
              {statusText}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Collector Report Code</div>
                  <div className="mt-1 text-gray-900">{cr?.reportCode ?? cr?.id ?? "-"}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Collected At</div>
                  <div className="mt-1 text-gray-900">{cr?.collectedAt ? new Date(cr.collectedAt).toLocaleString() : "-"}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Total Points</div>
                  <div className="mt-1 text-gray-900 font-semibold">{earnedPoints != null ? formatPoints(earnedPoints) : "-"}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Enterprise Rate</div>
                  <div className="mt-1 text-gray-900 font-semibold">{enterpriseRate != null ? `${formatNumber(enterpriseRate)}%` : "-"}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Collection Request ID</div>
                  <div className="mt-1 text-gray-900">{cr?.collectionRequestId ?? "-"}</div>
                </div>
              </div>

              <div>
                <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Collector Note</div>
                <div className="mt-2 whitespace-pre-wrap rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-800">
                  {cr?.collectorNote ? String(cr.collectorNote) : "No notes provided."}
                </div>
              </div>

              <div>
                <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Collected Categories</div>
                <div className="mt-3 overflow-x-auto rounded-2xl border border-gray-200">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 text-gray-600">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold">Name</th>
                        <th className="px-4 py-3 text-left font-semibold">Quantity</th>
                        <th className="px-4 py-3 text-left font-semibold">Unit</th>
                        <th className="px-4 py-3 text-right font-semibold">Point / Unit</th>
                        <th className="px-4 py-3 text-right font-semibold">Points</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {rows.length ? (
                        rows.map((r) => (
                          <tr key={r.key}>
                            <td className="px-4 py-3 text-gray-900 font-semibold">{r.name}</td>
                            <td className="px-4 py-3 text-gray-900">{r.quantity != null ? formatNumber(r.quantity) : "-"}</td>
                            <td className="px-4 py-3 text-gray-900">{r.unit ? formatWasteTypeUnit(r.unit) : "-"}</td>
                            <td className="px-4 py-3 text-gray-900 text-right">{r.pointPerUnit != null ? formatPoints(r.pointPerUnit) : "-"}</td>
                            <td className="px-4 py-3 text-gray-900 text-right">{r.points != null ? formatPoints(r.points) : "-"}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td className="px-4 py-6 text-gray-600" colSpan={5}>
                            No collected categories found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Evidence Photos</div>
                {images.length ? (
                  <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-4">
                    {images.map((src, idx) => (
                      <img
                        key={`${src}-${idx}`}
                        src={src}
                        alt={`Evidence photo ${idx + 1}`}
                        className="w-full h-40 object-cover rounded-xl border border-gray-100"
                        loading="lazy"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="mt-2 text-sm text-gray-600">No evidence photos attached.</div>
                )}
              </div>
            </>
          )}
        </CardBody>
      </Card>
    );
  }, [collectorReport, apiResult, status]);

  const steps = [
    { label: "Pending Review", sub: report?.createdAt ? new Date(report.createdAt).toLocaleString() : null },
    { label: "Accepted", sub: "Processing report details..." },
    step2,
    { label: "Collected", sub: apiResult?.collectedAt ? `Collected at: ${new Date(apiResult.collectedAt).toLocaleString()}` : "Final verification step" },
  ];

  return (
    <RoleLayout
      sidebar={<Sidebar />}
      navbar={<Navbar />}
      footer={
        <div className="animate-fade-in-up" style={{ animationDelay: "240ms" }}>
          <CD_Footer />
        </div>
      }
      showBackgroundEffects
    >
      <div className="animate-fade-in-up">
        <ReportDetail
          report={report}
          backTo={PATHS.citizen.reports}
          title="Report Detail"
          description={reportId ? `Viewing report: ${reportId}` : "Viewing report"}
          backLabel="Back to reports"
          showWasteTypes={false}
          wasteItemsLabel="Waste item"
          showSubmittedBy={false}
          reportInfoExtra={reportInfoExtra}
          mainBottom={collectionDetails}
          aside={
            <>
              <Card className="overflow-hidden">
                <CardHeader className="py-6 px-8">
                  <CardTitle className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Report Status</CardTitle>
                </CardHeader>
                <CardBody className="px-8 pb-8 pt-0">
                  <div className="flex items-center gap-3">
                    <StatusPill variant={reportStatusToPillVariant(status)}>{status}</StatusPill>
                    <div className="text-xs text-gray-500">{loading ? "Loading..." : null}</div>
                  </div>

                  {status === "rejected" && report?.rejectionReason ? (
                    <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-800">
                      <span className="font-semibold">Reason for rejection:</span> {report.rejectionReason}
                    </div>
                  ) : null}

                  <div className="mt-6 space-y-2">
                    {steps.map((s, idx) => {
                      const done = idx < stepIndex;
                      const active = idx === stepIndex;
                      
                      return (
                        <div 
                          key={s.label} 
                          className={`relative flex gap-4 transition-all duration-300 ${
                            active 
                              ? "bg-emerald-50 p-4 rounded-xl border border-emerald-100 shadow-sm" 
                              : "px-4 py-2"
                          }`}
                        >
                          <div className="flex flex-col items-center">
                             {/* Circle */}
                             <div className={`
                               relative z-10 flex items-center justify-center rounded-full border-2 transition-all duration-300
                               ${active ? "w-6 h-6 border-emerald-500 bg-white shadow-[0_0_0_4px_rgba(16,185,129,0.15)]" : "w-5 h-5"}
                               ${done ? "bg-emerald-500 border-emerald-500" : !active ? "border-gray-300 bg-white" : ""}
                             `}>
                               {done && (
                                 <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                 </svg>
                               )}
                               {active && <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />}
                             </div>

                             {/* Connector Line */}
                             {idx !== steps.length - 1 && (
                               <div className={`w-0.5 absolute left-[28px] -ml-[0.5px] ${
                                  active ? "-bottom-6 top-10" : "top-7 -bottom-4"
                               } ${done ? "bg-emerald-300" : "bg-gray-200"}`} />
                             )}
                          </div>
                          
                          <div className={`${active ? "pt-0.5" : ""}`}>
                            <div className={`text-sm font-bold ${active ? "text-emerald-900 text-base" : "text-gray-500"}`}>
                              {s.label}
                            </div>
                            {s.sub && (
                              <div className={`text-xs mt-1 ${active ? "text-emerald-700 font-medium" : "text-gray-400"}`}>
                                {s.sub}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardBody>
              </Card>
              
              <Card className="overflow-hidden">
                <CardHeader className="py-6 px-8">
                  <CardTitle className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Manage Report</CardTitle>
                </CardHeader>
                <CardBody className="px-8 pb-8 pt-0 space-y-3">
                  {status === "Collected" && (
                    <Button
                      variant="outline"
                      className="w-full rounded-xl border-orange-500 text-orange-600 hover:bg-orange-50"
                      onClick={() => navigate(PATHS.citizen.feedback, { state: { reportId: report.id } })}
                    >
                      Report Issue / Complaint
                    </Button>
                  )}
                  <Button
                    className="w-full rounded-xl"
                    disabled={!report || !canManage}
                    onClick={() => {
                      if (!report || !canManage) return;
                      const categories = Array.isArray(apiReport?.categories) ? apiReport.categories : [];
                      const images = Array.isArray(apiReport?.images) ? apiReport.images : [];
                      navigate(PATHS.citizen.createReport, {
                        state: {
                          editReport: {
                            id: apiReport?.id ?? reportId,
                            status: apiReport?.status ?? null,
                            address: "",
                            notes:
                              (typeof apiReport?.description === "string" && apiReport.description.trim()) ||
                              (typeof apiReport?.notes === "string" && apiReport.notes.trim()) ||
                              "",
                            coords: null,
                            images,
                            wasteItems: categories
                              .map((c) => ({
                                wasteTypeId: c?.id ?? null,
                                estimatedWeight: c?.quantity ?? "",
                              }))
                              .filter((x) => x.wasteTypeId != null),
                          },
                        },
                      });
                    }}
                  >
                    Update Details
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full rounded-xl border-red-600 text-red-700 hover:bg-red-50"
                    disabled={!report || !canManage}
                    onClick={() => {
                      if (!report || !canManage) return;
                      setRemoveConfirmOpen(true);
                    }}
                  >
                    Remove Report
                  </Button>
                  <div className="text-xs text-gray-500 text-center">
                    Reports can only be updated while in Pending status.
                  </div>
                </CardBody>
              </Card>
            </>
          }
        />

        <ConfirmDialog
          open={removeConfirmOpen}
          title="Are you sure you want to remove this report?"
          description="If you continue, this report will be permanently removed."
          confirmText="Remove"
          cancelText="Cancel"
          confirmClassName="bg-red-600 hover:bg-red-700 text-white"
          onClose={() => setRemoveConfirmOpen(false)}
          onConfirm={() => {
            setRemoveConfirmOpen(false);
            notify
              .promise(deleteReport(reportId), {
                loadingTitle: "Deleting report...",
                loadingMessage: "Removing report from the server.",
                successTitle: "Report removed",
                successMessage: "The report has been deleted.",
                errorTitle: "Delete failed",
                errorMessage: (err) => err?.message || "Unable to delete report.",
              })
              .then(() => navigate(PATHS.citizen.reports))
              .catch(() => {});
          }}
        />
      </div>
    </RoleLayout>
  );
}
