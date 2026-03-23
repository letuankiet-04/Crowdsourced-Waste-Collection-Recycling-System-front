import { useEffect, useState } from "react";
import { getAdminFeedbackById, getEnterpriseFeedbackById } from "../../../services/feedback.service.js";

export default function useLatestFeedbackDetail({ open, feedback, mode }) {
  const [detail, setDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    if (!open) {
      setDetail(null);
      setLoadingDetail(false);
      return;
    }

    if (!feedback?.id) {
      setDetail(feedback || null);
      return;
    }

    let cancelled = false;
    setLoadingDetail(true);
    void (async () => {
      try {
        const data = mode === "admin" ? await getAdminFeedbackById(feedback.id) : await getEnterpriseFeedbackById(feedback.id);
        if (cancelled) return;
        const wasteReportId =
          data?.wasteReportId ??
          data?.waste_report_id ??
          data?.reportId ??
          data?.report_id ??
          feedback?.wasteReportId ??
          feedback?.reportEntityId ??
          null;
        const collectionRequestId =
          data?.collectionRequestId ??
          data?.collection_request_id ??
          data?.requestId ??
          feedback?.collectionRequestId ??
          null;
        const collectorReportId =
          data?.collectorReportId ??
          data?.collector_report_id ??
          data?.collectorSubmissionId ??
          feedback?.collectorReportId ??
          null;

        setDetail({
          ...feedback,
          ...data,
          sender: feedback?.sender || undefined,
          wasteReportId,
          reportEntityId: wasteReportId,
          collectionRequestId,
          collectorReportId,
          reportId:
            wasteReportId ?? collectionRequestId ?? collectorReportId ?? feedback?.reportId ?? null,
        });
      } catch {
        if (cancelled) return;
        setDetail(feedback || null);
      } finally {
        if (!cancelled) setLoadingDetail(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, feedback, mode]);

  return { detail, loadingDetail };
}
