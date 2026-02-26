import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import CollectorLayout from "./layout/CollectorLayout.jsx";
import PageHeader from "../../../shared/ui/PageHeader.jsx";
import { Card, CardBody, CardHeader, CardTitle } from "../../../shared/ui/Card.jsx";
import Button from "../../../shared/ui/Button.jsx";
import TextField from "../../../shared/ui/TextField.jsx";
import useStoredUser from "../../../shared/hooks/useStoredUser.js";
import useNotify from "../../../shared/hooks/useNotify.js";
import { PATHS } from "../../../app/routes/paths.js";
import { subscribeReportDeleted, subscribeReportUpdated } from "../../../events/reportEvents.js";
import { deleteMockReport, getMockReports, upsertMockReport } from "../../../mock/reportStore.js";
import ReportRow from "../../../shared/ui/ReportRow.jsx";
import { normalizeReportStatus } from "../../../shared/lib/reportStatus.js";

export default function CollectorTasks() {
  const { user, displayName } = useStoredUser();
  const notify = useNotify();
  const navigate = useNavigate();
  const [reports, setReports] = useState(() => getMockReports());
  const collectorEmail = user?.email ?? null;

  // Filter states
  const initialFilterState = {
    status: "All",
    fromDate: "",
    toDate: "",
    search: "",
  };
  const [filter, setFilter] = useState(initialFilterState);

  const allAssignedTasks = useMemo(() => {
    return reports.filter((r) => {
      if (!collectorEmail) return false;
      const assignedEmails = Array.isArray(r?.assignedCollectors)
        ? r.assignedCollectors.map((c) => c?.email).filter(Boolean)
        : [];
      const legacyEmail = r?.assignedCollector?.email ?? r?.assignedCollectorEmail ?? r?.collectorEmail ?? null;
      const effectiveEmails = assignedEmails.length ? assignedEmails : legacyEmail ? [legacyEmail] : [];
      return effectiveEmails.includes(collectorEmail);
    });
  }, [reports, collectorEmail]);

  const activeTaskCount = useMemo(() => {
    return allAssignedTasks.filter((r) => {
      const status = normalizeReportStatus(r.status);
      return ["Assigned", "Accepted", "On The Way"].includes(status);
    }).length;
  }, [allAssignedTasks]);

  const filteredTasks = useMemo(() => {
    let result = [...allAssignedTasks];

    // Status
    if (filter.status !== "All") {
      result = result.filter((r) => {
        const status = normalizeReportStatus(r.status);
        if (filter.status === "Assigned") {
          return status === "Pending" || status === "Assigned";
        }
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
          String(r.id).toLowerCase().includes(term) || (r.address && r.address.toLowerCase().includes(term))
      );
    }

    return result;
  }, [allAssignedTasks, filter]);

  const handleResetFilter = () => {
    setFilter(initialFilterState);
  };

  useEffect(() => {
    const unsubUpdated = subscribeReportUpdated((nextReport) => {
      if (!nextReport || !nextReport.id) return;
      const next = upsertMockReport(nextReport);
      setReports(next);
      const status = normalizeReportStatus(nextReport.status);
      const assignedEmails = Array.isArray(nextReport?.assignedCollectors)
        ? nextReport.assignedCollectors.map((c) => c?.email).filter(Boolean)
        : [];
      const legacyEmail =
        nextReport?.assignedCollector?.email ?? nextReport?.assignedCollectorEmail ?? nextReport?.collectorEmail ?? null;
      const effectiveEmails = assignedEmails.length ? assignedEmails : legacyEmail ? [legacyEmail] : [];
      if (
        collectorEmail &&
        effectiveEmails.includes(collectorEmail) &&
        (status === "Accepted" || status === "Assigned")
      ) {
        notify.info("New task assigned", `${nextReport.id} · ${nextReport.address || "Unknown location"}`);
      }
    });

    const unsubDeleted = subscribeReportDeleted((reportId) => {
      if (!reportId) return;
      const next = deleteMockReport(reportId);
      setReports(next);
    });

    return () => {
      unsubUpdated();
      unsubDeleted();
    };
  }, [collectorEmail, notify]);

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
                      // Visual override: Pending -> Assigned
                      const displayReport =
                        normalizeReportStatus(r.status) === "Pending" ? { ...r, status: "Assigned" } : r;

                      return (
                        <ReportRow
                          key={r.id}
                          report={displayReport}
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
                        {allAssignedTasks.length === 0 ? "No tasks assigned yet." : "No tasks match your filter."}
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
