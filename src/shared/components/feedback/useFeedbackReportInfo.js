import { useEffect, useState } from "react";
import { getEnterpriseWasteReportById } from "../../../services/enterprise.service.js";

export default function useFeedbackReportInfo({ open, mode, detail, fallback }) {
  const [reportInfo, setReportInfo] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const primary = detail?.reportEntityId ?? fallback?.reportEntityId;
    const secondary = detail?.reportId ?? fallback?.reportId;
    const tertiary = detail?.collectionRequestId ?? fallback?.collectionRequestId;
    const candidates = [primary, secondary, tertiary].filter((v) => v != null && v !== "");

    if (!open || mode === "admin" || candidates.length === 0) {
      Promise.resolve().then(() => {
        if (cancelled) return;
        setReportInfo(null);
        setLoadingReport(false);
      });
      return () => {
        cancelled = true;
      };
    }

    Promise.resolve().then(() => {
      if (!cancelled) setLoadingReport(true);
    });
    void (async () => {
      let found = null;
      for (const c of candidates) {
        if (cancelled) break;
        try {
          const data = await getEnterpriseWasteReportById(c);
          if (data) {
            found = data;
            break;
          }
        } catch {
          void 0;
        }
      }
      if (cancelled) return;
      setReportInfo(found || null);
      setLoadingReport(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [open, mode, detail?.reportId, detail?.reportEntityId, detail?.collectionRequestId, fallback?.reportId, fallback?.reportEntityId, fallback?.collectionRequestId]);

  return { reportInfo, loadingReport };
}
