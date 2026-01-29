import { NavLink } from "react-router-dom";

export default function SidebarNavItem({
  to,
  icon,
  end,
  collapsed = false,
  label,
  children,
  className = "",
}) {
  const content = children ?? label;

  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center py-3.5 rounded-xl text-base font-medium transition-all duration-300 ease-out group relative overflow-hidden ${
          isActive
            ? "bg-gradient-to-r from-green-50 to-white/50 text-green-700 shadow-md translate-x-2 border-l-4 border-green-500"
            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:translate-x-1"
        } ${collapsed ? "justify-center px-3 translate-x-0 hover:translate-x-0" : "px-4"} ${className}`
      }
      end={end}
      title={typeof content === "string" ? content : undefined}
    >
      {icon ? (
        <span
          className={`text-lg transition-transform duration-300 group-hover:scale-110 relative z-10 ${collapsed ? "mr-0" : "mr-4"}`}
          aria-hidden="true"
        >
          {icon}
        </span>
      ) : null}
      <span className={`relative z-10 ${collapsed ? "sr-only" : ""}`}>{content}</span>
      <div className="absolute inset-0 bg-gradient-to-r from-green-100/0 via-green-100/30 to-green-100/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform" />
    </NavLink>
  );
}
