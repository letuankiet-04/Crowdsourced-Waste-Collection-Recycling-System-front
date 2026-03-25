import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import CollectorLayout from "../layouts/CollectorLayout.jsx";
import PageHeader from "../../../shared/ui/PageHeader.jsx";
import useNotify from "../../../shared/hooks/useNotify.js";
import { PATHS } from "../../../app/routes/paths.js";
import { createCollectorFeedback } from "../../../services/feedback.service.js";

export default function Collector_Feedback() {
  const navigate = useNavigate();
  const location = useLocation();
  const notify = useNotify();

  const preselectedRequestId =
    location.state?.collectionRequestId ??
    location.state?.requestId ??
    location.state?.taskId ??
    null;

  const [type, setType] = useState(preselectedRequestId != null ? "Collection" : "System");
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content.trim()) {
      notify.error("Feedback content is required");
      return;
    }

    if (rating == null) {
      notify.error("Please provide a rating (1-5)");
      return;
    }

    setIsSubmitting(true);
    try {
      const requestId =
        preselectedRequestId != null ? Number(preselectedRequestId) : null;
      await createCollectorFeedback({
        type: type === "System" ? "SYSTEM" : "COLLECTION",
        content: content.trim(),
        rating: Number(rating) || 5,
        collectionRequestId:
          type === "Collection" && Number.isFinite(requestId) ? requestId : undefined,
      });

      notify.success(
        type === "System"
          ? "Your feedback has been sent to the admin team."
          : "Your feedback has been sent to the enterprise team."
      );
      navigate(PATHS.collector.dashboard);
    } catch (error) {
      notify.error("Failed to send feedback", error?.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDiscard = () => {
    setContent("");
    setType(preselectedRequestId != null ? "Collection" : "System");
    setRating(5);
  };

  return (
    <CollectorLayout>
      <div className="space-y-8 max-w-3xl">
        <PageHeader
          title="Submit a Feedback"
          description="Choose Collection for enterprise handling, or System for admin handling."
        />

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              FEEDBACK TYPE
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="feedbackType"
                  value="System"
                  checked={type === "System"}
                  onChange={(e) => setType(e.target.value)}
                  className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-gray-900">System</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="feedbackType"
                  value="Collection"
                  checked={type === "Collection"}
                  onChange={(e) => setType(e.target.value)}
                  className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-gray-900">Collection</span>
              </label>
            </div>

            {type === "Collection" ? (
              <div className="mt-4 text-xs text-gray-600">
                This feedback will be routed to the enterprise team.
              </div>
            ) : null}
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              FEEDBACK DETAILS
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Describe your feedback in detail..."
              rows={6}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
              required
            />
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <label className="block text-sm font-semibold text-gray-700 mb-3">RATING</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((r) => (
                <label key={r} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="rating"
                    value={r}
                    checked={Number(rating) === r}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-gray-900">{r}</span>
                </label>
              ))}
            </div>
            <div className="text-xs text-gray-500 mt-2">1 = very dissatisfied, 5 = very satisfied</div>
          </div>

          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={handleDiscard}
              className="px-6 py-3 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
            >
              Discard draft
            </button>

            <button
              type="submit"
              className="px-8 py-3 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition disabled:opacity-50"
              disabled={!content.trim() || isSubmitting}
            >
              {isSubmitting ? "Sending..." : "Send feedback →"}
            </button>
          </div>

          <button
            type="button"
            onClick={() => navigate(PATHS.collector.dashboard)}
            className="text-sm font-semibold text-gray-600 hover:text-gray-900 underline"
          >
            Back to dashboard
          </button>
        </form>
      </div>
    </CollectorLayout>
  );
}
