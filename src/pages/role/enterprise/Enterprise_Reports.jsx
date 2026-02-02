import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import EnterpriseLayout from "./layout/EnterpriseLayout.jsx";
import PageHeader from "../../../components/ui/PageHeader.jsx";
import { Card, CardBody, CardHeader, CardTitle } from "../../../components/ui/Card.jsx";
import StatusPill from "../../../components/ui/StatusPill.jsx";
import {
  subscribeReportDeleted,
  subscribeReportSubmitted,
  subscribeReportsCleared,
  subscribeReportUpdated,
} from "../../../events/reportEvents.js";
import { clearMockReports, deleteMockReport, getMockReports, upsertMockReport } from "../../../mock/reportStore.js";
import { normalizeReportStatus, reportStatusToPillVariant } from "../../../lib/reportStatus.js";
import { PATHS } from "../../../routes/paths.js";

export default function EnterpriseReports() {
  const navigate = useNavigate();
  const [reports, setReports] = useState(() => getMockReports());

  const ordered = useMemo(() => {
    const list = Array.isArray(reports) ? reports : [];
    return [...list].sort((a, b) => {
      const ta = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tb = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
      return tb - ta;
    });
  }, [reports]);

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
    <EnterpriseLayout>
      <div className="space-y-8">
        <PageHeader title="Reports" description="Review incoming reports and take actions." />
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
                  {ordered.length ? (
                    ordered.map((r) => (
                      <tr
                        key={r.id}
                        className="hover:bg-gray-50/40 cursor-pointer"
                        onClick={() => navigate(`${PATHS.enterprise.reports}/${r.id}`, { state: { report: r } })}
                      >
                        <td className="px-8 py-5 text-sm font-semibold text-gray-900">{r.id}</td>
                        <td className="px-8 py-5 text-sm text-gray-600">
                          {r.address || (r.coords ? `${r.coords.lat.toFixed(5)}, ${r.coords.lng.toFixed(5)}` : "Unknown")}
                        </td>
                        <td className="px-8 py-5 text-sm text-gray-600">{r.createdAt ? new Date(r.createdAt).toLocaleString() : "-"}</td>
                        <td className="px-8 py-5 text-sm text-right">
                          <StatusPill variant={reportStatusToPillVariant(r.status)}>{normalizeReportStatus(r.status)}</StatusPill>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="px-8 py-8 text-sm text-gray-600" colSpan={4}>
                        No reports yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      </div>
    </EnterpriseLayout>
  );
}
