import { Card, CardBody, CardHeader, CardTitle } from "../../../../shared/ui/Card.jsx";
import { useEffect, useState } from "react";
import { getCitizenLeaderboard } from "../../../../services/citizen.service.js";

function LeaderboardPlaceholder({ title }) {
  return (
    <div>
      <h3 className="text-base font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="overflow-hidden rounded-xl border border-gray-100">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50/50">
            <tr>
              <th className="py-3 px-4 font-medium text-gray-500">Rank</th>
              <th className="py-3 px-4 font-medium text-gray-500">Name</th>
              <th className="py-3 px-4 font-medium text-gray-500 text-right">Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {[1, 2, 3].map((i) => (
              <tr key={i}>
                <td className="py-3 px-4 text-gray-400">#{i}</td>
                <td className="py-3 px-4 text-gray-400 italic">Wait API</td>
                <td className="py-3 px-4 text-right text-gray-400 italic">Wait API</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CitizenLeaderboardTable({ title, rows, loading, error }) {
  return (
    <div>
      <h3 className="text-base font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="overflow-hidden rounded-xl border border-gray-100">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50/50">
            <tr>
              <th className="py-3 px-4 font-medium text-gray-500">Rank</th>
              <th className="py-3 px-4 font-medium text-gray-500">Name</th>
              <th className="py-3 px-4 font-medium text-gray-500 text-right">Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {loading ? (
              <tr>
                <td className="py-3 px-4 text-gray-400" colSpan={3}>
                  Loading...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td className="py-3 px-4 text-red-600" colSpan={3}>
                  {error}
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td className="py-3 px-4 text-gray-400" colSpan={3}>
                  No data
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.citizenId ?? row.rank}>
                  <td className="py-3 px-4 text-gray-700">#{row.rank}</td>
                  <td className="py-3 px-4 text-gray-700">{row.fullName}</td>
                  <td className="py-3 px-4 text-right text-gray-700 font-semibold">{row.totalPoint ?? 0}</td>
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
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await getCitizenLeaderboard({ limit: 5 });
        if (!active) return;
        setRows(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!active) return;
        setError(e?.message || "Unable to load leaderboard.");
        setRows([]);
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="py-6 px-8">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Impact Leaderboard</CardTitle>
            <div className="mt-1 text-sm text-gray-600">Top contributors and collectors</div>
          </div>
          <div className="inline-flex rounded-xl border border-gray-200 overflow-hidden bg-white shadow-sm">
            <button type="button" className="px-4 py-2 text-sm font-medium text-gray-900 bg-gray-50 hover:bg-gray-100 transition-colors">Daily</button>
            <button type="button" className="px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 border-l border-gray-200 transition-colors">Monthly</button>
          </div>
        </div>
      </CardHeader>
      <CardBody className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <CitizenLeaderboardTable
            title="Top Contributors (Citizens)"
            rows={rows}
            loading={loading}
            error={error}
          />
          <LeaderboardPlaceholder title="Top Performing Collectors" />
        </div>
      </CardBody>
    </Card>
  );
}
