import { cloneElement, isValidElement } from "react";
import { Link } from "react-router-dom";
import { PATHS } from "../../app/routes/paths.js";
import { cn } from "../lib/cn.js";
import SidebarNavItem from "./sidebar/SidebarNavItem";

export default function AppSidebar({
  brand,
  navItems,
  footer,
  asideClassName = "",
  navClassName = "",
  collapsed = false,
}) {
  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-white border-r border-gray-200 z-50 flex flex-col transition-[width] duration-300 ease-out",
        collapsed ? "w-20" : "w-72",
        asideClassName
      )}
    >
      {brand ? (
        <Link
          to={PATHS.home}
          aria-label={brand.title ? `${brand.title} Home` : "Home"}
          className={cn(
            "h-20 flex items-center border-b border-gray-200",
            collapsed ? "px-4 justify-center" : "px-6 gap-3"
          )}
        >
          {brand.logoSrc ? (
            <img
              className={brand.logoClassName ?? "h-10 w-auto object-contain rounded-xl"}
              src={brand.logoSrc}
              alt={brand.logoAlt ?? brand.title ?? "App Logo"}
            />
          ) : null}
          {brand.title && !collapsed ? (
            <span className="text-2xl font-bold text-green-700 tracking-tight">
              {brand.title}
            </span>
          ) : null}
        </Link>
      ) : null}

      <nav className={cn("flex-1 py-8 space-y-2 overflow-y-auto", collapsed ? "px-3" : "px-4", navClassName)}>
        {(navItems ?? []).map((item, idx) => {
          if (isValidElement(item)) {
            return item.key == null ? cloneElement(item, { key: idx }) : item;
          }

          if (!item) return null;

          return (
            <SidebarNavItem
              key={item.key ?? item.name ?? idx}
              to={item.to}
              end={item.end}
              icon={item.icon}
              collapsed={collapsed}
              className={item.className}
            >
              {item.name}
            </SidebarNavItem>
          );
        })}
      </nav>

      {footer ? (
        <div className={cn("border-t border-gray-200 space-y-2", collapsed ? "p-3" : "p-6")}>
          {typeof footer === "function" ? footer({ collapsed }) : footer}
        </div>
      ) : null}
    </aside>
  );
}
