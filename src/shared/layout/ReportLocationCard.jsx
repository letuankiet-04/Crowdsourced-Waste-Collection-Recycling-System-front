import { useEffect, useState } from 'react'
import { Card, CardBody, CardHeader, CardTitle } from '../ui/Card.jsx'
import GoongMapView from '../components/maps/GoongMapView.jsx'

const reverseGeocodeCache = new Map()

function formatCoords(coords) {
  const lat = Number(coords?.lat)
  const lng = Number(coords?.lng)
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return ''
  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`
}

async function reverseGeocodeAddress(coords) {
  const lat = Number(coords?.lat)
  const lng = Number(coords?.lng)
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
  const key = `${lat.toFixed(6)},${lng.toFixed(6)}`
  if (reverseGeocodeCache.has(key)) return reverseGeocodeCache.get(key) || null
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(
      lat
    )}&lon=${encodeURIComponent(lng)}`
    const res = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'Accept-Language': 'vi',
      },
    })
    const data = await res.json()
    const name = typeof data?.display_name === 'string' ? data.display_name.trim() : ''
    reverseGeocodeCache.set(key, name || '')
    return name || null
  } catch {
    reverseGeocodeCache.set(key, '')
    return null
  }
}

export default function ReportLocationCard({ reportedAddress, reportedCoords, collectedAddress, collectedCoords }) {
  const showCollected = Boolean(collectedCoords) || (typeof collectedAddress === 'string' && collectedAddress.trim())
  const points = [
    reportedCoords ? { coords: reportedCoords, label: 'Reported location' } : null,
    collectedCoords ? { coords: collectedCoords, label: 'Collected location' } : null,
  ].filter(Boolean)
  const showMap = points.length > 0
  const reportedText = typeof reportedAddress === 'string' ? reportedAddress.trim() : ''
  const collectedText = typeof collectedAddress === 'string' ? collectedAddress.trim() : ''
  const reportedLat = Number(reportedCoords?.lat)
  const reportedLng = Number(reportedCoords?.lng)
  const collectedLat = Number(collectedCoords?.lat)
  const collectedLng = Number(collectedCoords?.lng)
  const reportedKey =
    Number.isFinite(reportedLat) && Number.isFinite(reportedLng) ? `${reportedLat.toFixed(6)},${reportedLng.toFixed(6)}` : ''
  const collectedKey =
    Number.isFinite(collectedLat) && Number.isFinite(collectedLng) ? `${collectedLat.toFixed(6)},${collectedLng.toFixed(6)}` : ''
  const [reportedResolved, setReportedResolved] = useState({ key: '', value: null })
  const [collectedResolved, setCollectedResolved] = useState({ key: '', value: null })
  const reportedResolvedHit = reportedResolved?.key === reportedKey ? reportedResolved.value : null
  const collectedResolvedHit = collectedResolved?.key === collectedKey ? collectedResolved.value : null
  const reportedFallback = reportedText || (reportedCoords ? formatCoords(reportedCoords) : '-')
  const collectedFallback = collectedText || (collectedCoords ? formatCoords(collectedCoords) : '-')
  const displayReported = reportedText || reportedResolvedHit || reportedFallback
  const displayCollected = collectedText || collectedResolvedHit || collectedFallback

  useEffect(() => {
    let cancelled = false
    if (reportedText) return () => void (cancelled = true)
    if (!reportedKey) return () => void (cancelled = true)
    void (async () => {
      const [latStr, lngStr] = reportedKey.split(',')
      const addr = await reverseGeocodeAddress({ lat: Number(latStr), lng: Number(lngStr) })
      if (cancelled) return
      if (addr) setReportedResolved({ key: reportedKey, value: addr })
    })()
    return () => {
      cancelled = true
    }
  }, [reportedKey, reportedText])

  useEffect(() => {
    let cancelled = false
    if (collectedText) return () => void (cancelled = true)
    if (!collectedKey) return () => void (cancelled = true)
    void (async () => {
      const [latStr, lngStr] = collectedKey.split(',')
      const addr = await reverseGeocodeAddress({ lat: Number(latStr), lng: Number(lngStr) })
      if (cancelled) return
      if (addr) setCollectedResolved({ key: collectedKey, value: addr })
    })()
    return () => {
      cancelled = true
    }
  }, [collectedKey, collectedText])

  return (
    <Card>
      <CardHeader className="py-6 px-8">
        <CardTitle className="text-2xl">Location</CardTitle>
      </CardHeader>
      <CardBody className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Reported Address</div>
            <div className="mt-1 text-gray-900">{displayReported || '-'}</div>
          </div>

          {showCollected ? (
            <>
              <div className="md:col-span-2 border-t border-gray-100 pt-6" />
              <div className="md:col-span-2">
                <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Collected Address</div>
                <div className="mt-1 text-gray-900">{displayCollected || '-'}</div>
              </div>
            </>
          ) : null}

          {showMap ? (
            <>
              <div className="md:col-span-2 border-t border-gray-100 pt-6" />
              <div className="md:col-span-2">
                <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Map</div>
                <div className="mt-3 overflow-hidden rounded-2xl border border-gray-200">
                  <GoongMapView points={points} />
                </div>
              </div>
            </>
          ) : null}
        </div>
      </CardBody>
    </Card>
  )
}
