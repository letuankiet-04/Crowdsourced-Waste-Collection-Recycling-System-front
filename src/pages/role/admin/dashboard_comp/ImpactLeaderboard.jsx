import { Card, CardBody, CardHeader, CardTitle } from "../../../../components/ui/Card.jsx";

export default function ImpactLeaderboard() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="py-6 px-8">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Impact Leaderboard</CardTitle>
            <div className="mt-1 text-sm text-gray-600">wait api</div>
          </div>
          <div className="inline-flex rounded-xl border border-gray-200 overflow-hidden">
            <button type="button" className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Daily</button>
            <button type="button" className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border-l border-gray-200">Monthly</button>
          </div>
        </div>
      </CardHeader>
      <CardBody className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Top Contributors (Citizens)</h3>
            <div className="mt-4 divide-y divide-gray-100 border border-gray-100 rounded-xl">
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-sm font-medium text-gray-900">wait api</span>
                <span className="text-sm text-gray-600">wait api</span>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-sm font-medium text-gray-900">wait api</span>
                <span className="text-sm text-gray-600">wait api</span>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-sm font-medium text-gray-900">wait api</span>
                <span className="text-sm text-gray-600">wait api</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-base font-semibold text-gray-900">Top Performing Collectors</h3>
            <div className="mt-4 divide-y divide-gray-100 border border-gray-100 rounded-xl">
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-sm font-medium text-gray-900">wait api</span>
                <span className="text-sm text-gray-600">wait api</span>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-sm font-medium text-gray-900">wait api</span>
                <span className="text-sm text-gray-600">wait api</span>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-sm font-medium text-gray-900">wait api</span>
                <span className="text-sm text-gray-600">wait api</span>
              </div>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
