import RoleLayout from "../../../shared/layout/RoleLayout.jsx";
import AdminSidebar from "../components/navigation/Admin_Sidebar.jsx";
import Navbar from "../../citizen/components/navigation/CD_Navbar";
import UserProfile from "../../../shared/components/user/UserProfile.jsx";
import PageHeader from "../../../shared/ui/PageHeader.jsx";
import CD_Footer from "../../../shared/layout/CD_Footer.jsx";

export default function AdminProfile() {
  return (
    <RoleLayout
      sidebar={<AdminSidebar />}
      navbar={<Navbar brandTitle="" />}
      footer={<CD_Footer />}
    >
      <div className="space-y-8">
        <PageHeader title="Profile" description="Manage admin account settings." />
        <UserProfile />
      </div>
    </RoleLayout>
  );
}
