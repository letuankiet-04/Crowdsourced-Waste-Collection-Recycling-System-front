import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import EnterpriseLayout from "../layouts/EnterpriseLayout.jsx";
import PageHeader from "../../../shared/ui/PageHeader.jsx";
import { Card, CardBody, CardHeader, CardTitle } from "../../../shared/ui/Card.jsx";
import Button from "../../../shared/ui/Button.jsx";
import TextField from "../../../shared/ui/TextField.jsx";
import WaitApiPlaceholder from "../../../shared/ui/WaitApiPlaceholder.jsx";
import useNotify from "../../../shared/hooks/useNotify.js";
import { PATHS } from "../../../app/routes/paths.js";
import { ClipboardList, Medal, Scale, Users } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend as RechartsLegend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  getEnterpriseReports,
  getEnterpriseReportsCitizens,
  getEnterpriseReportsGeneral,
} from "../../../services/enterprise.service.js";

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
  const now = useMemo(() => new Date(), []);
  const currentYear = now.getFullYear();
  const yearOptions = useMemo(() => {
    return [currentYear - 2, currentYear - 1, currentYear, currentYear + 1];
  }, [currentYear]);

  const [yearInput, setYearInput] = useState(String(currentYear));
  const [quarterInput, setQuarterInput] = useState("");
  const [monthInput, setMonthInput] = useState("");
  const requestSeqRef = useRef(0);

  const year = useMemo(() => {
    const parsed = Number.parseInt(String(yearInput), 10);
    return Number.isFinite(parsed) ? parsed : currentYear;
  }, [currentYear, yearInput]);
  const quarter = useMemo(() => {
    const parsed = Number.parseInt(String(quarterInput), 10);
    if (!Number.isFinite(parsed)) return null;
    if (parsed < 1 || parsed > 4) return null;
    return parsed;
  }, [quarterInput]);
  const month = useMemo(() => {
    const parsed = Number.parseInt(String(monthInput), 10);
    if (!Number.isFinite(parsed)) return null;
    if (parsed < 1 || parsed > 12) return null;
    return parsed;
  }, [monthInput]);

  const citizenParams = useMemo(() => {
    const params = { year };
    if (month != null) params.month = month;
    else if (quarter != null) params.quarter = quarter;
    return params;
  }, [month, quarter, year]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [generalStats, setGeneralStats] = useState(null);
  const [citizenStats, setCitizenStats] = useState(null);
  const [reports, setReports] = useState([]);
  const [reportsError, setReportsError] = useState("");

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

  const statusPieRows = useMemo(() => {
    const total = generalTotalReports || 0;
    return generalStatusRows.map((r, idx) => {
      const value = toFiniteNumber(r.value) ?? 0;
      const pct = total > 0 ? (value / total) * 100 : 0;
      return {
        ...r,
        value,
        percent: pct,
        color: CHART_COLORS[idx % CHART_COLORS.length],
      };
    });
  }, [generalStatusRows, generalTotalReports]);

    const wasteTypeChartData = useMemo(() => {
      return generalWasteRows.slice(0, 8).map((r) => ({
        name: r.label,
        kg: toFiniteNumber(r.value) ?? 0,
      }));
    }, [generalWasteRows]);

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
    return citizenRows.slice(0, 5).map((r) => ({
      name: r.fullName,
      points: toFiniteNumber(r.totalPoints) ?? 0,
      kg: toFiniteNumber(r.totalWeightKg) ?? 0,
    }));
  }, [citizenRows]);

  const overviewAvgWeightKg = useMemo(() => {
    if (!generalTotalReports) return null;
    return generalTotalWasteKg / generalTotalReports;
  }, [generalTotalReports, generalTotalWasteKg]);

  const overviewTopContributor = useMemo(() => {
    return citizenRows[0]?.fullName ?? null;
  }, [citizenRows]);

  const parseReportCreatedAt = useCallback((r) => {
    const raw = r?.createdAt ?? r?.created_at ?? r?.createdDate ?? r?.created_date ?? null;
    if (!raw) return null;
    const d = raw instanceof Date ? raw : new Date(raw);
    return Number.isNaN(d.getTime()) ? null : d;
  }, []);

  const reportsOrdered = useMemo(() => {
    const list = Array.isArray(reports) ? reports : [];
    return [...list].sort((a, b) => {
      const ta = parseReportCreatedAt(a)?.getTime() ?? 0;
      const tb = parseReportCreatedAt(b)?.getTime() ?? 0;
      return tb - ta;
    });
  }, [parseReportCreatedAt, reports]);

  const selectedPeriodLabel = useMemo(() => {
    if (month != null) return `Month ${month}/${year}`;
    if (quarter != null) return `Q${quarter}/${year}`;
    return `Year ${year}`;
  }, [month, quarter, year]);

  const isInSelectedPeriod = useCallback(
    (date) => {
      if (!(date instanceof Date)) return false;
      if (date.getFullYear() !== year) return false;
      if (month != null) return date.getMonth() + 1 === month;
      if (quarter != null) {
        const q = Math.floor(date.getMonth() / 3) + 1;
        return q === quarter;
      }
      return true;
    },
    [month, quarter, year]
  );

  const reportActivityChartData = useMemo(() => {
    function toKey(date) {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const d = String(date.getDate()).padStart(2, "0");
      return `${y}-${m}-${d}`;
    }

    function toLabel(date) {
      const d = String(date.getDate()).padStart(2, "0");
      const m = String(date.getMonth() + 1).padStart(2, "0");
      return `${d}/${m}`;
    }

    const counts = new Map();
    const dates = new Map();
    for (const r of reportsOrdered) {
      const createdAt = parseReportCreatedAt(r);
      if (!createdAt) continue;
      if (!isInSelectedPeriod(createdAt)) continue;
      const key = toKey(createdAt);
      counts.set(key, (counts.get(key) ?? 0) + 1);
      if (!dates.has(key)) dates.set(key, createdAt);
    }

    return [...counts.entries()]
      .map(([key, count]) => {
        const date = dates.get(key);
        return { key, label: date ? toLabel(date) : key, count };
      })
      .sort((a, b) => String(a.key).localeCompare(String(b.key)))
      .slice(-7);
  }, [isInSelectedPeriod, parseReportCreatedAt, reportsOrdered]);

  const load = useCallback(() => {
    const seq = (requestSeqRef.current += 1);
    Promise.resolve().then(() => {
      if (seq !== requestSeqRef.current) return;
      setLoading(true);
      setError("");
      setReportsError("");
    });

    Promise.allSettled([
      getEnterpriseReportsGeneral({ year }),
      getEnterpriseReportsCitizens(citizenParams),
      getEnterpriseReports(),
    ])
      .then(([generalRes, citizensRes, reportsRes]) => {
        if (seq !== requestSeqRef.current) return;
        const errors = [];

        if (generalRes.status === "fulfilled") setGeneralStats(generalRes.value ?? null);
        else errors.push(generalRes.reason?.message || "Unable to load general report.");

        if (citizensRes.status === "fulfilled") setCitizenStats(citizensRes.value ?? null);
        else errors.push(citizensRes.reason?.message || "Unable to load citizen report.");

        if (reportsRes.status === "fulfilled") setReports(Array.isArray(reportsRes.value) ? reportsRes.value : []);
        else setReportsError(reportsRes.reason?.message || "Unable to load report list.");

        if (errors.length) {
          const message = errors[0];
          setError(message);
          notify.error("Load enterprise reports failed", message);
        }
      })
      .finally(() => {
        if (seq !== requestSeqRef.current) return;
        setLoading(false);
      });
  }, [citizenParams, notify, year]);

  useEffect(() => {
    load();
  }, [load]);

  const handleExport = useCallback(() => {
    const payload = {
      params: { year, quarter, month },
      generatedAt: new Date().toISOString(),
      general: generalStats,
      citizens: citizenRows,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const suffix = month != null ? `m${String(month).padStart(2, "0")}` : quarter != null ? `q${quarter}` : `y${year}`;
    a.href = url;
    a.download = `enterprise_reports_analytics_${suffix}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, [citizenRows, generalStats, month, quarter, year]);

  return (
    <EnterpriseLayout>
      <div className="min-h-screen space-y-8">
        <PageHeader
          title="Reports Analytics"
          description="Overview of reports and citizen contributions."
          right={
            <div className="grid gap-3 sm:flex sm:items-end sm:gap-4">
              <div className="w-full sm:w-44">
                <label className="mb-1 block text-sm font-semibold text-slate-700">Year</label>
                <select
                  value={yearInput}
                  onChange={(e) => setYearInput(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                >
                  {yearOptions.map((y) => (
                    <option key={y} value={String(y)}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-full sm:w-36">
                <TextField
                  label="Quarter"
                  type="number"
                  placeholder="1-4"
                  value={quarterInput}
                  onChange={(e) => {
                    const next = e.target.value;
                    setQuarterInput(next);
                    if (next !== "") setMonthInput("");
                  }}
                  inputClassName="py-2.5"
                />
              </div>
              <div className="w-full sm:w-36">
                <TextField
                  label="Month"
                  type="number"
                  placeholder="1-12"
                  value={monthInput}
                  onChange={(e) => {
                    const next = e.target.value;
                    setMonthInput(next);
                    if (next !== "") setQuarterInput("");
                  }}
                  inputClassName="py-2.5"
                />
              </div>
              <Button variant="outline" disabled={loading} onClick={load} className="rounded-full">
                Refresh
              </Button>
              <Button disabled={loading} onClick={handleExport} className="rounded-full">
                Export
              </Button>
            </div>
          }
        />
        {error ? (
          <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader className="py-4 px-8 border-b border-gray-100">
              <CardTitle className="text-lg">Overview</CardTitle>
            </CardHeader>
            <CardBody className="px-8 py-6">
              {loading ? (
                <WaitApiPlaceholder height="h-28" />
              ) : generalStats ? (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 sm:gap-4">
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
                    <Metric
                      icon={<Scale className="h-5 w-5" aria-hidden="true" />}
                      label="Avg weight / report"
                      value={overviewAvgWeightKg == null ? "—" : formatKg(overviewAvgWeightKg)}
                    />
                    <Metric
                      icon={<Medal className="h-5 w-5" aria-hidden="true" />}
                      label="Top contributor"
                      value={overviewTopContributor ?? "—"}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-6">
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
                      {topCitizenChartData.length ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={topCitizenChartData} margin={{ top: 10, right: 12, left: 6, bottom: 14 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                            <XAxis
                              dataKey="name"
                              tick={{ fontSize: 12, fill: "#334155" }}
                              interval={0}
                              angle={-10}
                              textAnchor="end"
                              height={50}
                            />
                            <YAxis tick={{ fontSize: 12, fill: "#64748B" }} tickFormatter={(v) => formatNumber(v)} />
                            <RechartsTooltip
                              formatter={(v, name) => (name === "kg" ? formatKg(v) : formatNumber(v))}
                              contentStyle={{ borderRadius: 12, borderColor: "#E2E8F0" }}
                            />
                            <RechartsLegend />
                            <Bar dataKey="points" name="Points" fill="#10B981" radius={[10, 10, 0, 0]} />
                            <Bar dataKey="kg" name="Kg" fill="#2563EB" radius={[10, 10, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="text-sm text-slate-600">No data.</div>
                      )}
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

        <Card>
          <CardHeader className="py-4 px-8 border-b border-gray-100">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CardTitle className="text-lg">Reports (each report is one row)</CardTitle>
              <Button as={Link} to={PATHS.enterprise.reports} variant="outline" size="sm" className="rounded-full">
                View all →
              </Button>
            </div>
            <div className="mt-1 text-sm text-slate-600">Reports in {selectedPeriodLabel}.</div>
          </CardHeader>
          <CardBody className="px-8 py-6">
            {reportsError ? <div className="mb-4 text-sm text-red-600">{reportsError}</div> : null}
            {loading ? (
              <WaitApiPlaceholder height="h-28" />
            ) : (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div className="text-sm font-bold text-slate-900">Reports activity (last 7 days)</div>
                    <div className="text-xs font-semibold text-slate-600">{selectedPeriodLabel}</div>
                  </div>
                  <div className="h-64">
                    {reportActivityChartData.length ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={reportActivityChartData} margin={{ top: 10, right: 12, left: 6, bottom: 10 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                          <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#334155" }} />
                          <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#64748B" }} />
                          <RechartsTooltip
                            formatter={(v) => formatNumber(v)}
                            contentStyle={{ borderRadius: 12, borderColor: "#E2E8F0" }}
                          />
                          <Bar dataKey="count" name="Reports" fill="#10B981" radius={[10, 10, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="text-sm text-slate-600">No data.</div>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div className="text-sm font-bold text-slate-900">Status</div>
                    <div className="text-xs font-semibold text-slate-600">Year {year}</div>
                  </div>
                  {statusPieRows.length ? (
                    <div className="grid grid-cols-1 gap-4">
                      <div className="h-56 min-w-0">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={statusPieRows}
                              dataKey="value"
                              nameKey="label"
                              innerRadius={60}
                              outerRadius={95}
                              startAngle={90}
                              endAngle={450}
                              paddingAngle={2}
                            >
                              {statusPieRows.map((row) => (
                                <Cell key={row.key} fill={row.color} />
                              ))}
                            </Pie>
                            <RechartsTooltip
                              formatter={(v, _n, ctx) => {
                                const value = toFiniteNumber(v) ?? 0;
                                const pct = toFiniteNumber(ctx?.payload?.percent) ?? 0;
                                return [`${formatNumber(value)} (${formatNumber(pct, { maximumFractionDigits: 1 })}%)`, "Reports"];
                              }}
                              contentStyle={{ borderRadius: 12, borderColor: "#E2E8F0" }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="grid min-w-0 grid-cols-1 gap-2 md:grid-cols-2">
                        {statusPieRows.slice(0, 8).map((row) => (
                          <div key={row.key} className="flex items-center gap-3 rounded-xl border border-slate-100 px-3 py-2">
                            <div className="flex min-w-0 items-center gap-2">
                              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: row.color }} />
                              <div className="min-w-0 text-xs font-semibold leading-tight text-slate-700">{row.label}</div>
                            </div>
                            <div className="ml-auto text-xs font-bold text-slate-900">{formatNumber(row.value)}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-slate-600">No data.</div>
                  )}
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </EnterpriseLayout>
  );
}
