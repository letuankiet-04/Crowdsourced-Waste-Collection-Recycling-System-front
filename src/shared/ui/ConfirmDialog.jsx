import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '../lib/cn.js'
import { lockBodyScroll, unlockBodyScroll } from '../lib/lockBodyScroll.js'
import Button from './Button.jsx'

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onClose,
  confirmDisabled = false,
  confirmClassName,
  maxWidthClassName = 'max-w-lg',
}) {
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
      <div className={cn('w-full overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-black/5', maxWidthClassName)}>
        <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-gray-100">
          <div className="min-w-0">
            <div className="text-lg font-semibold text-gray-900">{title || 'Confirm action'}</div>
            {description ? <div className="mt-1 text-sm text-gray-600">{description}</div> : null}
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

        <div className="flex flex-wrap items-center justify-end gap-3 px-6 py-5">
          <Button variant="outline" size="sm" className="rounded-full" onClick={() => onClose?.()}>
            {cancelText}
          </Button>
          <Button
            size="sm"
            className={cn('rounded-full', confirmClassName)}
            disabled={confirmDisabled}
            onClick={() => onConfirm?.()}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  )
}

