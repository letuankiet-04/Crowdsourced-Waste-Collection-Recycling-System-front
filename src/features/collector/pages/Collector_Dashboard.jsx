import { useEffect, useMemo, useState } from "react";
import CollectorLayout from "../layouts/CollectorLayout.jsx";
import PageHeader from "../../../shared/ui/PageHeader.jsx";
import ActionCard from "../../../shared/ui/ActionCard.jsx";
import { Card, CardBody, CardHeader, CardTitle } from "../../../shared/ui/Card.jsx";
import useStoredUser from "../../../shared/hooks/useStoredUser.js";
import useNotify from "../../../shared/hooks/useNotify.js";
import { ClipboardList, History, MessageSquare, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PATHS } from "../../../app/routes/paths.js";
import ReportRow from "../../../shared/ui/ReportRow.jsx";
import { getCollectorLeaderboard, getCollectorTasks } from "../../../services/collector.service.js";
import { translateErrorMessage } from "../../../shared/lib/errorTranslator.js";
import { normalizeReportStatus } from "../../../shared/lib/reportStatus.js";

function getTaskAddress(t) {
  const loc = t?.location;
  if (typeof loc === "string") return loc;
  return loc?.address ?? t?.address ?? t?.collectedAddress ?? null;
}

function getLeaderboardItems(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.content)) return payload.content;
  if (Array.isArray(payload?.collectors)) return payload.collectors;
  if (Array.isArray(payload?.leaderboard)) return payload.leaderboard;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

function getCollectorName(entry) {
  const nested = entry?.collector ?? entry?.user ?? entry?.account ?? entry?.profile ?? null;
  return (
    entry?.collectorName ??
    entry?.fullName ??
    entry?.name ??
    entry?.username ??
    nested?.fullName ??
    nested?.name ??
    nested?.username ??
    nested?.email ??
    entry?.email ??
    null
  );
}

function getCollectorWeightKg(entry) {
  const candidates = [
    entry?.totalWeightCollected,
    entry?.totalWeightKg,
    entry?.totalCollectedWeight,
    entry?.weightKg,
    entry?.totalWeight,
    entry?.weight,
  ];
  for (const c of candidates) {
    const n = Number(c);
    if (Number.isFinite(n)) return n;
  }
  const nested = entry?.stats ?? entry?.summary ?? null;
  const nestedCandidates = [
    nested?.totalWeightCollected,
    nested?.totalWeightKg,
    nested?.totalCollectedWeight,
    nested?.weightKg,
    nested?.totalWeight,
    nested?.weight,
  ];
  for (const c of nestedCandidates) {
    const n = Number(c);
    if (Number.isFinite(n)) return n;
  }
  return 0;
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
  const [leaderboard, setLeaderboard] = useState([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);

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
    const result = allTasks.filter((t) => normalizeReportStatus(t.status) !== "Completed");
    result.sort((a, b) => {
      const ta = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tb = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
      return tb - ta;
    });
    return result.slice(0, 5);
  }, [allTasks]);

  const leaderboardTop5 = useMemo(() => {
    const items = getLeaderboardItems(leaderboard);
    const normalized = items
      .map((entry) => ({
        id: entry?.collectorId ?? entry?.id ?? entry?.userId ?? entry?.accountId ?? null,
        name: getCollectorName(entry),
        address: entry?.address ?? entry?.location ?? entry?.collector?.address ?? entry?.user?.address ?? null,
        weightKg: getCollectorWeightKg(entry),
      }))
      .filter((x) => x.name);

    normalized.sort((a, b) => b.weightKg - a.weightKg);
    return normalized.slice(0, 5);
  }, [leaderboard]);

  useEffect(() => {
    let active = true;
    let leaderboardInFlight = false;

    const loadTasks = async () => {
      try {
        const tasksData = await getCollectorTasks();
        if (!active) return;
        setTasks(Array.isArray(tasksData) ? tasksData : []);
      } catch (e) {
        if (!active) return;
        setTasks([]);
        notify.error("Unable to load tasks", translateErrorMessage(e?.message) || "Task services are currently unavailable. Please try again later.");
      }
    };

    const loadLeaderboard = async () => {
      if (leaderboardInFlight) return;
      leaderboardInFlight = true;
      try {
        setLeaderboardLoading(true);
        const now = new Date();
        const leaderboardData = await getCollectorLeaderboard({
          month: now.getMonth() + 1,
          year: now.getFullYear(),
        });
        if (!active) return;
        setLeaderboard(leaderboardData ?? []);
      } catch (e) {
        if (!active) return;
        setLeaderboard([]);
        notify.error(
          "Unable to load leaderboard",
          translateErrorMessage(e?.message) || "Leaderboard services are currently unavailable. Please try again later."
        );
      } finally {
        leaderboardInFlight = false;
        if (active) setLeaderboardLoading(false);
      }
    };

    const load = async () => {
      await loadTasks();
      await loadLeaderboard();
    };

    const refreshLeaderboardIfVisible = () => {
      if (!user) return;
      if (document.hidden) return;
      loadLeaderboard();
    };

    if (user) load();
    window.addEventListener("focus", refreshLeaderboardIfVisible);
    document.addEventListener("visibilitychange", refreshLeaderboardIfVisible);
    return () => {
      active = false;
      window.removeEventListener("focus", refreshLeaderboardIfVisible);
      document.removeEventListener("visibilitychange", refreshLeaderboardIfVisible);
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

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="space-y-8 xl:col-span-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8">
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
              <ActionCard
                to={PATHS.collector.feedback}
                title="Feedback"
                variant="purple"
                icon={<MessageSquare className="h-10 w-10" aria-hidden="true" />}
              />
            </div>

            <Card>
              <CardHeader className="py-6 px-8">
                <CardTitle className="text-2xl">Recent Tasks</CardTitle>
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

          <div className="space-y-8">
            <Card>
              <CardHeader className="py-6 px-8 flex items-center justify-between border-b-0">
                <CardTitle className="text-2xl font-bold text-gray-900">Top rank</CardTitle>
                <div className="bg-green-50 text-green-600 font-semibold px-4 py-1.5 rounded-full text-sm">
                  All time
                </div>
              </CardHeader>
              <CardBody className="p-0">
                <div className="px-8 pb-8 pt-2 space-y-6">
                  {leaderboardLoading ? (
                    <div className="text-sm text-gray-600">Loading leaderboard...</div>
                  ) : leaderboardTop5.length ? (
                    leaderboardTop5.map((row, idx) => (
                      <div key={row.id ?? row.name ?? idx} className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <span className="text-sm font-bold text-gray-400">#{idx + 1}</span>
                          <div>
                            <div className="text-sm font-bold text-gray-900 text-base">{row.name}</div>
                            {row.address && (
                              <div className="text-sm text-gray-500">{row.address}</div>
                            )}
                          </div>
                        </div>
                        <div className="text-base font-bold text-gray-900">
                          {row.weightKg.toLocaleString()}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-600">No leaderboard data available.</div>
                  )}
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </CollectorLayout>
  );
}
