import { useState, useMemo, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card } from "../../../shared/ui/Card.jsx";
import { PATHS } from "../../../app/routes/paths.js";
import RoleLayout from "../../../shared/layout/RoleLayout.jsx";
import Sidebar from "../components/navigation/Sidebar.jsx";
import Navbar from "../components/navigation/CD_Navbar.jsx";
import CD_Footer from "../../../shared/layout/CD_Footer.jsx";
import { MessageSquare, ChevronRight, Clock, CheckCircle, AlertCircle, Filter } from "lucide-react";
import { getCitizenFeedbacks } from "../../../services/feedback.service.js";
import useNotify from "../../../shared/hooks/useNotify.js";
import PaginationControls from "../../../shared/ui/PaginationControls.jsx";

export default function MyFeedback() {
  const navigate = useNavigate();
  const notify = useNotify();
  const [filterType, setFilterType] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const normalizeType = (item) => {
    const v = String(item?.type || "").toUpperCase();
    const noReport = item?.reportId == null;
    if (v === "COMPLAINT_SYSTEM" || v === "SYSTEM") return "SYSTEM";
    if (v === "COMPLAINT_REWARD" || v === "REWARD") return "REWARD";
    if (v === "COMPLAINT_COLLECTION" || v === "COLLECTION" || v === "SERVICE") {
      return noReport ? "SYSTEM" : "COLLECTION";
    }
    return v || "UNKNOWN";
  };

  const getDisplayType = (item) => {
    const v = String(item?.type || "").toUpperCase();
    if (v === "COMPLAINT_SYSTEM") return "COMPLAINT_SYSTEM";
    if (v === "COMPLAINT_COLLECTION") return "COMPLAINT_COLLECTION";
    if (v === "COMPLAINT_REWARD") return "COMPLAINT_REWARD";
    if (v === "SERVICE") return "COLLECTION";
    if (v === "SYSTEM") return "SYSTEM";
    if (v === "COLLECTION") return "COLLECTION";
    if (v === "REWARD") return "REWARD";
    return v || "UNKNOWN";
  };

  const getTypeBadgeClass = (item) => {
    const t = getDisplayType(item);
    if (t === "SYSTEM" || t === "COMPLAINT_SYSTEM") return "bg-purple-50 text-purple-700 border-purple-100";
    if (t === "COLLECTION") return "bg-blue-50 text-blue-700 border-blue-100";
    if (t === "COMPLAINT_COLLECTION") return "bg-cyan-50 text-cyan-700 border-cyan-100";
    if (t === "REWARD" || t === "COMPLAINT_REWARD") return "bg-orange-50 text-orange-700 border-orange-100";
    return "bg-gray-50 text-gray-700 border-gray-200";
  };

  const fetchFeedbacks = useCallback(async () => {
    setLoading(true);
    try {
        const data = await getCitizenFeedbacks();
        setFeedbacks(Array.isArray(data) ? data : data.items || []);
    } catch {
        notify.error("Failed to load feedbacks");
    } finally {
        setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    fetchFeedbacks();
  }, [fetchFeedbacks]);

  const filteredFeedback = useMemo(() => {
    return feedbacks.filter(item => {
      const normType = normalizeType(item);
      const typeMatch = filterType === "All" || normType === filterType;
      const statusMatch = filterStatus === "All" || item.status === filterStatus;
      return typeMatch && statusMatch;
    });
  }, [filterType, filterStatus, feedbacks]);

  const totalPages = useMemo(() => Math.ceil(filteredFeedback.length / itemsPerPage), [filteredFeedback.length, itemsPerPage]);
  const safePage = useMemo(() => {
    if (!totalPages) return 1;
    return Math.min(Math.max(currentPage, 1), totalPages);
  }, [currentPage, totalPages]);
  const handlePageChange = (page) => {
    if (!totalPages) return;
    const next = Math.min(Math.max(page, 1), totalPages);
    setCurrentPage(next);
  };
  const paginatedFeedback = useMemo(() => {
    if (!filteredFeedback.length) return [];
    const start = (safePage - 1) * itemsPerPage;
    return filteredFeedback.slice(start, start + itemsPerPage);
  }, [filteredFeedback, safePage, itemsPerPage]);
  useEffect(() => {
    setCurrentPage(1);
  }, [filterType, filterStatus]);

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "RESOLVED": return "bg-green-100 text-green-700 border-green-200";
      case "REJECTED": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "PENDING": return <Clock className="w-4 h-4" />;
      case "RESOLVED": return <CheckCircle className="w-4 h-4" />;
      case "REJECTED": return <AlertCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <RoleLayout
      sidebar={<Sidebar />}
      navbar={<Navbar />}
      footer={
        <div className="animate-fade-in-up" style={{ animationDelay: "240ms" }}>
          <CD_Footer />
        </div>
      }
      showBackgroundEffects
    >
      <div className="animate-fade-in-up max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
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
                  <option value="SYSTEM">System</option>
                  <option value="COLLECTION">Collection</option>
                  <option value="REWARD">Reward</option>
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
                  <option value="PENDING">Pending</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
            </div>
          </div>
        </Card>

        {/* Feedback List */}
        <div className="space-y-4">
          {loading ? (
             <div className="text-center py-16">Loading...</div>
          ) : filteredFeedback.length > 0 ? (
            paginatedFeedback.map((item) => (
              <div 
                key={item.id}
                onClick={() => navigate(PATHS.citizen.feedbackDetail.replace(':feedbackId', item.id))}
                className="group bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all cursor-pointer relative overflow-hidden"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gray-200 group-hover:bg-emerald-500 transition-colors"></div>
                
                <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center pl-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className={`px-2.5 py-0.5 text-xs font-bold uppercase rounded-md border ${getTypeBadgeClass(item)}`}>
                        {getDisplayType(item)}
                      </span>
                      <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                        {new Date(item.date || item.createdAt).toLocaleDateString()} • {new Date(item.date || item.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">
                      {item.subject || item.title || `Complaint #${item.id}`}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-1">
                      {item.content || item.description || "-"}
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

        <div className="flex items-center justify-center">
          <PaginationControls currentPage={safePage} totalPages={totalPages} onPageChange={handlePageChange} />
        </div>

      </div>
    </RoleLayout>
  );
}
