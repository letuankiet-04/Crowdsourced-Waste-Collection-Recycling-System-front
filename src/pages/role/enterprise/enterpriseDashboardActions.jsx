import { FileText, MessageSquareText, UserPlus, Users } from "lucide-react";
import { PATHS } from "../../../routes/paths.js";

export const enterpriseDashboardActions = [
  {
    key: "active-collectors",
    title: "Active collectors",
    to: PATHS.enterprise.reports,
    variant: "green",
    icon: <Users className="h-10 w-10" aria-hidden="true" />,
  },
  {
    key: "all-reports",
    title: "All reports",
    to: PATHS.enterprise.reports,
    variant: "green",
    icon: <FileText className="h-10 w-10" aria-hidden="true" />,
  },
  {
    key: "view-feedback",
    title: "View feedback",
    to: PATHS.enterprise.reports,
    variant: "blue",
    icon: <MessageSquareText className="h-10 w-10" aria-hidden="true" />,
  },
  {
    key: "create-collector-account",
    title: "Create collector account",
    to: PATHS.enterprise.adminPanel,
    variant: "orange",
    icon: <UserPlus className="h-10 w-10" aria-hidden="true" />,
  },
];

export const enterpriseQuickActions = [
  { key: "create-rule", label: "Create request rule" },
  { key: "assign-collector", label: "Assign collector" },
  { key: "analytics", label: "View analytics" },
];

