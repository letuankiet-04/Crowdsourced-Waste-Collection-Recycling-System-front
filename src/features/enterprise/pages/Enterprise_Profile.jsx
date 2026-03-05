import EnterpriseLayout from "../layouts/EnterpriseLayout.jsx";
import PageHeader from "../../../shared/ui/PageHeader.jsx";
import UserProfile from "../../../shared/components/user/UserProfile.jsx";

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
