import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { Save, X } from 'lucide-react'
import Button from '../../../../shared/ui/Button.jsx'
import ValidationError from '../../../../shared/ui/ValidationError.jsx'
import { lockBodyScroll, unlockBodyScroll } from '../../../../shared/lib/lockBodyScroll.js'

function splitTerms(text) {
  return String(text || '')
    .split('\n')
    .map((x) => x.trim())
    .filter(Boolean)
}

function toDateInputValue(value) {
  if (!value) return ''
  const str = String(value)
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) return str.slice(0, 10)
  try {
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return ''
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  } catch {
    return ''
  }
}

export default function EditVoucherDialog({ open, voucher, onClose, onSave }) {
  const [title, setTitle] = useState('')
  const [valueDisplay, setValueDisplay] = useState('')
  const [pointsRequired, setPointsRequired] = useState('')
  const [validUntil, setValidUntil] = useState('')
  const [remainingStock, setRemainingStock] = useState('')
  const [active, setActive] = useState(true)
  const [termsText, setTermsText] = useState('')
  const [bannerUrl, setBannerUrl] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const termsPreview = useMemo(() => splitTerms(termsText), [termsText])

  useEffect(() => {
    if (!open) return
    setTitle(String(voucher?.title || ''))
    setValueDisplay(String(voucher?.valueDisplay || ''))
    setPointsRequired(voucher?.pointsRequired == null ? '' : String(voucher.pointsRequired))
    setValidUntil(toDateInputValue(voucher?.validUntil))
    setRemainingStock(voucher?.remainingStock == null ? '' : String(voucher.remainingStock))
    setActive(Boolean(voucher?.active))
    setTermsText(Array.isArray(voucher?.terms) ? voucher.terms.filter(Boolean).join('\n') : '')
    setBannerUrl(String(voucher?.bannerUrl || ''))
    setLogoUrl(String(voucher?.logoUrl || ''))
    setError('')
    setSubmitting(false)
  }, [open, voucher])

  useEffect(() => {
    if (!open) return
    lockBodyScroll()
    return () => unlockBodyScroll()
  }, [open])

  const handleSubmit = async () => {
    if (!open || submitting) return

    const normalizedTitle = title.trim()
    if (!normalizedTitle) {
      setError('Please enter a title.')
      return
    }

    const points = pointsRequired === '' ? NaN : Number(pointsRequired)
    if (!Number.isFinite(points) || points < 0) {
      setError('Please enter a valid points required value.')
      return
    }

    const stock = remainingStock === '' ? null : Number(remainingStock)
    if (stock != null && (!Number.isFinite(stock) || stock < 0)) {
      setError('Please enter a valid remaining stock value.')
      return
    }

    const payload = {
      title: normalizedTitle,
      valueDisplay: valueDisplay.trim(),
      pointsRequired: Math.trunc(points),
      validUntil: validUntil || null,
      active: Boolean(active),
      remainingStock: stock == null ? null : Math.trunc(stock),
      terms: termsPreview,
      bannerUrl: bannerUrl.trim(),
      logoUrl: logoUrl.trim(),
    }

    setSubmitting(true)
    setError('')
    try {
      const ok = await onSave?.(payload)
      if (ok) onClose?.()
    } catch (e) {
      setError(e?.message || 'Unable to update voucher.')
    } finally {
      setSubmitting(false)
    }
  }

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
            <div className="text-lg font-semibold text-gray-900">Edit Voucher</div>
            <div className="mt-1 text-sm text-gray-600">
              {voucher?.voucherCode ? (
                <>
                  Code: <span className="font-semibold text-gray-900">{voucher.voucherCode}</span>
                </>
              ) : (
                'Update voucher information.'
              )}
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
          <ValidationError message={error} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-900" htmlFor="edit-voucher-title">
                Title
              </label>
              <input
                id="edit-voucher-title"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value)
                  if (error) setError('')
                }}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200"
                placeholder="e.g. Coffee House 20% OFF"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-900" htmlFor="edit-voucher-value">
                Value Display
              </label>
              <input
                id="edit-voucher-value"
                value={valueDisplay}
                onChange={(e) => setValueDisplay(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200"
                placeholder="e.g. 20% OFF"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-900" htmlFor="edit-voucher-points">
                Points Required
              </label>
              <input
                id="edit-voucher-points"
                type="number"
                min="0"
                step="1"
                value={pointsRequired}
                onChange={(e) => {
                  setPointsRequired(e.target.value)
                  if (error) setError('')
                }}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200"
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-900" htmlFor="edit-voucher-valid-until">
                Valid Until
              </label>
              <input
                id="edit-voucher-valid-until"
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-900" htmlFor="edit-voucher-stock">
                Remaining Stock
              </label>
              <input
                id="edit-voucher-stock"
                type="number"
                min="0"
                step="1"
                value={remainingStock}
                onChange={(e) => {
                  setRemainingStock(e.target.value)
                  if (error) setError('')
                }}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200"
                placeholder="Optional"
              />
            </div>

            <div className="space-y-2">
              <div className="text-sm font-semibold text-gray-900">Active</div>
              <div className="inline-flex rounded-2xl border border-gray-200 bg-gray-50 p-1">
                <button
                  type="button"
                  onClick={() => setActive(true)}
                  className={`px-5 py-2.5 text-sm font-semibold rounded-2xl transition ${
                    active ? 'bg-emerald-700 text-white shadow-sm ring-1 ring-black/5' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Active
                </button>
                <button
                  type="button"
                  onClick={() => setActive(false)}
                  className={`px-5 py-2.5 text-sm font-semibold rounded-2xl transition ${
                    !active ? 'bg-gray-700 text-white shadow-sm ring-1 ring-black/5' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Inactive
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-900" htmlFor="edit-voucher-banner-url">
                Banner URL
              </label>
              <input
                id="edit-voucher-banner-url"
                value={bannerUrl}
                onChange={(e) => setBannerUrl(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200"
                placeholder="https://..."
              />
              {bannerUrl ? <img alt="banner preview" src={bannerUrl} className="h-24 w-full rounded-2xl object-cover border border-gray-100" /> : null}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-900" htmlFor="edit-voucher-logo-url">
                Logo URL
              </label>
              <input
                id="edit-voucher-logo-url"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200"
                placeholder="https://..."
              />
              {logoUrl ? <img alt="logo preview" src={logoUrl} className="h-24 w-24 rounded-2xl object-cover border border-gray-100" /> : null}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-900" htmlFor="edit-voucher-terms">
              Terms
            </label>
            <textarea
              id="edit-voucher-terms"
              value={termsText}
              onChange={(e) => setTermsText(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200"
              placeholder="One term per line"
            />
            {termsPreview.length ? <div className="text-xs text-gray-500">{termsPreview.length} term(s)</div> : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 px-6 py-5 border-t border-gray-100">
          <Button variant="outline" size="sm" className="rounded-full" onClick={() => onClose?.()} disabled={submitting}>
            Cancel
          </Button>
          <Button size="sm" className="rounded-full" onClick={handleSubmit} disabled={submitting}>
            <Save className="h-5 w-5" aria-hidden="true" />
            Save Changes
          </Button>
        </div>
      </div>
    </div>,
    document.body
  )
}

