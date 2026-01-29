import Sidebar from "./Sidebar";
import Navbar from "./CD_Navbar";
import CD_Footer from "./CD_Footer";
import CreateReportForm from "./create_report/CreateReportForm.jsx";

function Header() {
  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl p-8 shadow-sm border border-white/50 mb-8">
      <h1 className="text-4xl font-bold text-gray-900">Create New Report</h1>
      <p className="text-gray-600 text-lg mt-2">
        Help improve recycling by submitting accurate information
      </p>
    </div>
  );
}

export default function CreateReport() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex relative overflow-hidden">
      <Sidebar />
      <div className="flex-1 ml-72 relative z-10">
        <Navbar />
        <main className="max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-12 py-10">
          <div className="animate-fade-in-up">
            <Header />
          </div>
          <div className="animate-fade-in-up" style={{ animationDelay: "120ms" }}>
            <CreateReportForm />
          </div>
          <div className="animate-fade-in-up" style={{ animationDelay: "240ms" }}>
            <CD_Footer />
          </div>
        </main>
      </div>
    </div>
  );
}
