import Navbar from "../citizen/CD_Navbar";
import CD_Footer from "../citizen/CD_Footer.jsx";
import RoleLayout from "../../../components/layout/RoleLayout.jsx";
import WaitApiPlaceholder from "../../../components/ui/WaitApiPlaceholder.jsx";

import { Card, CardBody, CardHeader, CardTitle } from "../../../components/ui/Card.jsx";

import SummaryCards from "./dashboard_comp/SummaryCards.jsx";
import ImpactLeaderboard from "./dashboard_comp/ImpactLeaderboard.jsx";
import AdminSidebar from "./dashboard_comp/Admin_Sidebar.jsx";

export default function AdminDashboard() {
  return (
    <RoleLayout
      sidebar={<AdminSidebar />}
      navbar={<Navbar brandTitle="Admin Portal" />}
      footer={
        <div className="animate-fade-in-up">
          <CD_Footer />
        </div>
      }
    >
      <div className="max-w-screen-xl mx-auto space-y-8">

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
                <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-700">
                  STABLE
                </span>
              </CardHeader>
              <CardBody className="p-8">
                <WaitApiPlaceholder/>
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
                <WaitApiPlaceholder />
              </CardBody>
            </Card>

          </div>
        </div>

      </div>
    </RoleLayout>
  );
}
