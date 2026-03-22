import { useEffect, useMemo, useState } from "react";
import CollectorLayout from "../layouts/CollectorLayout.jsx";
import PageHeader from "../../../shared/ui/PageHeader.jsx";
import ActionCard from "../../../shared/ui/ActionCard.jsx";
import { Card, CardBody, CardHeader, CardTitle } from "../../../shared/ui/Card.jsx";
import useStoredUser from "../../../shared/hooks/useStoredUser.js";
import useNotify from "../../../shared/hooks/useNotify.js";
import { ClipboardList, History, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PATHS } from "../../../app/routes/paths.js";
import ReportRow from "../../../shared/ui/ReportRow.jsx";
import { getCollectorTasks } from "../../../services/collector.service.js";
import { normalizeReportStatus } from "../../../shared/lib/reportStatus.js";

function getTaskAddress(t) {
  const loc = t?.location;
  if (typeof loc === "string") return loc;
  return loc?.address ?? t?.address ?? t?.collectedAddress ?? null;
}

function getTaskCoords(t) {
  const loc = t?.location;
  const latRaw = (loc && typeof loc === "object" ? loc.latitude : undefined) ?? t?.latitude ?? t?.lat ?? t?.coords?.lat;
  const lngRaw = (loc && typeof loc === "object" ? loc.longitude : undefined) ?? t?.longitude ?? t?.lng ?? t?.coords?.lng;
  const lat = Number(latRaw);
  const lng = Number(lngRaw);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng };
}

export default function CollectorDashboard() {
  const { user, displayName } = useStoredUser();
  const notify = useNotify();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);

  const allTasks = useMemo(() => {
    const list = Array.isArray(tasks) ? tasks : [];
    return list.map((t) => ({
      id: t?.id != null ? String(t.id) : "",
      reportCode: t?.requestCode ?? null,
      status: t?.status ?? null,
      createdAt: t?.createdAt ?? t?.assignedAt ?? t?.updatedAt ?? null,
      address: getTaskAddress(t),
      coords: getTaskCoords(t),
    }));
  }, [tasks]);

  const pendingTaskCount = useMemo(() => {
    return allTasks.filter((t) => normalizeReportStatus(t.status) !== "Completed").length;
  }, [allTasks]);

  const recentTasks = useMemo(() => {
    const result = [...allTasks];
    result.sort((a, b) => {
      const ta = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tb = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
      return tb - ta;
    });
    return result.slice(0, 10);
  }, [allTasks]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const data = await getCollectorTasks();
        if (!active) return;
        setTasks(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!active) return;
        setTasks([]);
        notify.error(
          "Không thể tải danh sách nhiệm vụ",
          e?.message || "Dịch vụ cho người thu gom hiện đang gặp sự cố. Vui lòng thử lại sau."
        );
      }
    };
    if (user) load();
    return () => {
      active = false;
    };
  }, [notify, user]);

  return (
    <CollectorLayout>
      <div className="space-y-8">
        <PageHeader
          title={`Hello, ${displayName}.`}
          description={
            <>
              You have <span className="font-bold text-emerald-700">{pendingTaskCount}</span> pending tasks.
            </>
          }
        />

        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
            <ActionCard
              to={PATHS.collector.tasks}
              title="My Tasks"
              variant="green"
              icon={<ClipboardList className="h-10 w-10" aria-hidden="true" />}
            />
            <ActionCard
              to={PATHS.collector.history}
              title="Work History"
              variant="blue"
              icon={<History className="h-10 w-10" aria-hidden="true" />}
            />
            <ActionCard
              to={PATHS.collector.profile}
              title="My Profile"
              variant="orange"
              icon={<User className="h-10 w-10" aria-hidden="true" />}
            />
          </div>

          <Card>
            <CardHeader className="py-6 px-8">
              <CardTitle className="text-2xl">Recently task</CardTitle>
            </CardHeader>
            <CardBody className="p-0">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left">
                  <thead className="bg-gray-50/60">
                    <tr className="text-xs uppercase tracking-wider text-gray-500">
                      <th className="px-8 py-4 font-bold">Report ID</th>
                      <th className="px-8 py-4 font-bold">Location</th>
                      <th className="px-8 py-4 font-bold">Date</th>
                      <th className="px-8 py-4 font-bold text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recentTasks.length ? (
                      recentTasks.map((r) => (
                        <ReportRow
                          key={r.id}
                          report={r}
                          showLocation
                          onClick={() => navigate(PATHS.collector.reportDetail.replace(":reportId", r.id), { state: { report: r } })}
                        />
                      ))
                    ) : (
                      <tr>
                        <td className="px-8 py-8 text-sm text-gray-600" colSpan={4}>
                          No tasks assigned yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </CollectorLayout>
  );
}
