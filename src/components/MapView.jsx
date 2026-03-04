import { useEffect } from 'react'
import {
  MapContainer, TileLayer, Marker, Polyline,
  Tooltip, useMapEvents, useMap,
} from 'react-leaflet'
import L from 'leaflet'
import { SAMPLE_ROUTES, TYPE_COLORS } from '../data/sampleData'

const PH_BOUNDS = [[4.5, 116.0], [21.5, 126.5]]

// Build a colored SVG pin per vehicle type
function buildIcon(type) {
  const color = TYPE_COLORS[type] || '#E74C3C'
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 41" width="25" height="41">
    <path d="M12.5 0C5.6 0 0 5.6 0 12.5c0 9.4 12.5 28.5 12.5 28.5S25 21.9 25 12.5C25 5.6 19.4 0 12.5 0z" fill="${color}" stroke="white" stroke-width="1.5"/>
    <circle cx="12.5" cy="12.5" r="4.5" fill="white"/>
  </svg>`
  return L.divIcon({
    html: svg,
    className: '',
    iconSize:   [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  })
}

// Pending pin (grey) shown while user hasn't submitted yet
const pendingIcon = L.divIcon({
  html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 41" width="25" height="41">
    <path d="M12.5 0C5.6 0 0 5.6 0 12.5c0 9.4 12.5 28.5 12.5 28.5S25 21.9 25 12.5C25 5.6 19.4 0 12.5 0z" fill="#666" stroke="white" stroke-width="1.5" stroke-dasharray="3 2"/>
    <circle cx="12.5" cy="12.5" r="4.5" fill="white"/>
  </svg>`,
  className: '',
  iconSize:   [25, 41],
  iconAnchor: [12, 41],
})

// Handles map click events
function ClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) { onMapClick(e.latlng) },
  })
  return null
}

// Smoothly flies to a search result
function FlyToHandler({ flyTo }) {
  const map = useMap()
  useEffect(() => {
    if (flyTo) map.flyTo([flyTo.lat, flyTo.lng], 14, { duration: 1.5 })
  }, [flyTo, map])
  return null
}

export default function MapView({ markers, onMarkerClick, onMapClick, flyTo, addingMode, pendingLatLng }) {
  return (
    <MapContainer
      bounds={PH_BOUNDS}
      style={{ height: '100%', width: '100%' }}
      zoomControl={true}
      attributionControl={true}
    >
      <TileLayer
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors'
        maxZoom={19}
      />

      {/* Sample polyline routes */}
      {SAMPLE_ROUTES.map(route => (
        <Polyline
          key={route.id}
          positions={route.positions}
          color={route.color}
          weight={route.weight}
          dashArray={route.dash}
          opacity={0.8}
        >
          <Tooltip sticky direction="top">{route.label}</Tooltip>
        </Polyline>
      ))}

      {/* Markers */}
      {markers.map(marker => (
        <Marker
          key={marker.id}
          position={[marker.lat, marker.lng]}
          icon={buildIcon(marker.type)}
          eventHandlers={{ click: () => onMarkerClick(marker) }}
        />
      ))}

      {/* Ghost pin while adding */}
      {addingMode && pendingLatLng && (
        <Marker
          position={[pendingLatLng.lat, pendingLatLng.lng]}
          icon={pendingIcon}
        />
      )}

      <ClickHandler onMapClick={onMapClick} />
      <FlyToHandler flyTo={flyTo} />
    </MapContainer>
  )
}
