import { useEffect, useState } from "react";
import { getCollectorCreateReport, getCollectorTasks, getCollectorWorkHistory } from "../../../services/collector.service.js";
import { buildSyntheticCollectorTask } from "../pages/collectorReportDetail.utils.js";

export default function useCollectorReportDetail({ id, notify }) {
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
        setTask(buildSyntheticCollectorTask({ requestId, tasksData, historyData }));
        setCreateReport(createData);
      } catch (e) {
        if (!active) return;
        setTask(null);
        setCreateReport(null);
        notify?.error("Unable to load task", e?.message || "Request failed");
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, [id, notify]);

  return { task, createReport, loading };
}

