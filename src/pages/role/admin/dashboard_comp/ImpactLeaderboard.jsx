import { Card, CardBody, CardHeader, CardTitle } from "../../../../components/ui/Card.jsx";

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

export default function ImpactLeaderboard() {
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
          <LeaderboardPlaceholder title="Top Contributors (Citizens)" />
          <LeaderboardPlaceholder title="Top Performing Collectors" />
        </div>
      </CardBody>
    </Card>
  );
}
