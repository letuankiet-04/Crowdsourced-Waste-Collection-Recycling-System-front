import { useCallback, useState } from "react";
import { FileText, LayoutDashboard, Settings, User } from "lucide-react";
import RoleSidebar from "../../../../components/sidebar/RoleSidebar.jsx";
import SidebarNavItem from "../../../../components/sidebar/SidebarNavItem.jsx";
import SidebarLogoutButton from "../../../../components/sidebar/SidebarLogoutButton.jsx";
import RoleLayout from "../../../../components/layout/RoleLayout.jsx";
import logo from "../../../../assets/app-logo.jpg";
import { PATHS } from "../../../../routes/paths.js";
import EnterpriseNavbar from "../navbar/EnterpriseNavbar.jsx";

export default function EnterpriseLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const openMobile = useCallback(() => setMobileOpen(true), []);
  const closeMobile = useCallback(() => setMobileOpen(false), []);

  return (
    <RoleLayout
      sidebar={
        <RoleSidebar
          mobileOpen={mobileOpen}
          onCloseMobile={closeMobile}
          brand={{
            logoSrc: logo,
            logoAlt: "Enterprise Portal Logo",
            title: "Enterprise Portal",
          }}
          navItems={[
            <SidebarNavItem key="dashboard" to={PATHS.enterprise.dashboard} end icon={<LayoutDashboard className="h-5 w-5" />}>
              Dashboard
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
      navbar={<EnterpriseNavbar onOpenMobile={openMobile} />}
      contentOffsetClassName="ml-0 lg:ml-72"
      showBackgroundEffects={false}
    >
      {children}
    </RoleLayout>
  );
}
