import EnterpriseLayout from "./layout/EnterpriseLayout.jsx";
import PageHeader from "../../../components/ui/PageHeader.jsx";
import ActionCard from "../../../components/ui/ActionCard.jsx";
import { Card, CardBody, CardHeader, CardTitle } from "../../../components/ui/Card.jsx";
import Button from "../../../components/ui/Button.jsx";
import useStoredUser from "../../../hooks/useStoredUser.js";
import { enterpriseRightPanelCards } from "./enterpriseDashboardRightPanelCards.jsx";
import { FileText, MessageSquareText, UserPlus, Users } from "lucide-react";
import { PATHS } from "../../../routes/paths.js";

function StatusPill({ children }) {
  return (
    <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold border border-gray-200 bg-gray-50 text-gray-600">
      {children}
    </span>
  );
}

const enterpriseQuickActions = [
  { key: "create-rule", label: "Create request rule" },
  { key: "assign-collector", label: "Assign collector" },
  { key: "analytics", label: "View analytics" },
];

export default function EnterpriseDashboard() {
  const { displayName } = useStoredUser();

  return (
    <EnterpriseLayout>
      <div className="space-y-8">
        <PageHeader
          title={`Hello, ${displayName}.`}
          description={
            <>
              Welcome back to your dashboard. All systems are operational. You have{" "}
              <span className="font-bold text-emerald-700">Wait API</span> pending requests waiting for review in your region.
            </>
          }
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8">
              <ActionCard
                to={PATHS.enterprise.reports}
                title="Active collectors"
                variant="green"
                icon={<Users className="h-10 w-10" aria-hidden="true" />}
              />
              <ActionCard
                to={PATHS.enterprise.reports}
                title="All reports"
                variant="green"
                icon={<FileText className="h-10 w-10" aria-hidden="true" />}
              />
              <ActionCard
                to={PATHS.enterprise.reports}
                title="View feedback"
                variant="blue"
                icon={<MessageSquareText className="h-10 w-10" aria-hidden="true" />}
              />
              <ActionCard
                to={PATHS.enterprise.adminPanel}
                title="Create collector account"
                variant="orange"
                icon={<UserPlus className="h-10 w-10" aria-hidden="true" />}
              />
            </div>

            <Card>
              <CardHeader className="py-6 px-8">
                <CardTitle className="text-2xl">Pending requests</CardTitle>
                <div className="text-sm font-semibold text-emerald-700">View all →</div>
              </CardHeader>
              <CardBody className="p-0">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left">
                    <thead className="bg-gray-50/60">
                      <tr className="text-xs uppercase tracking-wider text-gray-500">
                        <th className="px-8 py-4 font-bold">Report ID</th>
                        <th className="px-8 py-4 font-bold">Location</th>
                        <th className="px-8 py-4 font-bold">Date</th>
                        <th className="px-8 py-4 font-bold text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      <tr>
                        <td className="px-8 py-5 text-sm font-semibold text-gray-900">Wait API</td>
                        <td className="px-8 py-5 text-sm text-gray-600">Wait API</td>
                        <td className="px-8 py-5 text-sm text-gray-600">Wait API</td>
                        <td className="px-8 py-5 text-sm text-right">
                          <StatusPill>Wait API</StatusPill>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="px-8 py-6 border-t border-gray-100 flex items-center justify-between">
                  <div className="text-sm text-gray-500">Load more requests</div>
                  <div className="flex items-center gap-2">
                    <StatusPill>New</StatusPill>
                    <StatusPill>Open</StatusPill>
                    <StatusPill>Closed</StatusPill>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          <div className="space-y-6">
            {enterpriseRightPanelCards.map((panel) => (
              <Card key={panel.key}>
                <CardHeader className="py-6 px-8">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-2xl ${panel.iconBgClassName} text-white flex items-center justify-center`}>
                      {panel.icon}
                    </div>
                    <CardTitle className="text-2xl">{panel.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardBody className={panel.type === "quickActions" ? "p-8 space-y-3" : "p-8"}>
                  {panel.type === "quickActions" ? (
                    enterpriseQuickActions.map((action) => (
                      <Button key={action.key} className="w-full justify-between" variant="outline">
                        {action.label}
                        <span className="text-gray-500 font-bold">Wait API</span>
                      </Button>
                    ))
                  ) : (
                    <div className="text-gray-600">Wait API</div>
                  )}
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </EnterpriseLayout>
  );
}
