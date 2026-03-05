import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import CollectorLayout from "../layouts/CollectorLayout.jsx";
import PageHeader from "../../../shared/ui/PageHeader.jsx";
import { Card, CardBody, CardHeader, CardTitle } from "../../../shared/ui/Card.jsx";
import Button from "../../../shared/ui/Button.jsx";
import TextField from "../../../shared/ui/TextField.jsx";
import useStoredUser from "../../../shared/hooks/useStoredUser.js";
import useNotify from "../../../shared/hooks/useNotify.js";
import { PATHS } from "../../../app/routes/paths.js";
import ReportRow from "../../../shared/ui/ReportRow.jsx";
import { normalizeReportStatus } from "../../../shared/lib/reportStatus.js";
import { getCollectorTasks } from "../../../services/collector.service.js";

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

export default function CollectorTasks() {
  const { user, displayName } = useStoredUser();
  const notify = useNotify();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);

  // Filter states
  const initialFilterState = {
    status: "All",
    fromDate: "",
    toDate: "",
    search: "",
  };
  const [filter, setFilter] = useState(initialFilterState);

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

  const activeTaskCount = useMemo(() => {
    return allTasks.filter((r) => {
      const status = normalizeReportStatus(r.status);
      return ["Assigned", "Accepted", "On The Way"].includes(status);
    }).length;
  }, [allTasks]);

  const filteredTasks = useMemo(() => {
    let result = [...allTasks];

    // Status
    if (filter.status !== "All") {
      result = result.filter((r) => {
        const status = normalizeReportStatus(r.status);
        return status === filter.status;
      });
    }

    // Date
    if (filter.fromDate) {
      const from = new Date(filter.fromDate).getTime();
      result = result.filter((r) => new Date(r.createdAt).getTime() >= from);
    }
    if (filter.toDate) {
      const toDate = new Date(filter.toDate);
      toDate.setHours(23, 59, 59, 999);
      result = result.filter((r) => new Date(r.createdAt).getTime() <= toDate.getTime());
    }

    // Search (ID or Location)
    if (filter.search) {
      const term = filter.search.toLowerCase();
      result = result.filter(
        (r) =>
          String(r.id).toLowerCase().includes(term) ||
          String(r.reportCode ?? "").toLowerCase().includes(term) ||
          String(r.address ?? "").toLowerCase().includes(term)
      );
    }

    return result;
  }, [allTasks, filter]);

  const handleResetFilter = () => {
    setFilter(initialFilterState);
  };

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const data = await getCollectorTasks({ all: true });
        if (!active) return;
        setTasks(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!active) return;
        setTasks([]);
        notify.error("Unable to load tasks", e?.message || "Request failed");
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
          title="My Tasks"
          description={
            <>
              Hello, <span className="font-semibold text-gray-900">{displayName}</span>. You have{" "}
              <span className="font-bold text-emerald-700">{activeTaskCount}</span> active tasks.
            </>
          }
        />

        <Card className="mb-6">
          <CardHeader className="py-4 px-8 border-b border-gray-100">
            <CardTitle className="text-lg">Filter Tasks</CardTitle>
          </CardHeader>
          <CardBody className="px-8 py-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="grid gap-2 text-left">
                <label className="text-sm font-medium text-slate-800">Status</label>
                <select
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200"
                  value={filter.status}
                  onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                >
                  <option value="All">All</option>
                  <option value="Assigned">Assigned</option>
                  <option value="Accepted">Accepted</option>
                  <option value="On The Way">On The Way</option>
                  <option value="Collected">Collected</option>
                  <option value="Completed">Completed</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <TextField
                label="From Date"
                type="date"
                value={filter.fromDate}
                onChange={(e) => setFilter({ ...filter, fromDate: e.target.value })}
              />

              <TextField
                label="To Date"
                type="date"
                value={filter.toDate}
                onChange={(e) => setFilter({ ...filter, toDate: e.target.value })}
              />

              <TextField
                label="Search"
                placeholder="Search by ID or Location..."
                value={filter.search}
                onChange={(e) => setFilter({ ...filter, search: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={handleResetFilter}>
                Reset Filter
              </Button>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="py-6 px-8">
            <CardTitle className="text-2xl">Assigned Tasks</CardTitle>
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
                  {filteredTasks.length ? (
                    filteredTasks.map((r) => {
                      return (
                        <ReportRow
                          key={r.id}
                          report={r}
                          showLocation
                          onClick={() =>
                            navigate(PATHS.collector.reportDetail.replace(":reportId", r.id), { state: { report: r } })
                          }
                        />
                      );
                    })
                  ) : (
                    <tr>
                      <td className="px-8 py-8 text-sm text-gray-600" colSpan={4}>
                        {allTasks.length === 0 ? "No tasks assigned yet." : "No tasks match your filter."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      </div>
    </CollectorLayout>
  );
}
