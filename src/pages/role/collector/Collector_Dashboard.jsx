import { useEffect, useMemo, useState } from "react";
import CollectorLayout from "./layout/CollectorLayout.jsx";
import PageHeader from "../../../components/ui/PageHeader.jsx";
import ActionCard from "../../../components/ui/ActionCard.jsx";
import { Card, CardBody, CardHeader, CardTitle } from "../../../components/ui/Card.jsx";
import useStoredUser from "../../../hooks/useStoredUser.js";
import useNotify from "../../../hooks/useNotify.js";
import { ClipboardList, History, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PATHS } from "../../../routes/paths.js";
import {
  subscribeReportDeleted,
  subscribeReportUpdated,
} from "../../../events/reportEvents.js";
import { getMockReports, upsertMockReport, deleteMockReport } from "../../../mock/reportStore.js";
import ReportRow from "../../../components/ui/ReportRow.jsx";
import { normalizeReportStatus } from "../../../lib/reportStatus.js";

export default function CollectorDashboard() {
  const { user, displayName } = useStoredUser();
  const notify = useNotify();
  const navigate = useNavigate();
  const [reports, setReports] = useState(() => getMockReports());
  const collectorEmail = user?.email ?? null;

  const myTasks = useMemo(() => {
    return reports.filter((r) => {
        const status = normalizeReportStatus(r.status);
        if (!["accepted", "on the way"].includes(status)) return false;
        if (!collectorEmail) return false;
        const assignedEmails = Array.isArray(r?.assignedCollectors)
          ? r.assignedCollectors.map((c) => c?.email).filter(Boolean)
          : [];
        const legacyEmail = r?.assignedCollector?.email ?? r?.assignedCollectorEmail ?? r?.collectorEmail ?? null;
        const effectiveEmails = assignedEmails.length ? assignedEmails : legacyEmail ? [legacyEmail] : [];
        return effectiveEmails.includes(collectorEmail);
    }).slice(0, 10);
  }, [collectorEmail, reports]);

  useEffect(() => {
    const unsubUpdated = subscribeReportUpdated((nextReport) => {
      if (!nextReport || !nextReport.id) return;
      const next = upsertMockReport(nextReport);
      setReports(next);
      const status = normalizeReportStatus(nextReport.status);
      const assignedEmails = Array.isArray(nextReport?.assignedCollectors)
        ? nextReport.assignedCollectors.map((c) => c?.email).filter(Boolean)
        : [];
      const legacyEmail = nextReport?.assignedCollector?.email ?? nextReport?.assignedCollectorEmail ?? nextReport?.collectorEmail ?? null;
      const effectiveEmails = assignedEmails.length ? assignedEmails : legacyEmail ? [legacyEmail] : [];
      if (collectorEmail && effectiveEmails.includes(collectorEmail) && ["accepted"].includes(status)) {
        notify.info("New task assigned", `${nextReport.id} · ${nextReport.address || "Unknown location"}`);
      }
    });
    const unsubDeleted = subscribeReportDeleted((reportId) => {
      if (!reportId) return;
      const next = deleteMockReport(reportId);
      setReports(next);
    });

    return () => {
      unsubUpdated();
      unsubDeleted();
    };
  }, [collectorEmail, notify]);

  return (
    <CollectorLayout>
      <div className="space-y-8">
        <PageHeader
          title={`Hello, ${displayName}.`}
          description={
            <>
              You have <span className="font-bold text-emerald-700">{myTasks.length}</span> active tasks assigned to you.
            </>
          }
        />

        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
            <ActionCard
              to={PATHS.collector.tasks}
              title="My Tasks"
              variant="green"
              icon={<ClipboardList className="h-10 w-10" aria-hidden="true" />}
            />
            <ActionCard
              to={PATHS.collector.history}
              title="Work History"
              variant="blue"
              icon={<History className="h-10 w-10" aria-hidden="true" />}
            />
            <ActionCard
              to={PATHS.collector.profile}
              title="My Profile"
              variant="orange"
              icon={<User className="h-10 w-10" aria-hidden="true" />}
            />
          </div>

          <Card>
            <CardHeader className="py-6 px-8">
              <CardTitle className="text-2xl">Assigned Tasks</CardTitle>
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
                    {myTasks.length ? (
                      myTasks.map((r) => (
                        <ReportRow
                          key={r.id}
                          report={r}
                          showLocation
                          onClick={() => navigate(PATHS.collector.reportDetail.replace(":reportId", r.id), { state: { report: r } })}
                        />
                      ))
                    ) : (
                      <tr>
                        <td className="px-8 py-8 text-sm text-gray-600" colSpan={4}>
                          No tasks assigned yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </CollectorLayout>
  );
}
