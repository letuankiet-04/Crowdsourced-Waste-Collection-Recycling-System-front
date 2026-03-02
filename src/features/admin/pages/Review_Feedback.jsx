import { useState, useMemo } from "react";
import { 
  MessageSquare, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Archive,
  Eye,
  MessageCircle
} from "lucide-react";
import AdminNavbar from "./dashboard_comp/AdminNavbar.jsx";
import AdminSidebar from "./dashboard_comp/Admin_Sidebar.jsx";
import CD_Footer from "../../../shared/layout/CD_Footer.jsx";
import RoleLayout from "../../../shared/layout/RoleLayout.jsx";
import { Card, CardHeader, CardTitle } from "../../../shared/ui/Card.jsx";
import StatusPill from "../../../shared/ui/StatusPill.jsx";

// Mock Data
const MOCK_FEEDBACK = [
  {
    id: 1,
    sender: { name: "Sarah Jenkins", role: "Citizen", avatar: "S" },
    subject: "Bin overflow on 5th Avenue",
    date: "2023-10-24T10:30:00",
    status: "NEW",
    content: "The bin has been overflowing for 2 days..."
  },
  {
    id: 2,
    sender: { name: "Green Collect Ltd", role: "Collector", avatar: "G" },
    subject: "Route optimization suggestion",
    date: "2023-10-23T14:15:00",
    status: "IN PROGRESS",
    content: "We noticed that the current route for..."
  },
  {
    id: 3,
    sender: { name: "Mike Ross", role: "Citizen", avatar: "M" },
    subject: "App crashing on login",
    date: "2023-10-22T09:00:00",
    status: "RESOLVED",
    content: "I cannot log in to my account..."
  },
  {
    id: 4,
    sender: { name: "City Waste Dept", role: "Collector", avatar: "C" },
    subject: "New recycling guidelines query",
    date: "2023-10-21T16:45:00",
    status: "NEW",
    content: "Clarification needed on the new plastic types..."
  },
  {
    id: 5,
    sender: { name: "Emma Watson", role: "Citizen", avatar: "E" },
    subject: "Late pickup complaint",
    date: "2023-10-20T11:20:00",
    status: "RESOLVED",
    content: "My trash was not picked up last Tuesday..."
  },
  {
    id: 6,
    sender: { name: "John Doe", role: "Citizen", avatar: "J" },
    subject: "Feature request: Dark mode",
    date: "2023-10-19T13:10:00",
    status: "IN PROGRESS",
    content: "It would be great to have a dark mode..."
  },
  {
    id: 7,
    sender: { name: "Eco Solutions", role: "Enterprise", avatar: "E" },
    subject: "Partnership inquiry",
    date: "2023-10-18T10:00:00",
    status: "NEW",
    content: "We are interested in partnering with you..."
  },
  {
    id: 8,
    sender: { name: "Alice Cooper", role: "Citizen", avatar: "A" },
    subject: "Missed recycling pickup",
    date: "2023-10-17T09:30:00",
    status: "RESOLVED",
    content: "Recycling bin was skipped today..."
  }
];

