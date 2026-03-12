import { useState, useCallback, useEffect } from 'react'
import MapView         from './components/MapView'
import SearchBar       from './components/SearchBar'
import AddMarkerForm   from './components/AddMarkerForm'
import MarkerModal     from './components/MarkerModal'
import DirectionPanel  from './components/DirectionPanel'
import RoutePanel      from './components/RoutePanel'
import PinModal        from './components/PinModal'
import { useAdminAuth } from './hooks/useAdminAuth'
import { INITIAL_MARKERS } from './data/sampleData'

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch { return fallback }
}

function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* quota exceeded */ }
}

export default function App() {
  const [markers,        setMarkers]        = useState(() => load('sakayan_markers',     INITIAL_MARKERS))
  const [connections,    setConnections]    = useState(() => load('sakayan_connections', []))
  const [selectedMarker, setSelectedMarker] = useState(null)
  const [pendingLatLng,  setPendingLatLng]  = useState(null)
  const [showForm,       setShowForm]       = useState(false)
  const [fromPoint,      setFromPoint]      = useState(null)
  const [toPoint,        setToPoint]        = useState(null)
  const [userLocation,   setUserLocation]   = useState(null)
  const [locating,       setLocating]       = useState(false)
  const [connectingFrom, setConnectingFrom] = useState(null)
  const [flyTarget,      setFlyTarget]      = useState(null)
  const [searchResetKey, setSearchResetKey] = useState(0)

  // Manual route builder
  const [routeMode,  setRouteMode]  = useState(false)
  const [routeStops, setRouteStops] = useState([])

  // Admin PIN
  const { isAdmin, requireAdmin, showPinModal, onPinSuccess, onPinCancel } = useAdminAuth()

  // Auto-save whenever data changes
  useEffect(() => { save('sakayan_markers',     markers)     }, [markers])
  useEffect(() => { save('sakayan_connections', connections) }, [connections])

  // Auto-clear flyTarget after fly animation completes
  useEffect(() => {
    if (!flyTarget) return
    const t = setTimeout(() => setFlyTarget(null), 1500)
    return () => clearTimeout(t)
  }, [flyTarget])

  const handleRoute = useCallback((from, to) => {
    setFromPoint(from)
    setToPoint(to)
  }, [])

  const handleMapClick = useCallback((latlng) => {
    if (showForm) setPendingLatLng(latlng)
  }, [showForm])

  const handleConnect = useCallback((fromId, toId) => {
    if (fromId === toId) return
    setConnections(prev => {
      const exists = prev.some(c =>
        (c.fromId === fromId && c.toId === toId) ||
        (c.fromId === toId   && c.toId === fromId)
      )
      if (exists) return prev
      return [...prev, { id: `${fromId}-${toId}`, fromId, toId }]
    })
  }, [])

  const handleDisconnect = useCallback((fromId, toId) => {
    setConnections(prev => prev.filter(c =>
      !((c.fromId === fromId && c.toId === toId) ||
        (c.fromId === toId   && c.toId === fromId))
    ))
  }, [])

  const handleRemoveConnection = useCallback((connId) => {
    setConnections(prev => prev.filter(c => c.id !== connId))
  }, [])

  const handleStartConnect = useCallback((markerId) => {
    setConnectingFrom(markerId)
    setSelectedMarker(null)
  }, [])

  const handleCancelConnect = useCallback(() => {
    setConnectingFrom(null)
  }, [])

  const handleMarkerClick = useCallback((marker) => {
    if (showForm) return

    // Route-building mode: tap stops to add them in order
    if (routeMode) {
      setRouteStops(prev => {
        // Avoid duplicate consecutive stop
        if (prev.length > 0 && prev[prev.length - 1].id === marker.id) return prev
        return [...prev, marker]
      })
      return
    }

    if (connectingFrom !== null) {
      if (connectingFrom !== marker.id) handleConnect(connectingFrom, marker.id)
      setConnectingFrom(null)
      return
    }
    setSelectedMarker(marker)
  }, [showForm, routeMode, connectingFrom, handleConnect])

  const handleAddMarker = (data) => {
    setMarkers(prev => [...prev, { id: Date.now(), ...data }])
    setShowForm(false)
    setPendingLatLng(null)
  }

  const handleCancelForm = () => {
    setShowForm(false)
    setPendingLatLng(null)
  }

  const handleLocate = () => {
    if (!navigator.geolocation) return
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setLocating(false)
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }

  const toggleRouteMode = () => {
    if (routeMode) {
      setRouteMode(false)
      setRouteStops([])
    } else {
      setRouteMode(true)
      // Close any open panels when entering route mode
      setSelectedMarker(null)
      setConnectingFrom(null)
    }
  }

  return (
    <div className="app">
      <SearchBar onRoute={handleRoute} onFlyTo={(t) => setFlyTarget(t)} markers={markers} resetKey={searchResetKey} />

      <MapView
        markers={markers}
        connections={connections}
        connectingFrom={connectingFrom}
        onMarkerClick={handleMarkerClick}
        onMapClick={handleMapClick}
        onRemoveConnection={handleRemoveConnection}
        onCancelConnect={handleCancelConnect}
        fromPoint={fromPoint}
        toPoint={toPoint}
        userLocation={userLocation}
        flyTarget={flyTarget}
        addingMode={showForm}
        pendingLatLng={pendingLatLng}
        routeMode={routeMode}
        routeStops={routeStops}
        onCancelRouteMode={() => { setRouteMode(false); setRouteStops([]) }}
      />

      {/* Corner buttons */}
      <div className="corner-btns">
        <button
          className="icon-btn locate-btn"
          onClick={handleLocate}
          aria-label="My location"
          title="My location"
        >
          {locating ? '…' : '◎'}
        </button>
        <button
          className={`icon-btn route-mode-btn${routeMode ? ' route-mode-active' : ''}`}
          onClick={toggleRouteMode}
          aria-label="Build route"
          title="Build route"
        >
          ↗
        </button>
        <button
          className={`icon-btn fab-btn ${showForm ? 'fab-cancel' : ''}`}
          onClick={() => {
            if (showForm) handleCancelForm()
            else requireAdmin(() => {
              setShowForm(true)
              setPendingLatLng(null)
              setConnectingFrom(null)
            })
          }}
          aria-label={showForm ? 'Cancel' : 'Add stop'}
        >
          {showForm ? '✕' : '+'}
        </button>
      </div>

      {showForm && (
        <AddMarkerForm
          pendingLatLng={pendingLatLng}
          onSubmit={handleAddMarker}
          onCancel={handleCancelForm}
        />
      )}

      {fromPoint && toPoint && (
        <DirectionPanel
          fromPoint={fromPoint}
          toPoint={toPoint}
          markers={markers}
          connections={connections}
          onClose={() => { setFromPoint(null); setToPoint(null); setSearchResetKey(k => k + 1) }}
          onMarkerSelect={(m) => setSelectedMarker(m)}
        />
      )}

      {routeMode && routeStops.length >= 1 && (
        <RoutePanel
          stops={routeStops}
          onRemoveStop={(i) => setRouteStops(prev => prev.filter((_, idx) => idx !== i))}
          onClear={() => setRouteStops([])}
          onClose={() => { setRouteMode(false); setRouteStops([]) }}
        />
      )}

      {selectedMarker && (
        <MarkerModal
          marker={selectedMarker}
          allMarkers={markers}
          connections={connections}
          isAdmin={isAdmin}
          requireAdmin={requireAdmin}
          onClose={() => setSelectedMarker(null)}
          onSave={(updated) => {
            setMarkers(prev => prev.map(m => m.id === updated.id ? updated : m))
            setSelectedMarker(updated)
          }}
          onDisconnect={handleDisconnect}
          onStartConnect={handleStartConnect}
        />
      )}

      {showPinModal && (
        <PinModal onSuccess={onPinSuccess} onCancel={onPinCancel} />
      )}
    </div>
  )
}
