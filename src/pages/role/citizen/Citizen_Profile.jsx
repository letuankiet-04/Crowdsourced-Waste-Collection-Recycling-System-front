import RoleLayout from "../../../components/layout/RoleLayout.jsx";
import Sidebar from "./Sidebar";
import Navbar from "./CD_Navbar";
import UserProfile from "../../../components/UserProfile.jsx";
import PageHeader from "../../../components/ui/PageHeader.jsx";
import CD_Footer from "../../../components/layout/CD_Footer.jsx";

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
