import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import EnterpriseLayout from "./layout/EnterpriseLayout.jsx";
import ReportDetail from "../../../shared/layout/Report_Detail.jsx";
import { getMockReports, updateMockReport } from "../../../mock/reportStore.js";
import { publishReportUpdated, subscribeReportDeleted, subscribeReportUpdated, subscribeReportsCleared } from "../../../events/reportEvents.js";
import { normalizeReportStatus, reportStatusToPillVariant } from "../../../shared/lib/reportStatus.js";
import StatusPill from "../../../shared/ui/StatusPill.jsx";
import { Card, CardBody, CardHeader, CardTitle } from "../../../shared/ui/Card.jsx";
import Button from "../../../shared/ui/Button.jsx";
import { PATHS } from "../../../app/routes/paths.js";
import { CheckCircle2, Users, X, XCircle } from "lucide-react";
import { getEnterpriseCollectors } from "../../../services/enterprise.service.js";

function normalizeCollectors(payload) {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];
  const maybeList = payload.collectors ?? payload.items ?? payload.data ?? payload.users ?? payload.result ?? payload.content ?? [];
  return Array.isArray(maybeList) ? maybeList : [];
}

export default function EnterpriseReportDetail() {
  const { reportId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const id = reportId ? String(reportId) : "";
  const stateReport = location?.state?.report ?? null;

  const storedReport = useMemo(() => {
    if (!id) return null;
    const list = getMockReports();
    if (!Array.isArray(list)) return null;
    return list.find((r) => r && r.id === id) ?? null;
  }, [id]);

  const [reportOverride, setReportOverride] = useState(null);

  useEffect(() => {
    const unsubUpdated = subscribeReportUpdated((nextReport) => {
      if (!nextReport || !nextReport.id) return;
      if (nextReport.id !== id) return;
      setReportOverride(nextReport);
    });
    const unsubDeleted = subscribeReportDeleted((deletedId) => {
      if (!deletedId) return;
      if (deletedId !== id) return;
      setReportOverride(null);
    });
    const unsubCleared = subscribeReportsCleared(() => setReportOverride(null));
    return () => {
      unsubUpdated();
      unsubDeleted();
      unsubCleared();
    };
  }, [id]);

  const report =
    reportOverride?.id === id ? reportOverride : stateReport?.id && String(stateReport.id) === id ? stateReport : storedReport;
  const status = normalizeReportStatus(report?.status);
  const canDecide = status === "pending";
  const canGoAssign = status === "accepted";

  const [collectorSource, setCollectorSource] = useState([]);
  const [collectorsLoading, setCollectorsLoading] = useState(false);
  const [collectorsError, setCollectorsError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadCollectors() {
      setCollectorsLoading(true);
      setCollectorsError("");
      try {
        const data = await getEnterpriseCollectors();
        const list = normalizeCollectors(data);
        if (!cancelled) setCollectorSource(list);
      } catch (err) {
        const message = err?.message || "Unable to load collectors. Please try again.";
        if (!cancelled) {
          setCollectorSource([]);
          setCollectorsError(message);
        }
      } finally {
        if (!cancelled) setCollectorsLoading(false);
      }
    }

    loadCollectors();
    return () => {
      cancelled = true;
    };
  }, []);

  function getAssignedEmailsFromReport(r) {
    const many = Array.isArray(r?.assignedCollectors) ? r.assignedCollectors : [];
    const manyEmails = many.map((c) => c?.email).filter(Boolean);
    if (manyEmails.length) return manyEmails;
    const singleEmail = r?.assignedCollector?.email ?? r?.assignedCollectorEmail ?? r?.collectorEmail ?? null;
    return singleEmail ? [singleEmail] : [];
  }

  const collectors = useMemo(() => {
    const list = Array.isArray(collectorSource) ? collectorSource : [];
    return list
      .map((c, idx) => {
        const id = c?.id ?? c?._id ?? c?.collectorId ?? idx;
        const name = c?.name ?? c?.username ?? c?.displayName ?? c?.fullName ?? c?.email ?? `Collector ${idx + 1}`;
        const email = c?.email ?? c?.mail ?? null;
        const statusRaw = String(c?.status ?? c?.availability ?? (c?.online ? "online" : "offline")).toLowerCase();
        const isOnline = c?.online === true || ["online", "active", "available"].includes(statusRaw);
        return { id, name, email, isOnline };
      })
      .filter((c) => Boolean(c.email));
  }, [collectorSource]);

  const assignedEmails = useMemo(() => getAssignedEmailsFromReport(report), [report]);
  const assignedLabel = useMemo(() => {
    if (!assignedEmails.length) return null;
    const labels = assignedEmails.map((email) => {
      const match = collectors.find((c) => c.email === email);
      return match?.name ? `${match.name} (${email})` : email;
    });
    return labels.join(", ");
  }, [assignedEmails, collectors]);
  const [assignOpen, setAssignOpen] = useState(false);
  const [selectedCollectorEmails, setSelectedCollectorEmails] = useState([]);

  function openAssignDialog(nextReport) {
    const r = nextReport ?? report;
    setSelectedCollectorEmails(getAssignedEmailsFromReport(r));
    setAssignOpen(true);
  }

  return (
    <EnterpriseLayout>
      <div className="space-y-8">
        <ReportDetail
          report={report}
          backTo={PATHS.enterprise.reports}
          title="Report Detail"
          description={id ? `Viewing report: ${id}` : "Viewing report"}
          backLabel="Back to reports"
        />

        <Card className="overflow-hidden bg-gradient-to-br from-emerald-50/70 via-white to-white">
          <CardHeader className="py-6 px-8">
            <div className="min-w-0">
              <CardTitle className="text-2xl">Decision</CardTitle>
              <div className="mt-1 text-sm text-gray-600">
                Review this report and choose to accept or reject. Decisions can be made only while the report is pending.
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-xs text-gray-500">
                {report?.updatedAt ? `Updated ${new Date(report.updatedAt).toLocaleString()}` : report?.createdAt ? `Created ${new Date(report.createdAt).toLocaleString()}` : null}
              </div>
              <StatusPill variant={reportStatusToPillVariant(status)}>{status}</StatusPill>
            </div>
          </CardHeader>
          <CardBody className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 items-center">
              <div className="rounded-2xl border border-emerald-100 bg-white/70 p-5">
                <div className="text-sm font-semibold text-gray-900">What happens next</div>
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-700">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-700 mt-0.5" aria-hidden="true" />
                    <div>
                      <div className="font-semibold text-gray-900">Accept</div>
                      <div className="text-gray-600">Marks the report as accepted for processing.</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <XCircle className="h-5 w-5 text-red-700 mt-0.5" aria-hidden="true" />
                    <div>
                      <div className="font-semibold text-gray-900">Reject</div>
                      <div className="text-gray-600">Marks the report as rejected.</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap justify-end gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-full border-red-600 text-red-700 hover:bg-red-50"
                  disabled={!report || !canDecide}
                  onClick={() => {
                    if (!report || !canDecide) return;
                    const ok = window.confirm("Reject this report?");
                    if (!ok) return;
                    const next = { ...report, status: "rejected", updatedAt: new Date().toISOString() };
                    updateMockReport(next);
                    publishReportUpdated(next);
                    setReportOverride(next);
                    navigate(PATHS.enterprise.dashboard, { replace: true });
                  }}
                >
                  <XCircle className="h-5 w-5" aria-hidden="true" />
                  Reject
                </Button>
                <Button
                  size="lg"
                  className="rounded-full"
                  disabled={!report || !canDecide}
                  onClick={() => {
                    if (!report || !canDecide) return;
                    const next = { ...report, status: "accepted", updatedAt: new Date().toISOString() };
                    updateMockReport(next);
                    publishReportUpdated(next);
                    setReportOverride(next);
                    openAssignDialog(next);
                  }}
                >
                  <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                  Accept
                </Button>
              </div>
            </div>

            {!canDecide && report ? (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500">
                <div>This report is already {status}. Accept/Reject is available only while status is pending.</div>
                {canGoAssign ? (
                  <Button variant="outline" size="sm" className="rounded-full" onClick={() => openAssignDialog()}>
                    Assign collector
                  </Button>
                ) : null}
              </div>
            ) : null}
          </CardBody>
        </Card>

        {assignOpen ? (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8"
            role="dialog"
            aria-modal="true"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setAssignOpen(false);
            }}
          >
            <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-black/5">
              <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-gray-100">
                <div className="min-w-0">
                  <div className="text-lg font-semibold text-gray-900">Assign Collector</div>
                  <div className="mt-1 text-sm text-gray-600">Select a collector for {report?.id ?? "-"}. </div>
                </div>
                <button
                  type="button"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full text-gray-600 hover:bg-gray-50"
                  onClick={() => setAssignOpen(false)}
                  aria-label="Close"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              <div className="px-6 py-6 space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="text-sm text-gray-700">
                    Current status: <span className="font-semibold text-gray-900">{status}</span>
                  </div>
                  <StatusPill variant={reportStatusToPillVariant(status)}>{status}</StatusPill>
                </div>

                {assignedEmails.length ? (
                  <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-700">
                    Currently assigned to <span className="font-semibold text-gray-900">{assignedLabel}</span>.
                  </div>
                ) : null}

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-semibold text-gray-900">Collectors</div>
                    <button
                      type="button"
                      className="text-xs font-semibold text-indigo-700 hover:underline disabled:opacity-60"
                      disabled={!report || !canGoAssign || collectorsLoading || !collectors.length}
                      onClick={() => setSelectedCollectorEmails(collectors.map((c) => c.email))}
                    >
                      Select all
                    </button>
                  </div>
                  {collectorsError ? <div className="text-sm text-red-600">{collectorsError}</div> : null}
                  <div className="max-h-64 overflow-auto rounded-2xl border border-gray-200 bg-white">
                    {collectorsLoading ? (
                      <div className="px-4 py-5 text-sm text-gray-600">Loading collectors...</div>
                    ) : collectors.length ? (
                      collectors.map((c) => {
                        const checked = selectedCollectorEmails.includes(c.email);
                        return (
                          <label
                            key={c.email}
                            className="flex cursor-pointer items-center justify-between gap-4 px-4 py-3 text-sm text-gray-900 hover:bg-gray-50"
                          >
                            <div className="min-w-0">
                              <div className="truncate font-semibold">{c.name}</div>
                              <div className="truncate text-xs text-gray-600">{c.email}</div>
                            </div>
                            <input
                              type="checkbox"
                              className="h-4 w-4"
                              checked={checked}
                              disabled={!report || !canGoAssign}
                              onChange={() => {
                                setSelectedCollectorEmails((prev) => {
                                  if (prev.includes(c.email)) return prev.filter((e) => e !== c.email);
                                  return [...prev, c.email];
                                });
                              }}
                            />
                          </label>
                        );
                      })
                    ) : (
                      <div className="px-4 py-5 text-sm text-gray-600">No collectors available.</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-3 px-6 py-5 border-t border-gray-100">
                <Button variant="outline" size="sm" className="rounded-full" onClick={() => setAssignOpen(false)}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="rounded-full"
                  disabled={!report || !canGoAssign || !selectedCollectorEmails.length}
                  onClick={() => {
                    if (!report || !canGoAssign) return;
                    const selectedCollectors = collectors.filter((c) => selectedCollectorEmails.includes(c.email));
                    if (!selectedCollectors.length) return;
                    const ok = window.confirm("Assign this report to selected collectors?");
                    if (!ok) return;
                    const primaryCollector = selectedCollectors[0];
                    const next = {
                      ...report,
                      assignedCollector: { id: primaryCollector.id, name: primaryCollector.name, email: primaryCollector.email },
                      assignedCollectors: selectedCollectors.map((c) => ({ id: c.id, name: c.name, email: c.email })),
                      updatedAt: new Date().toISOString(),
                    };
                    updateMockReport(next);
                    publishReportUpdated(next);
                    setReportOverride(next);
                    setAssignOpen(false);
                    navigate(PATHS.enterprise.dashboard, { replace: true });
                  }}
                >
                  <Users className="h-5 w-5" aria-hidden="true" />
                  Assign
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </EnterpriseLayout>
  );
}
