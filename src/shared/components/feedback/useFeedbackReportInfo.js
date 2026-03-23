import { useEffect, useState } from "react";
import {
  getEnterpriseWasteReportById,
  getCollectorReportDetail,
  getCollectorReports,
} from "../../../services/enterprise.service.js";

function uniqueIds(values) {
  const seen = new Set();
  const out = [];
  for (const v of values) {
    if (v == null || v === "") continue;
    const key = String(v);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(v);
  }
  return out;
}

function pickCollectorReportIdFromWasteReport(w) {
  if (!w || typeof w !== "object") return null;
  const direct = w.collectorReportId ?? w.collector_report_id ?? w.collectorSubmissionId;
  if (direct != null && direct !== "") return direct;
  const nested = w.collectorReport ?? w.collectorSubmission ?? w.collector_report;
  if (nested && typeof nested === "object" && nested.id != null) return nested.id;
  return null;
}

function collectionRequestIdFromSources(citizenReport, detailCollectionRequestId, fallbackCollectionRequestId) {
  return (
    citizenReport?.collectionRequestId ??
    citizenReport?.requestId ??
    citizenReport?.collection_request_id ??
    detailCollectionRequestId ??
    fallbackCollectionRequestId ??
    null
  );
}

async function resolveCollectorByCollectionRequest({
  detailCollectionRequestId,
  fallbackCollectionRequestId,
  citizenReport,
}) {
  const requestId = collectionRequestIdFromSources(
    citizenReport,
    detailCollectionRequestId,
    fallbackCollectionRequestId
  );
  if (requestId == null || String(requestId).trim() === "") return null;

  let list = [];
  try {
    const raw = await getCollectorReports({ collectionRequestId: requestId });
    list = Array.isArray(raw) ? raw : raw?.items ?? [];
  } catch {
    list = [];
  }

  if (!list.length) {
    try {
      const raw = await getCollectorReports();
      list = Array.isArray(raw) ? raw : raw?.items ?? [];
    } catch {
      return null;
    }
  }

  const hit =
    list.find((r) => Number(r?.collectionRequestId) === Number(requestId)) ??
    list.find((r) => String(r?.collectionRequestId) === String(requestId));

  if (hit?.id == null) return null;

  try {
    return await getCollectorReportDetail(String(hit.id));
  } catch {
    return null;
  }
}

export default function useFeedbackReportInfo({ open, mode, detail, fallback }) {
  const [citizenReportInfo, setCitizenReportInfo] = useState(null);
  const [collectorReportInfo, setCollectorReportInfo] = useState(null);
  const [loadingReports, setLoadingReports] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const wasteCandidates = uniqueIds([
      detail?.wasteReportId,
      detail?.reportEntityId,
      fallback?.wasteReportId,
      fallback?.reportEntityId,
    ]);

    const hasAnyLink =
      wasteCandidates.length > 0 ||
      detail?.collectionRequestId != null ||
      fallback?.collectionRequestId != null ||
      detail?.collectorReportId != null ||
      fallback?.collectorReportId != null;

    if (!open || mode === "admin" || !hasAnyLink) {
      Promise.resolve().then(() => {
        if (cancelled) return;
        setCitizenReportInfo(null);
        setCollectorReportInfo(null);
        setLoadingReports(false);
      });
      return () => {
        cancelled = true;
      };
    }

    Promise.resolve().then(() => {
      if (!cancelled) setLoadingReports(true);
    });

    void (async () => {
      let citizen = null;
      for (const c of wasteCandidates) {
        if (cancelled) break;
        try {
          const data = await getEnterpriseWasteReportById(c);
          if (data) {
            citizen = data;
            break;
          }
        } catch {
          void 0;
        }
      }

      let collector = null;
      const explicitCollector = detail?.collectorReportId ?? fallback?.collectorReportId ?? null;
      if (!cancelled && explicitCollector != null && String(explicitCollector).trim() !== "") {
        try {
          collector = await getCollectorReportDetail(String(explicitCollector));
        } catch {
          collector = null;
        }
      }

      if (!collector && !cancelled) {
        const fromWaste = pickCollectorReportIdFromWasteReport(citizen);
        if (fromWaste != null && String(fromWaste).trim() !== "") {
          try {
            collector = await getCollectorReportDetail(String(fromWaste));
          } catch {
            collector = null;
          }
        }
      }

      if (!collector && !cancelled) {
        try {
          collector = await resolveCollectorByCollectionRequest({
            detailCollectionRequestId: detail?.collectionRequestId ?? null,
            fallbackCollectionRequestId: fallback?.collectionRequestId ?? null,
            citizenReport: citizen,
          });
        } catch {
          collector = null;
        }
      }

      if (cancelled) return;
      setCitizenReportInfo(citizen || null);
      setCollectorReportInfo(collector || null);
      setLoadingReports(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [
    open,
    mode,
    detail?.wasteReportId,
    detail?.reportEntityId,
    detail?.collectionRequestId,
    detail?.collectorReportId,
    fallback?.wasteReportId,
    fallback?.reportEntityId,
    fallback?.collectionRequestId,
    fallback?.collectorReportId,
  ]);

  return { citizenReportInfo, collectorReportInfo, loadingReports };
}
