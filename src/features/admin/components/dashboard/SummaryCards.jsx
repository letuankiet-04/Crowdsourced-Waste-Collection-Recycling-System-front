import { Users, AlertCircle, Trash2 } from "lucide-react";
import StatCard from "./StatCard.jsx";

function toNumber(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (value == null) return 0;
  const cleaned = String(value).replace(/,/g, "");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

export default function SummaryCards({ totalActiveUsers, pendingFeedbackCount, monthlyWasteKg, loading }) {
  const stats = [
    {
      title: "Total Active Users",
      value: toNumber(totalActiveUsers).toLocaleString(),
      icon: <Users className="w-6 h-6" />,
      color: "blue",
    },
    {
      title: "Pending Feedback",
      value: toNumber(pendingFeedbackCount).toLocaleString(),
      icon: <AlertCircle className="w-6 h-6" />,
      color: "orange",
    },
    {
      title: "Monthly Waste Collected",
      value: `${toNumber(monthlyWasteKg).toLocaleString()} kg`,
      icon: <Trash2 className="w-6 h-6" />,
      color: "green",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat, idx) => (
        <StatCard
          key={idx}
          title={stat.title}
          value={loading ? "Wait API" : stat.value}
          icon={stat.icon}
          color={stat.color}
        />
      ))}
    </div>
  );
}
