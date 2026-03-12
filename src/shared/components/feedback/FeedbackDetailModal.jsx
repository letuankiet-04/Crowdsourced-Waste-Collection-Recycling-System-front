import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Clock, FileText } from 'lucide-react';
import Button from '../../ui/Button.jsx';
import StatusPill from '../../ui/StatusPill.jsx';
import { resolveAdminFeedback, resolveEnterpriseFeedback, getEnterpriseFeedbackById, getAdminFeedbackById } from '../../../services/feedback.service.js';
import { getEnterpriseWasteReportById } from '../../../services/enterprise.service.js';
import { normalizeReportStatus, reportStatusToPillVariant } from '../../lib/reportStatus.js';
import useNotify from '../../hooks/useNotify.js';

export default function FeedbackDetailModal({
  open,
  feedback,
  onClose,
  onUpdate,
  onViewReport,
  mode = "enterprise"
}) {
  const notify = useNotify();
  const [response, setResponse] = useState("");
  const [decision, setDecision] = useState("RESOLVED");
  const [submitting, setSubmitting] = useState(false);
  const [detail, setDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [reportInfo, setReportInfo] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      // Load chi tiết mới nhất từ server khi mở modal
      if (feedback?.id) {
        setLoadingDetail(true);
        const load = async () => {
          try {
            const data = mode === "admin"
              ? await getAdminFeedbackById(feedback.id)
              : await getEnterpriseFeedbackById(feedback.id);
            // Chuẩn hoá một số field để component dùng thống nhất
            setDetail({
              ...feedback,
              ...data,
              sender: feedback?.sender || undefined,
              // Ưu tiên reportId nếu có, sau đó mới tới collectionRequestId
              reportId: data?.reportId ?? data?.collectionRequestId ?? feedback?.reportId,
              // Lưu cả các biến thể để thử fetch chi tiết
              reportEntityId: data?.reportId ?? feedback?.reportEntityId ?? null,
              collectionRequestId: data?.collectionRequestId ?? feedback?.collectionRequestId ?? null,
            });
          } catch {
            // Không chặn UI nếu lỗi, dùng dữ liệu từ props
            setDetail(feedback || null);
          } finally {
            setLoadingDetail(false);
          }
        };
        load();
      } else {
        setDetail(feedback || null);
      }
    } else {
      document.body.style.overflow = '';
      setResponse("");
      setDecision("RESOLVED");
      setDetail(null);
      setLoadingDetail(false);
      setReportInfo(null);
      setLoadingReport(false);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Load report info when applicable (enterprise + reportId)
  useEffect(() => {
    // Thử nhiều ứng viên ID vì backend có thể dùng các khoá khác nhau
    const primary = detail?.reportEntityId ?? feedback?.reportEntityId;
    const secondary = detail?.reportId ?? feedback?.reportId;
    const tertiary = detail?.collectionRequestId ?? feedback?.collectionRequestId;
    const candidates = [primary, secondary, tertiary].filter((v) => v != null && v !== "");
    if (!open || mode === "admin" || candidates.length === 0) {
      setReportInfo(null);
      setLoadingReport(false);
      return;
    }
    let cancelled = false;
    setLoadingReport(true);
    (async () => {
      let found = null;
      for (const c of candidates) {
        if (cancelled) break;
        try {
          // thử lần lượt cho tới khi thành công
          const data = await getEnterpriseWasteReportById(c);
          if (data) {
            found = data;
            break;
          }
        } catch {
          // thử ứng viên tiếp theo
        }
      }
      if (!cancelled) {
        setReportInfo(found || null);
        setLoadingReport(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, mode, detail?.reportId, detail?.reportEntityId, detail?.collectionRequestId, detail?.type, feedback?.reportId, feedback?.reportEntityId, feedback?.collectionRequestId, feedback?.type]);

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
  const hasAttached = Boolean(view?.reportId);

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Feedback Details</h2>
            <div className="text-sm text-gray-500 mt-1">ID: {view?.id}</div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 flex-1">
          {/* Sender Info */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-lg">
              {view?.sender?.avatar || view?.sender?.name?.[0] || "U"}
            </div>
            <div>
              <div className="font-bold text-gray-900">{view?.sender?.name || "Anonymous"}</div>
              <div className="text-sm text-gray-500">{view?.sender?.role || "User"}</div>
            </div>
            <div className="ml-auto flex flex-col items-end gap-1">
              <StatusPill variant={view?.status === 'RESOLVED' ? 'green' : view?.status === 'PENDING' ? 'yellow' : 'gray'}>
                {view?.status}
              </StatusPill>
              <div className="text-xs text-gray-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDate(view?.date || view?.createdAt)}
              </div>
            </div>
          </div>

          {hasAttached ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Subject & Content</h3>
                <div className="p-4 border border-gray-200 rounded-xl bg-white">
                  <div className="font-bold text-gray-900 mb-2">{view?.subject || view?.title}</div>
                  <p className="text-gray-700 whitespace-pre-wrap">{view?.content || view?.description}</p>
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Attached Report</h3>
                <div className="flex items-center justify-between p-4 border border-blue-100 bg-blue-50 rounded-xl text-blue-900">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <span className="font-medium">Report #{view?.reportId}</span>
                  </div>
                  <Button 
                      size="sm" 
                      variant="outline" 
                      className="border-blue-200 hover:bg-blue-100 text-blue-700"
                      onClick={() => onViewReport?.(view?.reportId)} 
                  >
                    View Report
                  </Button>
                </div>
                {mode === "enterprise" && (
                  <div className="p-4 border border-gray-200 rounded-xl bg-white">
                    {loadingReport ? (
                      <div className="text-sm text-gray-500">Loading report information...</div>
                    ) : reportInfo ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(() => {
                          // Chuẩn hoá dữ liệu hiển thị
                          const address =
                            (typeof reportInfo?.address === "string" && reportInfo.address.trim()) ||
                            (typeof reportInfo?.reportedAddress === "string" && reportInfo.reportedAddress.trim()) ||
                            (typeof reportInfo?.location?.address === "string" && reportInfo.location.address.trim()) ||
                            "-";
                          const imagesRaw = reportInfo?.images ?? reportInfo?.imageUrls ?? null;
                          const images = Array.isArray(imagesRaw)
                            ? imagesRaw.filter(Boolean).map(String)
                            : typeof imagesRaw === "string" && imagesRaw.trim()
                              ? imagesRaw.split(",").map((s) => s.trim()).filter(Boolean)
                              : [];
                          const createdAt =
                            reportInfo?.createdAt ??
                            reportInfo?.reportedAt ??
                            reportInfo?.created_at ??
                            null;
                          return (
                            <>
                        <div>
                          <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Report Code</div>
                          <div className="mt-1 text-gray-900 font-medium">
                            {reportInfo.reportCode || reportInfo.code || `#${reportInfo.id}`}
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <div>
                            <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Status</div>
                            <div className="mt-1">
                              <StatusPill variant={reportStatusToPillVariant(reportInfo.status)}>
                                {normalizeReportStatus(reportInfo.status)}
                              </StatusPill>
                            </div>
                          </div>
                        </div>
                        <div className="md:col-span-2">
                          <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Address</div>
                            <div className="mt-1 text-gray-900">{address}</div>
                        </div>
                        <div>
                          <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Created At</div>
                            <div className="mt-1 text-gray-900">{createdAt ? formatDate(createdAt) : "-"}</div>
                        </div>
                        {images.length > 0 && (
                          <div className="md:col-span-2">
                            <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Photos</div>
                            <div className="mt-2 grid grid-cols-3 sm:grid-cols-4 gap-3">
                              {images.slice(0, 4).map((url, idx) => (
                                <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="group block">
                                  <img
                                    src={url}
                                    alt={`Report ${reportInfo.reportCode || reportInfo.id} photo ${idx + 1}`}
                                    className="w-full h-24 object-cover rounded-lg border border-gray-200 group-hover:opacity-90"
                                    loading="lazy"
                                  />
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                            </>
                          );
                        })()}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">No additional report information available.</div>
                    )}
                  </div>
                )}
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

          {/* Response Section */}
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
            ) : view?.status === 'RESOLVED' || view?.status === 'REJECTED' ? (
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
                  <Button
                    variant="outline"
                    onClick={handleResolve}
                    disabled={submitting}
                  >
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
      </div>
    </div>,
    document.body
  );
}
