import { useEffect, useMemo, useState } from "react";
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
import { CheckCircle2, Truck } from "lucide-react";
import useStoredUser from "../../../hooks/useStoredUser.js";

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
                        if (!report) return;
                        const next = { ...report, status: "collected", updatedAt: new Date().toISOString() };
                        updateMockReport(next);
                        publishReportUpdated(next);
                        setReportOverride(next);
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
      </div>
    </CollectorLayout>
  );
}
