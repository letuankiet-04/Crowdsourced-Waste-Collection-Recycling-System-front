import { useEffect, useMemo, useState } from "react";
import EnterpriseLayout from "./layout/EnterpriseLayout.jsx";
import PageHeader from "../../../shared/ui/PageHeader.jsx";
import ActionCard from "../../../shared/ui/ActionCard.jsx";
import { Card, CardBody, CardHeader, CardTitle } from "../../../shared/ui/Card.jsx";
import Button from "../../../shared/ui/Button.jsx";
import useStoredUser from "../../../shared/hooks/useStoredUser.js";
import useNotify from "../../../shared/hooks/useNotify.js";
import { FileText, MessageSquareText, UserPlus, Users } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { PATHS } from "../../../app/routes/paths.js";
import {
  subscribeReportDeleted,
  subscribeReportSubmitted,
  subscribeReportsCleared,
  subscribeReportUpdated,
} from "../../../events/reportEvents.js";
import { clearMockReports, deleteMockReport, getMockReports, upsertMockReport } from "../../../mock/reportStore.js";
import StatusPill from "../../../shared/ui/StatusPill.jsx";
import ReportRow from "../../../shared/ui/ReportRow.jsx";
import { normalizeReportStatus } from "../../../shared/lib/reportStatus.js";

export default function EnterpriseDashboard() {
  const { displayName } = useStoredUser();
  const notify = useNotify();
  const navigate = useNavigate();
  const [reports, setReports] = useState(() => getMockReports());

  const pendingReports = useMemo(() => {
    return reports.filter((r) => r && normalizeReportStatus(r.status) !== "closed").slice(0, 8);
  }, [reports]);

  useEffect(() => {
    const unsubSubmitted = subscribeReportSubmitted((report) => {
      if (!report) return;
      const next = upsertMockReport(report);
      setReports(next);
      notify.info("New request received", `${report.id} · ${report.address || "Unknown location"}`);
    });
    const unsubUpdated = subscribeReportUpdated((nextReport) => {
      if (!nextReport || !nextReport.id) return;
      const next = upsertMockReport(nextReport);
      setReports(next);
    });
    const unsubDeleted = subscribeReportDeleted((reportId) => {
      if (!reportId) return;
      const next = deleteMockReport(reportId);
      setReports(next);
    });
    const unsubCleared = subscribeReportsCleared(() => {
      clearMockReports();
      setReports([]);
    });
    return () => {
      unsubSubmitted();
      unsubUpdated();
      unsubDeleted();
      unsubCleared();
    };
  }, [notify]);

  return (
    <EnterpriseLayout>
      <div className="space-y-8">
        <PageHeader
          title={`Hello, ${displayName}.`}
          description={
            <>
              Welcome back to your dashboard. All systems are operational. You have{" "}
              <span className="font-bold text-emerald-700">{pendingReports.length}</span> pending requests waiting for review in your region.
            </>
          }
          right={
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => {
                const ok = window.confirm("Clear dashboard list? This will not delete saved reports.");
                if (!ok) return;
                setReports([]);
                notify.success("Dashboard cleared", "Report list cleared for this dashboard only.");
              }}
            >
              Clear reports
            </Button>
          }
        />

        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8">
            <ActionCard
              to={PATHS.enterprise.activeCollector}
              title="Active collectors"
              variant="green"
              icon={<Users className="h-10 w-10" aria-hidden="true" />}
            />
            <ActionCard
              to={PATHS.enterprise.reports}
              title="All reports"
              variant="green"
              icon={<FileText className="h-10 w-10" aria-hidden="true" />}
            />
            <ActionCard
              to={PATHS.enterprise.reports}
              title="View feedback"
              variant="blue"
              icon={<MessageSquareText className="h-10 w-10" aria-hidden="true" />}
            />
            <ActionCard
              to={PATHS.enterprise.adminPanel}
              title="Create collector account"
              variant="orange"
              icon={<UserPlus className="h-10 w-10" aria-hidden="true" />}
            />
          </div>

          <Card>
            <CardHeader className="py-6 px-8">
              <CardTitle className="text-2xl">Pending requests</CardTitle>
              <Button as={Link} to={PATHS.enterprise.reports} variant="outline" size="sm" className="rounded-full">
                View all →
              </Button>
            </CardHeader>
            <CardBody className="p-0">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left">
                  <thead className="bg-gray-50/60">
                    <tr className="text-xs uppercase tracking-wider text-gray-500">
                      <th className="px-8 py-4 font-bold">Report ID</th>
                      <th className="px-8 py-4 font-bold">Location</th>
                      <th className="px-8 py-4 font-bold">Date</th>
                      <th className="px-8 py-4 font-bold text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {pendingReports.length ? (
                      pendingReports.map((r) => (
                        <ReportRow
                          key={r.id}
                          report={r}
                          showLocation
                          onClick={() => navigate(`${PATHS.enterprise.reports}/${r.id}`, { state: { report: r } })}
                        />
                      ))
                    ) : (
                      <tr>
                        <td className="px-8 py-8 text-sm text-gray-600" colSpan={4}>
                          No pending requests yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="px-8 py-6 border-t border-gray-100 flex items-center justify-between">
                <Button variant="outline" size="sm" className="rounded-full">
                  Load more requests
                </Button>
                <div className="flex items-center gap-2">
                  <StatusPill variant="yellow">pending</StatusPill>
                  <StatusPill variant="blue">on the way</StatusPill>
                  <StatusPill variant="red">rejected</StatusPill>
                  <StatusPill variant="green">accepted</StatusPill>
                  <StatusPill variant="green">collected</StatusPill>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </EnterpriseLayout>
  );
}
