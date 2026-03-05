import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import EnterpriseLayout from "../layouts/EnterpriseLayout.jsx";
import PageHeader from "../../../shared/ui/PageHeader.jsx";
import { Card, CardBody, CardHeader, CardTitle } from "../../../shared/ui/Card.jsx";
import Button from "../../../shared/ui/Button.jsx";
import TextField from "../../../shared/ui/TextField.jsx";
import ReportRow from "../../../shared/ui/ReportRow.jsx";
import { normalizeReportStatus } from "../../../shared/lib/reportStatus.js";
import { PATHS } from "../../../app/routes/paths.js";
import useNotify from "../../../shared/hooks/useNotify.js";
import { getEnterpriseReports } from "../../../services/enterprise.service.js";

export default function EnterpriseReports() {
  const navigate = useNavigate();
  const notify = useNotify();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    getEnterpriseReports()
      .then((rows) => {
        if (cancelled) return;
        setReports(Array.isArray(rows) ? rows : []);
        setError("");
      })
      .catch((err) => {
        if (cancelled) return;
        const message = err?.message || "Unable to load reports.";
        setError(message);
        notify.error("Load reports failed", message);
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [notify]);

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
            {error ? <div className="px-8 pt-6 text-sm text-red-600">{error}</div> : null}
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
                  {loading ? (
                    <tr>
                      <td className="px-8 py-8 text-sm text-gray-600" colSpan={4}>
                        Loading reports...
                      </td>
                    </tr>
                  ) : filteredReports.length ? (
                    filteredReports.map((r) => (
                      <ReportRow
                        key={r?.id ?? r?.reportCode ?? r?.code}
                        report={r}
                        showLocation
                        onClick={() => {
                          const reportKey = r?.id ?? r?.reportCode ?? r?.code ?? "";
                          navigate(`${PATHS.enterprise.reports}/${reportKey}`, { state: { report: r } });
                        }}
                      />
                    ))
                  ) : (
                    <tr>
                      <td className="px-8 py-8 text-sm text-gray-600" colSpan={4}>
                        {ordered.length === 0 ? "No reports submitted yet." : "No reports match your filter."}
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
