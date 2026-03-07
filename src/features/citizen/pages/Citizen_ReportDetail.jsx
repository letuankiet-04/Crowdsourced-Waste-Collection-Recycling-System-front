import { useEffect, useMemo, useState } from "react";
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
import { deleteReport, getMyReportById, getMyReportResult, getWasteCategories } from "../../../services/reports.service.js";
import { formatWasteTypeUnit } from "../../../shared/constants/wasteTypes.js";

export default function CitizenReportDetail() {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const notify = useNotify();

  const [apiReport, setApiReport] = useState(null);
  const [apiResult, setApiResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [removeConfirmOpen, setRemoveConfirmOpen] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState([]);

  useEffect(() => {
    if (!reportId) return;
    let cancelled = false;
    Promise.resolve().then(() => {
      if (cancelled) return;
      setLoading(true);
      Promise.all([getMyReportById(reportId), getMyReportResult(reportId), getWasteCategories()])
        .then(([r, res, cats]) => {
          if (cancelled) return;
          setApiReport(r ?? null);
          setApiResult(res ?? null);
          const list = Array.isArray(cats) ? cats : [];
          setCategoryOptions(
            list.map((c) => ({
              id: Number(c.id),
              name: String(c.name ?? "").trim(),
              unit: c.unit ?? null,
              pointPerUnit: c.pointPerUnit ?? null,
            }))
          );
        })
        .catch((err) => notify.error("Load report failed", err?.message || "Unable to load report."))
        .finally(() => {
          if (cancelled) return;
          setLoading(false);
        });
    });
    return () => {
      cancelled = true;
    };
  }, [reportId, notify]);

  const report = useMemo(() => {
    if (!apiReport) return null;
    const categories = Array.isArray(apiReport?.categories) ? apiReport.categories : [];
    const images = Array.isArray(apiReport?.images) ? apiReport.images : [];
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
      lat != null && lng != null && Number.isFinite(Number(lat)) && Number.isFinite(Number(lng))
        ? { lat: Number(lat), lng: Number(lng) }
        : null;
    return {
      id: apiReport?.id ?? reportId,
      status: apiReport?.status ?? null,
      createdAt: apiReport?.createdAt ?? null,
      address,
      coords,
      images,
      wasteItems: categories
        .map((c) => {
          const name = c?.name ? String(c.name) : "";
          const unit = c?.unit ?? null;
          const q = typeof c?.quantity === "number" ? c.quantity : Number(c?.quantity);
          return name && Number.isFinite(q) ? { name, unit, estimatedWeight: q } : null;
        })
        .filter(Boolean),
    };
  }, [apiReport, reportId]);

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

  const formatPoints = (n) => {
    if (!Number.isFinite(n)) return "0";
    const rounded = Math.round(n);
    if (Math.abs(n - rounded) < 1e-9) return String(rounded);
    return n.toFixed(2);
  };

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
          reportInfoExtra={reportInfoExtra}
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
                            notes: "",
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
