import { useState } from 'react'
import { TYPE_COLORS } from '../data/sampleData'

const ROUTE_COLORS = ['#4A90D9', '#FF6B35', '#27AE60', '#F39C12', '#8E44AD', '#E74C3C', '#1ABC9C']

// Consistent color for a route name based on its position among all unique names
function routeColor(routeName, allRouteNames) {
  const idx = allRouteNames.indexOf(routeName)
  return ROUTE_COLORS[(idx >= 0 ? idx : 0) % ROUTE_COLORS.length]
}

function dist(a, b) {
  return Math.hypot(a.lat - b.lat, a.lng - b.lng)
}

function findNearest(point, markers) {
  if (!markers.length) return null
  return markers.reduce((best, m) => dist(m, point) < dist(best, point) ? m : best)
}

// Build adjacency: stopId → [{ connId, neighborId, routeName }]
function buildAdjacency(connections) {
  const adj = {}
  for (const c of connections) {
    const name = c.routeName || ''
    if (!adj[c.fromId]) adj[c.fromId] = []
    if (!adj[c.toId])   adj[c.toId]   = []
    adj[c.fromId].push({ connId: c.id, neighborId: c.toId,   routeName: name })
    adj[c.toId].push(  { connId: c.id, neighborId: c.fromId, routeName: name })
  }
  return adj
}

// DFS — returns array of { stopIds, connNames[] }
// Two A→B connections with different routeNames → two distinct results
function findAllPaths(startId, endId, adj, maxDepth = 10) {
  const results      = []
  const visitedStops = new Set()
  const usedConns    = new Set()

  function dfs(current, stopPath, connNames) {
    if (stopPath.length > maxDepth) return
    if (current === endId) {
      results.push({ stopIds: [...stopPath], connNames: [...connNames] })
      return
    }
    const edges = adj[current]
    if (!edges) return
    for (const { connId, neighborId, routeName } of edges) {
      if (!usedConns.has(connId) && !visitedStops.has(neighborId)) {
        visitedStops.add(neighborId)
        usedConns.add(connId)
        stopPath.push(neighborId)
        connNames.push(routeName)
        dfs(neighborId, stopPath, connNames)
        stopPath.pop()
        connNames.pop()
        usedConns.delete(connId)
        visitedStops.delete(neighborId)
      }
    }
  }

  visitedStops.add(startId)
  dfs(startId, [startId], [])
  results.sort((a, b) => a.stopIds.length - b.stopIds.length)
  return results
}

function vehicleEmoji(type) {
  if (type === 'Train')    return '🚆'
  if (type === 'Bus')      return '🚌'
  if (type === 'Tricycle') return '🛺'
  return '🚐'
}

function pathLabel(connNames) {
  // If all connections on this path share a name, use that name
  const unique = [...new Set(connNames.filter(Boolean))]
  if (unique.length === 1) return unique[0]
  if (unique.length > 1)   return unique.join(' + ')
  return 'Route'
}

function pathFare(stops) {
  const fares = stops.slice(0, -1).map(s => s.fare).filter(f => f != null)
  if (!fares.length) return null
  return fares.reduce((a, b) => a + b, 0)
}

