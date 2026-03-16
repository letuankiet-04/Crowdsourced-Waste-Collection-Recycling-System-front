import RoleSidebar from "../../../../shared/layout/sidebar/RoleSidebar.jsx";
import SidebarLogoutButton from "../../../../shared/layout/sidebar/SidebarLogoutButton.jsx";
import appLogo from "../../../../assets/app-logo.jpg";
import { adminNavItems } from "./AdminNavItems.jsx";

export default function Admin_Sidebar() {
  return (
    <RoleSidebar
      brand={{
        logoSrc: appLogo,
        logoAlt: "Admin Portal Logo",
        title: "Admin Portal",
      }}
      navItems={adminNavItems}
      footer={
        <>
          <SidebarLogoutButton />
        </>
      }
    />
  );
}
