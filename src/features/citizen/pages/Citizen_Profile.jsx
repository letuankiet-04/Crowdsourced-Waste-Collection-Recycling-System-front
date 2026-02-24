import RoleLayout from "../../../shared/layout/RoleLayout.jsx";
import Sidebar from "./Sidebar";
import Navbar from "./CD_Navbar";
import UserProfile from "../../../shared/components/user/UserProfile.jsx";
import PageHeader from "../../../shared/ui/PageHeader.jsx";
import CD_Footer from "../../../shared/layout/CD_Footer.jsx";

export default function CitizenProfile() {
  return (
    <RoleLayout
      sidebar={<Sidebar />}
      navbar={<Navbar />}
      showBackgroundEffects
      footer={<CD_Footer />}
    >
      <div className="space-y-8">
        <PageHeader title="Profile" description="Manage your personal information." />
        <UserProfile />
      </div>
    </RoleLayout>
  );
}
