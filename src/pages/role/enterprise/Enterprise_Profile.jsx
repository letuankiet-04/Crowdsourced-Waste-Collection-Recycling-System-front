import EnterpriseLayout from "./layout/EnterpriseLayout.jsx";
import PageHeader from "../../../components/ui/PageHeader.jsx";
import UserProfile from "../../../components/UserProfile.jsx";

export default function EnterpriseProfile() {
  return (
    <EnterpriseLayout>
      <div className="space-y-8">
        <PageHeader title="Profile" description="Enterprise account and profile settings." />
        <UserProfile />
      </div>
    </EnterpriseLayout>
  );
}
