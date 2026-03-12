import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardBody, CardHeader, CardTitle } from "../../../../shared/ui/Card.jsx";
import { useEffect, useState, useMemo } from "react";
import { getAdminAccounts } from "../../../../services/admin.service.js";

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#ef4444"];

export default function RoleDistributionChart() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchAccounts() {
      try {
        setLoading(true);
        const data = await getAdminAccounts();
        setAccounts(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch accounts for distribution:", err);
        setError("Unable to load distribution data.");
      } finally {
        setLoading(false);
      }
    }
    fetchAccounts();
  }, []);

  const distributionData = useMemo(() => {
    if (!accounts.length) return [];

    const counts = accounts.reduce((acc, user) => {
      const role = user.roleCode || "UNKNOWN";
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    }, {});

    // Map role codes to readable names
    const roleMap = {
      CITIZEN: "Citizens",
      COLLECTOR: "Collectors",
      ENTERPRISE: "Enterprises",
      ADMIN: "Admins",
    };

    return Object.entries(counts).map(([role, value]) => ({
      name: roleMap[role] || role,
      value: value,
    })).sort((a, b) => b.value - a.value);
  }, [accounts]);

  const total = useMemo(() => 
    distributionData.reduce((acc, curr) => acc + curr.value, 0), 
  [distributionData]);

  if (error) {
    return (
      <Card className="h-full">
        <CardBody className="p-8 flex items-center justify-center text-red-500">
          {error}
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="py-6 px-8 border-b border-gray-100">
        <div>
          <CardTitle className="text-xl mb-1">User Distribution</CardTitle>
          <p className="text-sm text-gray-500">Real-time account role distribution</p>
        </div>
      </CardHeader>
      <CardBody className="p-8 flex flex-col items-center justify-center">
        {loading ? (
          <div className="h-64 w-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
          </div>
        ) : distributionData.length === 0 ? (
          <div className="h-64 w-full flex items-center justify-center text-gray-400 italic">
            No account data available
          </div>
        ) : (
          <>
            <div className="h-64 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    animationDuration={1500}
                  >
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ fontSize: '12px', fontWeight: 600 }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Center Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-bold text-gray-900">{total}</span>
                <span className="text-xs text-gray-500 uppercase font-semibold">Accounts</span>
              </div>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-x-8 gap-y-4 mt-8 w-full">
              {distributionData.map((item, index) => (
                <div key={item.name} className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-md shrink-0" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{item.name}</span>
                    <span className="text-base font-bold text-gray-900">
                      {item.value} <span className="text-xs text-gray-400 font-normal">({((item.value / total) * 100).toFixed(0)}%)</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardBody>
    </Card>
  );
}
