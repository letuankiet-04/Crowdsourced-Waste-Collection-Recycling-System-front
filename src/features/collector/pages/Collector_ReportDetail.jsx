import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import CollectorLayout from "../layouts/CollectorLayout.jsx";
import ReportDetail from "../../../shared/layout/Report_Detail.jsx";
import { normalizeReportStatus, reportStatusToPillVariant } from "../../../shared/lib/reportStatus.js";
import StatusPill from "../../../shared/ui/StatusPill.jsx";
import { Card, CardBody, CardHeader, CardTitle } from "../../../shared/ui/Card.jsx";
import Button from "../../../shared/ui/Button.jsx";
import ConfirmDialog from "../../../shared/ui/ConfirmDialog.jsx";
import PageHeader from "../../../shared/ui/PageHeader.jsx";
import { PATHS } from "../../../app/routes/paths.js";
import { CheckCircle2, Truck, X, XCircle } from "lucide-react";
import useNotify from "../../../shared/hooks/useNotify.js";
import CollectReportDialog from "../../../components/collector/CollectReportDialog.jsx";
import {
  acceptCollectorTask,
  completeCollectorTask,
  getCollectorReportByCollectionRequest,
  getCollectorTaskDetail,
  markCollectorCollected,
  rejectCollectorTask,
  startCollectorTask,
} from "../../../services/collector.service.js";

