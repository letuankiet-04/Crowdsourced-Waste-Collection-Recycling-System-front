

import { useState, useEffect, useMemo } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { publishFeedbackSubmitted } from "../../events/feedbackEvents.js"
import { PATHS } from "../../app/routes/paths.js"
import { createFeedback } from "../../services/feedback.service.js"
import { getMyReports } from "../../services/reports.service.js"
import useNotify from "../../shared/hooks/useNotify.js"

export default function FeedbackForm() {
  const navigate = useNavigate()
  const location = useLocation()
  const notify = useNotify()
  const [feedback, setFeedback] = useState("")
  const [type, setType] = useState("System")
  const [rating, setRating] = useState(5)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [reports, setReports] = useState([])
  const [loadingReports, setLoadingReports] = useState(false)
  const [selectedReportId, setSelectedReportId] = useState(null)

  const reportId = location.state?.reportId;

  useEffect(() => {
    if (reportId) {
      setType("Reward");
      setSelectedReportId(Number(reportId));
    } else {
      setLoadingReports(true)
      getMyReports()
        .then((data) => setReports(Array.isArray(data) ? data : []))
        .catch(() => notify.error("Failed to load your reports"))
        .finally(() => setLoadingReports(false))
    }
  }, [notify, reportId]);

  const filteredReports = useMemo(() => {
    const all = Array.isArray(reports) ? reports : []
    if (type === "Reward") {
      return all.filter(r => String(r.status) === "Collected")
    }
    return all
  }, [reports, type])

  useEffect(() => {
    if (!reportId) {
      const current = filteredReports.find(r => r.id === selectedReportId)
      if (!current && filteredReports.length > 0) {
        setSelectedReportId(filteredReports[0].id)
      }
    }
  }, [filteredReports, reportId, selectedReportId])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!feedback.trim()) {
      notify.error("Feedback reason is required")
      return
    }

    const needsReport = type === "Reward" || type === "Collection"
    const finalReportId = needsReport
      ? (reportId ? Number(reportId) : Number(selectedReportId))
      : undefined
    if (needsReport) {
      if (!finalReportId || Number.isNaN(finalReportId)) {
        notify.error("Please select a report")
        return
      }
    }

    if (rating == null) {
      notify.error("Please provide a rating (1-5)")
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        type: type === "System" 
          ? "SYSTEM" 
          : (type === "Collection" ? "COMPLAINT_COLLECTION" : "COMPLAINT_REWARD"),
        content: feedback,
        reportId: needsReport ? finalReportId : undefined,
        rating: (Number(rating) || 5),
      }
      
      await createFeedback(payload)

      // Keep event publishing for other listeners if any
      publishFeedbackSubmitted({
        id: `FDB-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
        message: feedback.trim(),
        type,
        fileName: null,
        createdAt: new Date().toISOString(),
      })
      
      notify.success("Your feedback has been successfully sent!")
      navigate(PATHS.citizen.dashboard)
    } catch (error) {
      notify.error("Failed to send feedback", error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDiscard = () => {
    setFeedback("")
    setType("System")
    if (!reportId) setSelectedReportId(null)
    setRating(5)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl mx-auto">


      {/* Feedback Type and Report */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          COMPLAINT TYPE
        </label>
        <div className="flex gap-4 mb-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="radio" 
              name="feedbackType" 
              value="System" 
              checked={type === "System"} 
              onChange={(e) => setType(e.target.value)} 
              className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 disabled:opacity-50"
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
              className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 disabled:opacity-50"
            />
            <span className="text-gray-900">Collection</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="radio" 
              name="feedbackType" 
              value="Reward" 
              checked={type === "Reward"} 
              onChange={(e) => setType(e.target.value)} 
              className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 disabled:opacity-50"
            />
            <span className="text-gray-900">Reward</span>
          </label>
        </div>
        {(type === "Reward" || type === "Collection") && (
          reportId ? (
            <div className="mt-4 p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
              <p className="text-sm font-medium text-emerald-800 mb-1">
                Linking to Report #{reportId}
              </p>
              <p className="text-xs text-emerald-600">
                 Your feedback will be attached to this report for the enterprise to review.
              </p>
              <button 
                  type="button"
                  onClick={() => navigate(PATHS.citizen.reportDetail.replace(':reportId', reportId))}
                  className="mt-2 text-xs font-bold text-emerald-700 hover:text-emerald-800 underline"
              >
                  View Report Details
              </button>
            </div>
          ) : (
            <div className="mt-2">
              <label className="block text-xs font-semibold text-gray-600 mb-2">
                Select a report
              </label>
              <select
                value={selectedReportId ?? ""}
                onChange={(e) => setSelectedReportId(e.target.value ? Number(e.target.value) : null)}
                disabled={loadingReports || filteredReports.length === 0}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="" disabled>Select a report</option>
                {filteredReports.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.reportCode ? `${r.reportCode} — ${r.status}` : `#${r.id} — ${r.status}`}
                  </option>
                ))}
              </select>
              {loadingReports && <div className="text-xs text-gray-500 mt-2">Loading your reports…</div>}
              {!loadingReports && type === "Reward" && filteredReports.length === 0 && (
                <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3 mt-2">
                  You can only submit reward-related complaints for collected reports.
                </div>
              )}
              {!loadingReports && type === "Collection" && filteredReports.length === 0 && (
                <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3 mt-2">
                  Attach a related report to your collection complaint for evaluation.
                </div>
              )}
            </div>
          )
        )}
      </div>

      {/* Feedback reason */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          FEEDBACK REASON
        </label>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Describe your feedback in detail here..."
          rows={6}
          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
          required
        />
      </div>

      {/* Rating (All types) */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          RATING
        </label>
        <div className="flex gap-2">
          {[1,2,3,4,5].map((r) => (
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

      {/* Actions */}
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
          disabled={
            !feedback.trim() || 
            ((type === "Reward" || type === "Collection") && (!reportId && !selectedReportId)) || 
            loadingReports ||
            isSubmitting
          }
        >
          {isSubmitting ? "Sending..." : "Send complaint →"}
        </button>
      </div>
    </form>
  )
}
