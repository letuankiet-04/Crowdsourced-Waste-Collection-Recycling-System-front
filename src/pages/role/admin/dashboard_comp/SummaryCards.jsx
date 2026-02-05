import { Users, AlertCircle, Trash2 } from "lucide-react";
import { cn } from "../../../../lib/cn.js";

function StatCard({ title, icon, color, className }) {
  const colors = {
    blue: "bg-blue-50 text-blue-700 border-blue-100",
    orange: "bg-orange-50 text-orange-700 border-orange-100",
    green: "bg-green-50 text-green-700 border-green-100",
  };
  
  const iconColors = {
    blue: "bg-blue-100 text-blue-600",
    orange: "bg-orange-100 text-orange-600",
    green: "bg-green-100 text-green-600",
  };

  return (
    <div className={cn("rounded-2xl border p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1", colors[color], className)}>
      <div className="flex items-start justify-between mb-4">
        <div className={cn("p-3 rounded-xl shadow-sm", iconColors[color])}>
            {icon}
        </div>
        <span className="text-xs font-bold uppercase tracking-wider opacity-60 bg-white/50 px-2 py-1 rounded-lg">Wait API</span>
      </div>
      <div>
        <h3 className="text-sm font-bold opacity-80 uppercase tracking-wide mb-1">{title}</h3>
        <div className="flex items-baseline gap-2">
           <p className="text-3xl font-extrabold">Wait API</p>
        </div>
      </div>
    </div>
  );
}

export default function SummaryCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatCard 
        title="Total Active Users" 
        icon={<Users className="w-6 h-6" />} 
        color="blue" 
      />
      <StatCard 
        title="Pending Reports" 
        icon={<AlertCircle className="w-6 h-6" />} 
        color="orange" 
      />
      <StatCard 
        title="Monthly Waste Collected" 
        icon={<Trash2 className="w-6 h-6" />} 
        color="green" 
      />
    </div>
  );
}
