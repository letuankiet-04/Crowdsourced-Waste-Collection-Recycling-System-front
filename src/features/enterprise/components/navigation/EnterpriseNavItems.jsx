import { BarChart3, ClipboardList, FileText, Gift, LayoutDashboard, MessageSquare, User, Users } from "lucide-react";
import { PATHS } from "../../../../app/routes/paths.js";

export const enterpriseNavItems = [
  {
    key: "dashboard",
    to: PATHS.enterprise.dashboard,
    end: true,
    icon: <LayoutDashboard className="h-5 w-5" />,
    name: "Dashboard",
  },
  {
    key: "activeCollector",
    to: PATHS.enterprise.activeCollector,
    icon: <Users className="h-5 w-5" />,
    name: "Active Collectors",
  },
  {
    key: "reports",
    to: PATHS.enterprise.reports,
    icon: <FileText className="h-5 w-5" />,
    name: "Reports",
  },
  {
    key: "reportsAnalytics",
    to: PATHS.enterprise.analytics,
    icon: <BarChart3 className="h-5 w-5" />,
    name: "Reports Analytics",
  },
  {
    key: "collectorReports",
    to: PATHS.enterprise.collectorReports,
    icon: <ClipboardList className="h-5 w-5" />,
    name: "Collector Reports",
  },
  {
    key: "rewards",
    to: PATHS.enterprise.rewards,
    icon: <Gift className="h-5 w-5" />,
    name: "Rewards",
  },
  {
    key: "feedback",
    to: PATHS.enterprise.reviewFeedback,
    icon: <MessageSquare className="h-5 w-5" />,
    name: "Review Feedback",
  },
  {
    key: "profile",
    to: PATHS.enterprise.profile,
    icon: <User className="h-5 w-5" />,
    name: "Profile",
  },
];
