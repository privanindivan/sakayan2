import { useEffect, useState, useRef } from 'react'
import ImageCarousel from './ImageCarousel'
import { TYPE_COLORS, VEHICLE_TYPES } from '../data/sampleData'

export default function MarkerModal({ marker, onClose, onSave }) {
  const [editing, setEditing] = useState(false)
  const [name,    setName]    = useState(marker.name)
  const [type,    setType]    = useState(marker.type)
  const [details, setDetails] = useState(marker.details || '')
  const [images,  setImages]  = useState(marker.images)
  const fileInputRef = useRef(null)

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  // Read picked files as base64 and append to images
  const handleFilePick = (e) => {
    const files = Array.from(e.target.files)
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = (ev) => {
        setImages(prev => [...prev, ev.target.result])
      }
      reader.readAsDataURL(file)
    })
    // reset input so same file can be re-picked
    e.target.value = ''
  }

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSave = () => {
    if (!name.trim()) return
    onSave({ ...marker, name: name.trim(), type, details: details.trim(), images })
    setEditing(false)
  }

  const handleCancel = () => {
    setName(marker.name)
    setType(marker.type)
    setDetails(marker.details || '')
    setImages(marker.images)
    setEditing(false)
  }

  const badgeColor = TYPE_COLORS[type] || '#1a73e8'

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">&#x2715;</button>

        {/* Carousel always visible — shows current images */}
        <ImageCarousel images={images} />

        <div className="modal-body">
          {editing ? (
            <>
              <label className="edit-label">Name</label>
              <input
                className="edit-field"
                value={name}
                onChange={e => setName(e.target.value)}
                autoFocus
                placeholder="Stop or route name"
              />

              <label className="edit-label">Vehicle type</label>
              <select
                className="edit-field"
                value={type}
                onChange={e => setType(e.target.value)}
              >
                {VEHICLE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>

              <label className="edit-label">Details</label>
              <textarea
                className="edit-field edit-textarea"
                value={details}
                onChange={e => setDetails(e.target.value)}
                placeholder="Routes, schedule, fare, notes…"
                rows={3}
              />

              <label className="edit-label">Photos</label>
              <div className="photo-grid">
                {images.map((src, i) => (
                  <div key={i} className="photo-thumb">
                    <img src={src} alt={`photo ${i + 1}`} />
                    <button
                      className="photo-remove"
                      onClick={() => removeImage(i)}
                      aria-label="Remove photo"
                    >&#x2715;</button>
                  </div>
                ))}

                {/* Upload button */}
                <button
                  className="photo-add"
                  onClick={() => fileInputRef.current?.click()}
                  aria-label="Add photo"
                >
                  <span>+</span>
                  <span className="photo-add-label">Add</span>
                </button>
              </div>

              {/* Hidden file input — accept images, allow camera on mobile */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                style={{ display: 'none' }}
                onChange={handleFilePick}
              />

              <p className="coords-text" style={{ marginTop: 12 }}>
                {marker.lat.toFixed(5)}, {marker.lng.toFixed(5)}
              </p>

              <div className="edit-actions">
                <button className="btn-save" onClick={handleSave}>Save</button>
                <button className="btn-cancel-edit" onClick={handleCancel}>Cancel</button>
              </div>
            </>
          ) : (
            <>
              <span className="vehicle-badge" style={{ background: badgeColor }}>
                {type}
              </span>
              <h2>{name}</h2>
              <p className="coords-text">
                {marker.lat.toFixed(5)}, {marker.lng.toFixed(5)}
              </p>
              {details && (
                <p className="marker-details">{details}</p>
              )}
              <button className="edit-btn" onClick={() => setEditing(true)}>
                &#9998; Edit
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
