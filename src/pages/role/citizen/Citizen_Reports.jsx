import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./CD_Navbar";
import CD_Footer from "../../../components/layout/CD_Footer.jsx";
import RoleLayout from "../../../components/layout/RoleLayout.jsx";
import PageHeader from "../../../components/ui/PageHeader.jsx";
import { Card, CardBody, CardHeader, CardTitle } from "../../../components/ui/Card.jsx";
import Button from "../../../components/ui/Button.jsx";
import TextField from "../../../components/ui/TextField.jsx";
import ReportRow from "../../../components/ui/ReportRow.jsx";
import useStoredUser from "../../../hooks/useStoredUser.js";
import useNotify from "../../../hooks/useNotify.js";
import {
  publishReportsCleared,
  subscribeReportDeleted,
  subscribeReportSubmitted,
  subscribeReportsCleared,
  subscribeReportUpdated,
} from "../../../events/reportEvents.js";
import { clearMockReports, deleteMockReport, getMockReports, upsertMockReport } from "../../../mock/reportStore.js";
import { PATHS } from "../../../routes/paths.js";

export default function CitizenReports() {
  const { user, displayName } = useStoredUser();
  const notify = useNotify();
  const [reports, setReports] = useState(() => getMockReports());

  // Filter states
  const initialFilterState = {
    status: "All",
    fromDate: "",
    toDate: "",
    searchId: "",
  };
  const [filter, setFilter] = useState(initialFilterState);

  const allMyReports = useMemo(() => {
    const me = user?.email ?? null;
    const list = Array.isArray(reports) ? reports : [];

    if (!me) return [];

    return list.filter((r) => r && r.createdBy === me);
  }, [reports, user]);

  const filteredReports = useMemo(() => {
    let filtered = [...allMyReports];

    // Apply filters based on filter state
    if (filter.status !== "All") {
      filtered = filtered.filter((r) => normalizeReportStatus(r.status) === filter.status);
    }

    if (filter.fromDate) {
      const from = new Date(filter.fromDate).getTime();
      filtered = filtered.filter((r) => new Date(r.createdAt).getTime() >= from);
    }

    if (filter.toDate) {
      // Add 1 day to include the end date fully or handle as end of day
      const toDate = new Date(filter.toDate);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter((r) => new Date(r.createdAt).getTime() <= toDate.getTime());
    }

    if (filter.searchId) {
      const search = filter.searchId.toLowerCase();
      filtered = filtered.filter((r) => String(r.id).toLowerCase().includes(search));
    }

    return filtered;
  }, [allMyReports, filter]);

  const handleResetFilter = () => {
    setFilter(initialFilterState);
  };

  useEffect(() => {
    const unsubSubmitted = subscribeReportSubmitted((report) => {
      if (!report) return;
      const next = upsertMockReport(report);
      setReports(next);
    });
    const unsubUpdated = subscribeReportUpdated((nextReport) => {
      if (!nextReport || !nextReport.id) return;
      const next = upsertMockReport(nextReport);
      setReports(next);
    });
    const unsubDeleted = subscribeReportDeleted((reportId) => {
      if (!reportId) return;
      const next = deleteMockReport(reportId);
      setReports(next);
    });
    const unsubCleared = subscribeReportsCleared(() => {
      clearMockReports();
      setReports([]);
    });
    return () => {
      unsubSubmitted();
      unsubUpdated();
      unsubDeleted();
      unsubCleared();
    };
  }, []);

  return (
    <RoleLayout
      sidebar={<Sidebar />}
      navbar={<Navbar />}
      footer={
        <div className="animate-fade-in-up" style={{ animationDelay: "240ms" }}>
          <CD_Footer />
        </div>
      }
      showBackgroundEffects
    >
      <div className="animate-fade-in-up">
        <PageHeader
          className="mb-8"
          title="My Reports"
          description={`Reports submitted by ${displayName}.`}
          right={
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={() => {
                  const ok = window.confirm("Clear ALL report data? This will remove all saved mock reports.");
                  if (!ok) return;
                  clearMockReports();
                  publishReportsCleared();
                  setReports([]);
                  notify.success("Reports cleared", "All report data has been removed.");
                }}
              >
                Clear reports
              </Button>
              <Button as={Link} to={PATHS.citizen.createReport} size="sm" className="rounded-full">
                Create report
              </Button>
            </div>
          }
        />
      </div>

      <div className="animate-fade-in-up" style={{ animationDelay: "120ms" }}>
        {/* Filter Section */}
        <Card className="mb-6">
          <CardHeader className="py-4 px-8 border-b border-gray-100">
            <CardTitle className="text-lg">Filter Reports</CardTitle>
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
                  <option value="Pending">Pending</option>
                  <option value="Accepted">Accepted</option>
                  <option value="Rejected">Rejected</option>
                  <option value="On The Way">On The Way</option>
                  <option value="Collected">Collected</option>
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
                label="Report ID"
                placeholder="Search by ID..."
                value={filter.searchId}
                onChange={(e) => setFilter({ ...filter, searchId: e.target.value })}
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
            <CardTitle className="text-2xl">All reports</CardTitle>
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
                  {filteredReports.length ? (
                    filteredReports.map((r) => (
                      <ReportRow
                        key={r.id}
                        report={r}
                        showLocation
                        idTo={`${PATHS.citizen.reports}/${r.id}`}
                      />
                    ))
                  ) : (
                    <tr>
                      <td className="px-8 py-8 text-sm text-gray-600" colSpan={4}>
                        {allMyReports.length === 0
                          ? "No reports submitted yet."
                          : "No reports match your filter."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      </div>
    </RoleLayout>
  );
}
