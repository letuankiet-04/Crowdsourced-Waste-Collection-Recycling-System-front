import { NavLink } from "react-router-dom";

export default function SidebarNavItem({
  to,
  icon,
  end,
  label,
  children,
  className = "",
}) {
  const content = children ?? label;

  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center px-4 py-3.5 rounded-xl text-base font-medium transition-all duration-300 ease-out group relative overflow-hidden ${
          isActive
            ? "bg-gradient-to-r from-green-50 to-white/50 text-green-700 shadow-md translate-x-2 border-l-4 border-green-500"
            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:translate-x-1"
        } ${className}`
      }
      end={end}
    >
      {icon ? (
        <span className="mr-4 text-lg transition-transform duration-300 group-hover:scale-110 relative z-10">
          {icon}
        </span>
      ) : null}
      <span className="relative z-10">{content}</span>
      <div className="absolute inset-0 bg-gradient-to-r from-green-100/0 via-green-100/30 to-green-100/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform" />
    </NavLink>
  );
}
