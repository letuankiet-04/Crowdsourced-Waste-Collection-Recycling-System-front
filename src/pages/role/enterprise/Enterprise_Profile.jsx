import EnterpriseLayout from "./layout/EnterpriseLayout.jsx";
import PageHeader from "../../../components/ui/PageHeader.jsx";
import { Card, CardBody } from "../../../components/ui/Card.jsx";

export default function EnterpriseProfile() {
  return (
    <EnterpriseLayout>
      <div className="space-y-8">
        <PageHeader title="Profile" description="Enterprise account and profile settings." />
        <Card>
          <CardBody className="p-8">
            <div className="text-gray-600">Wait API</div>
          </CardBody>
        </Card>
      </div>
    </EnterpriseLayout>
  );
}
