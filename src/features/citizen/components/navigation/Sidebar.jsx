import RoleSidebar from "../../../../shared/layout/sidebar/RoleSidebar.jsx";
import SidebarLogoutButton from "../../../../shared/layout/sidebar/SidebarLogoutButton.jsx";
import logo from "../../../../assets/app-logo.jpg";
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
          <button className="flex w-full items-center px-4 py-3.5 text-base font-medium text-gray-700 rounded-xl hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 ease-in-out hover:translate-x-1 hover:scale-[1.02] group">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 mr-3 text-gray-400 transition-transform duration-200 group-hover:scale-110"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Settings
          </button>
          <SidebarLogoutButton />
        </>
      }
    />
  );
}
