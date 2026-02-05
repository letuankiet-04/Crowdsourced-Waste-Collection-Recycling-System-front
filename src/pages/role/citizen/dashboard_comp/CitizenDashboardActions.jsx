import { Gift, MessageSquareText, Plus } from "lucide-react";
import { PATHS } from "../../../../routes/paths.js";
import ActionCard from "../../../../components/ui/ActionCard.jsx";

export const citizenDashboardActions = [
  <ActionCard
    key="new-report"
    to={PATHS.citizen.createReport}
    title="New report"
    variant="green"
    icon={<Plus className="h-10 w-10" aria-hidden="true" />}
  />,
  <ActionCard
    key="my-reward"
    to={PATHS.citizen.rewards}
    title="My reward"
    variant="blue"
    icon={<Gift className="h-10 w-10" aria-hidden="true" />}
  />,
  <ActionCard
    key="feedback"
    to={PATHS.citizen.feedback}
    title="Feedback"
    variant="orange"
    icon={<MessageSquareText className="h-10 w-10" aria-hidden="true" />}
  />,
];
