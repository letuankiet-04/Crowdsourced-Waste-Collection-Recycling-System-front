import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { lockBodyScroll, unlockBodyScroll } from '../lib/lockBodyScroll.js'

export default function PolicyTermsDialog({ open, onClose, title = 'Privacy Policy & Terms' }) {
  useEffect(() => {
    if (!open) return
    lockBodyScroll()
    return () => unlockBodyScroll()
  }, [open])

  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.()
      }}
    >
      <div className="w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-black/5">
        <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-gray-600 hover:bg-gray-50"
            onClick={() => onClose?.()}
            aria-label="Close"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="px-6 py-5 max-h-[70vh] overflow-y-auto text-sm text-gray-700">
          <section className="space-y-2">
            <h3 className="text-base font-semibold text-gray-900">Privacy Policy</h3>
            <p>We collect only the information necessary to operate the Eco-Stream Portal, including account data and activity related to waste collection and recycling reports.</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Data types: account details, report metadata, location (if you choose to share), and uploaded images.</li>
              <li>Usage: service provisioning, security, analytics to improve sustainability outcomes.</li>
              <li>Retention: data is retained only as long as required by operational and legal needs.</li>
              <li>Your rights: access, correction, deletion subject to applicable laws.</li>
            </ul>
          </section>

          <section className="mt-6 space-y-2">
            <h3 className="text-base font-semibold text-gray-900">Terms of Service</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Use the portal responsibly and submit accurate information.</li>
              <li>Do not upload harmful, illegal, or infringing content.</li>
              <li>We may moderate or remove content that violates these terms.</li>
              <li>The service is provided “as is” without warranties where permitted by law.</li>
            </ul>
          </section>

          <section className="mt-6 space-y-2">
            <h3 className="text-base font-semibold text-gray-900">Contact</h3>
            <p>Questions about this policy or the terms can be sent to supportecostream@gmail.com.</p>
          </section>
        </div>
      </div>
    </div>,
    document.body
  )
}
