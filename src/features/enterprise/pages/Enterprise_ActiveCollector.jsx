import { useEffect, useMemo, useState } from "react";
import EnterpriseLayout from "./layout/EnterpriseLayout.jsx";
import PageHeader from "../../../shared/ui/PageHeader.jsx";
import { Card, CardBody, CardHeader, CardTitle } from "../../../shared/ui/Card.jsx";
import Button from "../../../shared/ui/Button.jsx";
import TextField from "../../../shared/ui/TextField.jsx";
import StatusPill from "../../../shared/ui/StatusPill.jsx";
import useNotify from "../../../shared/hooks/useNotify.js";
import { getEnterpriseCollectors } from "../../../services/enterprise.service.js";

export default function EnterpriseActiveCollector() {
  const notify = useNotify();
  const [collectors, setCollectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    getEnterpriseCollectors()
      .then((rows) => {
        if (cancelled) return;
        setCollectors(Array.isArray(rows) ? rows : []);
        setError("");
      })
      .catch((err) => {
        if (cancelled) return;
        const message = err?.message || "Unable to load collectors.";
        setError(message);
        notify.error("Load collectors failed", message);
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
    search: "",
  };
  const [filter, setFilter] = useState(initialFilterState);

  const allCollectors = useMemo(() => {
    const list = Array.isArray(collectors) ? collectors : [];
    return list
      .map((c, idx) => {
      const id = c?.id ?? c?._id ?? c?.collectorId ?? idx;
      const name = c?.name ?? c?.username ?? c?.displayName ?? c?.fullName ?? c?.email ?? `Collector ${idx + 1}`;
      const email = c?.email ?? c?.mail ?? "-";
      const lastSeenRaw = c?.lastSeen ?? c?.lastActiveAt ?? c?.updatedAt ?? c?.lastOnlineAt ?? null;
      const lastSeen = lastSeenRaw ? new Date(lastSeenRaw).toLocaleString() : "-";
      const statusRaw = String(
        c?.status ?? c?.availability ?? (c?.online || c?.active || c?.isActive ? "online" : "offline")
      ).toLowerCase();
      const isOnline =
        c?.online === true ||
        c?.active === true ||
        c?.isActive === true ||
        ["online", "active", "available"].includes(statusRaw);
      const statusLabel = isOnline ? "Online" : "Offline";
      return { id, name, email, lastSeen, isOnline, statusLabel };
      });
  }, [collectors]);

  const filteredCollectors = useMemo(() => {
    let filtered = [...allCollectors];

    // Filter by status
    if (filter.status !== "All") {
      const isLookingForOnline = filter.status === "Online";
      filtered = filtered.filter((c) => c.isOnline === isLookingForOnline);
    }

    // Filter by search (name or email)
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      filtered = filtered.filter(
        (c) => c.name.toLowerCase().includes(searchLower) || c.email.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [allCollectors, filter]);

  const handleResetFilter = () => {
    setFilter(initialFilterState);
  };

  return (
    <EnterpriseLayout>
      <div className="space-y-8">
        <PageHeader title="Active Collectors" description="List collectors." />
        
        {/* Filter Section */}
        <Card>
          <CardHeader className="py-4 px-8 border-b border-gray-100">
            <CardTitle className="text-lg">Filter Collectors</CardTitle>
          </CardHeader>
          <CardBody className="px-8 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2 text-left">
                <label className="text-sm font-medium text-slate-800">Status</label>
                <select
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200"
                  value={filter.status}
                  onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                >
                  <option value="All">All</option>
                  <option value="Online">Online</option>
                  <option value="Offline">Offline</option>
                </select>
              </div>

              <TextField
                label="Search"
                placeholder="Search by Name or Email..."
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
            <CardTitle className="text-2xl">Collectors</CardTitle>
          </CardHeader>
          <CardBody className="p-0">
            {error ? <div className="px-8 pt-6 text-sm text-red-600">{error}</div> : null}
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="bg-gray-50/60">
                  <tr className="text-xs uppercase tracking-wider text-gray-500">
                    <th className="px-8 py-4 font-bold">Name</th>
                    <th className="px-8 py-4 font-bold">Email</th>
                    <th className="px-8 py-4 font-bold">Last seen</th>
                    <th className="px-8 py-4 font-bold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td className="px-8 py-8 text-sm text-gray-600" colSpan={4}>
                        Loading collectors...
                      </td>
                    </tr>
                  ) : filteredCollectors.length ? (
                    filteredCollectors.map((r) => (
                      <tr key={r.id} className="bg-white hover:bg-emerald-50/20 transition">
                        <td className="px-8 py-5 text-sm font-semibold text-gray-900">{r.name}</td>
                        <td className="px-8 py-5 text-sm text-gray-700">{r.email}</td>
                        <td className="px-8 py-5 text-sm text-gray-700">{r.lastSeen}</td>
                        <td className="px-8 py-5 text-right">
                          <StatusPill variant={r.isOnline ? "green" : "gray"}>{r.statusLabel}</StatusPill>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="px-8 py-8 text-sm text-gray-600" colSpan={4}>
                        {allCollectors.length === 0 ? "No collectors available." : "No collectors match your filter."}
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
