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
import PaginationControls from "../../../shared/ui/PaginationControls.jsx";
import { normalizeReportStatus } from "../../../shared/lib/reportStatus.js";
import { getCollectorWorkHistory } from "../../../services/collector.service.js";
import { translateErrorMessage } from "../../../shared/lib/errorTranslator.js";

export default function CollectorHistory() {
  const { user } = useStoredUser();
  const notify = useNotify();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter states
  const initialFilterState = {
    status: "All",
    fromDate: "",
    toDate: "",
    search: "",
  };
  const [filter, setFilter] = useState(initialFilterState);
  const updateFilter = (patch) => {
    setFilter((prev) => ({ ...prev, ...patch }));
    setCurrentPage(1);
  };

  const historyReports = useMemo(() => {
    const list = Array.isArray(items) ? items : [];
    return list.map((it) => ({
      id: it?.collectionRequestId != null ? String(it.collectionRequestId) : "",
      reportCode: it?.requestCode ?? null,
      status: it?.status ?? null,
      address: it?.address ?? null,
      createdAt: it?.completedAt ?? it?.collectedAt ?? it?.updatedAt ?? it?.startedAt ?? null,
    }));
  }, [items]);

  const filteredHistory = useMemo(() => {
    let result = [...historyReports];

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
  }, [historyReports, filter]);

  const handleResetFilter = () => {
    setFilter(initialFilterState);
    setCurrentPage(1);
  };

  const totalPages = useMemo(
    () => Math.ceil(filteredHistory.length / itemsPerPage),
    [filteredHistory.length, itemsPerPage]
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

  const pagedHistory = useMemo(() => {
    if (!filteredHistory.length) return [];
    const start = (safePage - 1) * itemsPerPage;
    return filteredHistory.slice(start, start + itemsPerPage);
  }, [filteredHistory, safePage, itemsPerPage]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const data = await getCollectorWorkHistory();
        if (!active) return;
        setItems(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!active) return;
        setItems([]);
        notify.error(
          "Unable to load work history",
          translateErrorMessage(e?.message) || "The collector service is currently experiencing issues. Please try again later."
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
        <PageHeader title="Work History" description="Review completed tasks and collection history." />

        <Card className="mb-6">
          <CardHeader className="py-4 px-8 border-b border-gray-100">
            <CardTitle className="text-lg">Filter History</CardTitle>
          </CardHeader>
          <CardBody className="px-8 py-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="grid gap-2 text-left">
                <label className="text-sm font-medium text-slate-800">Status</label>
                <select
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200"
                  value={filter.status}
                  onChange={(e) => updateFilter({ status: e.target.value })}
                >
                  <option value="All">All</option>
                  <option value="Assigned">Assigned</option>
                  <option value="Accepted">Accepted</option>
                  <option value="Reassign">Reassign</option>
                  <option value="On The Way">On The Way</option>
                  <option value="Collected">Collected</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

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
                placeholder="Search by ID or Location..."
                value={filter.search}
                onChange={(e) => updateFilter({ search: e.target.value })}
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
            <CardTitle className="text-2xl">History Records</CardTitle>
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
                  {filteredHistory.length ? (
                    pagedHistory.map((r) => (
                      <ReportRow
                        key={r.id}
                        report={r}
                        showLocation
                        onClick={() =>
                          navigate(PATHS.collector.reportDetail.replace(":reportId", r.id), { state: { report: r } })
                        }
                      />
                    ))
                  ) : (
                    <tr>
                      <td className="px-8 py-8 text-sm text-gray-600" colSpan={4}>
                        {historyReports.length === 0
                          ? "No history records found."
                          : "No history records match your filter."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardBody>
          {filteredHistory.length ? (
            <div className="p-6 border-t border-gray-100 flex items-center justify-center">
              <PaginationControls currentPage={safePage} totalPages={totalPages} onPageChange={handlePageChange} />
            </div>
          ) : null}
        </Card>
      </div>
    </CollectorLayout>
  );
}
