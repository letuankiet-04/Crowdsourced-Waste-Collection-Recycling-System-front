import { useCallback, useEffect, useMemo, useRef } from 'react'
import goongjs from '@goongmaps/goong-js'

const HCMC_CENTER = { lat: 10.8231, lng: 106.6297 }
const DEFAULT_ZOOM = 13
const GOONG_STYLE_URL = 'https://tiles.goong.io/assets/goong_map_web.json'

export default function GoongMapView({ points, height = 320 }) {
  const mapContainerRef = useRef(null)
  const mapRef = useRef(null)
  const markersRef = useRef([])

  const safePoints = useMemo(() => {
    const list = Array.isArray(points) ? points : []
    return list
      .map((p) => {
        const lat = typeof p?.coords?.lat === 'number' ? p.coords.lat : Number(p?.coords?.lat)
        const lng = typeof p?.coords?.lng === 'number' ? p.coords.lng : Number(p?.coords?.lng)
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
        return { coords: { lat, lng }, label: p?.label ? String(p.label) : '' }
      })
      .filter(Boolean)
  }, [points])

  const token = import.meta.env.VITE_GOONG_MAPTILES_KEY

  const resetView = useCallback(() => {
    const map = mapRef.current
    if (!map) return
    if (!safePoints.length) return

    if (safePoints.length === 1) {
      const p = safePoints[0]
      map.easeTo({ center: [p.coords.lng, p.coords.lat], zoom: 15, bearing: 0, pitch: 0 })
      return
    }

    const bounds = new goongjs.LngLatBounds()
    safePoints.forEach((p) => bounds.extend([p.coords.lng, p.coords.lat]))
    map.fitBounds(bounds, { padding: 40, animate: true, bearing: 0, pitch: 0 })
  }, [safePoints])

  useEffect(() => {
    if (!token) return
    if (!mapContainerRef.current) return
    if (mapRef.current) return

    goongjs.accessToken = token

    const first = safePoints[0]?.coords ?? HCMC_CENTER

    const map = new goongjs.Map({
      container: mapContainerRef.current,
      style: GOONG_STYLE_URL,
      center: [first.lng, first.lat],
      zoom: DEFAULT_ZOOM,
    })

    map.addControl(new goongjs.NavigationControl(), 'top-right')
    map.scrollZoom.disable()

    mapRef.current = map

    return () => {
      markersRef.current.forEach((m) => m?.remove?.())
      markersRef.current = []
      map.remove()
      mapRef.current = null
    }
  }, [token, safePoints])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    markersRef.current.forEach((m) => m?.remove?.())
    markersRef.current = []

    safePoints.forEach((p) => {
      const marker = new goongjs.Marker().setLngLat([p.coords.lng, p.coords.lat])
      if (p.label) {
        const popup = new goongjs.Popup({ closeButton: false, closeOnClick: false }).setText(p.label)
        marker.setPopup(popup)
      }
      marker.addTo(map)
      markersRef.current.push(marker)
    })

    if (!safePoints.length) return

    if (safePoints.length === 1) {
      const p = safePoints[0]
      map.easeTo({ center: [p.coords.lng, p.coords.lat], zoom: 15 })
      return
    }

    const bounds = new goongjs.LngLatBounds()
    safePoints.forEach((p) => bounds.extend([p.coords.lng, p.coords.lat]))
    map.fitBounds(bounds, { padding: 40, animate: true })
  }, [safePoints])

  if (!token) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        Missing VITE_GOONG_MAPTILES_KEY. Add it to your .env file and restart the dev server.
      </div>
    )
  }

  return (
    <div className="relative" style={{ height, width: '100%', overflow: 'hidden' }}>
      <div ref={mapContainerRef} style={{ height: '100%', width: '100%' }} />
      {safePoints.length ? (
        <button
          type="button"
          className="absolute left-3 top-3 rounded-xl border border-gray-200 bg-white/95 px-3 py-1.5 text-xs font-semibold text-gray-800 shadow-sm hover:bg-white"
          onClick={resetView}
        >
          Reset
        </button>
      ) : null}
    </div>
  )
}
