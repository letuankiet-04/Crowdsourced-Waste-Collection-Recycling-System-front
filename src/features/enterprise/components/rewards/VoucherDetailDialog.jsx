import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { lockBodyScroll, unlockBodyScroll } from '../../../../shared/lib/lockBodyScroll.js'

function formatDateOnly(value) {
  if (!value) return '-'
  try {
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return String(value)
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' })
  } catch {
    return String(value)
  }
}

export default function VoucherDetailDialog({ open, voucher, onClose }) {
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
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-black/5 max-h-[calc(100vh-4rem)] flex flex-col">
        <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-gray-100">
          <div className="min-w-0">
            <div className="text-lg font-semibold text-gray-900">{voucher?.title || 'Voucher details'}</div>
            <div className="mt-1 text-sm text-gray-600 flex flex-wrap gap-x-4 gap-y-1">
              <div>
                Code: <span className="font-semibold text-gray-900">{voucher?.voucherCode || '-'}</span>
              </div>
              <div>
                Status:{' '}
                <span className={`font-semibold ${voucher?.active ? 'text-emerald-700' : 'text-gray-700'}`}>
                  {voucher?.active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-gray-600 hover:bg-gray-50"
            onClick={() => onClose?.()}
            aria-label="Close"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="px-6 py-6 space-y-6 overflow-auto">
          {voucher?.bannerUrl ? (
            <img alt="banner" src={voucher.bannerUrl} className="h-40 w-full rounded-3xl object-cover border border-gray-100" />
          ) : (
            <div className="h-40 w-full rounded-3xl bg-gray-50 border border-gray-100" />
          )}

          <div className="flex items-center gap-4">
            {voucher?.logoUrl ? (
              <img alt="logo" src={voucher.logoUrl} className="h-16 w-16 rounded-2xl object-cover border border-gray-100" />
            ) : (
              <div className="h-16 w-16 rounded-2xl bg-gray-100 border border-gray-100" />
            )}
            <div className="min-w-0">
              <div className="text-sm text-gray-500">Voucher ID</div>
              <div className="text-sm font-semibold text-gray-900 truncate">{voucher?.id ?? '-'}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-gray-100 bg-gray-50/40 p-4">
              <div className="text-xs uppercase tracking-wider font-bold text-gray-500">Value</div>
              <div className="mt-1 text-sm font-semibold text-gray-900">{voucher?.valueDisplay || '-'}</div>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-gray-50/40 p-4">
              <div className="text-xs uppercase tracking-wider font-bold text-gray-500">Points Required</div>
              <div className="mt-1 text-sm font-semibold text-gray-900">{voucher?.pointsRequired ?? '-'}</div>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-gray-50/40 p-4">
              <div className="text-xs uppercase tracking-wider font-bold text-gray-500">Valid Until</div>
              <div className="mt-1 text-sm font-semibold text-gray-900">{formatDateOnly(voucher?.validUntil)}</div>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-gray-50/40 p-4">
              <div className="text-xs uppercase tracking-wider font-bold text-gray-500">Remaining Stock</div>
              <div className="mt-1 text-sm font-semibold text-gray-900">{voucher?.remainingStock ?? '-'}</div>
            </div>
          </div>

          <div>
            <div className="text-sm font-semibold text-gray-900">Terms</div>
            {Array.isArray(voucher?.terms) && voucher.terms.length ? (
              <ul className="mt-2 space-y-2 text-sm text-gray-700">
                {voucher.terms.map((t, idx) => (
                  <li key={`${idx}-${t}`} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-emerald-600 flex-none" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-2 text-sm text-gray-600">No terms.</div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

