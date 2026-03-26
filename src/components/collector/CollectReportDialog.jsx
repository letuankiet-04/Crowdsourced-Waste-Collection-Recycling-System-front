import { useEffect, useRef, useState } from 'react'
import { CheckCircle2, X } from 'lucide-react'
import { translateErrorMessage } from '../../shared/lib/errorTranslator.js'
import { createPortal } from 'react-dom'
import Button from '../../shared/ui/Button.jsx'
import ConfirmDialog from '../../shared/ui/ConfirmDialog.jsx'
import { lockBodyScroll, unlockBodyScroll } from '../../shared/lib/lockBodyScroll.js'
import StatusPill from '../../shared/ui/StatusPill.jsx'
import ValidationError from '../../shared/ui/ValidationError.jsx'
import ImageUploader from '../../shared/ui/ImageUploader.jsx'
import MapPicker from '../../shared/components/maps/GoongMapPicker.jsx'
import WasteItemsTable from '../../shared/ui/WasteItemsTable.jsx'
import { getWasteCategories } from '../../services/reports.service.js'
import { WASTE_TYPE_OPTIONS } from '../../shared/constants/wasteTypes.js'
 

const normalizeLocationText = (value) => {
  const raw = value == null ? '' : String(value)
  return raw
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

const inferAdminHint = (addr) => {
  const raw = addr == null ? '' : String(addr)
  const parts = raw
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean)
  if (!parts.length) return ''
  const keep = parts.filter((p) => {
    const n = normalizeLocationText(p)
    return n.includes('ho chi minh') || n.includes('tp hcm') || n.includes('thu duc')
  })
  const tail = keep.length ? keep : parts.slice(-3)
  return tail.join(', ')
}

