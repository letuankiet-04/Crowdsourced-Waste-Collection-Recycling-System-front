import Sidebar from "./Sidebar";
import ActionCards from "./dashboard_comp/ActionCards";
import Header from "./dashboard_comp/CD_Header";
import Navbar from "./CD_Navbar";
import RecentReports from "./dashboard_comp/RecentReports";
import PointWallet from "./dashboard_comp/PointWallet";
import TopRank from "./dashboard_comp/TopRank";
import QuickTips from "./dashboard_comp/QuickTips";
import CD_Footer from "./CD_Footer";
import RoleLayout from "../../../components/layout/RoleLayout.jsx";

export default function CitizenDashboard() {
  return (
    <RoleLayout
      sidebar={<Sidebar />}
      navbar={<Navbar />}
      showBackgroundEffects
      footer={
        <div className="animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <br />
          <CD_Footer />
        </div>
      }
    >
      <div className="animate-fade-in-up">
        <Header />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        <div className="lg:col-span-2 space-y-8">
          <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <ActionCards />
          </div>
          <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <RecentReports />
          </div>
        </div>

        <div className="space-y-8">
          <div className="animate-fade-in-up" style={{ animationDelay: '150ms' }}>
            <PointWallet />
          </div>
          <div className="animate-fade-in-up" style={{ animationDelay: '250ms' }}>
            <TopRank />
          </div>
          <div className="animate-fade-in-up" style={{ animationDelay: '350ms' }}>
            <QuickTips />
          </div>
        </div>
      </div>
    </RoleLayout>
  );
}
