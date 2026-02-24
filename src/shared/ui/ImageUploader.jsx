import { useEffect, useMemo, useRef, useState } from 'react'
import useImagePreviews from '../hooks/useImagePreviews.js'
import ValidationError from './ValidationError.jsx'

const DEFAULT_ALLOWED_EXTENSIONS = ['.jpg', '.png']
const DEFAULT_ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png']
const DEFAULT_MAX_BYTES = 10 * 1024 * 1024

function getLowercaseExtension(filename) {
  const lastDotIndex = filename.lastIndexOf('.')
  if (lastDotIndex <= -1) return ''
  return filename.slice(lastDotIndex).toLowerCase()
}

function buildAcceptValue({ allowedExtensions, allowedMimeTypes }) {
  return [...allowedExtensions, ...allowedMimeTypes].join(',')
}

function isAllowedImageFile(file, { allowedExtensions, allowedMimeTypes }) {
  const ext = getLowercaseExtension(file?.name || '')
  if (!allowedExtensions.includes(ext)) return false
  if (!file?.type) return true
  return allowedMimeTypes.includes(file.type)
}

function validateImageFiles(files, { allowedExtensions, allowedMimeTypes, maxBytes }) {
  const list = Array.from(files || [])
  if (!list.length) return ''
  if (list.some((file) => !isAllowedImageFile(file, { allowedExtensions, allowedMimeTypes }))) return 'Invalid file type'
  if (list.some((file) => file.size > maxBytes)) return 'File is too large'
  return ''
}

export default function ImageUploader({
  title,
  max = 6,
  multiple = true,
  addLabel = '+ Add Photo',
  emptyPreviewLabel = 'Main preview',
  allowedExtensions = DEFAULT_ALLOWED_EXTENSIONS,
  allowedMimeTypes = DEFAULT_ALLOWED_MIME_TYPES,
  maxBytes = DEFAULT_MAX_BYTES,
  onFilesChange,
  onItemsChange,
  className,
}) {
  const inputRef = useRef(null)
  const { items, active, activeIndex, setActiveIndex, replaceFiles, addFiles, removeAt } = useImagePreviews({ max })
  const [error, setError] = useState('')

  const accept = useMemo(
    () => buildAcceptValue({ allowedExtensions, allowedMimeTypes }),
    [allowedExtensions, allowedMimeTypes]
  )

  useEffect(() => {
    onItemsChange?.(items)
    onFilesChange?.(items.map((x) => x.file))
  }, [items, onFilesChange, onItemsChange])

  const handlePick = (e) => {
    const files = e.target.files
    const nextError = validateImageFiles(files, { allowedExtensions, allowedMimeTypes, maxBytes })
    if (nextError) {
      setError(nextError)
      e.target.value = ''
      return
    }

    if (error) setError('')
    if (multiple) addFiles(files)
    else replaceFiles(files)
    e.target.value = ''
  }

  return (
    <div className={className}>
      {title ? (
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-gray-500 uppercase">{title}</h4>
          <span className="text-sm text-gray-500">{items.length} images attached</span>
        </div>
      ) : null}

      <div className="aspect-[4/3] rounded-xl border border-gray-100 bg-gray-100/60 flex items-center justify-center text-gray-500 text-lg">
        {active ? (
          <img alt="preview" src={active.url} className="h-full w-full object-cover rounded-xl" />
        ) : (
          <>{emptyPreviewLabel}</>
        )}
      </div>

      <div className="mt-4 grid grid-cols-4 gap-3">
        {items.map((img, idx) => (
          <div key={idx} className="relative group">
            <button
              type="button"
              onClick={() => setActiveIndex(idx)}
              className={`aspect-square rounded-xl border ${idx === activeIndex ? 'border-green-500 ring-2 ring-green-200' : 'border-gray-200'} overflow-hidden bg-white transition hover:scale-[1.02] active:scale-[0.98]`}
            >
              <img alt={`thumb-${idx}`} src={img.url} className="h-full w-full object-cover" />
            </button>
            <button
              type="button"
              onClick={(ev) => {
                ev.stopPropagation()
                removeAt(idx)
              }}
              className="absolute top-1.5 right-1.5 inline-flex items-center justify-center h-6 w-6 rounded-full bg-white/90 text-gray-700 border border-gray-200 shadow-sm opacity-0 group-hover:opacity-100 transition hover:bg-red-50 hover:text-red-600"
              aria-label="Remove image"
              title="Remove image"
            >
              ×
            </button>
          </div>
        ))}

        {(multiple || items.length === 0) && (
          <label className="aspect-square rounded-xl border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition">
            <input
              ref={inputRef}
              type="file"
              accept={accept}
              multiple={multiple}
              className="hidden"
              onChange={handlePick}
            />
            {addLabel}
          </label>
        )}
      </div>

      <ValidationError message={error} className="mt-3" />
    </div>
  )
}

