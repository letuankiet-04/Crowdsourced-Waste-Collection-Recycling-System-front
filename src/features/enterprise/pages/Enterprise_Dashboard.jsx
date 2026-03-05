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
import ReportRow from "../../../shared/ui/ReportRow.jsx";
import { normalizeReportStatus } from "../../../shared/lib/reportStatus.js";
import { getEnterpriseReports } from "../../../services/enterprise.service.js";

export default function EnterpriseDashboard() {
  const { displayName } = useStoredUser();
  const notify = useNotify();
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    getEnterpriseReports()
      .then((rows) => {
        if (cancelled) return;
        setReports(Array.isArray(rows) ? rows : []);
        setError("");
      })
      .catch((err) => {
        if (cancelled) return;
        const message = err?.message || "Unable to load reports.";
        setError(message);
        notify.error("Load reports failed", message);
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [notify]);

  const pendingCount = useMemo(() => {
    return reports.filter((r) => r && normalizeReportStatus(r.status) === "Pending").length;
  }, [reports]);

  const pendingReports = useMemo(() => {
    return reports.filter((r) => r && normalizeReportStatus(r.status) === "Pending").slice(0, 8);
  }, [reports]);

  return (
    <EnterpriseLayout>
      <div className="space-y-8">
        <PageHeader
          title={`Hello, ${displayName}.`}
          description={
            <>
              Welcome back to your dashboard. All systems are operational. You have{" "}
              <span className="font-bold text-emerald-700">{pendingCount}</span> pending requests waiting for review in your region.
            </>
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
              <CardTitle className="text-2xl">Reports</CardTitle>
              <Button as={Link} to={PATHS.enterprise.reports} variant="outline" size="sm" className="rounded-full">
                View all →
              </Button>
            </CardHeader>
            <CardBody className="p-0">
              {error ? <div className="px-8 pt-6 text-sm text-red-600">{error}</div> : null}
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
                    {loading ? (
                      <tr>
                        <td className="px-8 py-8 text-sm text-gray-600" colSpan={4}>
                          Loading requests...
                        </td>
                      </tr>
                    ) : pendingReports.length ? (
                      pendingReports.map((r) => (
                        <ReportRow
                          key={r?.id ?? r?.reportCode ?? r?.code}
                          report={r}
                          showLocation
                          onClick={() => {
                            const reportKey = r?.id ?? r?.reportCode ?? r?.code ?? "";
                            navigate(`${PATHS.enterprise.reports}/${reportKey}`, { state: { report: r } });
                          }}
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
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  disabled={loading}
                  onClick={() => {
                    if (loading) return;
                    setLoading(true);
                    setError("");
                    getEnterpriseReports()
                      .then((rows) => setReports(Array.isArray(rows) ? rows : []))
                      .catch((err) => {
                        const message = err?.message || "Unable to load reports.";
                        setError(message);
                        notify.error("Load reports failed", message);
                      })
                      .finally(() => setLoading(false));
                  }}
                >
                  Refresh requests
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </EnterpriseLayout>
  );
}
