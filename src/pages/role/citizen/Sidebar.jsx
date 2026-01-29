import { NavLink } from "react-router-dom";
import logo from "../../../assets/app-logo.jpg";

export default function Sidebar() {
  const navItems = [
    { name: "Dashboard", path: "/home", icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    )},
    { name: "My Reports", path: "/reports", icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    )},
    { name: "Points & Rewards", path: "/rewards", icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
      </svg>
    )},
    { name: "Map", path: "/map", icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
    )},
    { name: "Profile", path: "/profile", icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    )},
  ];

  return (
    <aside className="fixed left-0 top-0 w-72 h-screen bg-white border-r border-gray-200 z-50 flex flex-col">
      {/* App Branding */}
      <div className="h-20 flex items-center px-6 border-b border-gray-200 gap-3">
        <img
          className="h-10 w-auto object-contain rounded-xl"
          src={logo}
          alt="Citizen Portal Logo"
        />
        <span className="text-2xl font-bold text-green-700 tracking-tight">
          Citizen Portal
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-8 px-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-4 py-3.5 rounded-xl text-base font-medium transition-all duration-300 ease-out group relative overflow-hidden ${
                isActive
                  ? "bg-gradient-to-r from-green-50 to-white/50 text-green-700 shadow-md translate-x-2 border-l-4 border-green-500"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:translate-x-1"
              }`
            }
          >
            <span className={`mr-4 text-lg transition-transform duration-300 group-hover:scale-110 relative z-10`}>
              {item.icon}
            </span>
            <span className="relative z-10">{item.name}</span>
            
            {/* Hover Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-green-100/0 via-green-100/30 to-green-100/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform" />
          </NavLink>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="p-6 border-t border-gray-200 space-y-2">
        <button className="flex w-full items-center px-4 py-3.5 text-base font-medium text-gray-700 rounded-xl hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 ease-in-out hover:translate-x-1 hover:scale-[1.02] group">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-gray-400 transition-transform duration-200 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Settings
        </button>
        <button className="flex w-full items-center px-4 py-3.5 text-base font-medium text-red-600 rounded-xl hover:bg-red-50 transition-all duration-200 ease-in-out hover:translate-x-1 hover:scale-[1.02] group">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 transition-transform duration-200 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </div>
    </aside>
  );
}