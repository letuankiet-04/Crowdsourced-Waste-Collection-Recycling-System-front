import EnterpriseLayout from "./layout/EnterpriseLayout.jsx";
import PageHeader from "../../../components/ui/PageHeader.jsx";
import { Card, CardBody } from "../../../components/ui/Card.jsx";

export default function EnterpriseReports() {
  return (
    <EnterpriseLayout>
      <div className="space-y-8">
        <PageHeader title="Reports" description="Enterprise reports and analytics." />
        <Card>
          <CardBody className="p-8">
            <div className="text-gray-600">Wait API</div>
          </CardBody>
        </Card>
      </div>
    </EnterpriseLayout>
  );
}
