import { Card, CardBody, CardHeader, CardTitle } from "../../../../shared/ui/Card.jsx";
import { useEffect, useState } from "react";
import { getCitizenLeaderboard } from "../../../../services/citizen.service.js";
import { getAdminSystemAnalytics } from "../../../../services/admin.service.js";
import { formatNumber, formatPoints } from "../../../../shared/lib/numberFormat.js";

function getInitials(name) {
  if (!name) return "";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function UserAvatar({ name, className = "" }) {
  const initials = getInitials(name);
  return (
    <div className={`flex items-center justify-center w-10 h-10 rounded-full bg-slate-200 text-slate-600 text-sm font-bold border border-slate-300 ${className}`}>
      {initials}
    </div>
  );
}

function RankBadge({ rank }) {
  const styles = {
    1: "bg-yellow-100 text-yellow-600 border-yellow-200",
    2: "bg-slate-100 text-slate-500 border-slate-200",
    3: "bg-orange-100 text-orange-600 border-orange-200",
  };
  const baseStyle = styles[rank] || "bg-transparent text-slate-400 border-transparent";
  
  return (
    <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs font-bold ${baseStyle}`}>
      #{rank}
    </div>
  );
}

function CollectorLeaderboardTable({ title, rows, loading, error }) {
  return (
    <div className="flex-1 min-w-[320px]">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-2 h-2 rounded-full bg-blue-500" />
        <h3 className="text-lg font-bold text-slate-800">{title}</h3>
      </div>
      
      <div className="w-full">
        <table className="w-full border-collapse">
          <thead>
            <tr className="text-xs uppercase tracking-wider text-slate-400 border-b border-slate-100">
              <th className="py-4 px-2 font-medium text-left w-16">Rank</th>
              <th className="py-4 px-2 font-medium text-left">Name</th>
              <th className="py-4 px-2 font-medium text-right">Weight (KG)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              [1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="animate-pulse">
                  <td className="py-4 px-2"><div className="w-8 h-8 rounded-full bg-slate-100" /></td>
                  <td className="py-4 px-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100" />
                      <div className="h-4 w-24 bg-slate-100 rounded" />
                    </div>
                  </td>
                  <td className="py-4 px-2 text-right"><div className="h-4 w-8 bg-slate-100 rounded ml-auto" /></td>
                </tr>
              ))
            ) : error ? (
              <tr><td colSpan={3} className="py-8 text-center text-red-500 text-sm">{error}</td></tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-12">
                  <div className="border-2 border-dashed border-slate-100 rounded-2xl p-8 text-center text-slate-400 text-sm">
                    More collectors joining the movement...
                  </div>
                </td>
              </tr>
            ) : (
              rows.slice(0, 5).map((row, index) => (
                <tr key={row.collectorId ?? index} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-2">
                    <RankBadge rank={index + 1} />
                  </td>
                  <td className="py-4 px-2">
                    <div className="flex items-center gap-3">
                      <UserAvatar name={row.collectorName} className="group-hover:scale-105 transition-transform" />
                      <span className="font-medium text-slate-700">{row.collectorName}</span>
                    </div>
                  </td>
                  <td className="py-4 px-2 text-right">
                    <span className="text-lg font-bold text-blue-600">
                      {formatNumber(row.totalWeightCollected, { maximumFractionDigits: 0 }, "0")}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CitizenLeaderboardTable({ title, rows, loading, error }) {
  return (
    <div className="flex-1 min-w-[320px]">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-2 h-2 rounded-full bg-green-500" />
        <h3 className="text-lg font-bold text-slate-800">{title}</h3>
      </div>
      
      <div className="w-full">
        <table className="w-full border-collapse">
          <thead>
            <tr className="text-xs uppercase tracking-wider text-slate-400 border-b border-slate-100">
              <th className="py-4 px-2 font-medium text-left w-16">Rank</th>
              <th className="py-4 px-2 font-medium text-left">Name</th>
              <th className="py-4 px-2 font-medium text-right">Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              [1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="animate-pulse">
                  <td className="py-4 px-2"><div className="w-8 h-8 rounded-full bg-slate-100" /></td>
                  <td className="py-4 px-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100" />
                      <div className="h-4 w-24 bg-slate-100 rounded" />
                    </div>
                  </td>
                  <td className="py-4 px-2 text-right"><div className="h-4 w-8 bg-slate-100 rounded ml-auto" /></td>
                </tr>
              ))
            ) : error ? (
              <tr><td colSpan={3} className="py-8 text-center text-red-500 text-sm">{error}</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={3} className="py-8 text-center text-slate-400 text-sm italic">No contributors yet.</td></tr>
            ) : (
              rows.slice(0, 5).map((row, index) => (
                <tr key={row.citizenId ?? index} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-2">
                    <RankBadge rank={index + 1} />
                  </td>
                  <td className="py-4 px-2">
                    <div className="flex items-center gap-3">
                      <UserAvatar name={row.fullName} className="group-hover:scale-105 transition-transform" />
                      <span className="font-medium text-slate-700">{row.fullName}</span>
                    </div>
                  </td>
                  <td className="py-4 px-2 text-right">
                    <span className="text-lg font-bold text-green-600 italic">
                      {formatPoints(row.totalPoints ?? row.totalPoint)}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function ImpactLeaderboard() {
  const [citizenRows, setCitizenRows] = useState([]);
  const [collectorRows, setCollectorRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState("weekly");

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        // Map period names to parameters for API
        const params = { period };

        // Fetch both in parallel
        const [citizenData, analyticsData] = await Promise.all([
          getCitizenLeaderboard({ ...params, limit: 5 }),
          getAdminSystemAnalytics(params),
        ]);

        if (!active) return;

        setCitizenRows(Array.isArray(citizenData) ? citizenData : []);
        setCollectorRows(analyticsData?.collectorPerformanceStats || []);
      } catch (e) {
        if (!active) return;
        setError(e?.message || "Unable to load leaderboard.");
        setCitizenRows([]);
        setCollectorRows([]);
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [period]);

  return (
    <Card className="overflow-hidden border-none shadow-xl bg-white">
      <CardHeader className="py-10 px-10 border-none">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 w-full">
          <div className="space-y-2">
            <CardTitle className="text-4xl font-extrabold text-slate-900 tracking-tight">Impact Leaderboard</CardTitle>
            <p className="text-slate-500 text-lg max-w-2xl leading-relaxed">
              Celebrating our top contributors and environmental collectors.
            </p>
          </div>

          <div className="flex p-1 bg-slate-100 rounded-2xl self-start">
            <button
              onClick={() => setPeriod("weekly")}
              className={`px-6 py-2.5 text-sm font-bold rounded-xl transition-all duration-200 ${
                period === "weekly"
                  ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setPeriod("monthly")}
              className={`px-6 py-2.5 text-sm font-bold rounded-xl transition-all duration-200 ${
                period === "monthly"
                  ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Monthly
            </button>
          </div>
        </div>
      </CardHeader>
      
      <CardBody className="p-10 pt-0">
        <div className="flex flex-col lg:flex-row gap-16">
          <CitizenLeaderboardTable
            title="Top Contributors (Citizens)"
            rows={citizenRows}
            loading={loading}
            error={error}
          />
          <CollectorLeaderboardTable 
            title="Top Performing Collectors" 
            rows={collectorRows}
            loading={loading}
            error={error}
          />
        </div>
      </CardBody>
    </Card>
  );
}
