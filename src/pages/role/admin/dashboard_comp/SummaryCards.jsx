import { Card, CardBody, CardHeader, CardTitle } from "../../../../components/ui/Card.jsx";
import WaitApiPlaceholder from "../../../../components/ui/WaitApiPlaceholder.jsx";

export default function SummaryCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardHeader className="py-6 px-8">
          <CardTitle className="text-lg">Total Active Users</CardTitle>
        </CardHeader>
        <CardBody className="p-8">
          <WaitApiPlaceholder height="h-24" />
        </CardBody>
      </Card>

      <Card>
        <CardHeader className="py-6 px-8">
          <CardTitle className="text-lg">Pending Reports</CardTitle>
        </CardHeader>
        <CardBody className="p-8">
          <WaitApiPlaceholder height="h-24" />
        </CardBody>
      </Card>

      <Card>
        <CardHeader className="py-6 px-8">
          <CardTitle className="text-lg">Monthly Waste Collected</CardTitle>
        </CardHeader>
        <CardBody className="p-8">
          <WaitApiPlaceholder height="h-24" />
        </CardBody>
      </Card>
    </div>
  );
}
