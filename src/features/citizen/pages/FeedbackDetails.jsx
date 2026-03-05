import { useParams, useNavigate } from "react-router-dom";
import RoleLayout from "../../../shared/layout/RoleLayout.jsx";
import Sidebar from "./Sidebar.jsx";
import Navbar from "./CD_Navbar.jsx";
import CD_Footer from "../../../shared/layout/CD_Footer.jsx";
import { Card } from "../../../shared/ui/Card.jsx";
import { ChevronLeft, Calendar, Clock, User, CheckCircle, AlertCircle } from "lucide-react";

// Mock data (same as MyFeedback for consistency)
const MOCK_FEEDBACK = [
  {
    id: "FDB-X7K9P2",
    subject: "Bin overflow on 5th Avenue",
    type: "Service",
    date: "2023-10-24T10:30:00",
    status: "NEW",
    content: "The bin has been overflowing for 2 days. Please collect it soon. It's attracting pests and smells bad.",
    response: null
  },
  {
    id: "FDB-M2J5L8",
    subject: "App crashing on login",
    type: "System",
    date: "2023-10-22T09:00:00",
    status: "RESOLVED",
    content: "I cannot log in to my account using Google Auth. It just spins and then crashes.",
    response: {
      date: "2023-10-23T14:00:00",
      message: "This issue has been fixed in the latest update (v1.2.4). Please update your app."
    }
  },
  {
    id: "FDB-R4H1N6",
    subject: "Late pickup complaint",
    type: "Service",
    date: "2023-10-20T11:20:00",
    status: "IN PROGRESS",
    content: "My trash was not picked up last Tuesday as scheduled. This is the second time this month.",
    response: {
      date: "2023-10-21T09:30:00",
      message: "We apologize for the delay. The truck had a mechanical failure. We will collect it tomorrow."
    }
  },
  {
    id: "FDB-T9Q3V4",
    subject: "Feature request: Dark mode",
    type: "System",
    date: "2023-10-19T13:10:00",
    status: "IN PROGRESS",
    content: "It would be great to have a dark mode for better night viewing. The white background is too bright.",
    response: null
  },
  {
    id: "FDB-A1B2C3",
    subject: "Missed recycling pickup",
    type: "Service",
    date: "2023-10-17T09:30:00",
    status: "RESOLVED",
    content: "Recycling bin was skipped today even though it was out by 6am.",
    response: {
      date: "2023-10-18T10:00:00",
      message: "The driver reported the bin was blocked by a parked car. We have rescheduled for Friday."
    }
  }
];

export default function FeedbackDetails() {
  const { feedbackId } = useParams();
  const navigate = useNavigate();

  const feedback = MOCK_FEEDBACK.find(item => item.id === feedbackId);

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
      "NEW": "bg-blue-100 text-blue-700 border-blue-200",
      "IN PROGRESS": "bg-yellow-100 text-yellow-700 border-yellow-200",
      "RESOLVED": "bg-green-100 text-green-700 border-green-200"
    };
    
    const icons = {
      "NEW": <AlertCircle className="w-4 h-4" />,
      "IN PROGRESS": <Clock className="w-4 h-4" />,
      "RESOLVED": <CheckCircle className="w-4 h-4" />
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
                  <h1 className="text-2xl font-bold text-gray-900">{feedback.subject}</h1>
                  {getStatusBadge(feedback.status)}
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-gray-300"></span>
                    ID: <span className="font-mono font-medium text-gray-700">{feedback.id}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    {new Date(feedback.date).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    {new Date(feedback.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
              </div>
              
              <div className="flex flex-col items-end justify-center">
                <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-lg border ${
                  feedback.type === 'Service' ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-orange-50 text-orange-700 border-orange-100'
                }`}>
                  {feedback.type}
                </span>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Description</h3>
              <p className="text-gray-700 leading-relaxed text-lg">
                {feedback.content}
              </p>
            </div>
          </Card>

          {/* Admin Response Section */}
          {feedback.response ? (
            <Card className="p-8 bg-emerald-50/50 border border-emerald-100 shadow-sm">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center border-2 border-white shadow-sm">
                    <User className="w-5 h-5 text-emerald-600" />
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-gray-900">Admin Response</h3>
                    <span className="text-xs font-medium text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                      {new Date(feedback.response.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-700 bg-white p-4 rounded-xl border border-emerald-100 shadow-sm">
                    {feedback.response.message}
                  </p>
                </div>
              </div>
            </Card>
          ) : (
            <div className="p-8 rounded-2xl bg-gray-50 border border-dashed border-gray-300 text-center">
              <p className="text-gray-500 font-medium">No response from admin yet.</p>
              <p className="text-xs text-gray-400 mt-1">We typically respond within 24-48 hours.</p>
            </div>
          )}
        </div>

      </div>
    </RoleLayout>
  );
}
