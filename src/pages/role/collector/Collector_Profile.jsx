import CollectorLayout from "./layout/CollectorLayout.jsx";
import PageHeader from "../../../components/ui/PageHeader.jsx";
import UserProfile from "../../../components/UserProfile.jsx";

export default function CollectorProfile() {
  return (
    <CollectorLayout>
      <div className="space-y-8">
        <PageHeader title="Profile" description="Collector account and profile settings." />
        <UserProfile />
      </div>
    </CollectorLayout>
  );
}
