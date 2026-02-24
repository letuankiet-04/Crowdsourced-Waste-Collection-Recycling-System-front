import ActionCardGrid from "../../../../shared/ui/ActionCardGrid.jsx";
import { citizenDashboardActions } from "./CitizenDashboardActions";

export default function ActionCards() {
  return (
    <ActionCardGrid items={citizenDashboardActions} />
  );
}
