import { useCallback } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import markerIconPng from 'leaflet/dist/images/marker-icon.png'
import markerShadowPng from 'leaflet/dist/images/marker-shadow.png'

const markerIcon = new L.Icon({
  iconUrl: markerIconPng,
  shadowUrl: markerShadowPng,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  shadowSize: [41, 41],
})

const HCMC_CENTER = { lat: 10.8231, lng: 106.6297 }

function ClickHandler({ onSelect }) {
  useMapEvents({
    click(e) {
      onSelect({ lat: e.latlng.lat, lng: e.latlng.lng })
    },
    locationfound(e) {
      onSelect({ lat: e.latlng.lat, lng: e.latlng.lng })
    },
  })
  return null
}

export default function MapPicker({ value, onChange }) {

  const setAndNotify = useCallback(
    (coords) => {
      if (onChange) onChange(coords)
    },
    [onChange]
  )

  const selected = value ?? null

  return (
    <div className="space-y-3">
      <div className="text-sm text-gray-600">
        {selected
          ? `Selected: ${selected.lat.toFixed(5)}, ${selected.lng.toFixed(5)}`
          : 'Click on the map to select a location'}
      </div>

      <MapContainer
        center={selected ?? HCMC_CENTER}
        zoom={13}
        scrollWheelZoom
        style={{ height: 360, width: '100%', borderRadius: '12px' }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler onSelect={setAndNotify} />
        {selected && <Marker position={selected} icon={markerIcon} />}
      </MapContainer>
    </div>
  )
}
