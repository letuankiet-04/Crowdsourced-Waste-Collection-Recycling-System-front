import { Bell, Crown, Zap } from "lucide-react";

export const enterpriseRightPanelCards = [
  {
    key: "quick-actions",
    title: "Quick actions",
    iconBgClassName: "bg-green-600",
    icon: <Zap className="h-5 w-5" aria-hidden="true" />,
    type: "quickActions",
  },
  {
    key: "notifications",
    title: "Notifications / Tasks",
    iconBgClassName: "bg-blue-600",
    icon: <Bell className="h-5 w-5" aria-hidden="true" />,
    type: "placeholder",
  },
];

