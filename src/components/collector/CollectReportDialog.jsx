import { useEffect, useRef, useState } from 'react'
import { CheckCircle2, X } from 'lucide-react'
import Button from '../../shared/ui/Button.jsx'
import StatusPill from '../../shared/ui/StatusPill.jsx'
import ValidationError from '../../shared/ui/ValidationError.jsx'
import ImageUploader from '../../shared/ui/ImageUploader.jsx'
import MapPicker from '../../shared/components/maps/GoongMapPicker.jsx'

export default function CollectReportDialog({
  open,
  onClose,
  reportId,
  statusLabel,
  statusVariant,
  categories,
  initialAddress,
  initialCoords,
  onSubmit,
}) {
  const [quantitiesByCategoryId, setQuantitiesByCategoryId] = useState({})
  const [collectedImages, setCollectedImages] = useState([])
  const [collectedAddress, setCollectedAddress] = useState('')
  const [collectedCoords, setCollectedCoords] = useState(null)
  const [collectorNote, setCollectorNote] = useState('')
  const [addrLoading, setAddrLoading] = useState(false)
  const [gpsLoading, setGpsLoading] = useState(false)
  const [geoError, setGeoError] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const sourceRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const next = {}
    const list = Array.isArray(categories) ? categories : []
    list.forEach((c) => {
      const id = c?.categoryId
      if (id == null) return
      const suggested =
        c?.suggestedQuantity === 0 ? '0' : c?.suggestedQuantity != null ? String(c.suggestedQuantity) : ''
      next[String(id)] = suggested
    })
    setQuantitiesByCategoryId(next)
    setCollectedImages([])
    setCollectedAddress(typeof initialAddress === 'string' ? initialAddress : '')
    setCollectedCoords(initialCoords ?? null)
    setCollectorNote('')
    setAddrLoading(false)
    setGpsLoading(false)
    setGeoError('')
    setError('')
    setSubmitting(false)
    sourceRef.current = 'system'
  }, [open, categories, initialAddress, initialCoords])

  useEffect(() => {
    if (!open) return
    if (sourceRef.current !== 'address') return
    if (!collectedAddress || collectedAddress.trim().length < 3) return
    setAddrLoading(true)
    setGeoError('')
    const t = setTimeout(async () => {
      try {
        const r = await fetch(
          `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(collectedAddress)}`
        )
        if (r.ok) {
          const data = await r.json()
          if (Array.isArray(data) && data.length) {
            const first = data[0]
            setCollectedCoords({ lat: parseFloat(first.lat), lng: parseFloat(first.lon) })
          } else {
            setGeoError('Address not found')
          }
        } else {
          setGeoError('Address lookup failed')
        }
      } catch {
        setGeoError('Network error during address lookup')
      } finally {
        setAddrLoading(false)
      }
    }, 500)
    return () => clearTimeout(t)
  }, [open, collectedAddress])

  const handleConfirm = async () => {
    if (!open || submitting) return
    if (!collectedImages.length) {
      setError('Please upload at least one collection photo.')
      return
    }
    if (!collectedCoords) {
      setError('Please choose a collection location using GPS, map, or address.')
      return
    }
    if (!collectedAddress || collectedAddress.trim().length < 3) {
      setError('Please enter the collection address.')
      return
    }
    if (geoError) {
      setError(geoError)
      return
    }

    if (!collectorNote || collectorNote.trim().length < 3) {
      setError('Please enter a collector note.')
      return
    }

    const list = Array.isArray(categories) ? categories : []
    const categoryIds = []
    const quantities = []
    for (const c of list) {
      const id = c?.categoryId
      if (id == null) continue
      const raw = quantitiesByCategoryId?.[String(id)]
      const value = raw === '' || raw === null || raw === undefined ? NaN : Number(raw)
      if (!Number.isFinite(value) || value < 0) {
        setError(`Please enter a valid quantity for ${c?.categoryName || 'this category'}.`)
        return
      }
      if (value > 0) {
        categoryIds.push(Number(id))
        quantities.push(value)
      }
    }

    if (!categoryIds.length) {
      setError('Please enter at least one collected quantity.')
      return
    }

    setSubmitting(true)
    try {
      const ok = await onSubmit?.({
        images: collectedImages,
        categoryIds,
        quantities,
        collectorNote: collectorNote.trim(),
        latitude: collectedCoords.lat,
        longitude: collectedCoords.lng,
      })
      if (ok) onClose?.()
    } catch (e) {
      setError(e?.message || 'Unable to save collected info.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8"
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.()
      }}
    >
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-black/5 max-h-[calc(100vh-4rem)] flex flex-col">
        <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-gray-100">
          <div className="min-w-0">
            <div className="text-lg font-semibold text-gray-900">Submit Collection Report</div>
            <div className="mt-1 text-sm text-gray-600">Upload photos, confirm location, and enter the collected weight.</div>
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
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm text-gray-700">
              Report: <span className="font-semibold text-gray-900">{reportId ?? '-'}</span>
            </div>
            {statusLabel ? <StatusPill variant={statusVariant}>{statusLabel}</StatusPill> : null}
          </div>

          <ValidationError message={error} />

          <div className="space-y-3">
            <div className="text-sm font-semibold text-gray-900">Collection Photos</div>
            <ImageUploader title={null} max={6} multiple addLabel="+ Add Photo" onFilesChange={setCollectedImages} />
          </div>

          <div className="space-y-3">
            <div className="text-sm font-semibold text-gray-900">Collection Location</div>
            <div className="flex items-center gap-2">
              <input
                value={collectedAddress}
                onChange={(e) => {
                  sourceRef.current = 'address'
                  setCollectedAddress(e.target.value)
                  if (error) setError('')
                }}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="Address"
              />
              <button
                type="button"
                disabled={gpsLoading}
                onClick={async () => {
                  setGeoError('')
                  setGpsLoading(true)
                  sourceRef.current = 'gps'
                  try {
                    const pos = await new Promise((resolve, reject) =>
                      navigator.geolocation
                        ? navigator.geolocation.getCurrentPosition(resolve, reject, {
                          enableHighAccuracy: true,
                          timeout: 10000,
                        })
                        : reject(new Error('Geolocation not supported'))
                    )
                    const next = { lat: pos.coords.latitude, lng: pos.coords.longitude }
                    setCollectedCoords(next)
                    const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${next.lat}&lon=${next.lng}`)
                    if (r.ok) {
                      const data = await r.json()
                      sourceRef.current = 'system'
                      setCollectedAddress(data.display_name || '')
                    }
                  } catch {
                    setGeoError('Unable to get current location')
                  } finally {
                    setGpsLoading(false)
                  }
                }}
                className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 font-medium transition border ${
                  gpsLoading ? 'border-gray-200 text-gray-400' : 'border-gray-300 text-gray-700 hover:bg-gray-50 active:scale-[0.98]'
                }`}
              >
                {gpsLoading ? 'Locating...' : 'Use current location'}
              </button>
            </div>
            {addrLoading ? <div className="text-sm text-gray-500">Finding location...</div> : null}
            {geoError ? <div className="text-sm text-red-600">{geoError}</div> : null}
            <MapPicker
              value={collectedCoords}
              onChange={async (c) => {
                setGeoError('')
                sourceRef.current = 'map'
                setCollectedCoords(c)
                if (error) setError('')
                try {
                  const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${c.lat}&lon=${c.lng}`)
                  if (r.ok) {
                    const data = await r.json()
                    sourceRef.current = 'system'
                    setCollectedAddress(data.display_name || '')
                  }
                } catch {
                  setGeoError('Unable to resolve address for the selected location')
                }
              }}
            />
          </div>

          <div className="space-y-3">
            <div className="text-sm font-semibold text-gray-900">Collected Quantities</div>
            {(Array.isArray(categories) ? categories : []).map((c) => {
              const categoryId = c?.categoryId
              if (categoryId == null) return null
              const id = `collected-qty-${categoryId}`
              const value = quantitiesByCategoryId?.[String(categoryId)] ?? ''
              const unit = c?.wasteUnit ? String(c.wasteUnit).toLowerCase() : 'kg'
              return (
                <div key={categoryId} className="grid gap-2">
                  <label htmlFor={id} className="text-sm font-medium text-slate-800">
                    {c?.categoryName || `Category ${categoryId}`} ({unit})
                  </label>
                  <input
                    id={id}
                    name={id}
                    type="number"
                    min="0"
                    step="0.01"
                    value={value}
                    onChange={(e) => {
                      const nextValue = e.target.value
                      setQuantitiesByCategoryId((prev) => ({ ...(prev || {}), [String(categoryId)]: nextValue }))
                      if (error) setError('')
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-3 pr-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200"
                    placeholder="0.00"
                  />
                </div>
              )
            })}
          </div>

          <div className="space-y-2">
            <div className="text-sm font-semibold text-gray-900">Collector Note</div>
            <textarea
              value={collectorNote}
              onChange={(e) => {
                setCollectorNote(e.target.value)
                if (error) setError('')
              }}
              rows={4}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200"
              placeholder="Describe what you collected and any observations..."
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 px-6 py-5 border-t border-gray-100">
          <Button variant="outline" size="sm" className="rounded-full" onClick={() => onClose?.()}>
            Cancel
          </Button>
          <Button
            size="sm"
            className="rounded-full bg-green-600 hover:bg-green-700 text-white"
            onClick={handleConfirm}
            disabled={submitting}
          >
            <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
            Submit Report
          </Button>
        </div>
      </div>
    </div>
  )
}
