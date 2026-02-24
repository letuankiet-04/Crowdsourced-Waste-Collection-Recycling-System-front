import EnterpriseLayout from "./layout/EnterpriseLayout.jsx";
import PageHeader from "../../../shared/ui/PageHeader.jsx";
import { Card, CardBody } from "../../../shared/ui/Card.jsx";

export default function EnterpriseRewards() {
  return (
    <EnterpriseLayout>
      <div className="space-y-8">
        <PageHeader title="Rewards" description="Reward rules, points, and incentives." />
        <Card>
          <CardBody className="p-8">
            <div className="text-gray-600">Wait API</div>
          </CardBody>
        </Card>
      </div>
    </EnterpriseLayout>
  );
}
