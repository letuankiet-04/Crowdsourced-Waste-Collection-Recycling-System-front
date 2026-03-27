import { useEffect, useState } from "react";
import { getMyReportById, getMyReportCollectorReport, getMyReportResult, getWasteCategories } from "../../../services/reports.service.js";
import { mapWasteCategoryOptions } from "../pages/citizenReportDetail.utils.js";

export default function useCitizenReportDetail({ reportId, notify }) {
  const [apiReport, setApiReport] = useState(null);
  const [apiResult, setApiResult] = useState(null);
  const [collectorReport, setCollectorReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState([]);

  useEffect(() => {
    if (!reportId) return;
    let cancelled = false;
    let inFlight = false;

    const fetchData = ({ silent } = {}) => {
      if (cancelled || inFlight) return;
      inFlight = true;
      if (!silent) {
        setLoading(true);
        setApiReport(null);
        setApiResult(null);
        setCollectorReport(null);
      }
      Promise.all([
        getMyReportById(reportId),
        getWasteCategories(),
        getMyReportResult(reportId).catch(() => null),
        getMyReportCollectorReport(reportId).catch(() => null),
      ])
        .then(([r, cats, res, cr]) => {
          if (cancelled) return;
          setApiReport(r ?? null);
          setApiResult(res ?? null);
          setCollectorReport(cr ?? null);
          setCategoryOptions(mapWasteCategoryOptions(cats));
        })
        .catch((err) => notify?.error("Load report failed", err?.message || "Unable to load report."))
        .finally(() => {
          inFlight = false;
          if (!cancelled && !silent) setLoading(false);
        });
    };

    fetchData({ silent: false });

    const onFocus = () => {
      fetchData({ silent: true });
    };
    const onVisibilityChange = () => {
      if (!document.hidden) fetchData({ silent: true });
    };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibilityChange);

    const interval = window.setInterval(() => {
      if (!document.hidden) fetchData({ silent: true });
    }, 20000);

    return () => {
      cancelled = true;
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.clearInterval(interval);
    };
  }, [reportId, notify]);

  return { apiReport, apiResult, collectorReport, loading, categoryOptions };
}
