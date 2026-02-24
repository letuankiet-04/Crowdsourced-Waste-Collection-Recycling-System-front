import { useMemo } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./CD_Navbar";
import CD_Footer from "../../../shared/layout/CD_Footer.jsx";
import RoleLayout from "../../../shared/layout/RoleLayout.jsx";
import ReportDetail from "../../../shared/layout/Report_Detail.jsx";
import Button from "../../../shared/ui/Button.jsx";
import StatusPill from "../../../shared/ui/StatusPill.jsx";
import { Card, CardBody, CardHeader, CardTitle } from "../../../shared/ui/Card.jsx";
import useStoredUser from "../../../shared/hooks/useStoredUser.js";
import { deleteMockReport, getMockReports } from "../../../mock/reportStore.js";
import { publishReportDeleted } from "../../../events/reportEvents.js";
import { normalizeReportStatus, reportStatusToPillVariant } from "../../../shared/lib/reportStatus.js";
import { PATHS } from "../../../app/routes/paths.js";

export default function CitizenReportDetail() {
  const { reportId } = useParams();
  const { user } = useStoredUser();
  const navigate = useNavigate();

  const report = useMemo(() => {
    const id = reportId ? String(reportId) : "";
    if (!id) return null;

    const list = getMockReports();
    if (!Array.isArray(list)) return null;

    return list.find((r) => r && r.id === id) ?? null;
  }, [reportId]);

  const me = user?.email ?? null;

  if (report && me && report.createdBy && report.createdBy !== me) {
    return <Navigate to={PATHS.unauthorized} replace />;
  }

  const status = normalizeReportStatus(report?.status);
  const canManage = status === "pending";
  const stepIndex =
    status === "pending"
      ? 0
      : status === "accepted"
        ? 1
        : status === "on the way"
          ? 2
          : status === "collected"
            ? 3
            : 0;

  const steps = [
    { label: "Pending Review", sub: report?.createdAt ? new Date(report.createdAt).toLocaleString() : null },
    { label: "Accepted", sub: "Processing report details..." },
    { label: "Assign Collector", sub: "Awaiting unit assignment" },
    { label: "Collected", sub: "Final verification step" },
  ];

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
        <ReportDetail
          report={report}
          backTo={PATHS.citizen.reports}
          title="Report Detail"
          description={reportId ? `Viewing report: ${reportId}` : "Viewing report"}
          backLabel="Back to reports"
          aside={
            <>
              <Card className="overflow-hidden">
                <CardHeader className="py-6 px-8">
                  <CardTitle className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Report Status</CardTitle>
                </CardHeader>
                <CardBody className="px-8 pb-8 pt-0">
                  <div className="flex items-center gap-3">
                    <StatusPill variant={reportStatusToPillVariant(status)}>{status}</StatusPill>
                    <div className="text-xs text-gray-500">{report?.updatedAt ? `Updated: ${new Date(report.updatedAt).toLocaleString()}` : null}</div>
                  </div>

                  {status === "rejected" && report?.rejectionReason ? (
                    <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-800">
                      <span className="font-semibold">Reason for rejection:</span> {report.rejectionReason}
                    </div>
                  ) : null}

                  <div className="mt-6 space-y-5">
                    {steps.map((s, idx) => {
                      const done = idx < stepIndex;
                      const active = idx === stepIndex;
                      return (
                        <div key={s.label} className="flex items-start gap-3">
                          <div className="mt-1.5">
                            <div
                              className={[
                                "h-5 w-5 rounded-full border flex items-center justify-center",
                                done ? "bg-emerald-600 border-emerald-600" : active ? "bg-emerald-50 border-emerald-500" : "bg-white border-gray-200",
                              ].join(" ")}
                            >
                              {done ? <div className="h-2 w-2 bg-white rounded-full" /> : active ? <div className="h-2 w-2 bg-emerald-600 rounded-full" /> : null}
                            </div>
                            {idx !== steps.length - 1 ? (
                              <div className={["mx-auto w-px h-8", done ? "bg-emerald-200" : "bg-gray-200"].join(" ")} />
                            ) : null}
                          </div>
                          <div className="min-w-0">
                            <div className={["text-sm font-semibold", active ? "text-gray-900" : "text-gray-800"].join(" ")}>{s.label}</div>
                            {s.sub ? <div className="text-xs text-gray-500 mt-1">{s.sub}</div> : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardBody>
              </Card>
              
              <Card className="overflow-hidden">
                <CardHeader className="py-6 px-8">
                  <CardTitle className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Manage Report</CardTitle>
                </CardHeader>
                <CardBody className="px-8 pb-8 pt-0 space-y-3">
                  <Button
                    className="w-full rounded-xl"
                    disabled={!report || !canManage}
                    onClick={() => {
                      if (!report || !canManage) return;
                      navigate(PATHS.citizen.createReport, { state: { editReport: report } });
                    }}
                  >
                    Update Details
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full rounded-xl border-red-600 text-red-700 hover:bg-red-50"
                    disabled={!report || !canManage}
                    onClick={() => {
                      if (!report || !canManage) return;
                      const ok = window.confirm("Remove this report?");
                      if (!ok) return;
                      deleteMockReport(report.id);
                      publishReportDeleted(report.id);
                      navigate(PATHS.citizen.reports);
                    }}
                  >
                    Remove Report
                  </Button>
                  <div className="text-xs text-gray-500 text-center">
                    Reports can only be updated while in Pending or Accepted status.
                  </div>
                </CardBody>
              </Card>
            </>
          }
        />
      </div>
    </RoleLayout>
  );
}
