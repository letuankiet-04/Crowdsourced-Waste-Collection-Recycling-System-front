import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useParams } from "react-router-dom";
import CollectorLayout from "../layouts/CollectorLayout.jsx";
import ReportDetail from "../../../shared/layout/Report_Detail.jsx";
import { normalizeReportStatus, reportStatusToPillVariant } from "../../../shared/lib/reportStatus.js";
import StatusPill from "../../../shared/ui/StatusPill.jsx";
import { Card, CardBody, CardHeader, CardTitle } from "../../../shared/ui/Card.jsx";
import Button from "../../../shared/ui/Button.jsx";
import ConfirmDialog from "../../../shared/ui/ConfirmDialog.jsx";
import { PATHS } from "../../../app/routes/paths.js";
import { CheckCircle2, Truck, X, XCircle } from "lucide-react";
import useNotify from "../../../shared/hooks/useNotify.js";
import CollectReportDialog from "../../../components/collector/CollectReportDialog.jsx";
import {
  acceptCollectorTask,
  completeCollectorTask,
  getCollectorCreateReport,
  getCollectorTasks,
  getCollectorWorkHistory,
  markCollectorCollected,
  rejectCollectorTask,
  startCollectorTask,
} from "../../../services/collector.service.js";

export default function CollectorReportDetail() {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const notify = useNotify();
  const id = reportId ? String(reportId) : "";
  const [task, setTask] = useState(null);
  const [createReport, setCreateReport] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!id) return;
      const requestId = Number(id);
      if (!Number.isFinite(requestId)) return;
      setLoading(true);
      try {
        const [createData, tasksData, historyData] = await Promise.all([
          getCollectorCreateReport(requestId).catch(() => null),
          getCollectorTasks({ all: true }).catch(() => []),
          getCollectorWorkHistory().catch(() => []),
        ]);

        if (!active) return;

        const tasks = Array.isArray(tasksData) ? tasksData : [];
        const foundTask = tasks.find((t) => Number(t?.id) === requestId) ?? null;

        const history = Array.isArray(historyData) ? historyData : [];
        const foundHistory =
          history.find((h) => Number(h?.collectionRequestId) === requestId) ??
          history.find((h) => Number(h?.id) === requestId) ??
          null;

        const syntheticTask = foundTask
          ? foundTask
          : foundHistory
            ? {
                id: foundHistory.collectionRequestId ?? requestId,
                requestCode: foundHistory.requestCode ?? null,
                status: foundHistory.status ?? null,
                createdAt: foundHistory.updatedAt ?? foundHistory.startedAt ?? null,
                updatedAt: foundHistory.updatedAt ?? null,
              }
            : null;

        setTask(syntheticTask);
        setCreateReport(createData);
      } catch (e) {
        if (!active) return;
        setTask(null);
        setCreateReport(null);
        notify.error("Unable to load task", e?.message || "Request failed");
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
    const coords =
      createReport?.latitude != null && createReport?.longitude != null
        ? { lat: Number(createReport.latitude), lng: Number(createReport.longitude) }
        : null;
    const items = Array.isArray(createReport?.items) ? createReport.items : [];
    const wasteItems = items
      .map((it) => {
        const name = it?.categoryName ? String(it.categoryName) : null;
        const estimatedWeight = it?.suggestedQuantity != null ? Number(it.suggestedQuantity) : NaN;
        if (!name || !Number.isFinite(estimatedWeight)) return null;
        return { name, unit: it?.wasteUnit ? String(it.wasteUnit).toLowerCase() : "kg", estimatedWeight };
      })
      .filter(Boolean);

    return {
      id,
      reportCode: createReport?.wasteReportCode ?? task?.requestCode ?? null,
      status: task?.status ?? null,
      createdAt: task?.createdAt ?? task?.assignedAt ?? task?.updatedAt ?? null,
      updatedAt: task?.updatedAt ?? null,
      address: createReport?.address ?? null,
      coords,
      images: Array.isArray(createReport?.imageUrls) ? createReport.imageUrls : [],
      types: createReport?.wasteType ? [String(createReport.wasteType)] : [],
      wasteItems,
    };
  }, [createReport, id, task]);

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
      const data = await getCollectorTasks({ all: true });
      const next = Array.isArray(data) ? data.find((t) => Number(t?.id) === requestId) ?? null : null;
      if (next) setTask(next);
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
        <ReportDetail
          report={report}
          backTo={PATHS.collector.dashboard}
          title="Task Detail"
          description={id ? `Viewing task: ${id}` : "Viewing task"}
          backLabel="Back to dashboard"
          showWaste
          showWasteTypes={false}
          wasteItemsLabel="Waste item"
        />

        <Card className="overflow-hidden bg-gradient-to-br from-blue-50/70 via-white to-white">
            <CardHeader className="py-6 px-8">
            <div className="min-w-0">
              <CardTitle className="text-2xl">Update Status</CardTitle>
              <div className="mt-1 text-sm text-gray-600">
                Update the status of this collection task as you progress.
              </div>
            </div>
            <div className="flex items-center gap-3">
               <StatusPill variant={reportStatusToPillVariant(task?.status)}>{statusLabel}</StatusPill>
            </div>
          </CardHeader>
          <CardBody className="p-8">
             <div className="flex flex-wrap justify-end gap-3">
                {canAccept && (
                  <>
                    {canReject && (
                      <Button
                        size="lg"
                        className="rounded-full bg-red-600 hover:bg-red-700 text-white"
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
                      className="rounded-full bg-blue-600 hover:bg-blue-700 text-white"
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
                              const data = await getCollectorTasks({ all: true });
                              const next = Array.isArray(data)
                                ? data.find((t) => Number(t?.id) === requestId) ?? null
                                : null;
                              setTask(next);
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
                    className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white"
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
                            const data = await getCollectorTasks({ all: true });
                            const next = Array.isArray(data) ? data.find((t) => Number(t?.id) === requestId) ?? null : null;
                            setTask(next);
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
                          const data = await getCollectorTasks({ all: true });
                          const next = Array.isArray(data) ? data.find((t) => Number(t?.id) === requestId) ?? null : null;
                          if (next) setTask(next);
                          else navigate(PATHS.collector.dashboard, { replace: true });
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
          categories={Array.isArray(createReport?.items) ? createReport.items : []}
          initialAddress={initialCollectedAddress}
          initialCoords={initialCollectedCoords}
          onSubmit={submitCollected}
        />
      </div>
    </CollectorLayout>
  );
}
