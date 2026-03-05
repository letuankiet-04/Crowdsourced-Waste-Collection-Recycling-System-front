import { cn } from "../../../../shared/lib/cn.js";

export default function StatCard({ title, value, change, icon, color, className }) {
  const colors = {
    green: "bg-green-50 text-green-700 border-green-100",
    blue: "bg-blue-50 text-blue-700 border-blue-100",
    orange: "bg-orange-50 text-orange-700 border-orange-100",
  };
  
  const iconColors = {
    green: "bg-green-100 text-green-600",
    blue: "bg-blue-100 text-blue-600",
    orange: "bg-orange-100 text-orange-600",
  };

  // Determine if value is a "Wait API" placeholder or real data
  const isPlaceholder = value === undefined || value === null || value === "Wait API";

  return (
    <div className={cn("rounded-2xl border p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1", colors[color] || colors.green, className)}>
      <div className="flex items-start justify-between mb-4">
        <div className={cn("p-3 rounded-xl shadow-sm", iconColors[color] || iconColors.green)}>
            {icon}
        </div>
        {/* Optional small status badge if needed */}
      </div>
      <div>
        <h3 className="text-sm font-bold opacity-80 uppercase tracking-wide mb-1">{title}</h3>
        <div className="flex items-baseline gap-2">
           <p className="text-3xl font-extrabold">{isPlaceholder ? "Wait API" : value}</p>
           {change && <span className="text-xs font-bold bg-white/50 px-2 py-1 rounded-lg">{change}</span>}
        </div>
      </div>
    </div>
  );
}
