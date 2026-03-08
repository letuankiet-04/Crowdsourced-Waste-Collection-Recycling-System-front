import { useCallback, useEffect, useMemo, useState } from "react";
import EnterpriseLayout from "../layouts/EnterpriseLayout.jsx";
import PageHeader from "../../../shared/ui/PageHeader.jsx";
import { Card, CardBody, CardHeader, CardTitle } from "../../../shared/ui/Card.jsx";
import Button from "../../../shared/ui/Button.jsx";
import TextField from "../../../shared/ui/TextField.jsx";
import WaitApiPlaceholder from "../../../shared/ui/WaitApiPlaceholder.jsx";
import useNotify from "../../../shared/hooks/useNotify.js";
import { BarChart3, ClipboardList, Medal, Scale, Users } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend as RechartsLegend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Bar as ChartBar, Doughnut } from "react-chartjs-2";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from "chart.js";
import {
  getEnterpriseReportsCitizens,
  getEnterpriseReportsGeneral,
  getEnterpriseReportsWasteVolume,
} from "../../../services/enterprise.service.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

function toFiniteNumber(value) {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

function formatNumber(value, options) {
  const n = toFiniteNumber(value);
  if (n === null) return "—";
  return new Intl.NumberFormat("vi-VN", options).format(n);
}

function formatKg(value) {
  const n = toFiniteNumber(value);
  if (n === null) return "—";
  const formatted = new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 1 }).format(n);
  return `${formatted} kg`;
}

function prettyKey(raw) {
  const s = String(raw ?? "")
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
  if (!s) return "Unknown";
  return s.replace(/\b\w/g, (m) => m.toUpperCase());
}

function Metric({ icon, label, value, sublabel }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div>
          <div className="text-2xl font-black text-slate-900">{value}</div>
          {sublabel ? <div className="text-xs text-slate-500">{sublabel}</div> : null}
        </div>
        <div className="rounded-2xl bg-emerald-50 p-2.5 text-emerald-700">{icon}</div>
      </div>
    </div>
  );
}

const CHART_COLORS = [
  "#10B981",
  "#2563EB",
  "#F59E0B",
  "#8B5CF6",
  "#EF4444",
  "#14B8A6",
  "#F97316",
  "#0EA5E9",
  "#84CC16",
  "#A855F7",
];

