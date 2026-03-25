import { ClipboardList, History, LayoutDashboard, MessageCircle, User } from "lucide-react";
import { PATHS } from "../../../../app/routes/paths.js";

export const collectorNavItems = [
  {
    key: "dashboard",
    to: PATHS.collector.dashboard,
    end: true,
    icon: <LayoutDashboard className="h-5 w-5" />,
    name: "Dashboard",
  },
  {
    key: "tasks",
    to: PATHS.collector.tasks,
    icon: <ClipboardList className="h-5 w-5" />,
    name: "My Tasks",
  },
  {
    key: "history",
    to: PATHS.collector.history,
    icon: <History className="h-5 w-5" />,
    name: "History",
  },
   {
    key: "myFeedback",
    to: PATHS.collector.myFeedback,
    icon: <MessageCircle className="h-5 w-5" />,
    name: "My Feedback",
  },
  {
    key: "profile",
    to: PATHS.collector.profile,
    icon: <User className="h-5 w-5" />,
    name: "Profile",
  },
 
];
