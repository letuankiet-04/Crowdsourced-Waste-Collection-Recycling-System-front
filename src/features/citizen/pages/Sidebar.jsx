import RoleSidebar from "../../../shared/layout/sidebar/RoleSidebar.jsx";
import SidebarLogoutButton from "../../../shared/layout/sidebar/SidebarLogoutButton.jsx";
import logo from "../../../assets/app-logo.jpg";
import { citizenNavItems } from "./CitizenNavItems";

export default function Sidebar() {
  return (
    <RoleSidebar
      brand={{
        logoSrc: logo,
        logoAlt: "Citizen Portal Logo",
        title: "Citizen Portal",
      }}
      navItems={citizenNavItems}
      footer={
        <>
          <SidebarLogoutButton />
        </>
      }
    />
  );
}
