import { useParams, useNavigate } from "react-router-dom";
import RoleLayout from "../../../shared/layout/RoleLayout.jsx";
import Sidebar from "../components/navigation/Sidebar.jsx";
import Navbar from "../components/navigation/CD_Navbar.jsx";
import CD_Footer from "../../../shared/layout/CD_Footer.jsx";
import { Card } from "../../../shared/ui/Card.jsx";
import { ChevronLeft, Calendar, Clock, User, CheckCircle, AlertCircle, MapPin, Image as ImageIcon, FileText } from "lucide-react";
import { getCitizenFeedbackById } from "../../../services/feedback.service.js";
import { getMyReportById } from "../../../services/reports.service.js";
import useNotify from "../../../shared/hooks/useNotify.js";
import { useEffect, useState } from "react";

export default function FeedbackDetails() {
  const { feedbackId } = useParams();
  const navigate = useNavigate();
  const notify = useNotify();
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [linkedReport, setLinkedReport] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);

  const normalizeType = (itemOrType) => {
    const t = typeof itemOrType === "string" ? itemOrType : itemOrType?.type;
    const v = String(t || "").toUpperCase();
    const noReport = typeof itemOrType === "object" ? itemOrType?.reportId == null : false;
    if (v === "COMPLAINT_SYSTEM" || v === "SYSTEM") return "SYSTEM";
    if (v === "COMPLAINT_REWARD" || v === "REWARD") return "REWARD";
    if (v === "COMPLAINT_COLLECTION" || v === "COLLECTION" || v === "SERVICE") {
      return noReport ? "SYSTEM" : "COLLECTION";
    }
    return v || "UNKNOWN";
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!feedbackId) return;
      setLoading(true);
      try {
        const data = await getCitizenFeedbackById(feedbackId);
        if (!cancelled) setFeedback(data);
      } catch (err) {
        if (!cancelled) notify.error("Failed to load feedback");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();

    const onFocus = () => {
      // Re-fetch to ensure latest resolution/status is shown
      load();
    };
    const onVisibility = () => {
      if (!document.hidden) load();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelled = true;
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [feedbackId]);

  useEffect(() => {
    const isReward = String(feedback?.type || "").toUpperCase().includes("REWARD");
    if (feedback && isReward && feedback.reportId) {
      setLoadingReport(true);
      getMyReportById(feedback.reportId)
        .then(data => setLinkedReport(data))
        .catch(() => {
          notify.error("Không tải được chi tiết báo cáo liên kết");
        })
        .finally(() => setLoadingReport(false));
    } else {
      setLinkedReport(null);
    }
  }, [feedback]);

  if (loading) {
    return (
      <RoleLayout sidebar={<Sidebar />} navbar={<Navbar />} footer={<CD_Footer />}>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <p className="text-gray-500">Loading feedback details...</p>
        </div>
      </RoleLayout>
    );
  }

  if (!feedback) {
    return (
      <RoleLayout sidebar={<Sidebar />} navbar={<Navbar />} footer={<CD_Footer />}>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Feedback Not Found</h2>
          <p className="text-gray-500 mb-6">The feedback ID you requested does not exist or you don't have permission to view it.</p>
          <button 
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </RoleLayout>
    );
  }

  const getStatusBadge = (status) => {
    const styles = {
      "PENDING": "bg-yellow-100 text-yellow-700 border-yellow-200",
      "RESOLVED": "bg-green-100 text-green-700 border-green-200",
      "REJECTED": "bg-red-100 text-red-700 border-red-200"
    };
    
    const icons = {
      "PENDING": <Clock className="w-4 h-4" />,
      "RESOLVED": <CheckCircle className="w-4 h-4" />,
      "REJECTED": <AlertCircle className="w-4 h-4" />
    };

    return (
      <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${styles[status] || "bg-gray-100 text-gray-700"}`}>
        {icons[status]}
        {status}
      </span>
    );
  };

  return (
    <RoleLayout sidebar={<Sidebar />} navbar={<Navbar />} footer={<CD_Footer />}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-emerald-600 transition-colors font-medium text-sm group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Feedback
        </button>

        {/* Main Content */}
        <div className="grid gap-6">
          {/* Header Card */}
          <Card className="p-8 bg-white border border-gray-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-400 to-emerald-600"></div>
            
            <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">{feedback.subject || feedback.title || `Complaint #${feedback.id}`}</h1>
                  {getStatusBadge(feedback.status)}
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-gray-300"></span>
                    ID: <span className="font-mono font-medium text-gray-700">{feedback.id}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    {new Date(feedback.date || feedback.createdAt).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    {new Date(feedback.date || feedback.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
              </div>
              
              <div className="flex flex-col items-end justify-center">
                <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-lg border ${
                  normalizeType(feedback) === 'SYSTEM' ? 'bg-purple-50 text-purple-700 border-purple-100'
                  : normalizeType(feedback) === 'COLLECTION' ? 'bg-blue-50 text-blue-700 border-blue-100'
                  : 'bg-orange-50 text-orange-700 border-orange-100'
                }`}>
                  {normalizeType(feedback)}
                </span>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Description</h3>
              <p className="text-gray-700 leading-relaxed text-lg">
                {feedback.content || feedback.description}
              </p>
            </div>
          </Card>

          {String(feedback.type || "").toUpperCase().includes("REWARD") && feedback.reportId && (
            <Card className="p-8 bg-white border border-gray-200 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-emerald-600"></div>
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Linked Report</h3>
                    <div className="mt-1 text-sm text-gray-700">
                      <span className="text-gray-500">Report Code: </span>
                      <span className="font-mono font-semibold text-gray-900">{linkedReport?.reportCode || `#${linkedReport?.id}`}</span>
                    </div>
                  </div>
                </div>
                <span className="px-2.5 py-1 text-xs font-bold rounded-lg border border-gray-200 text-gray-700">
                  {linkedReport?.status}
                </span>
              </div>
              {loadingReport ? (
                <div className="text-gray-500">Loading linked report...</div>
              ) : linkedReport ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-4">
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        {new Date(linkedReport.createdAt).toLocaleDateString()} • {new Date(linkedReport.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" />
                        {linkedReport.address || 'Unknown'}
                      </span>
                    </div>
                    <div className="text-gray-700">
                      <span className="font-medium">Waste type:</span> {linkedReport.wasteType || 'RECYCLABLE'}
                    </div>
                    {Array.isArray(linkedReport.categories) && linkedReport.categories.length > 0 && (
                      <div>
                        <div className="text-gray-700 font-medium mb-2">Items List</div>
                        <ul className="grid sm:grid-cols-2 gap-2">
                          {linkedReport.categories.slice(0, 6).map((c, idx) => (
                            <li key={idx} className="text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                              <span className="font-semibold text-gray-900">{c.name}</span>
                              {c.quantity != null && <span className="text-gray-500"> — {String(c.quantity)}{c.unit ? ` ${c.unit}` : ''}</span>}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2 text-gray-700">
                      <ImageIcon className="w-4 h-4" />
                      <span className="font-medium">Photos</span>
                    </div>
                    {Array.isArray(linkedReport.images) && linkedReport.images.length > 0 ? (
                      <div className="grid grid-cols-2 gap-3">
                        {linkedReport.images.slice(0, 4).map((url, idx) => (
                          <a key={idx} href={url} target="_blank" rel="noreferrer" className="block">
                            <img
                              src={url}
                              alt={`Report photo ${idx + 1}`}
                              className="w-full h-28 object-cover rounded-xl border border-gray-200 hover:opacity-90"
                              loading="lazy"
                            />
                          </a>
                        ))}
                      </div>
                    ) : (
                      <div className="h-28 rounded-xl border border-dashed border-gray-300 flex items-center justify-center text-sm text-gray-400">
                        No photos
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-gray-500">No linked report found.</div>
              )}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => linkedReport && navigate(`/citizen/reports/${linkedReport.id}`)}
                  disabled={!linkedReport}
                  className="px-4 py-2 text-sm rounded-lg border border-emerald-200 text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
                >
                  View Report
                </button>
              </div>
            </Card>
          )}

          {/* Admin/Enterprise Response Section */}
          {feedback.resolution ? (
            <Card className="p-8 bg-white border border-gray-200 shadow-sm">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                  <User className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-gray-900">
                      {['REWARD','COLLECTION'].includes(normalizeType(feedback)) ? 'Enterprise Response' : 'Admin Response'}
                    </h3>
                    {(function() {
                      const ts = feedback.updatedAt || feedback.date || feedback.createdAt;
                      const dt = ts ? new Date(ts) : null;
                      if (!dt || isNaN(dt.getTime())) return null;
                      const datePart = dt.toLocaleDateString();
                      const timePart = dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                      return (
                        <span className="text-xs font-medium text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                          {`${datePart} • ${timePart}`}
                        </span>
                      );
                    })()}
                  </div>
                  <p className="text-gray-700 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    {feedback.resolution}
                  </p>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-8 bg-white border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-500" />
                </div>
                <h3 className="font-bold text-gray-900">
                  {String(feedback.type || '').toUpperCase().includes('REWARD') ? 'Enterprise Response' 
                    : String(feedback.type || '').toUpperCase().includes('SYSTEM') ? 'Admin Response' 
                    : 'Admin Response'}
                </h3>
              </div>
              <div className="p-6 rounded-xl bg-gray-50 border border-dashed border-gray-300 text-center">
                {['RESOLVED','REJECTED'].includes(String(feedback.status || '').toUpperCase()) ? (
                  <p className="text-gray-600 italic">
                    This feedback has been {String(feedback.status).toLowerCase()} but no specific response was provided.
                  </p>
                ) : (
                  <>
                    <p className="text-gray-600 font-medium">
                      {String(feedback.type || '').toUpperCase().includes('REWARD') 
                        ? 'No response from enterprise yet.' 
                        : 'No response from admin yet.'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">We typically respond within 24-48 hours.</p>
                  </>
                )}
              </div>
            </Card>
          )}
        </div>

      </div>
    </RoleLayout>
  );
}
