import AdminNavbar from "./dashboard_comp/AdminNavbar.jsx";
import CD_Footer from "../../../components/layout/CD_Footer.jsx";
import CD_Header from "../../../components/layout/CD_Header.jsx";
import RoleLayout from "../../../components/layout/RoleLayout.jsx";

import { Card, CardBody, CardHeader, CardTitle } from "../../../components/ui/Card.jsx";

import SummaryCards from "./dashboard_comp/SummaryCards.jsx";
import ImpactLeaderboard from "./dashboard_comp/ImpactLeaderboard.jsx";
import AdminSidebar from "./dashboard_comp/Admin_Sidebar.jsx";
import { Server, Database, Globe } from "lucide-react";

export default function AdminDashboard() {
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
          <SummaryCards />
        </div>

        {/* IMPACT LEADERBOARD */}
        <div className="animate-fade-in-up">
          <ImpactLeaderboard />
        </div>

        {/* SYSTEM + STATS */}
        <div className="animate-fade-in-up">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

            {/* SYSTEM HEALTH */}
            <Card>
              <CardHeader className="py-6 px-8 flex items-center justify-between">
                <CardTitle className="text-2xl">
                  System Health Status
                </CardTitle>
                <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-700 font-bold uppercase tracking-wider">
                  STABLE
                </span>
              </CardHeader>
              <CardBody className="p-8">
                <div className="space-y-6">
                  {[
                    { label: "API Response Time", icon: <Globe className="w-5 h-5 text-blue-500" />, color: "bg-blue-500" },
                    { label: "Database Load", icon: <Database className="w-5 h-5 text-purple-500" />, color: "bg-purple-500" },
                    { label: "Server CPU", icon: <Server className="w-5 h-5 text-orange-500" />, color: "bg-orange-500" },
                  ].map((item, idx) => (
                     <div key={idx}>
                        <div className="flex justify-between items-center mb-2">
                           <div className="flex items-center gap-2">
                              {item.icon}
                              <span className="text-sm font-medium text-gray-700">{item.label}</span>
                           </div>
                           <span className="text-xs font-bold text-gray-400 uppercase">Wait API</span>
                        </div>
                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                           <div className={`h-full ${item.color} w-1/2 opacity-30 animate-pulse rounded-full`}></div>
                        </div>
                     </div>
                  ))}
                </div>
              </CardBody>
            </Card>

            {/* QUICK STATS */}
            <Card>
              <CardHeader className="py-6 px-8">
                <CardTitle className="text-2xl">
                  Quick Statistics
                </CardTitle>
              </CardHeader>
              <CardBody className="p-8">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    "New Tickets", "Resolved Issues", "Active Regions", "Feedback Score"
                  ].map((stat, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex flex-col items-center justify-center text-center transition-all hover:bg-white hover:shadow-md hover:border-transparent">
                       <span className="text-2xl font-bold text-gray-900 mb-1">Wait API</span>
                       <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{stat}</span>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>

          </div>
        </div>

      </div>
    </RoleLayout>
  );
}
