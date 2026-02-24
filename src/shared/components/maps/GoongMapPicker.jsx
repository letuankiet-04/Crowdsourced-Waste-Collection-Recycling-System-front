import { useCallback, useEffect, useRef } from 'react'
import goongjs from '@goongmaps/goong-js'

const HCMC_CENTER = { lat: 10.8231, lng: 106.6297 }
const DEFAULT_ZOOM = 13
const GOONG_STYLE_URL = 'https://tiles.goong.io/assets/goong_map_web.json'

export default function GoongMapPicker({ value, onChange }) {
  const mapContainerRef = useRef(null)
  const mapRef = useRef(null)
  const markerRef = useRef(null)
  const onChangeRef = useRef(onChange)
  const valueRef = useRef(value)

  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  useEffect(() => {
    valueRef.current = value
  }, [value])

  const notifyChange = useCallback((coords) => {
    onChangeRef.current?.(coords)
  }, [])

  const token = import.meta.env.VITE_GOONG_MAPTILES_KEY

  const lat = value?.lat ?? null
  const lng = value?.lng ?? null

  useEffect(() => {
    if (!token) return
    if (!mapContainerRef.current) return
    if (mapRef.current) return

    goongjs.accessToken = token

    const initialValue = valueRef.current
    const initialLat = initialValue?.lat ?? null
    const initialLng = initialValue?.lng ?? null
    const initial = initialLat != null && initialLng != null ? { lat: initialLat, lng: initialLng } : HCMC_CENTER

    const map = new goongjs.Map({
      container: mapContainerRef.current,
      style: GOONG_STYLE_URL,
      center: [initial.lng, initial.lat],
      zoom: DEFAULT_ZOOM,
    })

    map.addControl(new goongjs.NavigationControl(), 'top-right')

    map.on('click', (e) => {
      notifyChange({ lat: e.lngLat.lat, lng: e.lngLat.lng })
    })

    mapRef.current = map

    return () => {
      markerRef.current?.remove()
      markerRef.current = null
      map.remove()
      mapRef.current = null
    }
  }, [token, notifyChange])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    if (lat == null || lng == null) {
      markerRef.current?.remove()
      markerRef.current = null
      return
    }

    if (!markerRef.current) {
      markerRef.current = new goongjs.Marker().setLngLat([lng, lat]).addTo(map)
    } else {
      markerRef.current.setLngLat([lng, lat])
    }

    map.easeTo({ center: [lng, lat] })
  }, [lat, lng])

  return (
    <div className="space-y-3">
      <div className="text-sm text-gray-600">
        {lat != null && lng != null ? `Selected: ${lat.toFixed(5)}, ${lng.toFixed(5)}` : 'Click on the map to select a location'}
      </div>

      {!token ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Missing VITE_GOONG_MAPTILES_KEY. Add it to your .env file and restart the dev server.
        </div>
      ) : (
        <div style={{ height: 360, width: '100%', borderRadius: '12px', overflow: 'hidden' }}>
          <div ref={mapContainerRef} style={{ height: '100%', width: '100%' }} />
        </div>
      )}
    </div>
  )
}

