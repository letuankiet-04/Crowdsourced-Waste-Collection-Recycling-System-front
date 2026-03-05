import RoleSidebar from "../../../../shared/layout/sidebar/RoleSidebar.jsx";
import SidebarNavItem from "../../../../shared/layout/sidebar/SidebarNavItem.jsx";
import SidebarLogoutButton from "../../../../shared/layout/sidebar/SidebarLogoutButton.jsx";
import appLogo from "../../../../assets/app-logo.jpg";
import { PATHS } from "../../../../app/routes/paths.js";
import { LayoutDashboard, MessageSquare, Users, BarChart3, User } from "lucide-react";

export default function Admin_Sidebar() {
  return (
    <RoleSidebar
      brand={{
        logoSrc: appLogo,
        logoAlt: "Admin Portal Logo",
        title: "Admin Portal",
      }}
      navItems={[
        <SidebarNavItem key="dashboard" to={PATHS.admin.dashboard} end className="text-lg" icon={<LayoutDashboard className="h-6 w-6" />}>
          Dashboard
        </SidebarNavItem>,
        <SidebarNavItem key="feedback" to={PATHS.admin.reviewFeedback} className="text-lg" icon={<MessageSquare className="h-6 w-6" />}>
          Review Feedback
        </SidebarNavItem>,
        <SidebarNavItem key="users" to={PATHS.admin.userManagement} className="text-lg" icon={<Users className="h-6 w-6" />}>
          User Management
        </SidebarNavItem>,
        <SidebarNavItem key="stats" to="#" className="text-lg" icon={<BarChart3 className="h-6 w-6" />}>
          Statistical Report
        </SidebarNavItem>,
        <SidebarNavItem key="profile" to={PATHS.admin.profile} className="text-lg" icon={<User className="h-6 w-6" />}>
          Profile
        </SidebarNavItem>,
      ]}
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
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94 1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
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
