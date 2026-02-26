import { Users, AlertCircle, Trash2 } from "lucide-react";
import StatCard from "./StatCard.jsx";

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
