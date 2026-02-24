
import AppSidebar from "../AppSidebar.jsx";

export default function RoleSidebar({
  brand,
  navItems,
  footer,
  asideClassName,
  navClassName,
  collapsed,
}) {
  return (
    <AppSidebar
      brand={brand}
      navItems={navItems}
      footer={footer}
      asideClassName={asideClassName}
      navClassName={navClassName}
      collapsed={collapsed}
    />

  );
}
