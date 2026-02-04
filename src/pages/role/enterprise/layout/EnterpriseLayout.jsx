import { FileText, LayoutDashboard, Settings, User, Users } from "lucide-react";
import RoleSidebar from "../../../../components/sidebar/RoleSidebar.jsx";
import SidebarNavItem from "../../../../components/sidebar/SidebarNavItem.jsx";
import SidebarLogoutButton from "../../../../components/sidebar/SidebarLogoutButton.jsx";
import RoleLayout from "../../../../components/layout/RoleLayout.jsx";
import logo from "../../../../assets/app-logo.jpg";
import { PATHS } from "../../../../routes/paths.js";
import EnterpriseNavbar from "../navbar/EnterpriseNavbar.jsx";
import CD_Footer from "../../../../components/layout/CD_Footer.jsx";
import CD_Header from "../../../../components/layout/CD_Header.jsx";

export default function EnterpriseLayout({ children }) {
  return (
    <RoleLayout
      sidebar={
        <RoleSidebar
          brand={{
            logoSrc: logo,
            logoAlt: "Enterprise Portal Logo",
            title: "Enterprise Portal",
          }}
          navItems={[
            <SidebarNavItem key="dashboard" to={PATHS.enterprise.dashboard} end icon={<LayoutDashboard className="h-5 w-5" />}>
              Dashboard
            </SidebarNavItem>,
            <SidebarNavItem key="activeCollector" to={PATHS.enterprise.activeCollector} icon={<Users className="h-5 w-5" />}>
              Active Collectors
            </SidebarNavItem>,
            <SidebarNavItem key="reports" to={PATHS.enterprise.reports} icon={<FileText className="h-5 w-5" />}>
              Reports
            </SidebarNavItem>,
            <SidebarNavItem key="profile" to={PATHS.enterprise.profile} icon={<User className="h-5 w-5" />}>
              Profile
            </SidebarNavItem>,
            <SidebarNavItem key="settings" to={PATHS.enterprise.settings} icon={<Settings className="h-5 w-5" />}>
              Settings
            </SidebarNavItem>,
          ]}
          footer={<SidebarLogoutButton />}
        />
      }
      navbar={<EnterpriseNavbar />}
      showBackgroundEffects={false}
      footer={
        <div className="mt-10">
          <CD_Footer portalName="Enterprise Portal" />
        </div>
      }
    >
      <CD_Header
        title="Enterprise Portal"
        description="Welcome back! Manage recycling operations and review incoming requests."
        showBadge={false}
      />
      {children}
    </RoleLayout>

  );
}
