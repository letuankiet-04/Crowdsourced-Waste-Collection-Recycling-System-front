import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import EnterpriseLayout from "./layout/EnterpriseLayout.jsx";
import ReportDetail from "../../../shared/layout/Report_Detail.jsx";
import { createNotification } from "../../../services/notifications.js";
import { normalizeReportStatus, reportStatusToPillVariant } from "../../../shared/lib/reportStatus.js";
import StatusPill from "../../../shared/ui/StatusPill.jsx";
import { Card, CardBody, CardHeader, CardTitle } from "../../../shared/ui/Card.jsx";
import Button from "../../../shared/ui/Button.jsx";
import { PATHS } from "../../../app/routes/paths.js";
import { CheckCircle2, Users, X, XCircle } from "lucide-react";
import PageHeader from "../../../shared/ui/PageHeader.jsx";
import useNotify from "../../../shared/hooks/useNotify.js";
import useStoredUser from "../../../shared/hooks/useStoredUser.js";
import {
  acceptWasteReport,
  assignCollectorByReportCode,
  assignCollectorToRequest,
  getEnterpriseCollectors,
  getEnterpriseWasteReportById,
  rejectWasteReport,
} from "../../../services/enterprise.service.js";

export default function EnterpriseReportDetail() {
  const { reportId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const notify = useNotify();
  const { user } = useStoredUser();
  const id = reportId ? String(reportId) : "";
  const stateReport = location?.state?.report ?? null;

  const [reportOverride, setReportOverride] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState("");

  const report = reportOverride ?? reportData ?? (stateReport?.id && String(stateReport.id) === id ? stateReport : null);
  const status = normalizeReportStatus(report?.status);
  const canDecide = status === "Pending";
  const canGoAssign = status === "Accepted";

  const [collectorSource, setCollectorSource] = useState([]);
  const [collectorsLoading, setCollectorsLoading] = useState(false);
  const [collectorsError, setCollectorsError] = useState("");

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setReportLoading(true);
    setReportError("");
    getEnterpriseWasteReportById(id)
      .then((row) => {
        if (cancelled) return;
        setReportData(row ?? null);
      })
      .catch((err) => {
        if (cancelled) return;
        const message = err?.message || "Unable to load report.";
        setReportError(message);
        notify.error("Load report failed", message);
      })
      .finally(() => {
        if (cancelled) return;
        setReportLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, notify]);

  useEffect(() => {
    let cancelled = false;
    setCollectorsLoading(true);
    setCollectorsError("");
    getEnterpriseCollectors()
      .then((rows) => {
        if (cancelled) return;
        setCollectorSource(Array.isArray(rows) ? rows : []);
      })
      .catch((err) => {
        if (cancelled) return;
        const message = err?.message || "Unable to load collectors.";
        setCollectorsError(message);
        notify.error("Load collectors failed", message);
      })
      .finally(() => {
        if (cancelled) return;
        setCollectorsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [notify]);

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
  
  // Rejection Reason Modal
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  function openAssignDialog(nextReport) {
    const r = nextReport ?? report;
    setSelectedCollectorEmails(getAssignedEmailsFromReport(r));
    setAssignOpen(true);
  }

  function getReportCodeFromReport(r) {
    return String(r?.reportCode ?? r?.code ?? r?.id ?? "").trim();
  }

  function getRequestIdFromReport(r) {
    const raw = r?.collectionRequestId ?? r?.requestId ?? r?.collection_request_id ?? null;
    if (raw === null || raw === undefined || raw === "") return null;
    const n = typeof raw === "number" ? raw : Number(raw);
    return Number.isFinite(n) ? n : raw;
  }

  const handleRejectSubmit = async () => {
    if (!report || !canDecide) return;
    if (!rejectionReason.trim()) {
      alert("Rejection reason is required.");
      return;
    }
    
    const next = { 
      ...report, 
      status: "rejected", 
      updatedAt: new Date().toISOString(),
      rejectionReason: rejectionReason 
    };
    
    updateMockReport(next);
    publishReportUpdated(next);
    setReportOverride(next);
    
    // Notify Citizen
    await createNotification({
      receiverId: report.createdBy, // email or id
      senderId: 2, // Enterprise
      reportId: report.id,
      type: 'REPORT_REJECTED',
      message: 'Your report has been rejected.',
      reason: rejectionReason
    });

    setRejectOpen(false);
    navigate(PATHS.enterprise.dashboard, { replace: true });
  };

  return (
    <EnterpriseLayout>
      <div className="space-y-8">
        {reportLoading && !report ? (
          <div className="space-y-8">
            <PageHeader
              title="Report Detail"
              description={id ? `Loading report: ${id}` : "Loading report"}
              right={
                <Button as={Link} to={PATHS.enterprise.reports} variant="outline" size="sm" className="rounded-full">
                  Back to reports
                </Button>
              }
            />
            <Card>
              <CardBody className="p-8">
                <div className="text-gray-900 font-semibold">Loading report...</div>
                <div className="mt-2 text-gray-600 text-sm">Please wait while we fetch report details.</div>
              </CardBody>
            </Card>
          </div>
        ) : null}

        {!reportLoading || report ? (
        <ReportDetail report={report} backTo={PATHS.enterprise.reports} title="Report Detail" description={id ? `Viewing report: ${id}` : "Viewing report"} backLabel="Back to reports" />
        ) : null}
        {reportError && !reportLoading ? <div className="text-sm text-red-600">{reportError}</div> : null}

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
                  onClick={async () => {
                    if (!report || !canDecide) return;
                    const reason = window.prompt("Please enter the reason for rejection:");
                    if (reason === null) return; // Cancelled
                    if (!reason.trim()) {
                      alert("Rejection reason is required.");
                      return;
                    }
                    const reportCode = getReportCodeFromReport(report);
                    if (!reportCode) {
                      notify.error("Missing report code", "Unable to identify report code for this report.");
                      return;
                    }

                    try {
                      const updated = await notify.promise(rejectWasteReport({ reportCode, reason: reason.trim() }), {
                        loadingTitle: "Rejecting report...",
                        loadingMessage: "Sending rejection to the server.",
                        successTitle: "Report rejected",
                        successMessage: "The report has been rejected.",
                        errorTitle: "Reject failed",
                        errorMessage: (err) => err?.message || "Unable to reject this report.",
                      });
                      const next = updated ?? {
                        ...report,
                        status: "rejected",
                        updatedAt: new Date().toISOString(),
                        rejectionReason: reason.trim(),
                      };
                      setReportOverride(next);
                      setReportData(next);
                      setReportError("");

                      const senderId = user?.id ?? user?._id ?? user?.userId ?? 2;
                      try {
                        await createNotification({
                          receiverId: report.createdBy,
                          senderId,
                          reportId: report.id,
                          type: "REPORT_REJECTED",
                          message: "Your report has been rejected.",
                          reason: reason.trim(),
                        });
                      } catch {}
                      navigate(PATHS.enterprise.dashboard, { replace: true });
                    } catch {}
                  onClick={() => {
                    setRejectionReason("");
                    setRejectOpen(true);
                  }}
                >
                  <XCircle className="h-5 w-5" aria-hidden="true" />
                  Reject
                </Button>
                <Button
                  size="lg"
                  className="rounded-full"
                  disabled={!report || !canDecide}
                  onClick={async () => {
                    if (!report || !canDecide) return;
                    const reportCode = getReportCodeFromReport(report);
                    if (!reportCode) {
                      notify.error("Missing report code", "Unable to identify report code for this report.");
                      return;
                    }

                    try {
                      const updated = await notify.promise(acceptWasteReport({ reportCode }), {
                        loadingTitle: "Accepting report...",
                        loadingMessage: "Sending acceptance to the server.",
                        successTitle: "Report accepted",
                        successMessage: "You can now assign a collector.",
                        errorTitle: "Accept failed",
                        errorMessage: (err) => err?.message || "Unable to accept this report.",
                      });
                      const next = updated ?? { ...report, status: "accepted", updatedAt: new Date().toISOString() };
                      setReportOverride(next);
                      setReportData(next);
                      setReportError("");

                      const senderId = user?.id ?? user?._id ?? user?.userId ?? 2;
                      try {
                        await createNotification({
                          receiverId: report.createdBy,
                          senderId,
                          reportId: report.id,
                          type: "REPORT_ACCEPTED",
                          message: "Your report has been accepted.",
                        });
                      } catch {}

                      openAssignDialog(next);
                    } catch {}
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

        {/* Rejection Modal */}
        {rejectOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8"
            role="dialog"
            aria-modal="true"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setRejectOpen(false);
            }}
          >
            <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-black/5">
              <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-gray-100">
                <div className="min-w-0">
                  <div className="text-lg font-semibold text-gray-900">Reject Report</div>
                  <div className="mt-1 text-sm text-gray-600">Please provide a reason for rejecting this report.</div>
                </div>
                <button
                  type="button"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full text-gray-600 hover:bg-gray-50"
                  onClick={() => setRejectOpen(false)}
                  aria-label="Close"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              <div className="px-6 py-6">
                <label htmlFor="rejection-reason" className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Rejection
                </label>
                <textarea
                  id="rejection-reason"
                  rows={4}
                  className="w-full rounded-xl border border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-3"
                  placeholder="e.g., Image unclear, Location mismatch, Duplicate report..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                />
              </div>

              <div className="flex flex-wrap items-center justify-end gap-3 px-6 py-5 border-t border-gray-100">
                <Button variant="outline" size="sm" className="rounded-full" onClick={() => setRejectOpen(false)}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="rounded-full bg-red-600 hover:bg-red-700 text-white border-transparent"
                  onClick={handleRejectSubmit}
                  disabled={!rejectionReason.trim()}
                >
                  Confirm Rejection
                </Button>
              </div>
            </div>
          </div>
        )}

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
                  onClick={async () => {
                    if (!report || !canGoAssign) return;
                    const selectedCollectors = collectors.filter((c) => selectedCollectorEmails.includes(c.email));
                    if (!selectedCollectors.length) return;
                    const ok = window.confirm("Assign this report to selected collectors?");
                    if (!ok) return;
                    const primaryCollector = selectedCollectors[0];
                    const reportCode = getReportCodeFromReport(report);
                    if (!reportCode) {
                      notify.error("Missing report code", "Unable to identify report code for this report.");
                      return;
                    }

                    try {
                      const requestId = getRequestIdFromReport(report);
                      const assignPromise =
                        requestId != null
                          ? assignCollectorToRequest({ requestId, collectorId: primaryCollector.id })
                          : assignCollectorByReportCode({ reportCode, collectorId: primaryCollector.id });
                      await notify.promise(assignPromise, {
                        loadingTitle: "Assigning collector...",
                        loadingMessage: "Sending assignment to the server.",
                        successTitle: "Collector assigned",
                        successMessage: "Assignment saved successfully.",
                        errorTitle: "Assign failed",
                        errorMessage: (err) => err?.message || "Unable to assign collector.",
                      });

                      const next = {
                        ...report,
                        assignedCollector: { id: primaryCollector.id, name: primaryCollector.name, email: primaryCollector.email },
                        assignedCollectors: selectedCollectors.map((c) => ({ id: c.id, name: c.name, email: c.email })),
                        updatedAt: new Date().toISOString(),
                      };
                      setReportOverride(next);
                      setReportData(next);
                      setAssignOpen(false);
                      navigate(PATHS.enterprise.dashboard, { replace: true });
                    } catch {}
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
