import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./CD_Navbar";
import CD_Footer from "../../../components/layout/CD_Footer.jsx";
import RoleLayout from "../../../components/layout/RoleLayout.jsx";
import PageHeader from "../../../components/ui/PageHeader.jsx";
import { Card, CardBody, CardHeader, CardTitle } from "../../../components/ui/Card.jsx";
import Button from "../../../components/ui/Button.jsx";
import StatusPill from "../../../components/ui/StatusPill.jsx";
import useStoredUser from "../../../hooks/useStoredUser.js";
import useNotify from "../../../hooks/useNotify.js";
import {
  publishReportsCleared,
  subscribeReportDeleted,
  subscribeReportSubmitted,
  subscribeReportsCleared,
  subscribeReportUpdated,
} from "../../../events/reportEvents.js";
import { clearMockReports, getMockReports } from "../../../mock/reportStore.js";
import { normalizeReportStatus, reportStatusToPillVariant } from "../../../lib/reportStatus.js";
import { PATHS } from "../../../routes/paths.js";

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
      setReports((prev) => [report, ...prev]);
    });
    const unsubUpdated = subscribeReportUpdated((nextReport) => {
      if (!nextReport || !nextReport.id) return;
      setReports((prev) => prev.map((r) => (r && r.id === nextReport.id ? nextReport : r)));
    });
    const unsubDeleted = subscribeReportDeleted((reportId) => {
      if (!reportId) return;
      setReports((prev) => prev.filter((r) => !(r && r.id === reportId)));
    });
    const unsubCleared = subscribeReportsCleared(() => setReports([]));
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
                      <tr key={r.id} className="hover:bg-gray-50/40">
                        <td className="px-8 py-5 text-sm font-semibold">
                          <Link
                            to={`${PATHS.citizen.reports}/${r.id}`}
                            className="text-gray-900 hover:text-green-700 underline"
                          >
                            {r.id}
                          </Link>
                        </td>
                        <td className="px-8 py-5 text-sm text-gray-600">
                          {r.address || (r.coords ? `${r.coords.lat.toFixed(5)}, ${r.coords.lng.toFixed(5)}` : "Unknown")}
                        </td>
                        <td className="px-8 py-5 text-sm text-gray-600">
                          {r.createdAt ? new Date(r.createdAt).toLocaleString() : "-"}
                        </td>
                        <td className="px-8 py-5 text-sm text-right">
                          <StatusPill variant={reportStatusToPillVariant(r.status)}>{normalizeReportStatus(r.status)}</StatusPill>
                        </td>
                      </tr>
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
