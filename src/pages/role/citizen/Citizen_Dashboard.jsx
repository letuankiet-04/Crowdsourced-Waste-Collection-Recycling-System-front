import Sidebar from "./Sidebar";
import ActionCards from "./dashboard_comp/ActionCards";
import Header from "./dashboard_comp/CD_Header";
import Navbar from "./CD_Navbar";
import RecentReports from "./dashboard_comp/RecentReports";
import PointWallet from "./dashboard_comp/PointWallet";
import TopRank from "./dashboard_comp/TopRank";
import QuickTips from "./dashboard_comp/QuickTips";
import CD_Footer from "./CD_Footer";

export default function CitizenDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern opacity-[0.4]"></div>
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-green-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-emerald-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-lime-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <Sidebar />
      
      <div className="flex-1 ml-72 relative z-10">
        <Navbar />
        
        <main className="max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-12 py-10">
          <div className="animate-fade-in-up">
            <Header />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
            {/* LEFT COLUMN - 2/3 width */}
            <div className="lg:col-span-2 space-y-8">
              <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                <ActionCards />
              </div>
              <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                <RecentReports />
              </div>
            </div>

            {/* RIGHT COLUMN - 1/3 width */}
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
          <div className="animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            <br></br>
            <CD_Footer/>
          </div>
        </main>
      </div>
    </div>
  );
}
