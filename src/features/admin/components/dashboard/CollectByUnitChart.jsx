import { Bar, BarChart, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { useEffect, useState } from "react";
import { TrendingUp } from "lucide-react";
import { Card, CardBody, CardHeader, CardTitle } from "../../../../shared/ui/Card.jsx";
import { getIconForCategory } from "../../../../shared/lib/wasteIcons.js";
import { getAdminCollectedWasteByUnit } from "../../../../services/admin.service.js";

const CustomXAxisTick = ({ x, y, payload }) => {
  let iconCategory = payload.value;
  // Map unit names to categories that have icons
  if (iconCategory === 'KG') iconCategory = 'general'; 
  if (iconCategory === 'CAN') iconCategory = 'can'; 
  if (iconCategory === 'BOTTLE') iconCategory = 'glass'; 
  
  const { Icon, cls } = getIconForCategory(iconCategory);
  
  return (
    <g transform={`translate(${x},${y})`}>
      <foreignObject x={-20} y={10} width={40} height={40}>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-sm ${cls} mx-auto`}>
          <Icon size={20} />
        </div>
      </foreignObject>
      <text x={0} y={60} textAnchor="middle" fill="#374151" className="text-xs font-bold" style={{ fontSize: '12px', fontWeight: 600 }}>
        {payload.value}
      </text>
    </g>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const value = Number(data.value) || 0;
    return (
      <div className="bg-white p-4 rounded-xl shadow-xl border border-gray-100 z-50">
        <p className="font-semibold text-gray-900 mb-2 text-base">{label}</p>
        <div className="flex items-center gap-2">
          <span className="text-3xl font-bold text-gray-900">
            {value.toLocaleString()}
          </span>
          <span className="text-sm text-gray-500 font-medium mt-2">{data.unit}</span>
        </div>
      </div>
    );
  }
  return null;
};

export default function CollectByUnitChart() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [period, setPeriod] = useState('weekly'); 

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const result = await getAdminCollectedWasteByUnit(period);
        
        const chartData = [
          { 
            name: 'KG', 
            value: Number(result.totalWeightKg) || 0, 
            unit: 'KG', 
            color: '#10b981' 
          },
          { 
            name: 'CAN', 
            value: Number(result.totalCans) || 0, 
            unit: 'CANS', 
            color: '#3b82f6' 
          },
          { 
            name: 'BOTTLE', 
            value: Number(result.totalBottles) || 0, 
            unit: 'BOTTLES', 
            color: '#06b6d4' 
          }
        ];

        if (result.otherUnits) {
          Object.entries(result.otherUnits).forEach(([key, value]) => {
             chartData.push({
               name: key,
               value: Number(value) || 0,
               unit: key,
               color: '#f59e0b'
             });
          });
        }
        
        chartData.sort((a, b) => b.value - a.value);

        setData(chartData);
      } catch (error) {
        console.error("Failed to fetch waste by unit:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [period]);

  return (
    <Card className="h-full flex flex-col bg-white border border-gray-100 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between py-6 px-8 border-b border-gray-50">
        <div>
          <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span className="bg-orange-100 p-2 rounded-lg text-orange-600">
              <TrendingUp size={20} />
            </span>
            Statistics on collected waste by unit 
          </CardTitle>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setPeriod('weekly')}
            className={`px-4 py-1.5 text-sm font-bold rounded-md transition-all duration-300 ${
              period === 'weekly' 
                ? 'bg-orange-500 text-white shadow-md transform scale-105' 
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200'
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => setPeriod('monthly')}
            className={`px-4 py-1.5 text-sm font-bold rounded-md transition-all duration-300 ${
              period === 'monthly' 
                ? 'bg-orange-500 text-white shadow-md transform scale-105' 
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200'
            }`}
          >
            Monthly
          </button>
        </div>
      </CardHeader>
      
      <CardBody className="flex-1 p-8 flex flex-col justify-center">
        {loading ? (
          <div className="h-64 w-full flex items-center justify-center">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
          </div>
        ) : data.length === 0 ? (
          <div className="h-64 w-full flex items-center justify-center text-gray-400 italic">
            No data available
          </div>
        ) : (
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                barSize={50} 
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis 
                  dataKey="name" 
                  tick={<CustomXAxisTick />} 
                  interval={0}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                />
                <Tooltip 
                  content={<CustomTooltip />} 
                  cursor={{ fill: '#f9fafb', radius: 8 }} 
                  wrapperStyle={{ outline: 'none' }}
                />
                <Bar 
                  dataKey="value" 
                  radius={[8, 8, 0, 0]}
                  animationDuration={1500}
                  animationEasing="ease-out"
                >
                  {data.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color} 
                      className="transition-opacity duration-300 hover:opacity-80 cursor-pointer"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