export default function CollectorReportDetail() {
  const { reportId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const notify = useNotify();
  const stateReport = location?.state?.report ?? null;
  const stateId = stateReport?.collectionRequestId ?? stateReport?.requestId ?? stateReport?.id ?? null;
  const id = reportId ? String(reportId) : stateId != null ? String(stateId) : "";

  const [task, setTask] = useState(() => {
    if (!stateReport) return null;
    const taskId = stateId != null ? Number(stateId) : null;
    return {
      id: Number.isFinite(taskId) ? taskId : null,
      requestCode: stateReport?.reportCode ?? stateReport?.code ?? null,
      status: stateReport?.status ?? null,
      createdAt: stateReport?.createdAt ?? null,
      updatedAt: stateReport?.updatedAt ?? null,
    };
  });
  const [taskDetail, setTaskDetail] = useState(null);
  const [collectorReport, setCollectorReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [reportError, setReportError] = useState("");

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!id) return;
      const requestId = Number(id);
      if (!Number.isFinite(requestId)) return;
      setLoading(true);
      setReportError("");
      try {
        const [detailData, reportData] = await Promise.all([
          getCollectorTaskDetail(requestId),
          getCollectorReportByCollectionRequest(requestId).catch(() => null),
        ]);

        if (!active) return;

        setTask({
          id: requestId,
          requestCode: detailData?.reportCode ?? null,
          status: detailData?.status ?? null,
          createdAt: detailData?.createdAt ?? null,
          updatedAt: null,
        });
        setTaskDetail(detailData);
        setCollectorReport(reportData);
      } catch (e) {
        if (!active) return;
        setReportError(e?.message || "Request failed");
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [id, notify]);

  const report = useMemo(() => {
    if (!id) return null;
    if (!taskDetail && !collectorReport && !stateReport) return null;
    const baseCoords =
      taskDetail?.latitude != null && taskDetail?.longitude != null
        ? { lat: Number(taskDetail.latitude), lng: Number(taskDetail.longitude) }
        : stateReport?.coords ?? null;

    const collectedCoords =
      collectorReport?.latitude != null && collectorReport?.longitude != null
        ? { lat: Number(collectorReport.latitude), lng: Number(collectorReport.longitude) }
        : null;

    const collectedCategories = Array.isArray(collectorReport?.categories) ? collectorReport.categories : [];
    const collectedWasteItems = collectedCategories
      .map((it) => {
        const name = it?.name ? String(it.name) : null;
        const estimatedWeight = it?.quantity != null ? Number(it.quantity) : NaN;
        if (!name || !Number.isFinite(estimatedWeight)) return null;
        return { name, unit: it?.unit ? String(it.unit).toLowerCase() : "kg", estimatedWeight };
      })
      .filter(Boolean);

    const suggestedCategories = Array.isArray(taskDetail?.categories) ? taskDetail.categories : [];
    const suggestedWasteItems = suggestedCategories
      .map((it) => {
        const name = it?.name ? String(it.name) : null;
        const estimatedWeight = it?.quantity != null ? Number(it.quantity) : NaN;
        if (!name || !Number.isFinite(estimatedWeight)) return null;
        return { name, unit: it?.unit ? String(it.unit).toLowerCase() : "kg", estimatedWeight };
      })
      .filter(Boolean);

    return {
      id,
      collectionRequestId: taskDetail?.collectionRequestId ?? collectorReport?.collectionRequestId ?? Number(id),
      reportCode:
        taskDetail?.reportCode ??
        collectorReport?.reportCode ??
        task?.requestCode ??
        stateReport?.reportCode ??
        stateReport?.code ??
        null,
      status: task?.status ?? collectorReport?.status ?? stateReport?.status ?? null,
      createdAt: task?.createdAt ?? collectorReport?.createdAt ?? stateReport?.createdAt ?? task?.assignedAt ?? task?.updatedAt ?? null,
      updatedAt: task?.updatedAt ?? null,
      address: taskDetail?.address ?? stateReport?.address ?? null,
      coords: baseCoords,
      collectedCoords,
      images: Array.isArray(taskDetail?.imageUrls) ? taskDetail.imageUrls : stateReport?.images ?? stateReport?.imageUrls ?? [],
      collectedImages: Array.isArray(collectorReport?.imageUrls) ? collectorReport.imageUrls : [],
      types: taskDetail?.wasteType ? [String(taskDetail.wasteType)] : Array.isArray(stateReport?.types) ? stateReport.types : [],
      wasteItems: collectedWasteItems.length ? collectedWasteItems : suggestedWasteItems,
    };
  }, [collectorReport, id, stateReport, task, taskDetail]);

  const rawStatus = String(task?.status || "").trim().toLowerCase();
  const statusLabel = normalizeReportStatus(task?.status);
  const canAccept = rawStatus === "assigned";
  const canReject = canAccept;
  const canStart = rawStatus === "accepted_collector";
  const canCollect = rawStatus === "on_the_way";
  const canSubmitReport = rawStatus === "collected";

  const [collectOpen, setCollectOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectReasonError, setRejectReasonError] = useState("");
  const [rejectSubmitting, setRejectSubmitting] = useState(false);

  function openCollectDialog() {
    if (!report || !canSubmitReport) return;
    setCollectOpen(true);
  }

  async function confirmCollected() {
    if (!report || !canCollect) return;
    const requestId = Number(id);
    if (!Number.isFinite(requestId)) return;
    try {
      await markCollectorCollected(requestId);
      const nextDetail = await getCollectorTaskDetail(requestId);
      setTask({
        id: requestId,
        requestCode: nextDetail?.reportCode ?? null,
        status: nextDetail?.status ?? null,
        createdAt: nextDetail?.createdAt ?? null,
        updatedAt: null,
      });
      setTaskDetail(nextDetail);
      notify.success("Collected", "Task marked as collected.");
    } catch (e) {
      notify.error("Unable to mark collected", e?.message || "Request failed");
    }
  }

  const initialCollectedAddress = useMemo(() => {
    if (typeof report?.address === "string") return report.address;
    return "";
  }, [report]);

  const initialCollectedCoords = useMemo(() => {
    return report?.coords ?? null;
  }, [report]);

  async function submitCollected(payload) {
    if (!report || !canSubmitReport) return false;
    const requestId = Number(id);
    if (!Number.isFinite(requestId)) return false;
    try {
      await completeCollectorTask(requestId, payload || {});
      setTask((prev) => (prev ? { ...prev, status: "completed" } : prev));
      notify.success("Completed", "Collection report submitted.");
      setCollectOpen(false);
      navigate(PATHS.collector.history, { replace: true });
      return true;
    } catch (e) {
      notify.error("Unable to submit report", e?.message || "Request failed");
      return false;
    }
  }

  return (
    <CollectorLayout>
      <div className="space-y-8">
        {loading && !report ? (
          <div className="space-y-8">
            <PageHeader
              title="Report Detail"
              description={id ? `Loading report: ${id}` : "Loading report"}
              right={
                <Button as={Link} to={PATHS.collector.tasks} variant="outline" size="sm" className="rounded-full">
                  Back to tasks
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

        {!loading || report ? (
          <ReportDetail
            report={report}
            backTo={PATHS.collector.tasks}
            title="Report Detail"
            description={id ? `Viewing report: ${id}` : "Viewing report"}
            backLabel="Back to tasks"
            showWaste
            showWasteTypes
            showSubmittedBy={false}
          />
        ) : null}
        {reportError && !loading ? <div className="text-sm text-red-600">{reportError}</div> : null}

        <Card className="overflow-hidden bg-gradient-to-br from-emerald-50/70 via-white to-white">
          <CardHeader className="py-6 px-8">
            <div className="min-w-0">
              <CardTitle className="text-2xl">Decision</CardTitle>
              <div className="mt-1 text-sm text-gray-600">
                Update this task as you progress through collection.
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-xs text-gray-500">
                {report?.updatedAt
                  ? `Updated ${new Date(report.updatedAt).toLocaleString()}`
                  : report?.createdAt
                    ? `Created ${new Date(report.createdAt).toLocaleString()}`
                    : null}
              </div>
              <StatusPill variant={reportStatusToPillVariant(task?.status)}>{statusLabel}</StatusPill>
            </div>
          </CardHeader>
          <CardBody className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 items-center">
              <div className="rounded-2xl border border-emerald-100 bg-white/70 p-5">
                <div className="text-sm font-semibold text-gray-900">What happens next</div>
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-700">
                  <div className="flex items-start gap-2">
                    <Truck className="h-5 w-5 text-emerald-700 mt-0.5" aria-hidden="true" />
                    <div>
                      <div className="font-semibold text-gray-900">Progress</div>
                      <div className="text-gray-600">Accept, start, confirm collected, then submit the collection report.</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <XCircle className="h-5 w-5 text-red-700 mt-0.5" aria-hidden="true" />
                    <div>
                      <div className="font-semibold text-gray-900">Reject</div>
                      <div className="text-gray-600">If you cannot handle it, reject so it can be reassigned.</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap justify-end gap-3">
                {canAccept && (
                  <>
                    {canReject && (
                      <Button
                        variant="outline"
                        size="lg"
                        className="rounded-full border-red-600 text-red-700 hover:bg-red-50"
                        disabled={loading || rejectSubmitting}
                        onClick={() => {
                          setRejectReason("");
                          setRejectReasonError("");
                          setRejectOpen(true);
                        }}
                      >
                        <XCircle className="h-5 w-5" aria-hidden="true" />
                        Reject Task
                      </Button>
                    )}

                    <Button
                      size="lg"
                      className="rounded-full"
                      disabled={loading}
                      onClick={() => {
                        setConfirmConfig({
                          title: "Are you sure you want to accept this task?",
                          description: "If you continue, the task status will be updated to Accepted.",
                          confirmText: "Accept",
                          confirmClassName: "bg-blue-600 hover:bg-blue-700 text-white",
                          action: async () => {
                            const requestId = Number(id);
                            if (!Number.isFinite(requestId)) return;
                            try {
                              await acceptCollectorTask(requestId);
                              const nextDetail = await getCollectorTaskDetail(requestId);
                              setTask({
                                id: requestId,
                                requestCode: nextDetail?.reportCode ?? null,
                                status: nextDetail?.status ?? null,
                                createdAt: nextDetail?.createdAt ?? null,
                                updatedAt: null,
                              });
                              setTaskDetail(nextDetail);
                              notify.success("Accepted", "Task accepted successfully.");
                            } catch (e) {
                              notify.error("Unable to accept task", e?.message || "Request failed");
                            }
                          },
                        });
                      }}
                    >
                      <Truck className="h-5 w-5" aria-hidden="true" />
                      Accept Task
                    </Button>
                  </>
                )}
                {canStart && (
                  <Button
                    size="lg"
                    className="rounded-full"
                    disabled={loading}
                    onClick={() => {
                      setConfirmConfig({
                        title: "Are you sure you want to start this task?",
                        description: "If you continue, the task status will be updated to On the way.",
                        confirmText: "Start",
                        confirmClassName: "bg-indigo-600 hover:bg-indigo-700 text-white",
                        action: async () => {
                          const requestId = Number(id);
                          if (!Number.isFinite(requestId)) return;
                          try {
                            await startCollectorTask(requestId);
                            const nextDetail = await getCollectorTaskDetail(requestId);
                            setTask({
                              id: requestId,
                              requestCode: nextDetail?.reportCode ?? null,
                              status: nextDetail?.status ?? null,
                              createdAt: nextDetail?.createdAt ?? null,
                              updatedAt: null,
                            });
                            setTaskDetail(nextDetail);
                            notify.success("Started", "Task started successfully.");
                          } catch (e) {
                            notify.error("Unable to start task", e?.message || "Request failed");
                          }
                        },
                      });
                    }}
                  >
                    <Truck className="h-5 w-5" aria-hidden="true" />
                    Start Task
                  </Button>
                )}
                 {canCollect && (
                    <Button
                    size="lg"
                    className="rounded-full bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => {
                      setConfirmConfig({
                        title: "Are you sure you want to confirm collected?",
                        description: "If you continue, the task status will be updated to Collected.",
                        confirmText: "Confirm",
                        confirmClassName: "bg-green-600 hover:bg-green-700 text-white",
                        action: confirmCollected,
                      });
                    }}
                    >
                    <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                    Confirm Collected
                    </Button>
                )}
                {rawStatus === "collected" && (
                  <Button
                    size="lg"
                    className="rounded-full bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => {
                      openCollectDialog();
                    }}
                  >
                    <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                    Submit Collection Report
                  </Button>
                )}
                {!canAccept && !canStart && !canCollect && rawStatus && rawStatus !== "collected" && rawStatus !== "completed" && (
                    <div className="text-gray-500">No actions available for this status.</div>
                )}
                 {rawStatus === "completed" && (
                    <div className="flex items-center gap-2 text-green-700 font-medium">
                        <CheckCircle2 className="h-5 w-5" />
                        Task Completed
                    </div>
                )}
             </div>
            </div>
          </CardBody>
        </Card>

        <ConfirmDialog
          open={Boolean(confirmConfig)}
          title={confirmConfig?.title}
          description={confirmConfig?.description}
          confirmText={confirmConfig?.confirmText}
          cancelText="Cancel"
          confirmDisabled={loading}
          confirmClassName={confirmConfig?.confirmClassName}
          onClose={() => setConfirmConfig(null)}
          onConfirm={async () => {
            const action = confirmConfig?.action;
            setConfirmConfig(null);
            await action?.();
          }}
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
                <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-black/5">
                  <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-gray-100">
                    <div className="min-w-0">
                      <div className="text-lg font-semibold text-gray-900">Reject task</div>
                      <div className="mt-1 text-sm text-gray-600">Provide a reason so the enterprise can reassign.</div>
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
                      className="rounded-full bg-red-600 hover:bg-red-700 text-white"
                      disabled={rejectSubmitting}
                      onClick={async () => {
                        const requestId = Number(id);
                        if (!Number.isFinite(requestId)) return;
                        const reason = rejectReason.trim();
                        if (!reason) {
                          setRejectReasonError("Rejection reason is required.");
                          return;
                        }

                        try {
                          setRejectSubmitting(true);
                          await rejectCollectorTask(requestId, reason);
                          try {
                            const nextDetail = await getCollectorTaskDetail(requestId);
                            setTask({
                              id: requestId,
                              requestCode: nextDetail?.reportCode ?? null,
                              status: nextDetail?.status ?? null,
                              createdAt: nextDetail?.createdAt ?? null,
                              updatedAt: null,
                            });
                            setTaskDetail(nextDetail);
                          } catch {
                            navigate(PATHS.collector.dashboard, { replace: true });
                          }
                          setRejectOpen(false);
                          notify.success("Rejected", "Task rejected. The enterprise can reassign it.");
                        } catch (e) {
                          setRejectSubmitting(false);
                          setRejectReasonError(e?.message || "Request failed");
                        }
                      }}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              </div>,
              document.body
            )
          : null}

        <CollectReportDialog
          open={collectOpen}
          onClose={() => setCollectOpen(false)}
          reportId={report?.id ?? null}
          statusLabel={statusLabel}
          statusVariant={reportStatusToPillVariant(task?.status)}
          categories={
            Array.isArray(taskDetail?.categories)
              ? taskDetail.categories.map((c) => ({
                  id: c?.id ?? null,
                  name: c?.name ?? null,
                  unit: c?.unit ?? null,
                  estimatedWeight: c?.quantity,
                }))
              : []
          }
          initialAddress={initialCollectedAddress}
          initialCoords={initialCollectedCoords}
          onSubmit={submitCollected}
        />
      </div>
    </CollectorLayout>
  );
}
