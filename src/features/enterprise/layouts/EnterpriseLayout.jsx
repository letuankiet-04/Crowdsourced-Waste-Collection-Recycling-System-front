import RoleSidebar from "../../../shared/layout/sidebar/RoleSidebar.jsx";
import SidebarLogoutButton from "../../../shared/layout/sidebar/SidebarLogoutButton.jsx";
import RoleLayout from "../../../shared/layout/RoleLayout.jsx";
import logo from "../../../assets/app-logo.jpg";
import EnterpriseNavbar from "../components/navigation/EnterpriseNavbar.jsx";
import CD_Footer from "../../../shared/layout/CD_Footer.jsx";
import { enterpriseNavItems } from "../components/navigation/EnterpriseNavItems.jsx";

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
          navItems={enterpriseNavItems}
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