const scoreCandidate = ({ lat, lng, displayName }, queryNorm, queryDigits, anchor) => {
  const la = typeof lat === 'number' ? lat : Number(lat)
  const ln = typeof lng === 'number' ? lng : Number(lng)
  if (!Number.isFinite(la) || !Number.isFinite(ln)) return Number.POSITIVE_INFINITY

  const dn = normalizeLocationText(displayName ?? '')
  let penalty = 0
  if (queryDigits && dn && !dn.includes(queryDigits)) penalty += 10_000
  if (queryNorm && dn && !dn.includes(queryNorm)) penalty += 2_000

  if (anchor) {
    const dLat = la - anchor.lat
    const dLng = ln - anchor.lng
    const dist2 = dLat * dLat + dLng * dLng
    return dist2 * 1_000_000 + penalty
  }

  return penalty
}

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
  const [collectedItems, setCollectedItems] = useState([])
  const [collectedImages, setCollectedImages] = useState([])
  const [collectedAddress, setCollectedAddress] = useState('')
  const [collectedCoords, setCollectedCoords] = useState(null)
  const [collectorNote, setCollectorNote] = useState('')
  const [wasteTypes, setWasteTypes] = useState([])
  const [addrLoading, setAddrLoading] = useState(false)
  const [gpsLoading, setGpsLoading] = useState(false)
  const [geoError, setGeoError] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingPayload, setPendingPayload] = useState(null)
 

  const sourceRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const list = Array.isArray(categories) ? categories : []
    const nextItems = list.map((c) => {
      const id = c?.categoryId ?? c?.wasteTypeId ?? c?.id ?? null
      const baseSuggested = c?.suggestedQuantity ?? c?.estimatedWeight
      const suggested = baseSuggested === 0 ? '0' : baseSuggested != null ? String(baseSuggested) : ''
      return { wasteTypeId: id, estimatedWeight: suggested }
    })
    const nextTypes = list
      .map((c) => {
        const id = c?.categoryId ?? c?.wasteTypeId ?? c?.id
        if (id == null) return null
        return {
          id: Number(id),
          name: c?.categoryName ?? c?.name ?? String(id),
          unit: c?.wasteUnit ?? c?.unit ?? '',
        }
      })
      .filter(Boolean)
    const builtInTypes = (Array.isArray(WASTE_TYPE_OPTIONS) ? WASTE_TYPE_OPTIONS : [])
      .map((t) => {
        const id = t?.id
        if (id == null) return null
        return { id: Number(id), name: t?.name ?? String(id), unit: t?.unit ?? '' }
      })
      .filter(Boolean)
    const mergedInitial = new Map()
    ;[...builtInTypes, ...nextTypes].forEach((t) => {
      if (!t || t.id == null || !Number.isFinite(t.id)) return
      mergedInitial.set(t.id, t)
    })
    setCollectedItems(nextItems)
    setCollectedImages([])
    setCollectedAddress(typeof initialAddress === 'string' ? initialAddress : '')
    setCollectedCoords(initialCoords ?? null)
    setCollectorNote('')
    setWasteTypes(Array.from(mergedInitial.values()))
    setAddrLoading(false)
    setGpsLoading(false)
    setGeoError('')
    setError('')
    setSubmitting(false)
    setConfirmOpen(false)
    setPendingPayload(null)
    sourceRef.current = 'system'
  }, [open, categories, initialAddress, initialCoords])

  useEffect(() => {
    if (!open) return
    let alive = true
    ;(async () => {
      const fromReport = (Array.isArray(categories) ? categories : [])
        .map((c) => {
          const id = c?.categoryId ?? c?.wasteTypeId ?? c?.id
          if (id == null) return null
          return {
            id: Number(id),
            name: c?.categoryName ?? c?.name ?? String(id),
            unit: c?.wasteUnit ?? c?.unit ?? '',
          }
        })
        .filter(Boolean)
      const builtInTypes = (Array.isArray(WASTE_TYPE_OPTIONS) ? WASTE_TYPE_OPTIONS : [])
        .map((t) => {
          const id = t?.id
          if (id == null) return null
          return { id: Number(id), name: t?.name ?? String(id), unit: t?.unit ?? '' }
        })
        .filter(Boolean)

      try {
        const fetched = await getWasteCategories()
        const normalizedFetched = (Array.isArray(fetched) ? fetched : [])
          .map((c) => {
            const id = c?.id ?? c?.categoryId ?? c?.wasteTypeId
            if (id == null) return null
            return {
              id: Number(id),
              name: c?.name ?? c?.categoryName ?? String(id),
              unit: c?.unit ?? c?.wasteUnit ?? '',
            }
          })
          .filter(Boolean)

        const merged = new Map()
        ;[...builtInTypes, ...normalizedFetched, ...fromReport].forEach((t) => {
          if (!t || t.id == null || !Number.isFinite(t.id)) return
          merged.set(t.id, t)
        })

        if (!alive) return
        setWasteTypes(Array.from(merged.values()))
      } catch {
        const merged = new Map()
        ;[...builtInTypes, ...fromReport].forEach((t) => {
          if (!t || t.id == null || !Number.isFinite(t.id)) return
          merged.set(t.id, t)
        })
        if (!alive) return
        setWasteTypes(Array.from(merged.values()))
      }
    })()
    return () => {
      alive = false
    }
  }, [open, categories])

  useEffect(() => {
    if (!open) return
    lockBodyScroll()
    return () => unlockBodyScroll()
  }, [open])

  

  useEffect(() => {
    if (!open) return
    if (sourceRef.current !== 'address') return
    if (!collectedAddress || collectedAddress.trim().length < 3) return

    const initialAddr = typeof initialAddress === 'string' ? initialAddress.trim() : ''
    const nextAddr = String(collectedAddress || '').trim()
    const initLat = initialCoords?.lat
    const initLng = initialCoords?.lng
    const initLatNum = typeof initLat === 'number' ? initLat : Number(initLat)
    const initLngNum = typeof initLng === 'number' ? initLng : Number(initLng)
    const hasInitialCoords = Number.isFinite(initLatNum) && Number.isFinite(initLngNum)
    const normInitial = normalizeLocationText(initialAddr)
    const normNext = normalizeLocationText(nextAddr)
    const textLikelySame =
      normInitial &&
      normNext &&
      (normInitial === normNext ||
        (normNext.length >= 6 && normInitial.includes(normNext)) ||
        (normInitial.length >= 6 && normNext.includes(normInitial)))
    if (textLikelySame && hasInitialCoords) {
      sourceRef.current = 'system'
      setGeoError('')
      setCollectedCoords({ lat: initLatNum, lng: initLngNum })
      return
    }

    setAddrLoading(true)
    setGeoError('')
    const t = setTimeout(async () => {
      try {
        const rawQuery = String(collectedAddress || '').trim()
        const adminHint = initialAddr ? inferAdminHint(initialAddr) : ''
        const q = adminHint && rawQuery.length < 40 ? `${rawQuery}, ${adminHint}` : rawQuery

        const params = new URLSearchParams()
        params.set('format', 'jsonv2')
        params.set('q', q)
        params.set('limit', '10')
        params.set('countrycodes', 'vn')
        params.set('addressdetails', '1')

        const r = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
          headers: { Accept: 'application/json', 'Accept-Language': 'vi' },
        })
        if (r.ok) {
          const data = await r.json()
          if (Array.isArray(data) && data.length) {
            const anchor = hasInitialCoords ? { lat: initLatNum, lng: initLngNum } : null
            const queryDigits = normNext ? normNext.replace(/[^\d]/g, '') : ''
            const queryNorm = normalizeLocationText(rawQuery)
              .split(' ')
              .slice(0, 4)
              .join(' ')
              .trim()

            const scored = data
              .map((row) => ({
                row,
                score: scoreCandidate(
                  { lat: row?.lat, lng: row?.lon, displayName: row?.display_name },
                  queryNorm,
                  queryDigits,
                  anchor
                ),
              }))
              .filter((x) => Number.isFinite(x.score))
              .sort((a, b) => a.score - b.score)

            const best = scored[0]?.row ?? data[0]
            sourceRef.current = 'system'
            setCollectedCoords({ lat: parseFloat(best.lat), lng: parseFloat(best.lon) })
            if (typeof best?.display_name === 'string' && best.display_name.trim()) {
              setCollectedAddress(best.display_name.trim())
            }
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
  }, [open, collectedAddress, initialAddress, initialCoords])

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

    const categoryIds = []
    const quantities = []
    const selected = new Set()
    const list = Array.isArray(collectedItems) ? collectedItems : []
    for (let i = 0; i < list.length; i++) {
      const it = list[i] || {}
      const idRaw = it.wasteTypeId
      const id = idRaw === '' || idRaw === null || idRaw === undefined ? null : Number(idRaw)
      if (!Number.isInteger(id)) {
        setError(`Please select a waste type for row ${i + 1}.`)
        return
      }
      if (selected.has(id)) {
        const name = wasteTypes.find((t) => Number(t?.id) === id)?.name
        setError(`Duplicate waste type${name ? `: ${name}` : ''}. Please choose different types.`)
        return
      }
      selected.add(id)

      const raw = it.estimatedWeight
      const value = raw === '' || raw === null || raw === undefined ? NaN : Number(raw)
      if (!Number.isFinite(value) || value < 0) {
        const name = wasteTypes.find((t) => Number(t?.id) === id)?.name
        setError(`Please enter a valid quantity for ${name || `row ${i + 1}`}.`)
        return
      }
      if (value > 0) {
        categoryIds.push(id)
        quantities.push(value)
      }
    }

    if (!categoryIds.length) {
      setError('Please enter at least one collected quantity.')
      return
    }

    setPendingPayload({
      images: collectedImages,
      categoryIds,
      quantities,
      collectorNote: String(collectorNote ?? '').trim(),
      latitude: collectedCoords.lat,
      longitude: collectedCoords.lng,
    })
    setConfirmOpen(true)
  }

  const handleSubmitConfirmed = async () => {
    if (!open || submitting) return
    const payload = pendingPayload
    setConfirmOpen(false)
    setPendingPayload(null)
    if (!payload) return

    setSubmitting(true)
    try {
      const ok = await onSubmit?.(payload)
      if (ok) onClose?.()
    } catch (e) {
      setError(translateErrorMessage(e?.message) || 'Unable to save collected info.')
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
                onClick={() => {
                  const addr = typeof initialAddress === 'string' ? initialAddress : ''
                  const lat = initialCoords?.lat
                  const lng = initialCoords?.lng
                  const latNum = typeof lat === 'number' ? lat : Number(lat)
                  const lngNum = typeof lng === 'number' ? lng : Number(lng)
                  if (!addr || !addr.trim() || !Number.isFinite(latNum) || !Number.isFinite(lngNum)) return
                  setGeoError('')
                  sourceRef.current = 'system'
                  setCollectedAddress(addr)
                  setCollectedCoords({ lat: latNum, lng: lngNum })
                  if (error) setError('')
                }}
                className="inline-flex items-center gap-2 rounded-xl px-5 py-3 font-medium transition border border-gray-300 text-gray-700 hover:bg-gray-50 active:scale-[0.98]"
              >
                Use reported
              </button>
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
            <WasteItemsTable
              items={collectedItems}
              wasteTypes={wasteTypes}
              onChange={(next) => {
                setCollectedItems(next)
                if (error) setError('')
              }}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-gray-900">Collector Note</div>
              <div className="text-xs text-gray-500">{collectorNote.length} / 500</div>
            </div>
            <textarea
              value={collectorNote}
              onChange={(e) => {
                setCollectorNote(e.target.value)
                if (error) setError('')
              }}
              rows={4}
              maxLength={500}
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

      <ConfirmDialog
        open={confirmOpen}
        title="Are you sure you want to submit this collection report?"
        description="If you continue, the system will save it and update the status."
        confirmText="Submit"
        cancelText="Cancel"
        confirmDisabled={submitting}
        confirmClassName="bg-green-600 hover:bg-green-700 text-white"
        onClose={() => {
          if (submitting) return
          setConfirmOpen(false)
          setPendingPayload(null)
        }}
        onConfirm={handleSubmitConfirmed}
      />
    </div>
    ,
    document.body
  )
}
