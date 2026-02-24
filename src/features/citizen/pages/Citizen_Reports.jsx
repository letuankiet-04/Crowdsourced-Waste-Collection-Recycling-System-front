import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./CD_Navbar";
import CD_Footer from "../../../shared/layout/CD_Footer.jsx";
import RoleLayout from "../../../shared/layout/RoleLayout.jsx";
import PageHeader from "../../../shared/ui/PageHeader.jsx";
import { Card, CardBody, CardHeader, CardTitle } from "../../../shared/ui/Card.jsx";
import Button from "../../../shared/ui/Button.jsx";
import ReportRow from "../../../shared/ui/ReportRow.jsx";
import useStoredUser from "../../../shared/hooks/useStoredUser.js";
import useNotify from "../../../shared/hooks/useNotify.js";
import {
  publishReportsCleared,
  subscribeReportDeleted,
  subscribeReportSubmitted,
  subscribeReportsCleared,
  subscribeReportUpdated,
} from "../../../events/reportEvents.js";
import { clearMockReports, deleteMockReport, getMockReports, upsertMockReport } from "../../../mock/reportStore.js";
import { PATHS } from "../../../app/routes/paths.js";

export default function CitizenReports() {
  const { user, displayName } = useStoredUser();
  const notify = useNotify();
  const [reports, setReports] = useState(() => getMockReports());

  const myReports = useMemo(() => {
    const me = user?.email ?? null;
    const list = Array.isArray(reports) ? reports : [];

    if (!me) return [];

    return list.filter((r) => r && r.createdBy === me);
  }, [reports, user]);

  useEffect(() => {
    const unsubSubmitted = subscribeReportSubmitted((report) => {
      if (!report) return;
      const next = upsertMockReport(report);
      setReports(next);
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
  }, []);

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
        <PageHeader
          className="mb-8"
          title="My Reports"
          description={`Reports submitted by ${displayName}.`}
          right={
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={() => {
                  const ok = window.confirm("Clear ALL report data? This will remove all saved mock reports.");
                  if (!ok) return;
                  clearMockReports();
                  publishReportsCleared();
                  setReports([]);
                  notify.success("Reports cleared", "All report data has been removed.");
                }}
              >
                Clear reports
              </Button>
              <Button as={Link} to={PATHS.citizen.createReport} size="sm" className="rounded-full">
                Create report
              </Button>
            </div>
          }
        />
      </div>

      <div className="animate-fade-in-up" style={{ animationDelay: "120ms" }}>
        <Card>
          <CardHeader className="py-6 px-8">
            <CardTitle className="text-2xl">All reports</CardTitle>
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
                  {myReports.length ? (
                    myReports.map((r) => (
                      <ReportRow
                        key={r.id}
                        report={r}
                        showLocation
                        idTo={`${PATHS.citizen.reports}/${r.id}`}
                      />
                    ))
                  ) : (
                    <tr>
                      <td className="px-8 py-8 text-sm text-gray-600" colSpan={4}>
                        No reports submitted yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      </div>
    </RoleLayout>
  );
}
