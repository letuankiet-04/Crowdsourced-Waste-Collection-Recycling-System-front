import { useParams, useNavigate } from "react-router-dom";
import CollectorLayout from "../layouts/CollectorLayout.jsx";
import { Card } from "../../../shared/ui/Card.jsx";
import { ChevronLeft, Calendar, Clock, User, CheckCircle, AlertCircle, FileText } from "lucide-react";
import { getCollectorFeedbackById } from "../../../services/feedback.service.js";
import useNotify from "../../../shared/hooks/useNotify.js";
import { useEffect, useState } from "react";

export default function Collector_FeedbackDetails() {
  const { feedbackId } = useParams();
  const navigate = useNavigate();
  const notify = useNotify();
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);

  const normalizeType = (itemOrType) => {
    const t = typeof itemOrType === "string" ? itemOrType : itemOrType?.type;
    const v = String(t || "").toUpperCase();
    if (v === "SYSTEM") return "SYSTEM";
    if (v === "COLLECTION") return "COLLECTION";
    if (v === "COMPLAINT_SYSTEM") return "COMPLAINT_SYSTEM";
    if (v === "COMPLAINT_COLLECTION") return "COMPLAINT_COLLECTION";
    return v || "UNKNOWN";
  };

  const isEnterpriseHandled = (itemOrType) => {
    const t = typeof itemOrType === "string" ? itemOrType : itemOrType?.type;
    const v = String(t || "").toUpperCase();
    return v === "COLLECTION" || v === "COMPLAINT_COLLECTION";
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!feedbackId) return;
      setLoading(true);
      try {
        const data = await getCollectorFeedbackById(feedbackId);
        if (!cancelled) setFeedback(data);
      } catch {
        if (!cancelled) notify.error("Failed to load feedback details");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();

    const onFocus = () => {
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
  }, [feedbackId, notify]);

  if (loading) {
    return (
      <CollectorLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <p className="text-gray-500">Loading feedback details...</p>
        </div>
      </CollectorLayout>
    );
  }

  if (!feedback) {
    return (
      <CollectorLayout>
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
      </CollectorLayout>
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
    <CollectorLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-emerald-600 transition-colors font-medium text-sm group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Feedback List
        </button>

        {/* Main Content */}
        <div className="grid gap-6">
          {/* Header Card */}
          <Card className="p-8 bg-white border border-gray-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-400 to-emerald-600"></div>
            
            <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">{feedback.subject || feedback.title || `Feedback #${feedback.id}`}</h1>
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
                  : 'bg-blue-50 text-blue-700 border-blue-100'
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
                      {isEnterpriseHandled(feedback) ? 'Enterprise Response' : 'Admin Response'}
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
                  {isEnterpriseHandled(feedback) ? 'Enterprise Response' : 'Admin Response'}
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
                      {isEnterpriseHandled(feedback)
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
    </CollectorLayout>
  );
}
