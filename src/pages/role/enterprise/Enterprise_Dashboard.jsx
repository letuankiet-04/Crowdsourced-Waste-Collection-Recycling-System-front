import { useEffect, useMemo, useState } from "react";
import EnterpriseLayout from "./layout/EnterpriseLayout.jsx";
import PageHeader from "../../../components/ui/PageHeader.jsx";
import ActionCard from "../../../components/ui/ActionCard.jsx";
import { Card, CardBody, CardHeader, CardTitle } from "../../../components/ui/Card.jsx";
import Button from "../../../components/ui/Button.jsx";
import useStoredUser from "../../../hooks/useStoredUser.js";
import useNotify from "../../../hooks/useNotify.js";
import { FileText, MessageSquareText, UserPlus, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { PATHS } from "../../../routes/paths.js";
import { subscribeReportSubmitted } from "../../../events/reportEvents.js";
import { getMockReports } from "../../../mock/reportStore.js";

function StatusPill({ children }) {
  return (
    <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold border border-gray-200 bg-gray-50 text-gray-600">
      {children}
    </span>
  );
}

export default function EnterpriseDashboard() {
  const { displayName } = useStoredUser();
  const notify = useNotify();
  const [reports, setReports] = useState(() => getMockReports());

  const pendingReports = useMemo(() => {
    return reports.filter((r) => r && r.status !== "Closed").slice(0, 8);
  }, [reports]);

  useEffect(() => {
    return subscribeReportSubmitted((report) => {
      if (!report) return;
      setReports((prev) => [report, ...prev]);
      notify.info("New request received", `${report.id} · ${report.address || "Unknown location"}`);
    });
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
        />

        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8">
            <ActionCard
              to={PATHS.enterprise.reports}
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
                        <tr key={r.id} className="hover:bg-gray-50/40">
                          <td className="px-8 py-5 text-sm font-semibold text-gray-900">{r.id}</td>
                          <td className="px-8 py-5 text-sm text-gray-600">
                            {r.address || (r.coords ? `${r.coords.lat.toFixed(5)}, ${r.coords.lng.toFixed(5)}` : "Unknown")}
                          </td>
                          <td className="px-8 py-5 text-sm text-gray-600">
                            {r.createdAt ? new Date(r.createdAt).toLocaleString() : "-"}
                          </td>
                          <td className="px-8 py-5 text-sm text-right">
                            <StatusPill>{r.status || "New"}</StatusPill>
                          </td>
                        </tr>
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
                  <StatusPill>New</StatusPill>
                  <StatusPill>Open</StatusPill>
                  <StatusPill>Closed</StatusPill>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </EnterpriseLayout>
  );
}
