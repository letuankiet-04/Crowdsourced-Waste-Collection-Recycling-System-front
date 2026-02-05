import { useEffect, useMemo, useState } from "react";
import EnterpriseLayout from "./layout/EnterpriseLayout.jsx";
import PageHeader from "../../../components/ui/PageHeader.jsx";
import { Card, CardBody, CardHeader, CardTitle } from "../../../components/ui/Card.jsx";
import StatusPill from "../../../components/ui/StatusPill.jsx";
import useNotify from "../../../hooks/useNotify.js";
import { getEnterpriseCollectors } from "../../../api/enterprise.js";

function normalizeCollectors(payload) {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];
  const maybeList = payload.collectors ?? payload.items ?? payload.data ?? payload.users ?? payload.result ?? payload.content ?? [];
  return Array.isArray(maybeList) ? maybeList : [];
}

export default function EnterpriseActiveCollector() {
  const notify = useNotify();
  const [collectors, setCollectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadCollectors() {
      setLoading(true);
      setError("");
      try {
        const data = await getEnterpriseCollectors();
        const list = normalizeCollectors(data);
        if (!cancelled) setCollectors(list);
      } catch (err) {
        const message = err?.message || "Unable to load collectors. Please try again.";
        if (!cancelled) {
          setCollectors([]);
          setError(message);
        }
        notify.error("Load failed", message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadCollectors();
    return () => {
      cancelled = true;
    };
  }, [notify]);

  const rows = useMemo(() => {
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
      const statusLabel = isOnline ? "online" : statusRaw || "offline";
      return { id, name, email, lastSeen, isOnline, statusLabel };
      })
      .filter((r) => r.isOnline);
  }, [collectors]);

  return (
    <EnterpriseLayout>
      <div className="space-y-8">
        <PageHeader title="Active Collectors" description="List collectors." />
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
                  ) : rows.length ? (
                    rows.map((r) => (
                      <tr key={r.id} className="bg-white hover:bg-emerald-50/20 transition">
                        <td className="px-8 py-5 text-sm font-semibold text-gray-900">{r.name}</td>
                        <td className="px-8 py-5 text-sm text-gray-700">{r.email}</td>
                        <td className="px-8 py-5 text-sm text-gray-700">{r.lastSeen}</td>
                        <td className="px-8 py-5 text-right">
                          <StatusPill variant={r.isOnline ? "green" : "red"}>{r.statusLabel}</StatusPill>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="px-8 py-8 text-sm text-gray-600" colSpan={4}>
                        No collectors available.
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
