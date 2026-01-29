import EnterpriseLayout from "./layout/EnterpriseLayout.jsx";
import PageHeader from "../../../components/ui/PageHeader.jsx";
import { Card, CardBody } from "../../../components/ui/Card.jsx";

export default function EnterpriseAdminPanel() {
  return (
    <EnterpriseLayout>
      <div className="space-y-8">
        <PageHeader title="Admin Panel" description="Collector accounts, approvals, and enterprise controls." />
        <Card>
          <CardBody className="p-8">
            <div className="text-gray-600">Wait API</div>
          </CardBody>
        </Card>
      </div>
    </EnterpriseLayout>
  );
}
