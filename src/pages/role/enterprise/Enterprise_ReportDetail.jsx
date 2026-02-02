import { useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import EnterpriseLayout from "./layout/EnterpriseLayout.jsx";
import ReportDetail from "../../../components/layout/Report_Detail.jsx";
import { getMockReports, updateMockReport } from "../../../mock/reportStore.js";
import { publishReportUpdated, subscribeReportDeleted, subscribeReportUpdated, subscribeReportsCleared } from "../../../events/reportEvents.js";
import { normalizeReportStatus, reportStatusToPillVariant } from "../../../lib/reportStatus.js";
import StatusPill from "../../../components/ui/StatusPill.jsx";
import { Card, CardBody, CardHeader, CardTitle } from "../../../components/ui/Card.jsx";
import Button from "../../../components/ui/Button.jsx";
import { PATHS } from "../../../routes/paths.js";
import { CheckCircle2, XCircle } from "lucide-react";

export default function EnterpriseReportDetail() {
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
  const canDecide = status === "pending";

  return (
    <EnterpriseLayout>
      <div className="space-y-8">
        <ReportDetail
          report={report}
          backTo={PATHS.enterprise.reports}
          title="Report Detail"
          description={id ? `Viewing report: ${id}` : "Viewing report"}
          backLabel="Back to reports"
        />

        <Card className="overflow-hidden bg-gradient-to-br from-emerald-50/70 via-white to-white">
          <CardHeader className="py-6 px-8">
            <div className="min-w-0">
              <CardTitle className="text-2xl">Decision</CardTitle>
              <div className="mt-1 text-sm text-gray-600">
                Review this report and choose to accept or reject. Decisions can be made only while the report is pending.
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-xs text-gray-500">
                {report?.updatedAt ? `Updated ${new Date(report.updatedAt).toLocaleString()}` : report?.createdAt ? `Created ${new Date(report.createdAt).toLocaleString()}` : null}
              </div>
              <StatusPill variant={reportStatusToPillVariant(status)}>{status}</StatusPill>
            </div>
          </CardHeader>
          <CardBody className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 items-center">
              <div className="rounded-2xl border border-emerald-100 bg-white/70 p-5">
                <div className="text-sm font-semibold text-gray-900">What happens next</div>
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-700">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-700 mt-0.5" aria-hidden="true" />
                    <div>
                      <div className="font-semibold text-gray-900">Accept</div>
                      <div className="text-gray-600">Marks the report as accepted for processing.</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <XCircle className="h-5 w-5 text-red-700 mt-0.5" aria-hidden="true" />
                    <div>
                      <div className="font-semibold text-gray-900">Reject</div>
                      <div className="text-gray-600">Marks the report as rejected.</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap justify-end gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-full border-red-600 text-red-700 hover:bg-red-50"
                  disabled={!report || !canDecide}
                  onClick={() => {
                    if (!report || !canDecide) return;
                    const ok = window.confirm("Reject this report?");
                    if (!ok) return;
                    const next = { ...report, status: "rejected", updatedAt: new Date().toISOString() };
                    updateMockReport(next);
                    publishReportUpdated(next);
                    setReportOverride(next);
                  }}
                >
                  <XCircle className="h-5 w-5" aria-hidden="true" />
                  Reject
                </Button>
                <Button
                  size="lg"
                  className="rounded-full"
                  disabled={!report || !canDecide}
                  onClick={() => {
                    if (!report || !canDecide) return;
                    const next = { ...report, status: "accepted", updatedAt: new Date().toISOString() };
                    updateMockReport(next);
                    publishReportUpdated(next);
                    setReportOverride(next);
                  }}
                >
                  <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                  Accept
                </Button>
              </div>
            </div>

            {!canDecide && report ? (
              <div className="mt-4 text-xs text-gray-500">
                This report is already {status}. Accept/Reject is available only while status is pending.
              </div>
            ) : null}
          </CardBody>
        </Card>
      </div>
    </EnterpriseLayout>
  );
}
