import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card } from "../../../shared/ui/Card.jsx";
import { PATHS } from "../../../app/routes/paths.js";
import RoleLayout from "../../../shared/layout/RoleLayout.jsx";
import Sidebar from "./Sidebar.jsx";
import Navbar from "./CD_Navbar.jsx";
import CD_Footer from "../../../shared/layout/CD_Footer.jsx";
import { MessageSquare, ChevronRight, Clock, CheckCircle, AlertCircle, Filter } from "lucide-react";

// Mock data for feedback history
const MOCK_FEEDBACK = [
  {
    id: "FDB-X7K9P2",
    subject: "Bin overflow on 5th Avenue",
    type: "Service",
    date: "2023-10-24T10:30:00",
    status: "NEW",
    content: "The bin has been overflowing for 2 days. Please collect it soon.",
  },
  {
    id: "FDB-M2J5L8",
    subject: "App crashing on login",
    type: "System",
    date: "2023-10-22T09:00:00",
    status: "RESOLVED",
    content: "I cannot log in to my account using Google Auth.",
  },
  {
    id: "FDB-R4H1N6",
    subject: "Late pickup complaint",
    type: "Service",
    date: "2023-10-20T11:20:00",
    status: "IN PROGRESS",
    content: "My trash was not picked up last Tuesday as scheduled.",
  },
  {
    id: "FDB-T9Q3V4",
    subject: "Feature request: Dark mode",
    type: "System",
    date: "2023-10-19T13:10:00",
    status: "IN PROGRESS",
    content: "It would be great to have a dark mode for better night viewing.",
  },
  {
    id: "FDB-A1B2C3",
    subject: "Missed recycling pickup",
    type: "Service",
    date: "2023-10-17T09:30:00",
    status: "RESOLVED",
    content: "Recycling bin was skipped today even though it was out by 6am.",
  }
];

export default function MyFeedback() {
  const navigate = useNavigate();
  const [filterType, setFilterType] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  const filteredFeedback = useMemo(() => {
    return MOCK_FEEDBACK.filter(item => {
      const typeMatch = filterType === "All" || item.type === filterType;
      const statusMatch = filterStatus === "All" || item.status === filterStatus;
      return typeMatch && statusMatch;
    });
  }, [filterType, filterStatus]);

  const getStatusColor = (status) => {
    switch (status) {
      case "NEW": return "bg-blue-100 text-blue-700 border-blue-200";
      case "IN PROGRESS": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "RESOLVED": return "bg-green-100 text-green-700 border-green-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "NEW": return <AlertCircle className="w-4 h-4" />;
      case "IN PROGRESS": return <Clock className="w-4 h-4" />;
      case "RESOLVED": return <CheckCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <RoleLayout
      sidebar={<Sidebar />}
      navbar={<Navbar />}
      footer={<CD_Footer />}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <MessageSquare className="w-8 h-8 text-emerald-600" />
              My Feedback
            </h1>
            <p className="text-gray-500 mt-2">Track the status of your submitted feedback and reports.</p>
          </div>
          <Link 
            to={PATHS.citizen.feedback} 
            className="px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-xl shadow-md hover:bg-emerald-700 transition-all active:scale-95"
          >
            + New Feedback
          </Link>
        </div>

        {/* Filters */}
        <Card className="p-6 bg-white shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="flex items-center gap-2 text-gray-700 font-semibold min-w-max">
              <Filter className="w-5 h-5" />
              Filter By:
            </div>
            
            <div className="flex flex-wrap gap-4 w-full">
              <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Type</label>
                <select 
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-medium text-gray-700 cursor-pointer"
                >
                  <option value="All">All Types</option>
                  <option value="Service">Service</option>
                  <option value="System">System</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Status</label>
                <select 
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-medium text-gray-700 cursor-pointer"
                >
                  <option value="All">All Statuses</option>
                  <option value="NEW">New</option>
                  <option value="IN PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                </select>
              </div>
            </div>
          </div>
        </Card>

        {/* Feedback List */}
        <div className="space-y-4">
          {filteredFeedback.length > 0 ? (
            filteredFeedback.map((item) => (
              <div 
                key={item.id}
                onClick={() => navigate(PATHS.citizen.feedbackDetail.replace(':feedbackId', item.id))}
                className="group bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all cursor-pointer relative overflow-hidden"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gray-200 group-hover:bg-emerald-500 transition-colors"></div>
                
                <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center pl-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className={`px-2.5 py-0.5 text-xs font-bold uppercase rounded-md border ${
                        item.type === 'Service' ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-orange-50 text-orange-700 border-orange-100'
                      }`}>
                        {item.type}
                      </span>
                      <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                        {new Date(item.date).toLocaleDateString()} • {new Date(item.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">
                      {item.subject}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-1">
                      {item.content}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 self-end md:self-center">
                    <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${getStatusColor(item.status)}`}>
                      {getStatusIcon(item.status)}
                      {item.status}
                    </span>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">No feedback found</h3>
              <p className="text-gray-500 mt-1">Try adjusting your filters or create a new feedback.</p>
            </div>
          )}
        </div>

      </div>
    </RoleLayout>
  );
}
