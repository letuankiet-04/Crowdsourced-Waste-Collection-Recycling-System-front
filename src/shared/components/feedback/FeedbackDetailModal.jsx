import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from 'react-dom';
import { X, Clock, FileText } from 'lucide-react';
import Button from '../../ui/Button.jsx';
import StatusPill from '../../ui/StatusPill.jsx';
import { resolveAdminFeedback, resolveEnterpriseFeedback } from '../../../services/feedback.service.js';
import { createEnterprisePointAdjustment } from "../../../services/enterprise.service.js";
import useNotify from '../../hooks/useNotify.js';
import useBodyScrollLock from "../../hooks/useBodyScrollLock.js";
import useLatestFeedbackDetail from "./useLatestFeedbackDetail.js";
import useFeedbackReportInfo from "./useFeedbackReportInfo.js";
import EnterpriseAttachedReports from "./EnterpriseAttachedReports.jsx";
import EnterpriseRewardSection from "./EnterpriseRewardSection.jsx";
import { formatPoints } from "../../lib/numberFormat.js";

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
  const [savingReward, setSavingReward] = useState(false);
  const [rewardRateInput, setRewardRateInput] = useState("100");
  const [collectorOverride, setCollectorOverride] = useState(null);
  const lastNegativeRateWarnAtRef = useRef(0);
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
      setRewardRateInput("100");
      setCollectorOverride(null);
    }
  }, [open, feedback, mode]);
  const isReady = Boolean(open && feedback);

  const resolveFeedback = async (id, payload) => {
    if (mode === "admin") {
      return resolveAdminFeedback(id, payload);
    }
    return resolveEnterpriseFeedback(id, payload);
  };

  function estimatePointsFromCollector(report, bonusPoints) {
    const bonus = typeof bonusPoints === "number" ? bonusPoints : Number(bonusPoints);
    return Number.isFinite(bonus) ? Math.trunc(bonus) : 0;
  }

  async function saveRewardRate(rateSafe) {
    if (mode !== "enterprise") return null;
    if (!canUpdatePoints) return null;

    const requestId = collectionRequestIdForAdjustment;
    if (requestId == null) {
      notify.error("Missing collection request ID", "Unable to identify the collection request for point adjustment.");
      return { failed: true };
    }

    const points = estimatePointsFromCollector(effectiveCollector, rateSafe);
    if (!Number.isFinite(points) || points === 0) {
      notify.error("Points must be non-zero", "Unable to create an adjustment with 0 points.");
      return { failed: true };
    }

    setSavingReward(true);
    const toastId = notify.loading(
      "Saving point adjustment...",
      "Adjusting citizen points for this collection request."
    );
    try {
      const res = await createEnterprisePointAdjustment({
        collectionRequestId: requestId,
        points,
        description: response.trim() ? `Feedback #${view?.id ?? ""}: ${response.trim()}` : `Feedback #${view?.id ?? ""}`,
        citizenId: citizenIdForAdjustment ?? undefined,
      });

      notify.update(toastId, {
        variant: "success",
        title: "Saved",
        message: `Adjusted ${formatPoints(res?.points ?? points)} pts. Balance: ${
          res?.balanceAfter != null ? formatPoints(res.balanceAfter) : "N/A"
        }.`,
      });
      setTimeout(() => notify.dismiss(toastId), 3500);

      setCollectorOverride((prev) => {
        const base = prev || effectiveCollector || {};
        return {
          ...base,
          verificationRate: rateSafe,
          status: base.status ?? "COMPLETED",
        };
      });

      return { ok: true, res: res || null };
    } catch (err) {
      const message = err?.message || "Unable to adjust points for this collection request.";
      if (err?.status === 409) {
        notify.update(toastId, { variant: "warning", title: "Conflict", message });
        setTimeout(() => notify.dismiss(toastId), 3500);
        return { conflict: true, message };
      }
      notify.update(toastId, { variant: "error", title: "Save failed", message });
      setTimeout(() => notify.dismiss(toastId), 3500);
      return { failed: true, message };
    } finally {
      setSavingReward(false);
    }
  }

  const handleRespond = async () => {
    if (!response.trim()) {
      notify.error("Response cannot be empty");
      return;
    }
    const n = Number(rewardRateInput);
    if (Number.isFinite(n) && n < 0) {
      notify.error("Verification rate cannot be negative.");
      return;
    }
    const decisionUpper = String(decision || "").toUpperCase();
    const isFeedbackFromCollector = 
      feedback?.sender?.role === "Collector" || 
      Number(feedback?.id) < 0 || 
      String(feedback?.feedbackCode || feedback?.feedback_code || "").toUpperCase().startsWith("CF");
    const wantsReward = mode === "enterprise" && decisionUpper === "RESOLVED" && !isFeedbackFromCollector;
    
    if (wantsReward && (loadingDetail || loadingReports)) {
      notify.error("Please wait", "Loading linked report information...");
      return;
    }
    setSubmitting(true);
    try {
      if (wantsReward) {
        if (!canUpdatePoints) {
          notify.error(
            "Missing collector report",
            "This feedback is not linked to a collector report, so points cannot be awarded."
          );
          return;
        }
        if (!Number.isFinite(n)) throw new Error("Invalid verification rate.");
        const rateSafe = Math.max(0, Math.min(100, Math.round(n)));
        const rewardState = await saveRewardRate(rateSafe);
        if (rewardState?.failed) return;
      }
      await resolveFeedback(feedback.id, {
        resolution: response.trim(),
        status: decision,
      });
      notify.success("Feedback updated successfully");
      onUpdate?.();
      onClose();
    } catch (err) {
      notify.error(err?.message || "Failed to update feedback");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const view = detail || feedback;
  const isCollectorFeedback =
    view?.sender?.role === "Collector" ||
    Number(view?.id) < 0 ||
    String(view?.feedbackCode || view?.feedback_code || "")
      .toUpperCase()
      .startsWith("CF");
  const effectiveCollector = collectorOverride || collectorReportInfo;
  const effectiveCitizen = citizenReportInfo;
  const collectionRequestIdForAdjustment = (() => {
    const raw =
      effectiveCollector?.collectionRequestId ??
      effectiveCollector?.collection_request_id ??
      effectiveCitizen?.collectionRequestId ??
      effectiveCitizen?.requestId ??
      effectiveCitizen?.collection_request_id ??
      view?.collectionRequestId ??
      feedback?.collectionRequestId ??
      detail?.collectionRequestId ??
      null;
    if (raw == null) return null;
    const s = String(raw).trim();
    return s ? raw : null;
  })();
  const citizenIdForAdjustment = (() => {
    const raw =
      effectiveCitizen?.citizenId ??
      effectiveCitizen?.citizen_id ??
      effectiveCitizen?.citizen?.id ??
      effectiveCitizen?.citizen?.citizenId ??
      effectiveCitizen?.citizen?.citizen_id ??
      null;
    if (raw == null) return null;
    const n = typeof raw === "number" ? raw : Number(raw);
    return Number.isFinite(n) ? n : null;
  })();
  const collectorReportIdForReward = (() => {
    const raw =
      effectiveCollector?.id ??
      view?.collectorReport?.id ??
      view?.collectorReportId ??
      null;
    if (raw == null) return null;
    const s = String(raw).trim();
    return s ? raw : null;
  })();
  const canUpdatePoints =
    mode === "enterprise" && 
    collectorReportIdForReward != null && 
    collectionRequestIdForAdjustment != null && 
    !isCollectorFeedback;

  const inferredRate = useMemo(() => {
    const categories = Array.isArray(effectiveCollector?.categories) ? effectiveCollector.categories : [];
    const ptsRaw = effectiveCollector?.totalPoint ?? effectiveCollector?.totalPoints ?? effectiveCollector?.points ?? null;
    const pts = typeof ptsRaw === "number" ? ptsRaw : Number(ptsRaw);
    if (!Number.isFinite(pts) || pts <= 0) return null;
    let base = 0;
    for (const c of categories) {
      const p = c?.pointPerUnit ?? c?.point_per_unit ?? c?.point ?? null;
      const q = c?.quantity ?? c?.qty ?? c?.weight ?? c?.actualWeight ?? c?.actual_weight ?? null;
      const pn = typeof p === "number" ? p : Number(p);
      const qn = typeof q === "number" ? q : Number(q);
      if (!Number.isFinite(pn) || !Number.isFinite(qn)) continue;
      base += pn * qn;
    }
    if (!Number.isFinite(base) || base <= 0) return null;
    const r = (pts / base) * 100;
    if (!Number.isFinite(r)) return null;
    return Math.max(0, Math.min(100, Math.round(r)));
  }, [effectiveCollector]);

  const rewardRateNum = Number(rewardRateInput);
  const rewardRateSafe = Number.isFinite(rewardRateNum) ? Math.max(0, Math.min(100, Math.round(rewardRateNum))) : null;
  const handleRewardRateChange = (nextValue) => {
    const s = nextValue == null ? "" : String(nextValue);
    const trimmed = s.trim();
    if (!trimmed) {
      setRewardRateInput("");
      return;
    }
    if (trimmed.startsWith("-")) {
      const now = Date.now();
      if (now - lastNegativeRateWarnAtRef.current > 800) {
        notify.error("Verification rate cannot be negative.");
        lastNegativeRateWarnAtRef.current = now;
      }
      setRewardRateInput("0");
      return;
    }
    const num = Number(trimmed);
    if (Number.isFinite(num) && num < 0) {
      const now = Date.now();
      if (now - lastNegativeRateWarnAtRef.current > 800) {
        notify.error("Verification rate cannot be negative.");
        lastNegativeRateWarnAtRef.current = now;
      }
      setRewardRateInput("0");
      return;
    }
    setRewardRateInput(s);
  };
  const handleRewardRateBlur = () => {
    if (!canUpdatePoints) return;
    const n = Number(rewardRateInput);
    if (!Number.isFinite(n)) return;
    if (n < 0) {
      notify.error("Verification rate cannot be negative.");
      return;
    }
    const rateSafe = Math.max(0, Math.min(100, Math.round(n)));
    setRewardRateInput(String(rateSafe));
  };

  useEffect(() => {
    if (!open) return;
    const raw = effectiveCollector?.verificationRate ?? effectiveCollector?.verification_rate ?? null;
    const num = typeof raw === "number" ? raw : Number(raw);
    if (Number.isFinite(num)) {
      setRewardRateInput(String(Math.max(0, Math.min(100, Math.round(num)))));
      return;
    }
    if (inferredRate != null) {
      setRewardRateInput(String(inferredRate));
      return;
    }
    setRewardRateInput("100");
  }, [effectiveCollector, inferredRate, open]);
  const hasAttached = Boolean(
    view?.wasteReportId ||
      view?.reportEntityId ||
      view?.collectionRequestId ||
      view?.collectorReportId ||
      (view?.reportId != null && String(view.reportId).trim() !== "")
  );
  const isSystemFeedback = 
    String(view?.type || view?.feedbackType || "").toUpperCase().includes("SYSTEM") ||
    (!hasAttached && view?.collectionRequestId == null);
  const isAdmin = mode === "admin";

  const complaintTitle =
    view?.subject ||
    view?.title ||
    `Complaint #${view?.id ?? ""}`;

  const identifierLine = isAdmin
    ? complaintTitle
    : isCollectorFeedback
      ? view?.feedbackCode || view?.feedback_code
        ? `Feedback Code: ${view?.feedbackCode || view?.feedback_code}`
        : `ID: ${view?.id ?? "-"}`
      : `ID: ${view?.id ?? "-"}`;

  const safeSenderName = view?.sender?.name || "Anonymous";
  const linkedEntityId =
    view?.wasteReportId ?? view?.reportEntityId ?? view?.reportId ?? view?.collectionRequestId ?? null;

  const normalizeImageUrl = (value) => {
    if (typeof value === "string") return value.trim();
    if (!value || typeof value !== "object") return "";
    const url =
      value.url ??
      value.imageUrl ??
      value.image_url ??
      value.photoUrl ??
      value.photo_url ??
      value.path ??
      value.src ??
      value.location ??
      "";
    return typeof url === "string" ? url.trim() : "";
  };

  const extractImages = (source) => {
    if (!source || typeof source !== "object") return [];

    const seen = new Set();
    const out = [];
    const pushOne = (value) => {
      const url = normalizeImageUrl(value);
      if (!url) return;
      if (seen.has(url)) return;
      seen.add(url);
      out.push(url);
    };

    const arraySources = [
      source.imageUrls,
      source.image_urls,
      source.photoUrls,
      source.photo_urls,
      source.photos,
      source.images,
      source.imageUrlList,
      source.image_url_list,
    ];
    for (const src of arraySources) {
      if (!Array.isArray(src)) continue;
      for (const it of src) pushOne(it);
    }

    const stringSources = [source.imageUrl, source.image_url, source.photoUrl, source.photo_url, source.images, source.photos];
    for (const src of stringSources) {
      if (typeof src !== "string") continue;
      const s = src.trim();
      if (!s) continue;
      for (const part of s.split(",")) pushOne(part);
    }

    return out;
  };

  const linkedImages = extractImages(view);

  if (!isReady) return null;

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
              {identifierLine}
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

                {linkedEntityId != null && !isSystemFeedback ? (
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

            {!isSystemFeedback && (
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
            )}

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
                ) : view?.status === "RESOLVED" || view?.status === "REJECTED" ? (
                  <div className="p-5 bg-gray-50 border border-dashed border-gray-200 rounded-xl text-gray-500">
                    This complaint is closed but no response note was provided.
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
                        onClick={handleRespond}
                        disabled={!response.trim() || submitting}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        {submitting ? "Submitting..." : decision === "REJECTED" ? "Reject" : "Resolve"}
                      </Button>
                    </div>
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
                    <div className="space-y-6">
                      <EnterpriseAttachedReports
                        citizen={effectiveCitizen}
                        collector={effectiveCollector}
                        loading={loadingReports}
                        fallbackWasteId={view?.wasteReportId ?? view?.reportEntityId ?? view?.reportId}
                        onViewCitizen={(id) => onViewReport?.(id)}
                        onViewCollector={onViewCollectorReport}
                      />
                    </div>
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

            {canUpdatePoints ? (
              <EnterpriseRewardSection
                collector={effectiveCollector}
                rateInput={rewardRateInput}
                onRateChange={handleRewardRateChange}
                onRateBlur={handleRewardRateBlur}
                disabled={submitting}
              />
            ) : null}

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
                    <Button
                      onClick={handleRespond}
                      disabled={
                        !response.trim() ||
                        submitting ||
                        savingReward ||
                        (mode === "enterprise" &&
                          String(decision || "").toUpperCase() === "RESOLVED" &&
                          (loadingDetail || loadingReports)) ||
                        (canUpdatePoints && decision === "RESOLVED" && rewardRateSafe == null)
                      }
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      {submitting ? "Submitting..." : decision === "REJECTED" ? "Reject" : "Resolve"}
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
