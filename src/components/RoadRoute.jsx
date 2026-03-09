import { useState, useEffect } from 'react'
import { Polyline, Tooltip, Popup } from 'react-leaflet'

// Double-layer polyline: white casing + colored line so routes pop against OSM tiles
function StyledRoute({ positions, color, label, dashed = false, onRemove }) {
  const dash = dashed ? '8 8' : undefined
  return (
    <>
      {/* White casing underneath */}
      <Polyline
        positions={positions}
        color="white"
        weight={9}
        opacity={0.9}
        dashArray={dash}
        interactive={false}
      />
      {/* Colored line on top — click opens remove popup */}
      <Polyline
        positions={positions}
        color={color}
        weight={5}
        opacity={1}
        dashArray={dash}
      >
        {label && <Tooltip sticky>{label}</Tooltip>}
        {onRemove && (
          <Popup className="remove-popup" closeButton={false}>
            <div className="popup-remove-wrap">
              {label && <span className="popup-route-label">{label}</span>}
              <button className="popup-remove-btn" onClick={onRemove}>
                Remove route
              </button>
            </div>
          </Popup>
        )}
      </Polyline>
    </>
  )
}

export default function RoadRoute({ route, onRemove }) {
  const [positions, setPositions] = useState(null)

  useEffect(() => {
    const coords = route.waypoints
      .map(([lat, lng]) => `${lng},${lat}`)
      .join(';')

    fetch(
      `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`
    )
      .then(r => r.json())
      .then(data => {
        const geom = data.routes?.[0]?.geometry?.coordinates
        setPositions(geom ? geom.map(([lng, lat]) => [lat, lng]) : route.waypoints)
      })
      .catch(() => setPositions(route.waypoints))
  }, [route.id]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!positions) {
    return (
      <StyledRoute
        positions={route.waypoints}
        color={route.color}
        label={route.label}
        dashed
      />
    )
  }

  return (
    <StyledRoute
      positions={positions}
      color={route.color}
      label={route.label}
      onRemove={onRemove}
    />
  )
}
