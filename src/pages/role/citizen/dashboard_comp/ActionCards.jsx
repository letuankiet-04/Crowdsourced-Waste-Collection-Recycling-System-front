import ActionCardGrid from "../../../../components/ui/ActionCardGrid";
import { citizenDashboardActions } from "./CitizenDashboardActions";

export default function ActionCards() {
  return (
    <ActionCardGrid items={citizenDashboardActions} />
  );
}
