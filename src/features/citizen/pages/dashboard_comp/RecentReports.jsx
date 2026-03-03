import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle } from "../../../../shared/ui/Card.jsx";
import useNotify from "../../../../shared/hooks/useNotify.js";
import ReportRow from "../../../../shared/ui/ReportRow.jsx";
import { PATHS } from "../../../../app/routes/paths.js";
import { getMyReports } from "../../../../services/reports.service.js";

function toTime(value) {
  if (!value) return 0;
  const t = new Date(value).getTime();
  return Number.isFinite(t) ? t : 0;
}

export default function RecentReports() {
  const navigate = useNavigate();
  const notify = useNotify();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const myReports = useMemo(() => {
    const list = Array.isArray(reports) ? reports : [];
    return list
      .slice()
      .sort((a, b) => toTime(b?.createdAt) - toTime(a?.createdAt))
      .slice(0, 5);
  }, [reports]);

  useEffect(() => {
    let cancelled = false;
    getMyReports()
      .then((rows) => {
        if (cancelled) return;
        setReports(Array.isArray(rows) ? rows : []);
      })
      .catch((err) => notify.error("Load reports failed", err?.message || "Unable to load reports."))
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [notify]);

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
                  {loading ? "Loading..." : "No reports submitted yet."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
