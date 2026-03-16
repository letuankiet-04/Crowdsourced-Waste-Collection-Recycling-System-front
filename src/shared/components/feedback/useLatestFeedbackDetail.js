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
        setDetail({
          ...feedback,
          ...data,
          sender: feedback?.sender || undefined,
          reportId: data?.reportId ?? data?.collectionRequestId ?? feedback?.reportId,
          reportEntityId: data?.reportId ?? feedback?.reportEntityId ?? null,
          collectionRequestId: data?.collectionRequestId ?? feedback?.collectionRequestId ?? null,
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
