import { ClipboardList, FileText, LayoutDashboard, User, Users } from "lucide-react";
import RoleSidebar from "../../../shared/layout/sidebar/RoleSidebar.jsx";
import SidebarNavItem from "../../../shared/layout/sidebar/SidebarNavItem.jsx";
import SidebarLogoutButton from "../../../shared/layout/sidebar/SidebarLogoutButton.jsx";
import RoleLayout from "../../../shared/layout/RoleLayout.jsx";
import logo from "../../../assets/app-logo.jpg";
import { PATHS } from "../../../app/routes/paths.js";
import EnterpriseNavbar from "../components/navigation/EnterpriseNavbar.jsx";
import CD_Footer from "../../../shared/layout/CD_Footer.jsx";

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
            <SidebarNavItem key="collectorReports" to={PATHS.enterprise.collectorReports} icon={<ClipboardList className="h-5 w-5" />}>
              Collector Reports
            </SidebarNavItem>,
            <SidebarNavItem key="profile" to={PATHS.enterprise.profile} icon={<User className="h-5 w-5" />}>
              Profile
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
      {children}
    </RoleLayout>

  );
}
