import { useEffect, useState } from "react";
import { createPortal } from 'react-dom';
import { X, Clock, FileText } from 'lucide-react';
import Button from '../../ui/Button.jsx';
import StatusPill from '../../ui/StatusPill.jsx';
import { resolveAdminFeedback, resolveEnterpriseFeedback } from '../../../services/feedback.service.js';
import useNotify from '../../hooks/useNotify.js';
import useBodyScrollLock from "../../hooks/useBodyScrollLock.js";
import useLatestFeedbackDetail from "./useLatestFeedbackDetail.js";
import useFeedbackReportInfo from "./useFeedbackReportInfo.js";
import EnterpriseAttachedReports from "./EnterpriseAttachedReports.jsx";

export default function FeedbackDetailModal({
  open,
  feedback,
  onClose,
  onUpdate,
  onViewReport,
  onViewCollectorReport,
  mode = "enterprise"
}) {
  const notify = useNotify();
  useBodyScrollLock(open);
  const [response, setResponse] = useState("");
  const [decision, setDecision] = useState("RESOLVED");
  const [submitting, setSubmitting] = useState(false);
  const { detail, loadingDetail } = useLatestFeedbackDetail({ open, feedback, mode });
  const { citizenReportInfo, collectorReportInfo, loadingReports } = useFeedbackReportInfo({
    open,
    mode,
    detail,
    fallback: feedback,
  });

  useEffect(() => {
    if (!open) {
      setResponse("");
      setDecision("RESOLVED");
      setSubmitting(false);
    }
  }, [open, feedback, mode]);

  if (!open || !feedback) return null;

  const resolveFeedback = async (id, payload) => {
    if (mode === "admin") {
      return resolveAdminFeedback(id, payload);
    }
    return resolveEnterpriseFeedback(id, payload);
  };

  const handleRespond = async () => {
    if (!response.trim()) {
      notify.error("Response cannot be empty");
      return;
    }
    setSubmitting(true);
    try {
      await resolveFeedback(feedback.id, {
        resolution: response.trim(),
        status: decision,
      });
      notify.success("Feedback updated successfully");
      onUpdate?.();
      onClose();
    } catch {
      notify.error("Failed to update feedback");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResolve = async () => {
    if (!response.trim()) {
      notify.error("Response cannot be empty");
      return;
    }
    setSubmitting(true);
    try {
      await resolveFeedback(feedback.id, {
        resolution: response.trim(),
        status: "RESOLVED",
      });
      notify.success("Feedback resolved");
      onUpdate?.();
      onClose();
    } catch {
      notify.error("Failed to resolve feedback");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const view = detail || feedback;
  const hasAttached = Boolean(
    view?.wasteReportId ||
      view?.reportEntityId ||
      view?.collectionRequestId ||
      view?.collectorReportId ||
      (view?.reportId != null && String(view.reportId).trim() !== "")
  );
  const isAdmin = mode === "admin";

  const complaintTitle =
    view?.subject ||
    view?.title ||
    `Complaint #${view?.id ?? ""}`;

  const safeSenderName = view?.sender?.name || "Anonymous";
  const linkedEntityId =
    view?.wasteReportId ?? view?.reportEntityId ?? view?.reportId ?? view?.collectionRequestId ?? null;

  const extractImages = (source) => {
    const raw = source?.images ?? source?.imageUrls ?? source?.image_urls ?? source?.photos ?? source?.photoUrls;
    if (Array.isArray(raw)) return raw.filter(Boolean).map(String);
    if (typeof raw === "string" && raw.trim()) return raw.split(",").map((s) => s.trim()).filter(Boolean);
    return [];
  };

  const linkedImages = extractImages(view);

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto flex flex-col"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-gray-900 truncate">
              {isAdmin ? `Complaint Details #${view?.id ?? ""}` : "Feedback Details"}
            </h2>
            <div className="text-sm text-gray-500 mt-1 truncate">
              {isAdmin ? complaintTitle : `ID: ${view?.id ?? "-"}`}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {isAdmin ? (
          <div className="p-6 space-y-6 flex-1">
            <div className="rounded-2xl border border-gray-100 bg-gradient-to-r from-white to-gray-50 p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                  <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Complaint</div>
                  <div className="mt-1 text-lg font-bold text-gray-900 truncate">{complaintTitle}</div>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <span className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                        {view?.sender?.avatar || safeSenderName?.[0] || "U"}
                      </span>
                      <span className="font-semibold text-gray-700">{safeSenderName}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-gray-400" />
                      {formatDate(view?.date || view?.createdAt)}
                    </span>
                  </div>
                </div>

                {linkedEntityId != null ? (
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-blue-900 w-full md:w-auto">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <div className="min-w-0">
                        <div className="text-xs font-semibold uppercase tracking-wider text-blue-700">Linked</div>
                        <div className="font-medium truncate">{`#${linkedEntityId}`}</div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-blue-200 hover:bg-blue-100 text-blue-700"
                      onClick={() => onViewReport?.(linkedEntityId)}
                    >
                      View
                    </Button>
                  </div>
                ) : null}
              </div>

              <div className="mt-6 rounded-2xl bg-white border border-gray-100 p-5">
                <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Details</div>
                <div className="mt-2 text-gray-800 whitespace-pre-wrap">
                  {view?.content || view?.description || "-"}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
                  <div className="text-sm font-bold text-gray-900">Citizen&apos;s Report</div>
                </div>
                <div className="p-6 space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Report ID</div>
                      <div className="mt-1 text-gray-900 font-medium">{linkedEntityId != null ? `#${linkedEntityId}` : "-"}</div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Timestamp</div>
                      <div className="mt-1 text-gray-900">{view?.date || view?.createdAt ? formatDate(view?.date || view?.createdAt) : "-"}</div>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Location</div>
                    <div className="mt-1 text-gray-900">{view?.address || view?.reportedAddress || "-"}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Attached Photos</div>
                    {linkedImages.length ? (
                      <div className="mt-2 grid grid-cols-3 sm:grid-cols-4 gap-3">
                        {linkedImages.slice(0, 4).map((url, idx) => (
                          <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="group block">
                            <img
                              src={url}
                              alt={`Attachment ${idx + 1}`}
                              className="w-full h-24 object-cover rounded-lg border border-gray-200 group-hover:opacity-90"
                              loading="lazy"
                            />
                          </a>
                        ))}
                      </div>
                    ) : (
                      <div className="mt-2 h-24 rounded-xl border border-dashed border-gray-200 flex items-center justify-center text-sm text-gray-400">
                        No photos
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
                  <div className="text-sm font-bold text-gray-900">Collector&apos;s Report</div>
                </div>
                <div className="p-6 space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Collector</div>
                      <div className="mt-1 text-gray-900">{view?.collectorName || view?.collector?.name || "-"}</div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Collection Point</div>
                      <div className="mt-1 text-gray-900">
                        {view?.collectionPoint || view?.stationName || view?.collectionStation || "-"}
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Collector Note</div>
                    <div className="mt-1 text-gray-900 whitespace-pre-wrap">{view?.collectorNote || view?.note || "-"}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Proof of Work</div>
                    <div className="mt-2 h-24 rounded-xl border border-dashed border-gray-200 flex items-center justify-center text-sm text-gray-400">
                      No proof provided
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
                <div className="text-sm font-bold text-gray-900">Admin Response</div>
              </div>
              <div className="p-6">
                {loadingDetail ? (
                  <div className="text-sm text-gray-500">Loading latest response...</div>
                ) : view?.resolution ? (
                  <div className="p-5 bg-emerald-50 border border-emerald-100 rounded-xl">
                    <div className="text-xs text-emerald-700 font-semibold mb-1">
                      Updated on {formatDate(view?.updatedAt || view?.createdAt)}
                    </div>
                    <div className="text-gray-900 whitespace-pre-wrap">{view?.resolution}</div>
                  </div>
                ) : (
                  <div className="p-5 bg-gray-50 border border-dashed border-gray-200 rounded-xl text-gray-500">
                    {String(view?.status || "").toUpperCase() === "RESOLVED" ||
                    String(view?.status || "").toUpperCase() === "REJECTED"
                      ? "This complaint is closed but no response note was provided."
                      : "No response from admin yet."}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-6 flex-1">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-lg">
                {view?.sender?.avatar || view?.sender?.name?.[0] || "U"}
              </div>
              <div>
                <div className="font-bold text-gray-900">{view?.sender?.name || "Anonymous"}</div>
                <div className="text-sm text-gray-500">{view?.sender?.role || "User"}</div>
              </div>
              <div className="ml-auto flex flex-col items-end gap-1">
                <StatusPill
                  variant={view?.status === "RESOLVED" ? "green" : view?.status === "PENDING" ? "yellow" : "gray"}
                >
                  {view?.status}
                </StatusPill>
                <div className="text-xs text-gray-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDate(view?.date || view?.createdAt)}
                </div>
              </div>
            </div>

            {hasAttached ? (
              <div className="space-y-6">
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Subject & Content</h3>
                  <div className="p-4 border border-gray-200 rounded-xl bg-white">
                    <div className="font-bold text-gray-900 mb-2">{view?.subject || view?.title}</div>
                    <p className="text-gray-700 whitespace-pre-wrap">{view?.content || view?.description}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Attached Report</h3>
                  {mode === "enterprise" ? (
                    <EnterpriseAttachedReports
                      citizen={citizenReportInfo}
                      collector={collectorReportInfo}
                      loading={loadingReports}
                      fallbackWasteId={view?.wasteReportId ?? view?.reportEntityId ?? view?.reportId}
                      onViewCitizen={(id) => onViewReport?.(id)}
                      onViewCollector={onViewCollectorReport}
                    />
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Subject & Content</h3>
                <div className="p-4 border border-gray-200 rounded-xl bg-white">
                  <div className="font-bold text-gray-900 mb-2">{view?.subject || view?.title}</div>
                  <p className="text-gray-700 whitespace-pre-wrap">{view?.content || view?.description}</p>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Response</h3>
              {loadingDetail ? (
                <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl text-gray-500">
                  Loading latest response...
                </div>
              ) : view?.resolution ? (
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                  <div className="text-xs text-emerald-600 font-medium mb-1">
                    Updated on {formatDate(view?.updatedAt || view?.createdAt)}
                  </div>
                  <p className="text-gray-800">{view?.resolution}</p>
                </div>
              ) : view?.status === "RESOLVED" || view?.status === "REJECTED" ? (
                <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl text-gray-500 italic">
                  This feedback has been resolved without a specific text response.
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setDecision("RESOLVED")}
                      className={`px-4 py-2 rounded-xl border font-semibold transition-colors ${decision === "RESOLVED" ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
                    >
                      Resolve
                    </button>
                    <button
                      type="button"
                      onClick={() => setDecision("REJECTED")}
                      className={`px-4 py-2 rounded-xl border font-semibold transition-colors ${decision === "REJECTED" ? "border-red-300 bg-red-50 text-red-700" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
                    >
                      Reject
                    </button>
                  </div>
                  <textarea
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    placeholder="Type resolution note..."
                    className="w-full min-h-[120px] p-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none resize-y"
                  />
                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={handleResolve} disabled={submitting}>
                      Mark as Resolved
                    </Button>
                    <Button
                      onClick={handleRespond}
                      disabled={!response.trim() || submitting}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      {submitting ? "Submitting..." : "Submit Decision"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