export default function Review_Feedback() {
  // State
  const [activeTab, setActiveTab] = useState("All Submissions");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [searchQuery, _setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("All Time");
  const [feedback] = useState([]);

  // Filtering Logic
  const filteredFeedback = useMemo(() => {
    let result = feedback;

    // Tab Filter
    if (activeTab === "From Citizens") {
      result = result.filter(item => item.sender.role === "Citizen");
    } else if (activeTab === "From Collectors") {
      result = result.filter(item => item.sender.role === "Collector" || item.sender.role === "Enterprise");
    }

    // Search Filter (optional based on UI, but good to have)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.subject.toLowerCase().includes(query) || 
        item.sender.name.toLowerCase().includes(query)
      );
    }

    // Date Filter
    if (dateFilter !== "All Time") {
      const now = new Date();
      const pastDate = new Date(now);
      
      if (dateFilter === "Last 7 Days") {
        pastDate.setDate(now.getDate() - 7);
      } else if (dateFilter === "Last 30 Days") {
        pastDate.setDate(now.getDate() - 30);
      }
      
      // Set to beginning of the day to ensure we include all items from that day onwards
      pastDate.setHours(0, 0, 0, 0);

      result = result.filter(item => {
         if (!item.date) return false;
         const feedbackDate = new Date(item.date);
         return feedbackDate >= pastDate;
      });
    }

    return result;
  }, [activeTab, searchQuery, dateFilter, feedback]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredFeedback.length / itemsPerPage);
  const paginatedFeedback = filteredFeedback.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Helper for Status Badge
  const getStatusBadge = (status) => {
    switch (status) {
      case "NEW":
        return <StatusPill variant="green">NEW</StatusPill>;
      case "IN PROGRESS":
        return <StatusPill variant="yellow">IN PROGRESS</StatusPill>;
      case "RESOLVED":
        return <StatusPill variant="blue">RESOLVED</StatusPill>;
      default:
        return <StatusPill variant="gray">{status}</StatusPill>;
    }
  };

  // Helper for Date Formatting
  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

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
      <div className="max-w-screen-xl mx-auto space-y-8 p-4">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-fade-in-up">
          <div>
            <div className="text-sm text-gray-500 font-medium mb-1">Admin / Review Feedback</div>
            <h1 className="text-3xl font-bold text-gray-900">Review Feedback</h1>
            <p className="text-gray-500 mt-1">Manage and respond to user feedback submissions.</p>
          </div>
        </div>

        {/* Main Content Card */}
        <Card className="animate-fade-in-up border-none shadow-lg bg-white rounded-2xl overflow-hidden">
          <CardHeader className="py-6 px-8 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white">
            
            {/* Filter Tabs */}
            <div className="flex p-1 bg-gray-100 rounded-xl">
              {["All Submissions", "From Citizens", "From Collectors"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
                  className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                    activeTab === tab 
                      ? "bg-white text-gray-900 shadow-sm" 
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Filter Controls */}
            <div className="flex gap-3">
              <div className="relative">
                 <select 
                   value={dateFilter}
                   onChange={(e) => { setDateFilter(e.target.value); setCurrentPage(1); }}
                   className="appearance-none pl-10 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 cursor-pointer hover:border-gray-300 focus:ring-2 focus:ring-green-500 outline-none transition-all"
                 >
                    <option>All Time</option>
                    <option>Last 7 Days</option>
                    <option>Last 30 Days</option>
                 </select>
                 <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
              <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                <Filter className="w-4 h-4" />
                More Filters
              </button>
            </div>
          </CardHeader>

          {/* Table Section */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider font-semibold border-b border-gray-100">
                  <th className="px-8 py-4">Sender</th>
                  <th className="px-6 py-4">Subject</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginatedFeedback.length > 0 ? (
                  paginatedFeedback.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/80 transition-colors group">
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-600 font-bold shadow-sm border border-gray-100">
                            {item.sender.avatar}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900">{item.sender.name}</div>
                            <div className="text-xs text-gray-500 font-medium px-2 py-0.5 bg-gray-100 rounded-full inline-block mt-0.5">
                              {item.sender.role}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-900">{item.subject}</div>
                        <div className="text-xs text-gray-500 truncate max-w-[200px]">{item.content}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          {formatDate(item.date)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(item.status)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {item.status === "RESOLVED" ? (
                           <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                             <Archive className="w-3.5 h-3.5" />
                             View Archive
                           </button>
                        ) : (
                           <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg transition-all shadow-sm hover:shadow">
                             <MessageCircle className="w-3.5 h-3.5" />
                             View & Respond
                           </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-8 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center">
                          <Search className="w-6 h-6 text-gray-300" />
                        </div>
                        <p className="font-medium">No feedback found matching your filters.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-8 py-5 border-t border-gray-100 bg-gray-50/30 flex items-center justify-between">
             <div className="text-sm text-gray-500 font-medium">
                Showing <span className="text-gray-900 font-bold">{Math.min(filteredFeedback.length, (currentPage - 1) * itemsPerPage + 1)}-{Math.min(filteredFeedback.length, currentPage * itemsPerPage)}</span> of <span className="text-gray-900 font-bold">{filteredFeedback.length}</span> submissions
             </div>
             <div className="flex items-center gap-2">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 border border-gray-200 rounded-lg hover:bg-white hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-600" />
                </button>
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 rounded-lg text-sm font-bold flex items-center justify-center transition-all ${
                        currentPage === page 
                          ? "bg-green-500 text-white shadow-md shadow-green-200" 
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="p-2 border border-gray-200 rounded-lg hover:bg-white hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                </button>
             </div>
          </div>
        </Card>
      </div>
    </RoleLayout>
  );
}
