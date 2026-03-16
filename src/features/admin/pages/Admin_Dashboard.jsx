import AdminNavbar from "../components/navigation/AdminNavbar.jsx";
import CD_Footer from "../../../shared/layout/CD_Footer.jsx";
import CD_Header from "../../../shared/layout/CD_Header.jsx";
import RoleLayout from "../../../shared/layout/RoleLayout.jsx";

import SummaryCards from "../components/dashboard/SummaryCards.jsx";
import WasteActivityChart from "../components/dashboard/WasteActivityChart.jsx";
import RoleDistributionChart from "../components/dashboard/RoleDistributionChart.jsx";
import CollectByUnitChart from "../components/dashboard/CollectByUnitChart.jsx";
import ImpactLeaderboard from "../components/dashboard/ImpactLeaderboard.jsx";
import AdminSidebar from "../components/navigation/Admin_Sidebar.jsx";
import { useEffect, useState } from "react";
import { getAdminSystemAnalytics } from "../../../services/admin.service.js";

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        setLoading(true);
        const data = await getAdminSystemAnalytics();
        setAnalytics(data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch system analytics:", err);
        setError("Failed to load dashboard data. Please refresh.");
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  return (
    <RoleLayout
      sidebar={<AdminSidebar />}
      navbar={<AdminNavbar />}
      footer={
        <div className="animate-fade-in-up">
          <CD_Footer />
        </div>
      }
    >
      <div className="max-w-screen-xl mx-auto space-y-8">
        <div className="animate-fade-in-up">
           <CD_Header
             description="Welcome back! Monitor system performance and manage user activities."
             badgeText="System running normally"
             showBadge={true}
           />
        </div>

        {/* SUMMARY CARDS */}
        <div className="animate-fade-in-up">
          <SummaryCards analytics={analytics} loading={loading} />
        </div>

        {/* CHARTS SECTION */}
        <div className="animate-fade-in-up">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            <div className="lg:col-span-3">
              <WasteActivityChart />
            </div>
            <div>
              <RoleDistributionChart 
                analytics={analytics} 
                loading={loading} 
                error={error} 
              />
            </div>
            <div className="lg:col-span-2">
              <CollectByUnitChart />
            </div>
          </div>
        </div>

        {/* IMPACT LEADERBOARD */}
        <div className="animate-fade-in-up">
          <ImpactLeaderboard />
        </div>
      </div>
    </RoleLayout>
  );
}
