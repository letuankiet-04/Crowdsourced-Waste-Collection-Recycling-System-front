import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { lockBodyScroll, unlockBodyScroll } from '../../../shared/lib/lockBodyScroll.js'
import { cn } from '../../../shared/lib/cn.js'
import Button from '../../../shared/ui/Button.jsx'
import LoadingButton from '../../../shared/ui/LoadingButton.jsx'
import ImageUploader from '../../../shared/ui/ImageUploader.jsx'

function DetailRow({ label, value }) {
  if (!value) return null
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 py-2 border-b border-gray-100 last:border-0 last:pb-0 first:pt-0">
      <span className="text-sm font-medium text-gray-500 sm:w-1/3 shrink-0">{label}</span>
      <span className="text-sm text-gray-900 font-semibold">{value}</span>
    </div>
  )
}

export default function CccdUploadDialog({ open, onClose, onExtract, onConfirm }) {
  const [step, setStep] = useState('upload') // 'upload' | 'review'
  const [profile, setProfile] = useState(null)
  const [frontFile, setFrontFile] = useState(null)
  const [backFile, setBackFile] = useState(null)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')

  const canClose = useMemo(() => !pending, [pending])

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
        if (!canClose) return
        if (e.target === e.currentTarget) onClose?.()
      }}
    >
      <div className="w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-black/5 transition-all">
        <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-gray-100">
          <div className="min-w-0">
            <div className="text-lg font-semibold text-gray-900">
              {step === 'upload' ? 'Upload ID Card' : 'Review Information'}
            </div>
            <div className="mt-1 text-sm text-gray-600">
              {step === 'upload'
                ? 'Select the front and back images of your ID card.'
                : 'Please verify the extracted information before creating your account.'}
            </div>
          </div>
          <button
            type="button"
            className={cn(
              'inline-flex h-10 w-10 items-center justify-center rounded-full text-gray-600 hover:bg-gray-50',
              !canClose && 'opacity-60 pointer-events-none'
            )}
            onClick={() => onClose?.()}
            aria-label="Close"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {step === 'upload' ? (
          <>
            <div className="px-6 py-5">
              <div className="grid gap-5 lg:grid-cols-2">
                <ImageUploader
                  title="ID Card Front"
                  max={1}
                  multiple={false}
                  addLabel="+ Select Image"
                  emptyPreviewLabel="No image selected"
                  onFilesChange={(files) => {
                    const file = Array.isArray(files) ? files[0] : null
                    setFrontFile(file ?? null)
                    if (error) setError('')
                  }}
                />
                <ImageUploader
                  title="ID Card Back"
                  max={1}
                  multiple={false}
                  addLabel="+ Select Image"
                  emptyPreviewLabel="No image selected"
                  onFilesChange={(files) => {
                    const file = Array.isArray(files) ? files[0] : null
                    setBackFile(file ?? null)
                    if (error) setError('')
                  }}
                />
              </div>

              {error ? (
                <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                  {error}
                </div>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3 px-6 py-5 border-t border-gray-100">
              <Button
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={() => onClose?.()}
                disabled={!canClose}
              >
                Cancel
              </Button>
              <LoadingButton
                accent="emerald"
                className="rounded-full sm:w-fit sm:px-6"
                loading={pending}
                loadingText="Extracting…"
                onClick={async () => {
                  if (!frontFile || !backFile) {
                    setError('Please select both the front and back images of your ID card.')
                    return
                  }
                  setPending(true)
                  try {
                    const data = await onExtract?.({ frontFile, backFile })
                    setProfile(data)
                    setStep('review')
                    setError('')
                  } catch (err) {
                    setError(err?.message || 'Failed to extract ID card information. Please try again.')
                  } finally {
                    setPending(false)
                  }
                }}
              >
                Extract Information
              </LoadingButton>
            </div>
          </>
        ) : (
          <>
            <div className="px-6 py-5">
              <div className="rounded-2xl border border-gray-200 bg-gray-50/50 p-5">
                <DetailRow label="Full Name" value={profile?.fullName} />
                <DetailRow label="ID Number" value={profile?.idNumber || profile?.citizenId} />
                <DetailRow label="Date of Birth" value={profile?.birthDay} />
                <DetailRow label="Gender" value={profile?.gender} />
                <DetailRow label="Place of Origin" value={profile?.originLocation} />
                <DetailRow label="Place of Residence" value={profile?.recentLocation} />
              </div>

              {error ? (
                <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                  {error}
                </div>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3 px-6 py-5 border-t border-gray-100">
              <Button
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={() => {
                  setStep('upload')
                  setError('')
                }}
                disabled={!canClose}
              >
                Back
              </Button>
              <LoadingButton
                accent="emerald"
                className="rounded-full sm:w-fit sm:px-6"
                loading={pending}
                loadingText="Creating account…"
                onClick={async () => {
                  setPending(true)
                  try {
                    await onConfirm?.()
                  } catch (err) {
                    setError(err?.message || 'Failed to create account. Please try again.')
                    setPending(false)
                  }
                }}
              >
                Confirm & Create Account
              </LoadingButton>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  )
}
