import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import EnterpriseLayout from "./layout/EnterpriseLayout.jsx";
import PageHeader from "../../../shared/ui/PageHeader.jsx";
import { Card, CardBody, CardHeader, CardTitle } from "../../../shared/ui/Card.jsx";
import Button from "../../../shared/ui/Button.jsx";
import TextField from "../../../shared/ui/TextField.jsx";
import ReportRow from "../../../shared/ui/ReportRow.jsx";
import { normalizeReportStatus } from "../../../shared/lib/reportStatus.js";
import { PATHS } from "../../../app/routes/paths.js";
import { getEnterpriseReportsPending } from "../../../services/enterprise.service.js";

function normalizeEnterpriseReport(report, index) {
  const raw = report && typeof report === "object" ? report : {};
  const reportCode = raw.reportCode ?? raw.code ?? null;
  const id = reportCode != null ? String(reportCode) : raw.id != null ? String(raw.id) : String(index);
  const latRaw = raw.latitude ?? raw.lat ?? raw.coords?.lat ?? null;
  const lngRaw = raw.longitude ?? raw.lng ?? raw.coords?.lng ?? null;
  const lat = latRaw != null ? Number(latRaw) : null;
  const lng = lngRaw != null ? Number(lngRaw) : null;

  return {
    ...raw,
    id,
    reportId: raw.id ?? raw.reportId ?? null,
    reportCode: reportCode ?? (raw.reportCode != null ? String(raw.reportCode) : id),
    address: raw.address ?? raw.location ?? raw.place ?? "",
    coords: Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : raw.coords ?? null,
    images: Array.isArray(raw.images) ? raw.images : [],
    createdAt: raw.createdAt ?? raw.created_at ?? raw.createdDate ?? null,
    status: raw.status ?? "PENDING",
  };
}

export default function EnterpriseReports() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  // Filter states
  const initialFilterState = {
    status: "All",
    fromDate: "",
    toDate: "",
    searchId: "",
  };
  const [filter, setFilter] = useState(initialFilterState);

  const ordered = useMemo(() => {
    const list = Array.isArray(reports) ? reports : [];
    return [...list].sort((a, b) => {
      const ta = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tb = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
      return tb - ta;
    });
  }, [reports]);

  const filteredReports = useMemo(() => {
    let filtered = [...ordered];

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
  }, [ordered, filter]);

  const handleResetFilter = () => {
    setFilter(initialFilterState);
  };

  useEffect(() => {
    let cancelled = false;

    async function loadReports() {
      setLoading(true);
      setLoadError("");
      try {
        const data = await getEnterpriseReportsPending();
        const list = Array.isArray(data) ? data : data?.items ?? data?.data ?? [];
        const normalized = Array.isArray(list) ? list.map((r, idx) => normalizeEnterpriseReport(r, idx)) : [];
        if (!cancelled) setReports(normalized);
      } catch (err) {
        const message = err?.message || "Không thể tải danh sách report. Vui lòng thử lại.";
        if (!cancelled) {
          setReports([]);
          setLoadError(message);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadReports();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <EnterpriseLayout>
      <div className="space-y-8">
        <PageHeader title="Reports" description="Review incoming reports and take actions." />
        
        {/* Filter Section */}
        <Card>
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
                        onClick={() => navigate(`${PATHS.enterprise.reports}/${r.id}`, { state: { report: r } })}
                      />
                    ))
                  ) : (
                    <tr>
                      <td className="px-8 py-8 text-sm text-gray-600" colSpan={4}>
                        {loading
                          ? "Đang tải..."
                          : loadError
                            ? loadError
                            : ordered.length === 0
                              ? "Chưa có report nào."
                              : "Không có report phù hợp bộ lọc."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      </div>
    </EnterpriseLayout>
  );
}
