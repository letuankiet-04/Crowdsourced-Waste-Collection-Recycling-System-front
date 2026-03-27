import { Card, CardBody, CardTitle } from "../../../../shared/ui/Card.jsx";
import { useEffect, useState } from "react";
import { getCitizenLeaderboard } from "../../../../services/citizen.service.js";
import { formatPoints } from "../../../../shared/lib/numberFormat.js";

export default function TopRank() {
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
    <Card>
      <CardBody>
        <div className="flex justify-between items-center mb-8">
          <CardTitle as="h4">Top rank</CardTitle>
          <span className="text-sm font-medium text-green-600 bg-green-50 px-3 py-1.5 rounded-full">All time</span>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <span className="text-sm font-medium text-gray-500">Loading...</span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-12">
            <span className="text-sm font-medium text-red-600">{error}</span>
          </div>
        ) : rows.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <span className="text-sm font-medium text-gray-500">No data</span>
          </div>
        ) : (
          <div className="space-y-4">
            {rows.map((row) => (
              <div key={row.citizenId ?? row.rank} className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-8 shrink-0 text-sm font-semibold text-gray-500">#{row.rank}</span>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-gray-900 truncate">{row.fullName}</div>
                    <div className="text-xs text-gray-500 truncate">
                      {[row.ward, row.city].filter(Boolean).join(", ")}
                    </div>
                  </div>
                </div>
                <div className="shrink-0 text-sm font-bold text-gray-900">{formatPoints(row.totalPoint ?? 0)}</div>
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
