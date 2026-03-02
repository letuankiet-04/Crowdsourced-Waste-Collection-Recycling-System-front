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
import StatusPill from "../../../shared/ui/StatusPill.jsx";
import ReportRow from "../../../shared/ui/ReportRow.jsx";
import { normalizeReportStatus } from "../../../shared/lib/reportStatus.js";
import { getEnterpriseReportsPending } from "../../../services/enterprise.service.js";

function normalizeEnterpriseReport(report, index) {
  const raw = report && typeof report === "object" ? report : {};
  const reportCode = raw.reportCode ?? raw.code ?? null;
  const id = reportCode != null ? String(reportCode) : raw.id != null ? String(raw.id) : String(index);
  const latRaw = raw.latitude ?? raw.lat ?? raw.coords?.lat ?? null;
  const lngRaw = raw.longitude ?? raw.lng ?? raw.coords?.lng ?? null;
  const lat = latRaw != null ? Number(latRaw) : null;
  const lng = lngRaw != null ? Number(lngRaw) : null;

  return {
    ...raw,
    id,
    reportId: raw.id ?? raw.reportId ?? null,
    reportCode: reportCode ?? (raw.reportCode != null ? String(raw.reportCode) : id),
    address: raw.address ?? raw.location ?? raw.place ?? "",
    coords: Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : raw.coords ?? null,
    images: Array.isArray(raw.images) ? raw.images : [],
    createdAt: raw.createdAt ?? raw.created_at ?? raw.createdDate ?? null,
    status: raw.status ?? "PENDING",
  };
}

export default function EnterpriseDashboard() {
  const { displayName } = useStoredUser();
  const notify = useNotify();
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  const pendingReports = useMemo(() => {
    return reports.filter((r) => r && normalizeReportStatus(r.status) !== "closed").slice(0, 8);
  }, [reports]);

  useEffect(() => {
    let cancelled = false;

    async function loadReports() {
      setLoading(true);
      setLoadError("");
      try {
        const data = await getEnterpriseReportsPending();
        const list = Array.isArray(data) ? data : data?.items ?? data?.data ?? [];
        const normalized = Array.isArray(list) ? list.map((r, idx) => normalizeEnterpriseReport(r, idx)) : [];
        if (!cancelled) setReports(normalized);
      } catch (err) {
        const message = err?.message || "Không thể tải danh sách report.";
        if (!cancelled) {
          setReports([]);
          setLoadError(message);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadReports();
    return () => {
      cancelled = true;
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
                          {loading ? "Đang tải..." : loadError ? loadError : "Chưa có yêu cầu nào."}
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
                  onClick={async () => {
                    setLoading(true);
                    setLoadError("");
                    try {
                      const data = await getEnterpriseReportsPending();
                      const list = Array.isArray(data) ? data : data?.items ?? data?.data ?? [];
                      const normalized = Array.isArray(list) ? list.map((r, idx) => normalizeEnterpriseReport(r, idx)) : [];
                      setReports(normalized);
                    } catch (err) {
                      setReports([]);
                      setLoadError(err?.message || "Không thể tải danh sách report.");
                    } finally {
                      setLoading(false);
                    }
                  }}
                >
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
