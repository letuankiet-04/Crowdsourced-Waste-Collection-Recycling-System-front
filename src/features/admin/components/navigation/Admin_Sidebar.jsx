import RoleSidebar from "../../../../shared/layout/sidebar/RoleSidebar.jsx";
import SidebarNavItem from "../../../../shared/layout/sidebar/SidebarNavItem.jsx";
import SidebarLogoutButton from "../../../../shared/layout/sidebar/SidebarLogoutButton.jsx";
import appLogo from "../../../../assets/app-logo.jpg";
import { PATHS } from "../../../../app/routes/paths.js";
import { LayoutDashboard, MessageSquare, Users, BarChart3, User } from "lucide-react";

export default function Admin_Sidebar() {
  return (
    <RoleSidebar
      brand={{
        logoSrc: appLogo,
        logoAlt: "Admin Portal Logo",
        title: "Admin Portal",
      }}
      navItems={[
        <SidebarNavItem key="dashboard" to={PATHS.admin.dashboard} end className="text-lg" icon={<LayoutDashboard className="h-6 w-6" />}>
          Dashboard
        </SidebarNavItem>,
        <SidebarNavItem key="feedback" to={PATHS.admin.reviewFeedback} className="text-lg" icon={<MessageSquare className="h-6 w-6" />}>
          Review Feedback
        </SidebarNavItem>,
        <SidebarNavItem key="users" to={PATHS.admin.userManagement} className="text-lg" icon={<Users className="h-6 w-6" />}>
          User Management
        </SidebarNavItem>,
        <SidebarNavItem key="stats" to="#" className="text-lg" icon={<BarChart3 className="h-6 w-6" />}>
          Statistical Report
        </SidebarNavItem>,
        <SidebarNavItem key="profile" to={PATHS.admin.profile} className="text-lg" icon={<User className="h-6 w-6" />}>
          Profile
        </SidebarNavItem>,
      ]}
      footer={
        <>
          <SidebarLogoutButton />
        </>
      }
    />
  );
}
