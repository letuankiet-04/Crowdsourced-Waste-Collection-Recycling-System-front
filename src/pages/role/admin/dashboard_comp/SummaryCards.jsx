import { Card, CardBody, CardHeader, CardTitle } from "../../../../components/ui/Card.jsx";

export default function SummaryCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardHeader className="py-6 px-8">
          <CardTitle className="text-lg">Total Active Users</CardTitle>
        </CardHeader>
        <CardBody className="p-8">
          <div className="text-3xl font-bold text-gray-900">wait api</div>
          <div className="mt-2 text-sm text-emerald-700">wait api</div>
          <div className="mt-4 text-sm text-gray-600">wait api</div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader className="py-6 px-8">
          <CardTitle className="text-lg">Pending Reports</CardTitle>
        </CardHeader>
        <CardBody className="p-8">
          <div className="text-3xl font-bold text-gray-900">wait api</div>
          <div className="mt-2 inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold border border-gray-200 bg-gray-50 text-gray-600">
            wait api
          </div>
          <div className="mt-4 text-sm text-gray-600">wait api</div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader className="py-6 px-8">
          <CardTitle className="text-lg">Monthly Waste Collected</CardTitle>
        </CardHeader>
        <CardBody className="p-8">
          <div className="text-3xl font-bold text-gray-900">wait api</div>
          <div className="mt-2 text-sm text-emerald-700">wait api</div>
          <div className="mt-4 text-sm text-gray-600">wait api</div>
        </CardBody>
      </Card>
    </div>
  );
}
