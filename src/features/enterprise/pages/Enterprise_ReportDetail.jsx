import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import EnterpriseLayout from "../layouts/EnterpriseLayout.jsx";
import ReportDetail from "../../../shared/layout/Report_Detail.jsx";
import { createNotification } from "../../../services/notifications.js";
import { normalizeReportStatus, reportStatusToPillVariant } from "../../../shared/lib/reportStatus.js";
import { lockBodyScroll, unlockBodyScroll } from "../../../shared/lib/lockBodyScroll.js";
import StatusPill from "../../../shared/ui/StatusPill.jsx";
import { Card, CardBody, CardHeader, CardTitle } from "../../../shared/ui/Card.jsx";
import Button from "../../../shared/ui/Button.jsx";
import ConfirmDialog from "../../../shared/ui/ConfirmDialog.jsx";
import { PATHS } from "../../../app/routes/paths.js";
import { CheckCircle2, Users, X, XCircle } from "lucide-react";
import PageHeader from "../../../shared/ui/PageHeader.jsx";
import useNotify from "../../../shared/hooks/useNotify.js";
import useStoredUser from "../../../shared/hooks/useStoredUser.js";
import { getRejectedCollectorsFromReport, resolveEnterpriseReport } from "./enterpriseReportDetail.utils.js";
import {
  acceptWasteReport,
  assignCollectorByReportCode,
  assignCollectorToRequest,
  getEligibleCollectorsForRequest,
  getEnterpriseCollectors,
  getEnterpriseRequestReportDetail,
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

  const report = useMemo(() => {
    return resolveEnterpriseReport({ id, reportOverride, reportData, stateReport });
  }, [reportOverride, reportData, stateReport, id]);
  const [requestDetail, setRequestDetail] = useState(null);
  const [requestDetailLoading, setRequestDetailLoading] = useState(false);
  const reportRequestIdRaw = report?.collectionRequestId ?? report?.requestId ?? report?.collection_request_id ?? null;

  useEffect(() => {
    const requestId =
      reportRequestIdRaw === null || reportRequestIdRaw === undefined || reportRequestIdRaw === ""
        ? null
        : typeof reportRequestIdRaw === "number"
          ? reportRequestIdRaw
          : Number.isFinite(Number(reportRequestIdRaw))
            ? Number(reportRequestIdRaw)
            : reportRequestIdRaw;
    if (requestId == null) {
      setRequestDetail(null);
      setRequestDetailLoading(false);
      return;
    }
    let cancelled = false;
    setRequestDetailLoading(true);
    getEnterpriseRequestReportDetail(requestId)
      .then((row) => {
        if (cancelled) return;
        setRequestDetail(row ?? null);
      })
      .catch(() => {
        if (cancelled) return;
        setRequestDetail(null);
      })
      .finally(() => {
        if (cancelled) return;
        setRequestDetailLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [reportRequestIdRaw]);

  const status = normalizeReportStatus(requestDetail?.requestStatus ?? report?.status);
  const canDecide = status === "Pending";
  const canGoAssign = status === "Accepted" || status === "Reassign";
  const isReassign = status === "Reassign";
  const assignActionLabel = isReassign ? "Reassign collector" : "Assign collector";
  const assignDialogTitle = isReassign ? "Reassign Collector" : "Assign Collector";
  const assignConfirmTitle = isReassign
    ? "Are you sure you want to reassign this report?"
    : "Are you sure you want to assign this report?";
  const assignConfirmDescription = isReassign
    ? "If you continue, the report will be reassigned to the selected collector."
    : "If you continue, the report will be assigned to the selected collector.";
  const assignConfirmText = isReassign ? "Reassign" : "Assign";

  const [collectorSource, setCollectorSource] = useState([]);
  const [collectorsLoading, setCollectorsLoading] = useState(false);
  const [collectorsError, setCollectorsError] = useState("");
  const [eligibleCollectorSource, setEligibleCollectorSource] = useState([]);
  const [eligibleCollectorsLoading, setEligibleCollectorsLoading] = useState(false);

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

  const rejected = useMemo(() => getRejectedCollectorsFromReport(report), [report]);
  const rejectedEmails = rejected.emails;
  const rejectedCollectorIds = rejected.ids;
  const rejectedEmailSet = useMemo(() => {
    const set = new Set();
    rejectedEmails.forEach((email) => {
      if (!email) return;
      set.add(String(email).trim().toLowerCase());
    });
    return set;
  }, [rejectedEmails]);
  const rejectedCollectorIdSet = useMemo(() => new Set(rejectedCollectorIds.map(String)), [rejectedCollectorIds]);

  const eligibleCollectorById = useMemo(() => {
    const list = Array.isArray(eligibleCollectorSource) ? eligibleCollectorSource : [];
    const map = new Map();
    list.forEach((c) => {
      const id = c?.id ?? c?.collectorId ?? null;
      if (id == null) return;
      map.set(String(id), {
        activeTaskCount: c?.activeTaskCount,
        online: c?.online,
        status: c?.status,
        distanceKm: c?.distanceKm,
        fullName: c?.fullName,
      });
    });
    return map;
  }, [eligibleCollectorSource]);

  const eligibleCollectorIdSet = useMemo(() => {
    const list = Array.isArray(eligibleCollectorSource) ? eligibleCollectorSource : [];
    const set = new Set();
    list.forEach((c) => {
      const id = c?.id ?? c?.collectorId ?? null;
      if (id == null) return;
      set.add(String(id));
    });
    return set;
  }, [eligibleCollectorSource]);

  const collectors = useMemo(() => {
    const list = Array.isArray(collectorSource) ? collectorSource : [];
    return list
      .map((c, idx) => {
        const id = c?.id ?? c?._id ?? c?.collectorId ?? idx;
        const name = c?.name ?? c?.username ?? c?.displayName ?? c?.fullName ?? c?.email ?? `Collector ${idx + 1}`;
        const email = c?.email ?? c?.mail ?? null;
        const statusRaw = String(c?.status ?? c?.availability ?? (c?.online ? "online" : "offline")).toLowerCase();
        const eligible = eligibleCollectorById.get(String(id)) ?? null;
        const eligibleStatusRaw = String(eligible?.status ?? "").toLowerCase();
        const isOnline =
          eligible?.online === true ||
          ["online", "active", "available"].includes(statusRaw) ||
          ["active", "available"].includes(eligibleStatusRaw);
        const activeTaskCountRaw = eligible?.activeTaskCount;
        const currentTasks = Number.isFinite(Number(activeTaskCountRaw)) ? Number(activeTaskCountRaw) : null;
        return { id, name, email, isOnline, currentTasks };
      })
      .filter((c) => {
        if (!c.email) return false;
        if (!c.isOnline) return false;
        if (isReassign && eligibleCollectorIdSet.size && !eligibleCollectorIdSet.has(String(c.id))) return false;
        const emailKey = String(c.email).trim().toLowerCase();
        if (rejectedEmailSet.has(emailKey)) return false;
        if (rejectedCollectorIdSet.has(String(c.id))) return false;
        return true;
      });
  }, [collectorSource, rejectedCollectorIdSet, rejectedEmailSet, eligibleCollectorById, eligibleCollectorIdSet, isReassign]);

  const assignedEmails = useMemo(() => getAssignedEmailsFromReport(report), [report]);
  const assignedLabel = useMemo(() => {
    if (!assignedEmails.length) return null;
    const labels = assignedEmails.map((email) => {
      const match = collectors.find((c) => c.email === email);
      return match?.name ? `${match.name} (${email})` : email;
    });
    return labels.join(", ");
  }, [assignedEmails, collectors]);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectReasonError, setRejectReasonError] = useState("");
  const [rejectSubmitting, setRejectSubmitting] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [selectedCollectorEmail, setSelectedCollectorEmail] = useState("");
  const [acceptConfirmOpen, setAcceptConfirmOpen] = useState(false);
  const [assignConfirmOpen, setAssignConfirmOpen] = useState(false);
  const [assignSubmitting, setAssignSubmitting] = useState(false);

  useEffect(() => {
    if (!assignOpen) return;
    if (requestDetailLoading) return;
    const statusRaw = String(requestDetail?.requestStatus ?? "").toLowerCase();
    if (statusRaw && !["accepted_enterprise", "reassign"].includes(statusRaw)) return;
    const requestId =
      reportRequestIdRaw === null || reportRequestIdRaw === undefined || reportRequestIdRaw === ""
        ? null
        : typeof reportRequestIdRaw === "number"
          ? reportRequestIdRaw
          : Number.isFinite(Number(reportRequestIdRaw))
            ? Number(reportRequestIdRaw)
            : reportRequestIdRaw;
    if (requestId == null) return;
    let cancelled = false;
    setEligibleCollectorsLoading(true);
    getEligibleCollectorsForRequest(requestId)
      .then((rows) => {
        if (cancelled) return;
        setEligibleCollectorSource(Array.isArray(rows) ? rows : []);
      })
      .catch((err) => {
        if (cancelled) return;
        const message = err?.message || "Unable to load collector tasks.";
        if (String(message).includes("Chỉ hỗ trợ tìm collector khi request ở trạng thái")) return;
      })
      .finally(() => {
        if (cancelled) return;
        setEligibleCollectorsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [assignOpen, reportRequestIdRaw, requestDetailLoading, requestDetail?.requestStatus]);

  function openRejectDialog() {
    setRejectReason("");
    setRejectReasonError("");
    setRejectSubmitting(false);
    setRejectOpen(true);
  }

  function openAssignDialog(nextReport) {
    const r = nextReport ?? report;
    const assigned = getAssignedEmailsFromReport(r);
    const rejected = getRejectedCollectorsFromReport(r);
    const rejectedSet = new Set((rejected?.emails ?? []).map((e) => String(e).trim().toLowerCase()).filter(Boolean));
    const candidates = assigned.filter((email) => !rejectedSet.has(String(email).trim().toLowerCase()));
    const first = candidates.find((email) => collectors.some((c) => c.email === email)) ?? "";
    setSelectedCollectorEmail(first);
    setAssignOpen(true);
  }

  useEffect(() => {
    if (!assignOpen) return;
    lockBodyScroll();
    return () => unlockBodyScroll();
  }, [assignOpen]);

  useEffect(() => {
    if (!rejectOpen) return;
    lockBodyScroll();
    return () => unlockBodyScroll();
  }, [rejectOpen]);

  function getReportCodeFromReport(r) {
    return String(r?.reportCode ?? r?.code ?? r?.id ?? "").trim();
  }

  function getRequestIdFromReport(r) {
    const raw = r?.collectionRequestId ?? r?.requestId ?? r?.collection_request_id ?? null;
    if (raw === null || raw === undefined || raw === "") return null;
    const n = typeof raw === "number" ? raw : Number(raw);
    return Number.isFinite(n) ? n : raw;
  }

  async function handleAcceptReport() {
    if (!report || !canDecide) return;
    setAcceptConfirmOpen(false);
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
      const next = {
        ...report,
        status: updated?.status ?? report?.status ?? "accepted",
        updatedAt: updated?.actionAt ?? new Date().toISOString(),
        collectionRequestId: updated?.collectionRequestId ?? getRequestIdFromReport(report),
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
          type: "REPORT_ACCEPTED",
          message: "Your report has been accepted.",
        });
      } catch {
        throw new Error("Report accepted, but failed to send notification to the reporter.");
      }

      openAssignDialog(next);
    } catch {
      throw new Error("Failed to accept the report. Please try again.");
    }
  }

  async function handleAssignCollectors() {
    if (!report || !canGoAssign || assignSubmitting) return;
    setAssignConfirmOpen(false);
    const primaryCollector = collectors.find((c) => c.email === selectedCollectorEmail);
    if (!primaryCollector) return;
    const requestId = getRequestIdFromReport(report);
    const reportCode = requestId == null ? getReportCodeFromReport(report) : null;
    if (requestId == null && !reportCode) {
      notify.error("Missing report code", "Unable to identify report code for this report.");
      return;
    }

    try {
      setAssignSubmitting(true);
      const assignedResponse = await notify.promise(
        requestId == null
          ? assignCollectorByReportCode({ reportCode, collectorId: primaryCollector.id })
          : assignCollectorToRequest({ requestId, collectorId: primaryCollector.id }),
        {
          loadingTitle: "Assigning collector...",
          loadingMessage: "Sending assignment to the server.",
          successTitle: "Collector assigned",
          successMessage: "Assignment saved successfully.",
          errorTitle: "Assign failed",
          errorMessage: (err) => err?.message || "Unable to assign collector.",
        }
      );

      const next = {
        ...report,
        status: assignedResponse?.status ?? report?.status,
        collectionRequestId: assignedResponse?.collectionRequestId ?? requestId ?? getRequestIdFromReport(report),
        assignedCollector: { id: primaryCollector.id, name: primaryCollector.name, email: primaryCollector.email },
        assignedCollectors: [{ id: primaryCollector.id, name: primaryCollector.name, email: primaryCollector.email }],
        updatedAt: assignedResponse?.assignedAt ?? assignedResponse?.actionAt ?? new Date().toISOString(),
      };
      setReportOverride(next);
      setReportData(next);
      setAssignOpen(false);
      navigate(PATHS.enterprise.dashboard, { replace: true });
    } finally {
      setAssignSubmitting(false);
    }
  }

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
                  onClick={() => {
                    if (!report || !canDecide) return;
                    openRejectDialog();
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
                    setAcceptConfirmOpen(true);
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
                    {assignActionLabel}
                  </Button>
                ) : null}
              </div>
            ) : null}
          </CardBody>
        </Card>

        {rejectOpen ? createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            role="dialog"
            aria-modal="true"
            onMouseDown={(e) => {
              if (rejectSubmitting) return;
              if (e.target === e.currentTarget) setRejectOpen(false);
            }}
          >
            <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-black/5">
              <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-gray-100">
                <div className="min-w-0">
                  <div className="text-lg font-semibold text-gray-900">Reject report</div>
                  <div className="mt-1 text-sm text-gray-600">Provide a reason so the citizen can understand what to fix.</div>
                </div>
                <button
                  type="button"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                  onClick={() => setRejectOpen(false)}
                  aria-label="Close"
                  disabled={rejectSubmitting}
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              <div className="px-6 py-6 space-y-4">
                <div>
                  <div className="text-sm font-semibold text-gray-900">Reason</div>
                  <div className="mt-2 space-y-2">
                    <textarea
                      value={rejectReason}
                      onChange={(e) => {
                        setRejectReason(e.target.value);
                        if (rejectReasonError) setRejectReasonError("");
                      }}
                      maxLength={500}
                      className="w-full min-h-[120px] px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-200 resize-y transition"
                      placeholder="Enter rejection reason..."
                      disabled={rejectSubmitting}
                    />
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm text-red-600">{rejectReasonError}</div>
                      <div className="text-sm text-gray-500">{rejectReason.length} / 500</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-6 py-5 border-t border-gray-100 flex items-center justify-end gap-3 bg-gray-50/60">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  disabled={rejectSubmitting}
                  onClick={() => setRejectOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="rounded-full bg-red-600 hover:bg-red-700"
                  disabled={rejectSubmitting}
                  onClick={async () => {
                    if (!report || !canDecide) return;
                    const reason = rejectReason.trim();
                    if (!reason) {
                      setRejectReasonError("Rejection reason is required.");
                      return;
                    }
                    const reportCode = getReportCodeFromReport(report);
                    if (!reportCode) {
                      notify.error("Missing report code", "Unable to identify report code for this report.");
                      return;
                    }

                    try {
                      setRejectSubmitting(true);
                      const updated = await notify.promise(rejectWasteReport({ reportCode, reason }), {
                        loadingTitle: "Rejecting report...",
                        loadingMessage: "Sending rejection to the server.",
                        successTitle: "Report rejected",
                        successMessage: "The report has been rejected.",
                        errorTitle: "Reject failed",
                        errorMessage: (err) => err?.message || "Unable to reject this report.",
                      });
                      const next = {
                        ...report,
                        status: updated?.status ?? report?.status ?? "rejected",
                        updatedAt: updated?.actionAt ?? new Date().toISOString(),
                        rejectionReason: reason,
                        collectionRequestId: updated?.collectionRequestId ?? getRequestIdFromReport(report),
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
                          reason,
                        });
                      } catch {
                        throw new Error("Report rejected, but failed to send notification to the reporter.");
                      }
                      setRejectOpen(false);
                      navigate(PATHS.enterprise.dashboard, { replace: true });
                    } catch (err) {
                      setRejectSubmitting(false);
                      setRejectReasonError(err?.message || "Failed to reject the report. Please try again.");
                    }
                  }}
                >
                  Reject
                </Button>
              </div>
            </div>
          </div>,
          document.body
        ) : null}

        {assignOpen ? createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            role="dialog"
            aria-modal="true"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setAssignOpen(false);
            }}
          >
            <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-black/5">
              <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-gray-100">
                <div className="min-w-0">
                  <div className="text-lg font-semibold text-gray-900">{assignDialogTitle}</div>
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
                    <div className="text-xs font-semibold text-gray-500">Current tasks</div>
                  </div>
                  {collectorsError ? <div className="text-sm text-red-600">{collectorsError}</div> : null}
                  {eligibleCollectorsError ? <div className="text-sm text-red-600">{eligibleCollectorsError}</div> : null}
                  <div className="max-h-64 overflow-auto rounded-2xl border border-gray-200 bg-white">
                    {collectorsLoading ? (
                      <div className="px-4 py-5 text-sm text-gray-600">Loading collectors...</div>
                    ) : collectors.length ? (
                      collectors.map((c) => {
                        const checked = selectedCollectorEmail === c.email;
                        return (
                          <label
                            key={c.email}
                            className="flex cursor-pointer items-center justify-between gap-4 px-4 py-3 text-sm text-gray-900 hover:bg-gray-50"
                          >
                            <div className="min-w-0">
                              <div className="truncate font-semibold">
                                {c.name}
                                {c.isOnline ? <span className="ml-2 text-xs font-semibold text-emerald-700">Online</span> : null}
                              </div>
                              <div className="truncate text-xs text-gray-600">{c.email}</div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-xs font-semibold text-gray-700 tabular-nums">
                                {eligibleCollectorsLoading ? "..." : c.currentTasks ?? "-"}
                              </div>
                              <input
                                type="radio"
                                name="collector"
                                className="h-4 w-4"
                                checked={checked}
                                disabled={!report || !canGoAssign || assignSubmitting}
                                onChange={() => setSelectedCollectorEmail(c.email)}
                              />
                            </div>
                          </label>
                        );
                      })
                    ) : (
                      <div className="px-4 py-5 text-sm text-gray-600">No online collectors available.</div>
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
                  disabled={!report || !canGoAssign || !selectedCollectorEmail || assignSubmitting}
                  onClick={() => {
                    if (!report || !canGoAssign || !selectedCollectorEmail || assignSubmitting) return;
                    setAssignConfirmOpen(true);
                  }}
                >
                  <Users className="h-5 w-5" aria-hidden="true" />
                  {assignConfirmText}
                </Button>
              </div>
            </div>
          </div>,
          document.body
        ) : null}

        <ConfirmDialog
          open={acceptConfirmOpen}
          title="Are you sure you want to accept this report?"
          description="If you continue, the report status will be updated to Accepted."
          confirmText="Accept"
          cancelText="Cancel"
          onClose={() => setAcceptConfirmOpen(false)}
          onConfirm={handleAcceptReport}
        />

        <ConfirmDialog
          open={assignConfirmOpen}
          title={assignConfirmTitle}
          description={assignConfirmDescription}
          confirmText={assignConfirmText}
          cancelText="Cancel"
          confirmDisabled={assignSubmitting}
          onClose={() => setAssignConfirmOpen(false)}
          onConfirm={handleAssignCollectors}
        />
      </div>
    </EnterpriseLayout>
  );
}
