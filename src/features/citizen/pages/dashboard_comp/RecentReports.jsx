import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle } from "../../../../shared/ui/Card.jsx";
import useStoredUser from "../../../../shared/hooks/useStoredUser.js";
import { subscribeReportDeleted, subscribeReportSubmitted, subscribeReportsCleared, subscribeReportUpdated } from "../../../../events/reportEvents.js";
import { clearMockReports, deleteMockReport, getMockReports, upsertMockReport } from "../../../../mock/reportStore.js";
import ReportRow from "../../../../shared/ui/ReportRow.jsx";
import { PATHS } from "../../../../app/routes/paths.js";

export default function RecentReports() {
  const { user } = useStoredUser();
  const navigate = useNavigate();
  const [reports, setReports] = useState(() => getMockReports());

  const myReports = useMemo(() => {
    const me = user?.email ?? null;
    const list = Array.isArray(reports) ? reports : [];

    if (!me) return [];

    return list.filter((r) => r && r.createdBy === me).slice(0, 5);
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
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Recent Reports</CardTitle>
        <Link
          to={PATHS.citizen.reports}
          className="text-base font-medium text-green-600 hover:text-green-700 flex items-center transition-all duration-200 hover:translate-x-1 group"
        >
          View all
          <svg className="w-5 h-5 ml-1 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </CardHeader>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50">
              <th className="px-8 py-5 text-sm font-semibold text-gray-500 uppercase tracking-wider">Report</th>
              <th className="px-8 py-5 text-sm font-semibold text-gray-500 uppercase tracking-wider">Created Date</th>
              <th className="px-8 py-5 text-sm font-semibold text-gray-500 uppercase tracking-wider text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {myReports.length ? (
              myReports.map((r) => (
                <ReportRow
                  key={r.id}
                  report={r}
                  onClick={() => navigate(`${PATHS.citizen.reports}/${r.id}`)}
                />
              ))
            ) : (
              <tr>
                <td className="px-8 py-6 text-center text-sm text-gray-500" colSpan={3}>
                  No reports submitted yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
