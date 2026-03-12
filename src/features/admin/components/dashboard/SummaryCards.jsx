import { Users, AlertCircle, Trash2 } from "lucide-react";
import StatCard from "./StatCard.jsx";

export default function SummaryCards({ analytics, loading }) {
  const stats = [
    {
      title: "Total Active Users",
      value: analytics?.citizenActivityStats?.totalCitizens ?? 0,
      icon: <Users className="w-6 h-6" />,
      color: "blue",
    },
    {
      title: "Pending Reports",
      value: analytics?.reportStats?.pending ?? 0,
      icon: <AlertCircle className="w-6 h-6" />,
      color: "orange",
    },
    {
      title: "Monthly Waste Collected",
      value: `${analytics?.collectorActivityStats?.totalWasteCollected ?? 0} kg`,
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
