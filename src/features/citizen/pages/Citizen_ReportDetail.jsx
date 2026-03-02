import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./CD_Navbar";
import CD_Footer from "../../../shared/layout/CD_Footer.jsx";
import RoleLayout from "../../../shared/layout/RoleLayout.jsx";
import ReportDetail from "../../../shared/layout/Report_Detail.jsx";
import Button from "../../../shared/ui/Button.jsx";
import StatusPill from "../../../shared/ui/StatusPill.jsx";
import { Card, CardBody, CardHeader, CardTitle } from "../../../shared/ui/Card.jsx";
import useNotify from "../../../shared/hooks/useNotify.js";
import { normalizeReportStatus, reportStatusToPillVariant } from "../../../shared/lib/reportStatus.js";
import { PATHS } from "../../../app/routes/paths.js";
import { deleteReport, getMyReportById, getMyReportResult } from "../../../services/reports.service.js";

export default function CitizenReportDetail() {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const notify = useNotify();

  const [apiReport, setApiReport] = useState(null);
  const [apiResult, setApiResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!reportId) return;
    let cancelled = false;
    Promise.resolve().then(() => {
      if (cancelled) return;
      setLoading(true);
      Promise.all([getMyReportById(reportId), getMyReportResult(reportId)])
        .then(([r, res]) => {
          if (cancelled) return;
          setApiReport(r ?? null);
          setApiResult(res ?? null);
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

                  <div className="mt-6 space-y-5">
                    {steps.map((s, idx) => {
                      const done = idx < stepIndex;
                      const active = idx === stepIndex;
                      return (
                        <div key={s.label} className="flex items-start gap-3">
                          <div className="mt-1.5">
                            <div
                              className={[
                                "h-5 w-5 rounded-full border flex items-center justify-center",
                                done ? "bg-emerald-600 border-emerald-600" : active ? "bg-emerald-50 border-emerald-500" : "bg-white border-gray-200",
                              ].join(" ")}
                            >
                              {done ? <div className="h-2 w-2 bg-white rounded-full" /> : active ? <div className="h-2 w-2 bg-emerald-600 rounded-full" /> : null}
                            </div>
                            {idx !== steps.length - 1 ? (
                              <div className={["mx-auto w-px h-8", done ? "bg-emerald-200" : "bg-gray-200"].join(" ")} />
                            ) : null}
                          </div>
                          <div className="min-w-0">
                            <div className={["text-sm font-semibold", active ? "text-gray-900" : "text-gray-800"].join(" ")}>{s.label}</div>
                            {s.sub ? <div className="text-xs text-gray-500 mt-1">{s.sub}</div> : null}
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
                      const ok = window.confirm("Remove this report?");
                      if (!ok) return;
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
      </div>
    </RoleLayout>
  );
}