export default function DirectionPanel({ fromPoint, toPoint, markers, connections, onClose, onMarkerSelect }) {
  const [selectedIdx, setSelectedIdx] = useState(0)

  const nearFrom = findNearest(fromPoint, markers)
  const nearTo   = findNearest(toPoint,   markers)

  const adj      = buildAdjacency(connections)
  const allPaths = nearFrom && nearTo && nearFrom.id !== nearTo.id
    ? findAllPaths(nearFrom.id, nearTo.id, adj)
    : []

  // All unique route names across all connections (for consistent colors)
  const allRouteNames = [...new Set(connections.map(c => c.routeName).filter(Boolean))]

  // Build route objects
  const routes = allPaths.map(({ stopIds, connNames }) => {
    const label     = pathLabel(connNames)
    const firstName = connNames.find(Boolean) || ''
    const color     = routeColor(firstName, allRouteNames) || ROUTE_COLORS[0]
    return { stopIds, connNames, label, color }
  })

  const safeIdx = routes.length > 0 ? Math.min(selectedIdx, routes.length - 1) : 0
  const route   = routes[safeIdx] ?? null

  const steps = []
  if (route) {
    const stops = route.stopIds.map(id => markers.find(m => m.id === id)).filter(Boolean)
    steps.push({ kind: 'walk', label: `Walk to ${stops[0].name}` })
    for (let i = 0; i < stops.length - 1; i++) {
      const segColor = routeColor(route.connNames[i] || '', allRouteNames) || route.color
      steps.push({ kind: 'ride', from: stops[i], to: stops[i + 1], segColor, segName: route.connNames[i] })
    }
    steps.push({ kind: 'walk', label: `Walk to ${toPoint.name || 'destination'}` })
  }

  return (
    <div className="dir-panel">
      <div className="dir-drag-handle" />

      <div className="dir-header">
        <div className="dir-endpoints">
          <div className="dir-endpoint">
            <span className="dir-dot from-dot" />
            <span className="dir-endpoint-name">{fromPoint.name || 'Starting point'}</span>
          </div>
          <div className="dir-endpoint-line" />
          <div className="dir-endpoint">
            <span className="dir-dot to-dot" />
            <span className="dir-endpoint-name">{toPoint.name || 'Destination'}</span>
          </div>
        </div>
        <button className="dir-close" onClick={onClose} aria-label="Close">&#x2715;</button>
      </div>

      {nearFrom && nearTo && (
        <div className="dir-snap-row">
          <span className="dir-snap-stop" style={{ borderColor: TYPE_COLORS[nearFrom.type] || '#888' }}>
            {nearFrom.name}
          </span>
          <span className="dir-snap-arrow">→</span>
          <span className="dir-snap-stop" style={{ borderColor: TYPE_COLORS[nearTo.type] || '#888' }}>
            {nearTo.name}
          </span>
        </div>
      )}

      {routes.length > 0 && (
        <div className="route-count-label">
          {routes.length === 1 ? '1 route found' : `${routes.length} routes — tap to choose`}
        </div>
      )}

      {/* Route choice cards */}
      {routes.length > 1 && (
        <div className="route-options-row">
          {routes.map((r, i) => {
            const stops  = r.stopIds.map(id => markers.find(m => m.id === id)).filter(Boolean)
            const fare   = pathFare(stops)
            const active = safeIdx === i
            return (
              <button
                key={i}
                className={`route-option-card${active ? ' route-option-active' : ''}`}
                style={active ? { borderColor: r.color, background: r.color + '18' } : {}}
                onClick={() => setSelectedIdx(i)}
              >
                <span className="route-option-line-dot" style={{ background: r.color }} />
                <span className="route-option-num">{r.label}</span>
                <span className="route-option-stops">{r.stopIds.length - 1} hop{r.stopIds.length - 1 !== 1 ? 's' : ''}</span>
                {fare != null && <span className="route-option-fare">₱{Math.round(fare)}</span>}
              </button>
            )
          })}
        </div>
      )}

      <div className="dir-steps">
        {routes.length === 0 && (
          <p className="dir-no-route">No route found. Connect the stops to create one.</p>
        )}

        {route !== null && steps.map((step, i) =>
          step.kind === 'walk' ? (
            <div key={i} className="dir-step walk-step">
              <span className="dir-step-ico">🚶</span>
              <span className="dir-step-txt">{step.label}</span>
            </div>
          ) : (
            <div key={i} className="dir-step ride-step" onClick={() => onMarkerSelect?.(step.from)}>
              <span className="dir-step-ico ride-ico" style={{ background: step.segColor }}>
                {vehicleEmoji(step.from.type)}
              </span>
              <div className="dir-step-body">
                <span className="dir-ride-label" style={{ color: step.segColor }}>
                  {step.segName || step.from.type}
                  {step.from.fare != null && <span className="dir-step-fare"> · ₱{step.from.fare}</span>}
                </span>
                <span className="dir-ride-route">{step.from.name} → {step.to.name}</span>
              </div>
              <span className="dir-step-arrow">›</span>
            </div>
          )
        )}
      </div>
    </div>
  )
}
