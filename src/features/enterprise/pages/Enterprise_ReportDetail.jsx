import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { createPortal } from "react-dom";
import EnterpriseLayout from "../layouts/EnterpriseLayout.jsx";
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
import ConfirmDialog from "../../../shared/ui/ConfirmDialog.jsx";
import { lockBodyScroll, unlockBodyScroll } from "../../../shared/lib/lockBodyScroll.js";
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

  const report = useMemo(() => {
    const base = reportOverride ?? reportData ?? (stateReport?.id && String(stateReport.id) === id ? stateReport : null);
    if (!base) return null;

    const address =
      (typeof base?.address === "string" && base.address.trim()) ||
      (typeof base?.reportedAddress === "string" && base.reportedAddress.trim()) ||
      (typeof base?.location?.address === "string" && base.location.address.trim()) ||
      "";

    const lat =
      base?.latitude ??
      base?.lat ??
      base?.coords?.lat ??
      base?.location?.lat ??
      base?.reportedLatitude ??
      null;
    const lng =
      base?.longitude ??
      base?.lng ??
      base?.coords?.lng ??
      base?.location?.lng ??
      base?.reportedLongitude ??
      null;
    const coords =
      lat != null && lng != null && Number.isFinite(Number(lat)) && Number.isFinite(Number(lng))
        ? { lat: Number(lat), lng: Number(lng) }
        : null;

    const reportCode = String(base?.reportCode ?? base?.code ?? "").trim() || null;
    const requestIdRaw = base?.collectionRequestId ?? base?.requestId ?? base?.collection_request_id ?? null;
    const collectionRequestId =
      requestIdRaw === null || requestIdRaw === undefined || requestIdRaw === ""
        ? null
        : typeof requestIdRaw === "number"
          ? requestIdRaw
          : Number.isFinite(Number(requestIdRaw))
            ? Number(requestIdRaw)
            : requestIdRaw;

    const notes =
      (typeof base?.notes === "string" && base.notes.trim()) ||
      (typeof base?.description === "string" && base.description.trim()) ||
      "";

    const imagesRaw = base?.images ?? null;
    const images =
      Array.isArray(imagesRaw)
        ? imagesRaw.filter(Boolean).map(String)
        : Array.isArray(base?.imageUrls)
          ? base.imageUrls.filter(Boolean).map(String)
          : typeof imagesRaw === "string" && imagesRaw.trim()
            ? imagesRaw
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
            : [];

    const typesRaw = Array.isArray(base?.types) ? base.types.filter(Boolean).map(String) : [];
    const categoriesRaw = Array.isArray(base?.categories) ? base.categories : [];
    const categoriesTypes = categoriesRaw
      .map((c) => (c?.name ? String(c.name).trim() : ""))
      .filter(Boolean);
    const wasteType = typeof base?.wasteType === "string" ? base.wasteType.trim() : "";
    const types = typesRaw.length ? typesRaw : categoriesTypes.length ? categoriesTypes : wasteType ? [wasteType] : [];

    const wasteItemsRaw = Array.isArray(base?.wasteItems) ? base.wasteItems : [];
    const wasteItems =
      wasteItemsRaw.length
        ? wasteItemsRaw
        : categoriesRaw
            .map((c) => {
              const name = c?.name ? String(c.name).trim() : "";
              const q = c?.quantity;
              const num = typeof q === "number" ? q : Number(q);
              const unit = c?.unit ? String(c.unit).trim() : "";
              if (!name || !Number.isFinite(num)) return null;
              return { name, estimatedWeight: num, unit };
            })
            .filter(Boolean);

    return {
      ...base,
      id: base?.id ?? id,
      address,
      coords,
      reportCode,
      collectionRequestId,
      notes,
      images,
      types,
      wasteItems,
    };
  }, [reportOverride, reportData, stateReport, id]);
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
  const [assignSubmitting, setAssignSubmitting] = useState(false);
  const [assignConfirmOpen, setAssignConfirmOpen] = useState(false);
  const [acceptConfirmOpen, setAcceptConfirmOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectSubmitting, setRejectSubmitting] = useState(false);
  const [rejectDialogError, setRejectDialogError] = useState("");

  useEffect(() => {
    if (!rejectOpen) return;
    lockBodyScroll();
    return () => unlockBodyScroll();
  }, [rejectOpen]);

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
      } catch (e) {
        notify.error("Notify failed", e?.message || "Report accepted, but failed to send notification.");
      }

      openAssignDialog(next);
    } catch (e) {
      notify.error("Accept failed", e?.message || "Failed to accept the report. Please try again.");
    }
  }

  async function handleRejectReport() {
    if (!report || !canDecide || rejectSubmitting) return;
    const reason = String(rejectReason || "").trim();
    if (!reason) {
      setRejectDialogError("Rejection reason is required.");
      return;
    }
    const reportCode = getReportCodeFromReport(report);
    if (!reportCode) {
      notify.error("Missing report code", "Unable to identify report code for this report.");
      return;
    }

    setRejectSubmitting(true);
    try {
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
      } catch (e) {
        notify.error("Notify failed", e?.message || "Report rejected, but failed to send notification.");
      }

      setRejectOpen(false);
      navigate(PATHS.enterprise.dashboard, { replace: true });
    } catch (e) {
      notify.error("Reject failed", e?.message || "Failed to reject the report. Please try again.");
    } finally {
      setRejectSubmitting(false);
    }
  }

  async function handleAssignSelectedCollectors() {
    if (!report || !canGoAssign || assignSubmitting) return;
    const selectedCollectors = collectors.filter((c) => selectedCollectorEmails.includes(c.email));
    if (!selectedCollectors.length) return;
    setAssignConfirmOpen(false);
    setAssignSubmitting(true);
    try {
      const primaryCollector = selectedCollectors[0];
      const reportCode = getReportCodeFromReport(report);
      if (!reportCode) {
        notify.error("Missing report code", "Unable to identify report code for this report.");
        return;
      }

      const requestId = getRequestIdFromReport(report);
      const assignPromise =
        requestId != null
          ? assignCollectorToRequest({ requestId, collectorId: primaryCollector.id })
          : assignCollectorByReportCode({ reportCode, collectorId: primaryCollector.id });

      const assignedResponse = await notify.promise(assignPromise, {
        loadingTitle: "Assigning collector...",
        loadingMessage: "Sending assignment to the server.",
        successTitle: "Collector assigned",
        successMessage: "Assignment saved successfully.",
        errorTitle: "Assign failed",
        errorMessage: (err) => err?.message || "Unable to assign collector.",
      });

      const next = {
        ...report,
        status: assignedResponse?.status ?? report?.status,
        collectionRequestId: assignedResponse?.collectionRequestId ?? getRequestIdFromReport(report),
        assignedCollector: { id: primaryCollector.id, name: primaryCollector.name, email: primaryCollector.email },
        assignedCollectors: selectedCollectors.map((c) => ({ id: c.id, name: c.name, email: c.email })),
        updatedAt: assignedResponse?.assignedAt ?? new Date().toISOString(),
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
                    setRejectDialogError("");
                    setRejectReason("");
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
                  disabled={!report || !canGoAssign || !selectedCollectorEmails.length || assignSubmitting}
                  onClick={() => {
                    if (!report || !canGoAssign || !selectedCollectorEmails.length || assignSubmitting) return;
                    setAssignConfirmOpen(true);
                  }}
                >
                  <Users className="h-5 w-5" aria-hidden="true" />
                  Assign
                </Button>
              </div>
            </div>
          </div>  
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
          title="Are you sure you want to assign this report?"
          description="If you continue, the report will be assigned to the selected collectors."
          confirmText="Assign"
          cancelText="Cancel"
          confirmDisabled={assignSubmitting}
          onClose={() => setAssignConfirmOpen(false)}
          onConfirm={handleAssignSelectedCollectors}
        />  

        {rejectOpen
          ? createPortal(
              <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
                role="dialog"
                aria-modal="true"
                onMouseDown={(e) => {
                  if (rejectSubmitting) return;
                  if (e.target === e.currentTarget) setRejectOpen(false);
                }}
              >
                <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-black/5 max-h-[calc(100vh-4rem)] flex flex-col">
                  <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-gray-100">
                    <div className="min-w-0">
                      <div className="text-lg font-semibold text-gray-900">Reject Report</div>
                      <div className="mt-1 text-sm text-gray-600">Are you sure you want to reject this report?</div>
                    </div>
                    <button
                      type="button"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full text-gray-600 hover:bg-gray-50 disabled:opacity-60"
                      onClick={() => {
                        if (rejectSubmitting) return;
                        setRejectOpen(false);
                      }}
                      aria-label="Close"
                      disabled={rejectSubmitting}
                    >
                      <X className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </div>

                  <div className="px-6 py-6 space-y-4 overflow-auto">
                    {rejectDialogError ? <div className="text-sm text-red-600">{rejectDialogError}</div> : null}
                    <div className="grid gap-2">
                      <label className="text-sm font-semibold text-gray-900" htmlFor="reject_reason">
                        Rejection reason
                      </label>
                      <textarea
                        id="reject_reason"
                        value={rejectReason}
                        onChange={(e) => {
                          setRejectReason(e.target.value);
                          if (rejectDialogError) setRejectDialogError("");
                        }}
                        className="min-h-28 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-rose-600 focus:ring-2 focus:ring-rose-200"
                        placeholder="Explain why you are rejecting this report..."
                        disabled={rejectSubmitting}
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-end gap-3 px-6 py-5 border-t border-gray-100">
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
                      className="rounded-full bg-rose-600 hover:bg-rose-700"
                      disabled={rejectSubmitting}
                      onClick={handleRejectReport}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              </div>,
              document.body
            )
          : null}
      </div>
    </EnterpriseLayout>
  );
}
