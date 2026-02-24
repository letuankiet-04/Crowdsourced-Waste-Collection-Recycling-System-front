

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { publishFeedbackSubmitted } from "../../events/feedbackEvents.js"
import { PATHS } from "../../app/routes/paths.js"

export default function FeedbackForm() {
  const navigate = useNavigate()
  const [feedback, setFeedback] = useState("")
  const [file, setFile] = useState(null)

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!feedback.trim()) {
      alert("Feedback reason is required")
      return
    }

    const formData = new FormData()
    formData.append("feedback", feedback)
    if (file) formData.append("evidence", file)

    console.log("Submit feedback:", {
      feedback,
      file,
    })

    // TODO: call API here
    const payload = {
      id: `FDB-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      message: feedback.trim(),
      fileName: file?.name ?? null,
      createdAt: new Date().toISOString(),
    }
    publishFeedbackSubmitted(payload)
    
    alert("Your feedback has been successfully sent!")
    navigate(PATHS.citizen.dashboard)
  }

  const handleDiscard = () => {
    setFeedback("")
    setFile(null)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl mx-auto">
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

      {/* Evidence upload */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <label className="block text-sm font-semibold text-gray-700 mb-4">
          EVIDENCE (OPTIONAL)
        </label>

        <div className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center">
          <input
            type="file"
            accept="image/png, image/jpeg, image/gif"
            className="hidden"
            id="evidence-upload"
            onChange={(e) => setFile(e.target.files[0])}
          />

          <label
            htmlFor="evidence-upload"
            className="cursor-pointer inline-flex flex-col items-center gap-2"
          >
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
              ⬆️
            </div>
            <p className="text-emerald-600 font-medium">Upload file</p>
            <p className="text-sm text-gray-500">
              PNG, JPG, GIF up to 10MB
            </p>
          </label>

          {file && (
            <p className="mt-4 text-sm text-gray-700">
              Selected file: <strong>{file.name}</strong>
            </p>
          )}
        </div>
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
          disabled={!feedback.trim()}
        >
          Send feedback →
        </button>
      </div>
    </form>
  )
}
