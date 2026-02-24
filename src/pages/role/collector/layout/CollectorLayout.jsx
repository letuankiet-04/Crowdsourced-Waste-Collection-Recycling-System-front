import { ClipboardList, LayoutDashboard, User, History } from "lucide-react";
import RoleSidebar from "../../../../components/sidebar/RoleSidebar.jsx";
import SidebarNavItem from "../../../../components/sidebar/SidebarNavItem.jsx";
import SidebarLogoutButton from "../../../../components/sidebar/SidebarLogoutButton.jsx";
import RoleLayout from "../../../../components/layout/RoleLayout.jsx";
import logo from "../../../../assets/app-logo.jpg";
import { PATHS } from "../../../../routes/paths.js";
import CollectorNavbar from "../navbar/CollectorNavbar.jsx";
import CD_Footer from "../../../../components/layout/CD_Footer.jsx";
import CD_Header from "../../../../components/layout/CD_Header.jsx";

export default function CollectorLayout({ children }) {
  return (
    <RoleLayout
      sidebar={
        <RoleSidebar
          brand={{
            logoSrc: logo,
            logoAlt: "Collector Portal Logo",
            title: "Collector Portal",
          }}
          navItems={[
            <SidebarNavItem key="dashboard" to={PATHS.collector.dashboard} end icon={<LayoutDashboard className="h-5 w-5" />}>
              Dashboard
            </SidebarNavItem>,
            <SidebarNavItem key="tasks" to={PATHS.collector.tasks} icon={<ClipboardList className="h-5 w-5" />}>
              My Tasks
            </SidebarNavItem>,
            <SidebarNavItem key="history" to={PATHS.collector.history} icon={<History className="h-5 w-5" />}>
              History
            </SidebarNavItem>,
            <SidebarNavItem key="profile" to={PATHS.collector.profile} icon={<User className="h-5 w-5" />}>
              Profile
            </SidebarNavItem>,
          ]}
          footer={<SidebarLogoutButton />}
        />
      }
      navbar={<CollectorNavbar />}
      showBackgroundEffects={false}
      footer={
        <div className="mt-10">
          <CD_Footer portalName="Collector Portal" />
        </div>
      }
    >
      <CD_Header
        title="Collector Portal"
        description="Welcome back! View your assigned tasks and update collection status."
        showBadge={false}
      />
      {children}
    </RoleLayout>
  );
}
