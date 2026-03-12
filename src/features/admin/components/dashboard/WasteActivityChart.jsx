import { useState, useEffect, useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardBody, CardHeader, CardTitle } from "../../../../shared/ui/Card.jsx";
import Button from "../../../../shared/ui/Button.jsx";
import { getAdminCollectedWeightDailyChart } from "../../../../services/admin.service.js";
import WaitApiPlaceholder from "../../../../shared/ui/WaitApiPlaceholder.jsx";

const WEEKDAYS_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function WasteActivityChart() {
  const [view, setView] = useState("week");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dailyData, setDailyData] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;

        const response = await getAdminCollectedWeightDailyChart(year, month);
        
        if (response && response.daily) {
          const formatted = response.daily.map(item => {
            const date = new Date(year, month - 1, item.day);
            return {
              dayNum: item.day,
              weekday: WEEKDAYS_EN[date.getDay()],
              weekdayIndex: date.getDay(), // 0 for Sun, 1 for Mon...
              collected: item.totalWeightKg || 0,
            };
          });
          setDailyData(formatted);
        }
        setError(null);
      } catch (err) {
        console.error("Failed to fetch waste activity data:", err);
        setError("Unable to load chart data. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const chartData = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    if (view === "week") {
      // Find the start of the current week (Monday)
      const currentDay = now.getDay(); // 0 is Sun, 1 is Mon...
      const diffToMonday = currentDay === 0 ? 6 : currentDay - 1;
      
      const monday = new Date(now);
      monday.setDate(now.getDate() - diffToMonday);
      monday.setHours(0, 0, 0, 0);

      const weekDays = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        
        // Find data for this date in dailyData
        const found = dailyData.find(item => item.dayNum === d.getDate() && (currentMonth + 1) === (d.getMonth() + 1));
        
        weekDays.push({
          name: WEEKDAYS_EN[d.getDay()],
          collected: found ? found.collected : 0,
        });
      }
      return weekDays;
    }
    
    // Monthly view: Show all days of the current month
    const lastDay = new Date(currentYear, currentMonth + 1, 0).getDate();
    const allDaysOfMonth = [];
    
    for (let day = 1; day <= lastDay; day++) {
      const found = dailyData.find(item => item.dayNum === day);
      allDaysOfMonth.push({
        name: day.toString(),
        collected: found ? found.collected : 0,
      });
    }
    
    return allDaysOfMonth;
  }, [view, dailyData]);

  const viewLabel = view === "week" ? "the current week" : "this month";

  if (loading) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="py-6 px-8">
          <CardTitle className="text-2xl">Collection Activity</CardTitle>
        </CardHeader>
        <CardBody className="p-8 pt-0">
          <WaitApiPlaceholder height="h-80" />
        </CardBody>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="py-6 px-8">
          <CardTitle className="text-2xl">Collection Activity</CardTitle>
        </CardHeader>
        <CardBody className="p-8 pt-0 flex items-center justify-center h-80 text-red-500 font-medium">
          {error}
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-6 px-8">
        <div>
          <CardTitle className="text-2xl mb-1">Collection Activity</CardTitle>
          <p className="text-sm text-gray-500">
            Waste collected in {viewLabel}
          </p>
        </div>
        <div className="flex items-center gap-1 bg-gray-100/50 p-1 rounded-xl">
          <Button
            size="sm"
            variant={view === "week" ? "primary" : "outline"}
            className={view === "week" 
              ? "rounded-lg shadow-sm" 
              : "border-transparent text-gray-500 hover:bg-white hover:text-emerald-700 bg-transparent"
            }
            onClick={() => setView("week")}
          >
            Week
          </Button>
          <Button
            size="sm"
            variant={view === "month" ? "primary" : "outline"}
            className={view === "month" 
              ? "rounded-lg shadow-sm" 
              : "border-transparent text-gray-500 hover:bg-white hover:text-emerald-700 bg-transparent"
            }
            onClick={() => setView("month")}
          >
            Month
          </Button>
        </div>
      </CardHeader>
      <CardBody className="p-8 pt-0">
        <div className="h-80 w-full mt-6">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 500 }}
                dy={10}
                interval={view === "month" ? 2 : 0} // Show every 3rd label for month view to avoid crowding
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 500 }}
                tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}
                label={{ value: "kg", angle: -90, position: "insideLeft", fill: "#94a3b8", fontSize: 12, fontWeight: 500 }}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #f1f5f9",
                  boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                  padding: "12px"
                }}
                itemStyle={{ padding: "2px 0" }}
                formatter={(value) => [`${value.toLocaleString()} kg`, "Collected"]}
              />
              <Area
                type="monotone"
                dataKey="collected"
                stroke="#3b82f6"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorCollected)"
                name="Collected"
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardBody>
    </Card>
  );
}