function SimpleTable({ columns, rows, empty }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left">
        <thead className="bg-slate-50/70">
          <tr className="text-xs uppercase tracking-wider text-slate-500">
            {columns.map((c) => (
              <th key={c.key} className={`px-4 py-3 font-bold ${c.align === "right" ? "text-right" : ""}`}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.length ? (
            rows.map((r, idx) => (
              <tr key={r.key ?? idx} className="text-sm text-slate-800">
                {columns.map((c) => (
                  <td key={c.key} className={`px-4 py-3 ${c.align === "right" ? "text-right" : ""}`}>
                    {typeof c.render === "function" ? c.render(r) : r[c.key]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td className="px-4 py-6 text-sm text-slate-600" colSpan={columns.length}>
                {empty}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default function EnterpriseReportsAnalytics() {
  const notify = useNotify();
  const [yearInput, setYearInput] = useState(String(new Date().getFullYear()));
  const year = useMemo(() => {
    const parsed = Number.parseInt(String(yearInput), 10);
    return Number.isFinite(parsed) ? parsed : new Date().getFullYear();
  }, [yearInput]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [generalStats, setGeneralStats] = useState(null);
  const [wasteVolumeStats, setWasteVolumeStats] = useState(null);
  const [citizenStats, setCitizenStats] = useState(null);

  const generalStatusRows = useMemo(() => {
    const source = generalStats?.reportsByStatus;
    if (!source || typeof source !== "object") return [];
    return Object.entries(source)
      .map(([key, value]) => ({
        key,
        label: prettyKey(key),
        value: toFiniteNumber(value) ?? 0,
      }))
      .sort((a, b) => b.value - a.value);
  }, [generalStats]);

  const generalWasteRows = useMemo(() => {
    const source = generalStats?.wasteWeightByType;
    if (!source || typeof source !== "object") return [];
    return Object.entries(source)
      .map(([key, value]) => ({
        key,
        label: String(key),
        value: toFiniteNumber(value) ?? 0,
      }))
      .sort((a, b) => b.value - a.value);
  }, [generalStats]);

  const generalTotalReports = useMemo(() => {
    return generalStatusRows.reduce((sum, r) => sum + (toFiniteNumber(r.value) ?? 0), 0);
  }, [generalStatusRows]);

  const generalTotalWasteKg = useMemo(() => {
    return generalWasteRows.reduce((sum, r) => sum + (toFiniteNumber(r.value) ?? 0), 0);
  }, [generalWasteRows]);

  const generalWasteMax = useMemo(() => {
    return generalWasteRows.reduce((m, r) => Math.max(m, toFiniteNumber(r.value) ?? 0), 0);
  }, [generalWasteRows]);

  const statusDoughnutData = useMemo(() => {
    const labels = generalStatusRows.map((r) => r.label);
    const data = generalStatusRows.map((r) => r.value);
    return {
      labels,
      datasets: [
        {
          label: "Reports",
          data,
          backgroundColor: labels.map((_, idx) => CHART_COLORS[idx % CHART_COLORS.length]),
          borderWidth: 0,
        },
      ],
    };
  }, [generalStatusRows]);

  const wasteTypeChartData = useMemo(() => {
    return generalWasteRows.slice(0, 8).map((r) => ({
      name: r.label,
      kg: toFiniteNumber(r.value) ?? 0,
    }));
  }, [generalWasteRows]);

  const wasteYear = useMemo(() => {
    const y = wasteVolumeStats?.year ?? year;
    return Number.isFinite(Number(y)) ? Number(y) : year;
  }, [wasteVolumeStats, year]);

  const wasteKpis = useMemo(() => {
    return {
      totalWeightKg: wasteVolumeStats?.totalWeightKg ?? wasteVolumeStats?.totalWeight,
      totalRequests: wasteVolumeStats?.totalRequests ?? wasteVolumeStats?.totalReports,
    };
  }, [wasteVolumeStats]);

  const byMonthRows = useMemo(() => {
    const list = wasteVolumeStats?.byMonth;
    if (!Array.isArray(list)) return [];
    const normalized = list
      .map((row) => ({
        key: `${row?.year ?? ""}-${row?.month ?? ""}`,
        year: toFiniteNumber(row?.year),
        month: toFiniteNumber(row?.month),
        totalWeightKg: toFiniteNumber(row?.totalWeightKg ?? row?.totalWeight),
        totalRequests: toFiniteNumber(row?.totalRequests ?? row?.totalReports),
      }))
      .filter((r) => r.year && r.month)
      .sort((a, b) => (a.year - b.year) || (a.month - b.month));
    return normalized.slice(-6);
  }, [wasteVolumeStats]);

  const byMonthChartData = useMemo(() => {
    return byMonthRows.map((r) => ({
      key: r.key,
      label: `${String(r.month).padStart(2, "0")}/${r.year}`,
      weightKg: toFiniteNumber(r.totalWeightKg) ?? 0,
      requests: toFiniteNumber(r.totalRequests) ?? 0,
    }));
  }, [byMonthRows]);

  const byQuarterRows = useMemo(() => {
    const list = wasteVolumeStats?.byQuarter;
    if (!Array.isArray(list)) return [];
    const normalized = list
      .map((row) => ({
        key: `${row?.year ?? ""}-${row?.quarter ?? ""}`,
        year: toFiniteNumber(row?.year),
        quarter: toFiniteNumber(row?.quarter),
        totalWeightKg: toFiniteNumber(row?.totalWeightKg ?? row?.totalWeight),
        totalRequests: toFiniteNumber(row?.totalRequests ?? row?.totalReports),
      }))
      .filter((r) => r.year && r.quarter)
      .sort((a, b) => (a.year - b.year) || (a.quarter - b.quarter));
    return normalized.slice(-4);
  }, [wasteVolumeStats]);

  const byQuarterChartData = useMemo(() => {
    return byQuarterRows.map((r) => ({
      key: r.key,
      label: `Q${r.quarter}/${r.year}`,
      weightKg: toFiniteNumber(r.totalWeightKg) ?? 0,
      requests: toFiniteNumber(r.totalRequests) ?? 0,
    }));
  }, [byQuarterRows]);

  const citizenRows = useMemo(() => {
    const list = Array.isArray(citizenStats)
      ? citizenStats
      : Array.isArray(citizenStats?.citizens)
        ? citizenStats.citizens
        : Array.isArray(citizenStats?.items)
          ? citizenStats.items
          : [];
    return list
      .map((c, idx) => ({
        key: c?.citizenId ?? c?.id ?? c?.userId ?? c?.fullName ?? `row-${idx}`,
        fullName: c?.fullName ?? c?.name ?? "Unknown",
        totalPoints: toFiniteNumber(c?.totalPoints ?? c?.points) ?? 0,
        totalWeightKg: toFiniteNumber(c?.totalWeightKg ?? c?.totalWeight) ?? 0,
        totalCollections: toFiniteNumber(c?.totalCollections ?? c?.collections) ?? 0,
      }))
      .sort((a, b) => b.totalPoints - a.totalPoints);
  }, [citizenStats]);

  const citizenKpis = useMemo(() => {
    const totalCitizens = citizenRows.length;
    const totalPoints = citizenRows.reduce((sum, r) => sum + (toFiniteNumber(r.totalPoints) ?? 0), 0);
    const totalWeightKg = citizenRows.reduce((sum, r) => sum + (toFiniteNumber(r.totalWeightKg) ?? 0), 0);
    return { totalCitizens, totalPoints, totalWeightKg };
  }, [citizenRows]);

  const topCitizenChartData = useMemo(() => {
    const top = citizenRows.slice(0, 5);
    return {
      labels: top.map((r) => r.fullName),
      datasets: [
        {
          label: "Points",
          data: top.map((r) => r.totalPoints),
          backgroundColor: "rgba(16, 185, 129, 0.75)",
          borderRadius: 10,
          yAxisID: "y",
        },
        {
          label: "Kg",
          data: top.map((r) => r.totalWeightKg),
          backgroundColor: "rgba(59, 130, 246, 0.55)",
          borderRadius: 10,
          yAxisID: "y1",
        },
      ],
    };
  }, [citizenRows]);

  const load = useCallback(() => {
    setLoading(true);
    setError("");

    Promise.allSettled([
      getEnterpriseReportsWasteVolume({ year }),
      getEnterpriseReportsGeneral(),
      getEnterpriseReportsCitizens({ year }),
    ])
      .then(([wasteVolumeRes, generalRes, citizensRes]) => {
        const errors = [];

        if (wasteVolumeRes.status === "fulfilled") setWasteVolumeStats(wasteVolumeRes.value ?? null);
        else errors.push(wasteVolumeRes.reason?.message || "Unable to load waste volume report.");

        if (generalRes.status === "fulfilled") setGeneralStats(generalRes.value ?? null);
        else errors.push(generalRes.reason?.message || "Unable to load general report.");

        if (citizensRes.status === "fulfilled") setCitizenStats(citizensRes.value ?? null);
        else errors.push(citizensRes.reason?.message || "Unable to load citizen report.");

        if (errors.length) {
          const message = errors[0];
          setError(message);
          notify.error("Load enterprise reports failed", message);
        }
      })
      .finally(() => setLoading(false));
  }, [notify, year]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <EnterpriseLayout>
      <div className="space-y-8">
        <PageHeader
          title="Reports Analytics"
          description="Overview of reports, waste volume, and citizen contributions."
          right={
            <div className="grid gap-3 sm:flex sm:items-end sm:gap-4">
              <div className="w-full sm:w-36">
                <TextField
                  label="Year"
                  type="number"
                  value={yearInput}
                  onChange={(e) => setYearInput(e.target.value)}
                  inputClassName="py-2.5"
                />
              </div>
              <Button variant="outline" disabled={loading} onClick={load} className="rounded-full">
                Refresh
              </Button>
            </div>
          }
        />
        {error ? (
          <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <Card>
            <CardHeader className="py-4 px-8 border-b border-gray-100">
              <CardTitle className="text-lg">Overview</CardTitle>
            </CardHeader>
            <CardBody className="px-8 py-6">
              {loading ? (
                <WaitApiPlaceholder height="h-28" />
              ) : generalStats ? (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                    <Metric
                      icon={<ClipboardList className="h-5 w-5" aria-hidden="true" />}
                      label="Total reports"
                      value={formatNumber(generalTotalReports)}
                    />
                    <Metric
                      icon={<Scale className="h-5 w-5" aria-hidden="true" />}
                      label="Total weight"
                      value={formatKg(generalTotalWasteKg)}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="min-w-0 space-y-3">
                      <div className="text-sm font-bold text-slate-900">Status</div>
                      {generalStatusRows.length ? (
                        <div className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-200 bg-white p-4">
                          <div className="grid grid-cols-1 gap-4">
                            <div className="h-56 min-w-0">
                              <Doughnut
                                data={statusDoughnutData}
                                options={{
                                  responsive: true,
                                  maintainAspectRatio: false,
                                  plugins: {
                                    legend: { display: false },
                                    tooltip: { enabled: true },
                                  },
                                  cutout: "68%",
                                }}
                              />
                            </div>
                            <div className="grid min-w-0 grid-cols-1 gap-2 md:grid-cols-2">
                              {generalStatusRows.slice(0, 8).map((row, idx) => (
                                <div
                                  key={row.key}
                                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 px-3 py-2"
                                >
                                  <div className="flex min-w-0 items-center gap-2">
                                    <span
                                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                                      style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }}
                                    />
                                    <div className="min-w-0 text-xs font-semibold leading-tight text-slate-700">{row.label}</div>
                                  </div>
                                  <div className="shrink-0 text-xs font-black text-slate-900">{formatNumber(row.value)}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-slate-600">No data.</div>
                      )}
                    </div>

                    <div className="min-w-0 space-y-3">
                      <div className="text-sm font-bold text-slate-900">Waste by type</div>
                      {wasteTypeChartData.length ? (
                        <div className="h-72 min-w-0 rounded-2xl border border-slate-200 bg-white p-4">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={wasteTypeChartData} layout="vertical" margin={{ top: 6, right: 16, left: 24, bottom: 10 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                              <XAxis
                                type="number"
                                tick={{ fontSize: 12, fill: "#64748B" }}
                                tickMargin={8}
                                tickFormatter={(v) => `${formatNumber(v)}kg`}
                              />
                              <YAxis
                                type="category"
                                dataKey="name"
                                tick={{ fontSize: 12, fill: "#334155" }}
                                tickMargin={8}
                                tickLine={false}
                                width={120}
                              />
                              <RechartsTooltip
                                formatter={(v) => formatKg(v)}
                                contentStyle={{ borderRadius: 12, borderColor: "#E2E8F0" }}
                              />
                              <Bar dataKey="kg" fill="#10B981" radius={[10, 10, 10, 10]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        <div className="text-sm text-slate-600">No data.</div>
                      )}
                      {generalWasteRows.length ? (
                        <div className="grid gap-3">
                          <div className="text-xs text-slate-500">Max: {formatKg(generalWasteMax)}</div>
                          <div className="rounded-2xl border border-slate-200 bg-white">
                            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                              <div className="text-sm font-bold text-slate-900">Top types</div>
                              <div className="text-xs font-semibold text-slate-500">kg</div>
                            </div>
                            <SimpleTable
                              columns={[
                                { key: "label", label: "Type" },
                                { key: "value", label: "Weight", align: "right", render: (r) => formatKg(r.value) },
                              ]}
                              rows={generalWasteRows.slice(0, 6)}
                              empty="No data."
                            />
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-slate-600">No data.</div>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader className="py-4 px-8 border-b border-gray-100">
              <CardTitle className="text-lg">Waste volume</CardTitle>
            </CardHeader>
            <CardBody className="px-8 py-6">
              {loading ? (
                <WaitApiPlaceholder height="h-28" />
              ) : wasteVolumeStats ? (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                    <Metric
                      icon={<BarChart3 className="h-5 w-5" aria-hidden="true" />}
                      label={`Weight (${wasteYear})`}
                      value={formatKg(wasteKpis.totalWeightKg)}
                    />
                    <Metric
                      icon={<ClipboardList className="h-5 w-5" aria-hidden="true" />}
                      label={`Requests (${wasteYear})`}
                      value={formatNumber(wasteKpis.totalRequests)}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="space-y-4 lg:col-span-2">
                      <div className="text-sm font-bold text-slate-900">By month (last 6 months)</div>
                      {byMonthChartData.length ? (
                        <div className="h-64 rounded-2xl border border-slate-200 bg-white p-4">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={byMonthChartData} margin={{ top: 8, right: 18, left: 10, bottom: 6 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                              <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#64748B" }} />
                              <YAxis
                                yAxisId="left"
                                tick={{ fontSize: 12, fill: "#64748B" }}
                                tickFormatter={(v) => formatNumber(v)}
                              />
                              <YAxis
                                yAxisId="right"
                                orientation="right"
                                tick={{ fontSize: 12, fill: "#64748B" }}
                                tickFormatter={(v) => formatNumber(v)}
                              />
                              <RechartsTooltip
                                formatter={(v, name) => (name === "weightKg" ? formatKg(v) : formatNumber(v))}
                                contentStyle={{ borderRadius: 12, borderColor: "#E2E8F0" }}
                              />
                              <RechartsLegend />
                              <Line
                                yAxisId="left"
                                type="monotone"
                                dataKey="weightKg"
                                name="Kg"
                                stroke="#10B981"
                                strokeWidth={3}
                                dot={{ r: 3 }}
                                activeDot={{ r: 5 }}
                              />
                              <Line
                                yAxisId="right"
                                type="monotone"
                                dataKey="requests"
                                name="Requests"
                                stroke="#2563EB"
                                strokeWidth={3}
                                dot={{ r: 3 }}
                                activeDot={{ r: 5 }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        <div className="text-sm text-slate-600">No data.</div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="text-sm font-bold text-slate-900">By quarter (last 4 quarters)</div>
                      {byQuarterChartData.length ? (
                        <div className="h-64 rounded-2xl border border-slate-200 bg-white p-4">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={byQuarterChartData} margin={{ top: 8, right: 18, left: 10, bottom: 6 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                              <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#64748B" }} />
                              <YAxis tick={{ fontSize: 12, fill: "#64748B" }} tickFormatter={(v) => formatNumber(v)} />
                              <RechartsTooltip
                                formatter={(v, name) => (name === "weightKg" ? formatKg(v) : formatNumber(v))}
                                contentStyle={{ borderRadius: 12, borderColor: "#E2E8F0" }}
                              />
                              <RechartsLegend />
                              <Bar dataKey="weightKg" name="Kg" fill="#10B981" radius={[10, 10, 0, 0]} />
                              <Bar dataKey="requests" name="Requests" fill="#2563EB" radius={[10, 10, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        <div className="text-sm text-slate-600">No data.</div>
                      )}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white">
                    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                      <div className="text-sm font-bold text-slate-900">Last 6 months details</div>
                      <div className="text-xs font-semibold text-slate-500">{wasteYear}</div>
                    </div>
                    <SimpleTable
                      columns={[
                        { key: "label", label: "Month" },
                        { key: "weightKg", label: "Kg", align: "right", render: (r) => formatKg(r.weightKg) },
                        { key: "requests", label: "Requests", align: "right", render: (r) => formatNumber(r.requests) },
                      ]}
                      rows={byMonthChartData}
                      empty="No data."
                    />
                  </div>
                </div>
              ) : (
                <div className="text-sm text-slate-600">No data.</div>
              )}
            </CardBody>
          </Card>
        </div>

        <Card>
          <CardHeader className="py-4 px-8 border-b border-gray-100">
            <CardTitle className="text-lg">Citizens</CardTitle>
          </CardHeader>
          <CardBody className="px-8 py-6">
            {loading ? (
              <WaitApiPlaceholder height="h-28" />
            ) : citizenStats ? (
              <div className="space-y-5">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
                  <Metric
                    icon={<Users className="h-5 w-5" aria-hidden="true" />}
                    label="Citizens"
                    value={formatNumber(citizenKpis.totalCitizens)}
                  />
                  <Metric
                    icon={<Medal className="h-5 w-5" aria-hidden="true" />}
                    label="Total points"
                    value={formatNumber(citizenKpis.totalPoints)}
                  />
                  <Metric
                    icon={<Scale className="h-5 w-5" aria-hidden="true" />}
                    label="Total weight"
                    value={formatKg(citizenKpis.totalWeightKg)}
                  />
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="text-sm font-bold text-slate-900">Top 5 by points</div>
                      <div className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600">
                        <Medal className="h-4 w-4" aria-hidden="true" />
                        Points / Kg
                      </div>
                    </div>
                    <div className="h-64">
                      <ChartBar
                        data={topCitizenChartData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: { position: "bottom" },
                            tooltip: { enabled: true },
                          },
                          scales: {
                            y: {
                              beginAtZero: true,
                              ticks: { color: "#64748B" },
                              grid: { color: "rgba(226, 232, 240, 0.9)" },
                            },
                            y1: {
                              beginAtZero: true,
                              position: "right",
                              ticks: { color: "#64748B" },
                              grid: { drawOnChartArea: false },
                            },
                            x: {
                              ticks: { color: "#334155" },
                              grid: { display: false },
                            },
                          },
                        }}
                      />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                      <div className="text-sm font-bold text-slate-900">Top contributors</div>
                      <div className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600">
                        <Medal className="h-4 w-4" aria-hidden="true" />
                        Points
                      </div>
                    </div>
                    <SimpleTable
                      columns={[
                        { key: "rank", label: "#" },
                        { key: "fullName", label: "Name" },
                        { key: "totalPoints", label: "Points", align: "right", render: (r) => formatNumber(r.totalPoints) },
                        { key: "totalWeightKg", label: "Kg", align: "right", render: (r) => formatKg(r.totalWeightKg) },
                        { key: "totalCollections", label: "Trips", align: "right", render: (r) => formatNumber(r.totalCollections) },
                      ]}
                      rows={citizenRows.slice(0, 8).map((r, idx) => ({ ...r, rank: idx + 1 }))}
                      empty="No data."
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-slate-600">No data.</div>
            )}
          </CardBody>
        </Card>
      </div>
    </EnterpriseLayout>
  );
}
