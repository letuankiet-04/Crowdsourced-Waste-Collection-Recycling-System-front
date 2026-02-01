import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle } from "../../../../components/ui/Card.jsx";
import useStoredUser from "../../../../hooks/useStoredUser.js";
import { subscribeReportSubmitted, subscribeReportsCleared } from "../../../../events/reportEvents.js";
import { getMockReports } from "../../../../mock/reportStore.js";
import StatusPill from "../../../../components/ui/StatusPill.jsx";
import { normalizeReportStatus, reportStatusToPillVariant } from "../../../../lib/reportStatus.js";
import { PATHS } from "../../../../routes/paths.js";

export default function RecentReports() {
  const { user } = useStoredUser();
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
      setReports((prev) => [report, ...prev]);
    });
    const unsubCleared = subscribeReportsCleared(() => setReports([]));
    return () => {
      unsubSubmitted();
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
              <th className="px-8 py-5 text-sm font-semibold text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {myReports.length ? (
              myReports.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50/40">
                  <td className="px-8 py-5 text-sm font-semibold text-gray-900">{r.id}</td>
                  <td className="px-8 py-5 text-sm text-gray-600">
                    {r.createdAt ? new Date(r.createdAt).toLocaleString() : "-"}
                  </td>
                  <td className="px-8 py-5 text-sm">
                    <StatusPill variant={reportStatusToPillVariant(r.status)}>{normalizeReportStatus(r.status)}</StatusPill>
                  </td>
                </tr>
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
