import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import EnterpriseLayout from "../layouts/EnterpriseLayout.jsx";
import PageHeader from "../../../shared/ui/PageHeader.jsx";
import { Card, CardBody, CardHeader, CardTitle } from "../../../shared/ui/Card.jsx";
import Button from "../../../shared/ui/Button.jsx";
import TextField from "../../../shared/ui/TextField.jsx";
import PaginationControls from "../../../shared/ui/PaginationControls.jsx";
import { getCollectorReports } from "../../../services/enterprise.service.js";
import { PATHS } from "../../../app/routes/paths.js";
import StatusPill from "../../../shared/ui/StatusPill.jsx";

export default function EnterpriseCollectorReports() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter states
  const initialFilterState = {
    fromDate: "",
    toDate: "",
    searchId: "",
  };
  const [filter, setFilter] = useState(initialFilterState);

  const updateFilter = (patch) => {
    setFilter((prev) => ({ ...prev, ...patch }));
    setCurrentPage(1);
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await getCollectorReports();
      setReports(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch collector reports:", err);
    } finally {
      setLoading(false);
    }
  };

  const ordered = useMemo(() => {
    return [...reports].sort((a, b) => {
      const ta = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tb = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
      return tb - ta;
    });
  }, [reports]);

  const filteredReports = useMemo(() => {
    let filtered = [...ordered];

    if (filter.fromDate) {
      const from = new Date(filter.fromDate).getTime();
      filtered = filtered.filter((r) => new Date(r.createdAt).getTime() >= from);
    }

    if (filter.toDate) {
      const toDate = new Date(filter.toDate);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter((r) => new Date(r.createdAt).getTime() <= toDate.getTime());
    }

    if (filter.searchId) {
      const search = filter.searchId.toLowerCase();
      filtered = filtered.filter((r) => 
        String(r.id).toLowerCase().includes(search) || 
        (r.reportCode && r.reportCode.toLowerCase().includes(search))
      );
    }

    
    return filtered;
  }, [ordered, filter]);

  const totalPages = useMemo(
    () => Math.ceil(filteredReports.length / itemsPerPage),
    [filteredReports.length, itemsPerPage]
  );

  const safePage = useMemo(() => {
    if (!totalPages) return 1;
    return Math.min(Math.max(currentPage, 1), totalPages);
  }, [currentPage, totalPages]);

  const handlePageChange = (page) => {
    if (!totalPages) return;
    const next = Math.min(Math.max(page, 1), totalPages);
    setCurrentPage(next);
  };

  const pagedReports = useMemo(() => {
    if (!filteredReports.length) return [];
    const start = (safePage - 1) * itemsPerPage;
    return filteredReports.slice(start, start + itemsPerPage);
  }, [filteredReports, safePage, itemsPerPage]);

  const handleResetFilter = () => {
    setFilter(initialFilterState);
    setCurrentPage(1);
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case "COMPLETED": return "emerald";
      case "FAILED": return "red";
      default: return "yellow"; // PENDING
    }
  };

  return (
    <EnterpriseLayout>
      <div className="space-y-8">
        <PageHeader title="Collector Reports" description="Review reports submitted by collectors." />
        
        {/* Filter Section */}
        <Card>
          <CardHeader className="py-4 px-8 border-b border-gray-100">
            <CardTitle className="text-lg">Filter Reports</CardTitle>
          </CardHeader>
          <CardBody className="px-8 py-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <TextField
                label="From Date"
                type="date"
                value={filter.fromDate}
                onChange={(e) => updateFilter({ fromDate: e.target.value })}
              />

              <TextField
                label="To Date"
                type="date"
                value={filter.toDate}
                onChange={(e) => updateFilter({ toDate: e.target.value })}
              />

              <TextField
                label="Search"
                placeholder="ID or Code..."
                value={filter.searchId}
                onChange={(e) => updateFilter({ searchId: e.target.value })}
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
            <CardTitle className="text-2xl">All Collector Reports</CardTitle>
          </CardHeader>
          <CardBody className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="bg-gray-50/60">
                  <tr className="text-xs uppercase tracking-wider text-gray-500">
                    <th className="px-8 py-4 font-bold">Report Code</th>
                    <th className="px-8 py-4 font-bold">Collector ID</th>
                    <th className="px-8 py-4 font-bold">Points</th>
                    <th className="px-8 py-4 font-bold">Date</th>
                    <th className="px-8 py-4 font-bold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr><td colSpan={5} className="px-8 py-8 text-center">Loading...</td></tr>
                  ) : filteredReports.length ? (
                    pagedReports.map((r) => (
                      <tr 
                        key={r.id} 
                        className="hover:bg-gray-50/40 transition-colors cursor-pointer"
                        onClick={() => navigate(PATHS.enterprise.collectorReportDetail.replace(":reportId", r.id))}
                      >
                        <td className="px-8 py-5 text-sm font-semibold text-gray-900">{r.reportCode || r.id}</td>
                        <td className="px-8 py-5 text-sm text-gray-600">{r.collectorId}</td>
                        <td className="px-8 py-5 text-sm text-gray-600">{r.totalPoint}</td>
                        <td className="px-8 py-5 text-sm text-gray-600">
                          {r.createdAt ? new Date(r.createdAt).toLocaleString() : "-"}
                        </td>
                        <td className="px-8 py-5 text-sm text-right">
                          <StatusPill variant={getStatusVariant(r.status)}>
                            {r.status}
                          </StatusPill>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="px-8 py-8 text-sm text-gray-600" colSpan={5}>
                        {reports.length === 0 ? "No reports found." : "No reports match your filter."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardBody>
          {!loading && filteredReports.length > 0 ? (
            <div className="p-6 border-t border-gray-100 flex items-center justify-center">
              <PaginationControls currentPage={safePage} totalPages={totalPages} onPageChange={handlePageChange} />
            </div>
          ) : null}
        </Card>
      </div>
    </EnterpriseLayout>
  );
}
