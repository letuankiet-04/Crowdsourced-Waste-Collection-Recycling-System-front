import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./CD_Navbar";
import CD_Footer from "../../../shared/layout/CD_Footer.jsx";
import RoleLayout from "../../../shared/layout/RoleLayout.jsx";
import PageHeader from "../../../shared/ui/PageHeader.jsx";
import { Card, CardBody, CardHeader, CardTitle } from "../../../shared/ui/Card.jsx";
import Button from "../../../shared/ui/Button.jsx";
import TextField from "../../../shared/ui/TextField.jsx";
import ReportRow from "../../../shared/ui/ReportRow.jsx";
import useStoredUser from "../../../shared/hooks/useStoredUser.js";
import useNotify from "../../../shared/hooks/useNotify.js";
import { normalizeReportStatus } from "../../../shared/lib/reportStatus.js";
import { PATHS } from "../../../app/routes/paths.js";
import { getMyReports } from "../../../services/reports.service.js";

function toTime(value) {
  if (!value) return 0;
  const t = new Date(value).getTime();
  return Number.isFinite(t) ? t : 0;
}

function mapApiReportToUi(r) {
  if (!r) return null;
  const lat =
    r?.latitude ??
    r?.lat ??
    r?.coords?.lat ??
    r?.location?.lat ??
    r?.reportedLatitude ??
    null;
  const lng =
    r?.longitude ??
    r?.lng ??
    r?.coords?.lng ??
    r?.location?.lng ??
    r?.reportedLongitude ??
    null;
  const coords =
    lat != null && lng != null && Number.isFinite(Number(lat)) && Number.isFinite(Number(lng))
      ? { lat: Number(lat), lng: Number(lng) }
      : null;
  return {
    id: r?.id ?? "",
    reportCode: r?.reportCode ?? r?.code ?? "",
    status: r?.status ?? null,
    createdAt: r?.createdAt ?? null,
    address: r?.address ?? "",
    coords,
  };
}

export default function CitizenReports() {
  const navigate = useNavigate();
  const { displayName } = useStoredUser();
  const notify = useNotify();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filter states
  const initialFilterState = {
    status: "All",
    fromDate: "",
    toDate: "",
    searchId: "",
  };
  const [filter, setFilter] = useState(initialFilterState);

  const allMyReports = useMemo(() => (Array.isArray(reports) ? reports : []), [reports]);

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
      filtered = filtered.filter((r) => String(r.reportCode || r.id).toLowerCase().includes(search));
    }

    filtered.sort((a, b) => toTime(b?.createdAt) - toTime(a?.createdAt));
    return filtered;
  }, [allMyReports, filter]);

  const handleResetFilter = () => {
    setFilter(initialFilterState);
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getMyReports()
      .then((rows) => {
        if (cancelled) return;
        const list = Array.isArray(rows) ? rows : [];
        setReports(list.map(mapApiReportToUi).filter(Boolean));
      })
      .catch((err) => notify.error("Load reports failed", err?.message || "Unable to load reports."))
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [notify]);

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
                disabled={loading}
                onClick={async () => {
                  setLoading(true);
                  try {
                    const rows = await getMyReports();
                    const list = Array.isArray(rows) ? rows : [];
                    setReports(list.map(mapApiReportToUi).filter(Boolean));
                  } catch (err) {
                    notify.error("Load reports failed", err?.message || "Unable to load reports.");
                  } finally {
                    setLoading(false);
                  }
                }}
              >
                Refresh
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
                        onClick={() => navigate(`${PATHS.citizen.reports}/${r.id}`)}
                      />
                    ))
                  ) : (
                    <tr>
                      <td className="px-8 py-8 text-sm text-gray-600" colSpan={4}>
                        {loading ? "Loading..." : allMyReports.length === 0 ? "No reports submitted yet." : "No reports match your filter."}
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
