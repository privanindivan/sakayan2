import { TYPE_COLORS } from '../data/sampleData'

// Haversine distance in km
function haversineKm(a, b) {
  const R = 6371
  const dLat = (b.lat - a.lat) * Math.PI / 180
  const dLng = (b.lng - a.lng) * Math.PI / 180
  const sinLat = Math.sin(dLat / 2)
  const sinLng = Math.sin(dLng / 2)
  const c = sinLat * sinLat + Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) * sinLng * sinLng
  return R * 2 * Math.atan2(Math.sqrt(c), Math.sqrt(1 - c))
}

// Philippine fare rates (2024 LTFRB)
function fareEstimate(type, km) {
  if (type === 'Jeep' || type === 'UV Express') {
    return km <= 4 ? 13 : 13 + Math.ceil(km - 4) * 1.80
  }
  if (type === 'Bus') {
    return km <= 5 ? 15 : 15 + Math.ceil(km - 5) * 2.65
  }
  if (type === 'Tricycle') {
    return km <= 2 ? 10 : 10 + Math.ceil(km - 2) * 5
  }
  return null // Train: zone-based, can't calculate from distance alone
}

// Average speed in PH traffic (km/h)
function avgSpeed(type) {
  if (type === 'Train')      return 40
  if (type === 'UV Express') return 30
  if (type === 'Bus')        return 25
  return 20 // Jeep, Tricycle
}

function fmtTime(minutes) {
  if (minutes < 60) return `${Math.round(minutes)} min`
  const h = Math.floor(minutes / 60)
  const m = Math.round(minutes % 60)
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

export default function RoutePanel({ stops, onRemoveStop, onClear, onClose }) {
  if (stops.length === 0) return null

  const segments = []
  let totalFare    = 0
  let totalMinutes = 0
  let totalKm      = 0
  let fareKnown    = true

  for (let i = 0; i < stops.length - 1; i++) {
    const from = stops[i]
    const to   = stops[i + 1]
    const km   = haversineKm(from, to)
    const fare = fareEstimate(from.type, km)
    const mins = (km / avgSpeed(from.type)) * 60

    totalKm      += km
    totalMinutes += mins
    if (fare !== null) totalFare += fare
    else fareKnown = false

    segments.push({ from, to, km, fare, mins })
  }

  return (
    <div className="dir-panel">
      <div className="dir-drag-handle" />

      <div className="dir-header">
        <span className="dir-route-title">Planned route</span>
        <button className="dir-close" onClick={onClose} aria-label="Close">&#x2715;</button>
      </div>

      <div className="dir-steps">
        {stops.map((stop, i) => (
          <div key={`${stop.id}-${i}`} className="route-stop-row">
            <span
              className="route-stop-num"
              style={{ background: TYPE_COLORS[stop.type] || '#888' }}
            >
              {i + 1}
            </span>
            <div className="route-stop-info">
              <span className="route-stop-name">{stop.name}</span>
              {segments[i] && (
                <span className="route-seg-detail">
                  {segments[i].km.toFixed(1)} km
                  {segments[i].fare !== null ? ` · ₱${Math.round(segments[i].fare)}` : ''}
                  {` · ${fmtTime(segments[i].mins)}`}
                </span>
              )}
            </div>
            <button
              className="connect-remove"
              onClick={() => onRemoveStop(i)}
              aria-label="Remove stop"
            >&#x2715;</button>
          </div>
        ))}
      </div>

      {stops.length >= 2 && (
        <div className="route-summary">
          <div className="route-summary-row">
            <span>Total distance</span>
            <span>{totalKm.toFixed(1)} km</span>
          </div>
          <div className="route-summary-row">
            <span>Est. travel time</span>
            <span>{fmtTime(totalMinutes)}</span>
          </div>
          <div className="route-summary-row route-fare-row">
            <span>Est. fare</span>
            <span>
              {fareKnown
                ? `₱${Math.round(totalFare)}`
                : totalFare > 0 ? `₱${Math.round(totalFare)}+` : '—'}
            </span>
          </div>
        </div>
      )}

      <button className="btn-cancel-edit route-clear-btn" onClick={onClear}>
        Clear route
      </button>
    </div>
  )
}
