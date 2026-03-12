import { BarChart3, LayoutDashboard, MessageSquare, User, Users } from "lucide-react";
import { PATHS } from "../../../../app/routes/paths.js";

export const adminNavItems = [
  {
    key: "dashboard",
    to: PATHS.admin.dashboard,
    end: true,
    icon: <LayoutDashboard className="h-6 w-6" />,
    name: "Dashboard",
    className: "text-lg",
  },
  {
    key: "feedback",
    to: PATHS.admin.reviewFeedback,
    icon: <MessageSquare className="h-6 w-6" />,
    name: "Review Feedback",
    className: "text-lg",
  },
  {
    key: "users",
    to: PATHS.admin.userManagement,
    icon: <Users className="h-6 w-6" />,
    name: "User Management",
    className: "text-lg",
  },
  {
    key: "stats",
    to: "#",
    icon: <BarChart3 className="h-6 w-6" />,
    name: "Statistical Report",
    className: "text-lg",
  },
  {
    key: "profile",
    to: PATHS.admin.profile,
    icon: <User className="h-6 w-6" />,
    name: "Profile",
    className: "text-lg",
  },
];
