import { cloneElement, isValidElement } from "react";
import SidebarNavItem from "./sidebar/SidebarNavItem";

export default function AppSidebar({
  brand,
  navItems,
  footer,
  asideClassName = "",
  navClassName = "",
}) {
  return (
    <aside
      className={`fixed left-0 top-0 w-72 h-screen bg-white border-r border-gray-200 z-50 flex flex-col ${asideClassName}`}
    >
      {brand ? (
        <div className="h-20 flex items-center px-6 border-b border-gray-200 gap-3">
          {brand.logoSrc ? (
            <img
              className={brand.logoClassName ?? "h-10 w-auto object-contain rounded-xl"}
              src={brand.logoSrc}
              alt={brand.logoAlt ?? brand.title ?? "App Logo"}
            />
          ) : null}
          {brand.title ? (
            <span className="text-2xl font-bold text-green-700 tracking-tight">
              {brand.title}
            </span>
          ) : null}
        </div>
      ) : null}

      <nav className={`flex-1 py-8 px-4 space-y-2 overflow-y-auto ${navClassName}`}>
        {(navItems ?? []).map((item, idx) => {
          if (isValidElement(item)) {
            return item.key == null ? cloneElement(item, { key: idx }) : item;
          }

          if (!item) return null;

          return (
            <SidebarNavItem key={item.key ?? item.name ?? idx} to={item.to} end={item.end} icon={item.icon}>
              {item.name}
            </SidebarNavItem>
          );
        })}
      </nav>

      {footer ? <div className="p-6 border-t border-gray-200 space-y-2">{footer}</div> : null}
    </aside>
  );
}
