import { useState, useEffect } from 'react'
import { VEHICLE_TYPES } from '../data/sampleData'

export default function AddMarkerForm({ pendingLatLng, onSubmit, onCancel }) {
  const [name, setName] = useState('')
  const [type, setType] = useState(VEHICLE_TYPES[0])
  const [lat,  setLat]  = useState('')
  const [lng,  setLng]  = useState('')

  useEffect(() => {
    if (pendingLatLng) {
      setLat(pendingLatLng.lat.toFixed(6))
      setLng(pendingLatLng.lng.toFixed(6))
    }
  }, [pendingLatLng])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim() || !lat || !lng) return
    onSubmit({
      name: name.trim(),
      type,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      images: [
        `https://placehold.co/480x240/888888/white?text=${encodeURIComponent(type)}+Photo+1`,
        `https://placehold.co/480x240/888888/white?text=${encodeURIComponent(type)}+Photo+2`,
        `https://placehold.co/480x240/888888/white?text=${encodeURIComponent(type)}+Photo+3`,
      ],
    })
    setName('')
    setLat('')
    setLng('')
  }

  return (
    <div className="add-form">
      <div className="add-form-header">
        <h3>Add Stop / Route</h3>
        <button className="form-close" onClick={onCancel} aria-label="Close">&#x2715;</button>
      </div>
      <p className="hint">&#128205; Tap the map to pin location</p>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Name (e.g. Quiapo Terminal)"
          value={name}
          onChange={e => setName(e.target.value)}
          autoComplete="off"
          required
        />

        <select value={type} onChange={e => setType(e.target.value)}>
          {VEHICLE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        <div className="coords-row">
          <input
            type="text"
            inputMode="decimal"
            placeholder="Latitude"
            value={lat}
            onChange={e => setLat(e.target.value)}
            readOnly={!!pendingLatLng}
            required
          />
          <input
            type="text"
            inputMode="decimal"
            placeholder="Longitude"
            value={lng}
            onChange={e => setLng(e.target.value)}
            readOnly={!!pendingLatLng}
            required
          />
        </div>

        {!pendingLatLng && (
          <p className="hint" style={{ marginBottom: 8 }}>No pin yet — tap the map first</p>
        )}

        <button type="submit" className="btn-primary" disabled={!pendingLatLng}>
          Add Marker
        </button>
      </form>
    </div>
  )
}
