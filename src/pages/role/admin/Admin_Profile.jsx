import RoleLayout from "../../../components/layout/RoleLayout.jsx";
import AdminSidebar from "./dashboard_comp/Admin_Sidebar.jsx";
import Navbar from "../citizen/CD_Navbar";
import UserProfile from "../../../components/UserProfile.jsx";
import PageHeader from "../../../components/ui/PageHeader.jsx";
import CD_Footer from "../../../components/layout/CD_Footer.jsx";

export default function AdminProfile() {
  return (
    <RoleLayout
      sidebar={<AdminSidebar />}
      navbar={<Navbar brandTitle="Admin Portal" />}
      footer={<CD_Footer />}
    >
      <div className="space-y-8">
        <PageHeader title="Profile" description="Manage admin account settings." />
        <UserProfile />
      </div>
    </RoleLayout>
  );
}
