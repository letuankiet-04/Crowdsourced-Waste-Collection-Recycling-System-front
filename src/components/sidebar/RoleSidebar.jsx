import AppSidebar from "../AppSidebar.jsx";

export default function RoleSidebar({
  mobileOpen,
  onCloseMobile,
  brand,
  navItems,
  footer,
  asideClassName,
  navClassName,
  collapsed,
}) {
  const mobileEnabled = typeof mobileOpen === "boolean";

  return (
    <>
      {mobileEnabled && mobileOpen ? (
        <div className="fixed inset-0 bg-black/20 z-40 lg:hidden" onClick={onCloseMobile} aria-hidden="true" />
      ) : null}
      <AppSidebar
        mobileOpen={mobileOpen}
        brand={brand}
        navItems={navItems}
        footer={footer}
        asideClassName={asideClassName}
        navClassName={navClassName}
        collapsed={collapsed}
      />
    </>
  );
}
