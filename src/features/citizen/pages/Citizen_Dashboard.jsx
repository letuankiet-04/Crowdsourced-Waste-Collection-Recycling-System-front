import Sidebar from "../components/navigation/Sidebar";
import ActionCards from "../components/dashboard/ActionCards";
import Header from "../../../shared/layout/CD_Header.jsx";
import Navbar from "../components/navigation/CD_Navbar";
import RecentReports from "../components/dashboard/RecentReports";
import PointWallet from "../components/dashboard/PointWallet";
import TopRank from "../components/dashboard/TopRank";
import QuickTips from "../components/dashboard/QuickTips";
import CD_Footer from "../../../shared/layout/CD_Footer.jsx";
import RoleLayout from "../../../shared/layout/RoleLayout.jsx";
import banner02 from "../../../assets/banner02.png";

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
      <section className="animate-fade-in-up mb-10 -mx-6 sm:-mx-8 lg:-mx-12">
        <img src={banner02} alt="Welcome banner" className="w-full h-auto block" />
      </section>

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
