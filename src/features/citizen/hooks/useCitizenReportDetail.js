import { useEffect, useState } from "react";
import { getMyReportById, getMyReportResult, getWasteCategories } from "../../../services/reports.service.js";
import { mapWasteCategoryOptions } from "../pages/citizenReportDetail.utils.js";

export default function useCitizenReportDetail({ reportId, notify }) {
  const [apiReport, setApiReport] = useState(null);
  const [apiResult, setApiResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState([]);

  useEffect(() => {
    if (!reportId) return;
    let cancelled = false;
    Promise.resolve().then(() => {
      if (cancelled) return;
      setLoading(true);
      Promise.all([getMyReportById(reportId), getMyReportResult(reportId), getWasteCategories()])
        .then(([r, res, cats]) => {
          if (cancelled) return;
          setApiReport(r ?? null);
          setApiResult(res ?? null);
          setCategoryOptions(mapWasteCategoryOptions(cats));
        })
        .catch((err) => notify?.error("Load report failed", err?.message || "Unable to load report."))
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    });

    return () => {
      cancelled = true;
    };
  }, [reportId, notify]);

  return { apiReport, apiResult, loading, categoryOptions };
}
