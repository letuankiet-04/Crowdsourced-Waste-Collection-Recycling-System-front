import { NavLink } from "react-router-dom";

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
        {(navItems ?? []).map((item) => (
          <NavLink
            key={item.key ?? item.name}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center px-4 py-3.5 rounded-xl text-base font-medium transition-all duration-300 ease-out group relative overflow-hidden ${
                isActive
                  ? "bg-gradient-to-r from-green-50 to-white/50 text-green-700 shadow-md translate-x-2 border-l-4 border-green-500"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:translate-x-1"
              }`
            }
            end={item.end}
          >
            {item.icon ? (
              <span className="mr-4 text-lg transition-transform duration-300 group-hover:scale-110 relative z-10">
                {item.icon}
              </span>
            ) : null}
            <span className="relative z-10">{item.name}</span>
            <div className="absolute inset-0 bg-gradient-to-r from-green-100/0 via-green-100/30 to-green-100/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform" />
          </NavLink>
        ))}
      </nav>

      {footer ? <div className="p-6 border-t border-gray-200 space-y-2">{footer}</div> : null}
    </aside>
  );
}
