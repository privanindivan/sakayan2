import { useEffect } from 'react'
import ImageCarousel from './ImageCarousel'
import { TYPE_COLORS } from '../data/sampleData'

export default function MarkerModal({ marker, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const badgeColor = TYPE_COLORS[marker.type] || '#1a73e8'

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">&#x2715;</button>

        <ImageCarousel images={marker.images} />

        <div className="modal-body">
          <span className="vehicle-badge" style={{ background: badgeColor }}>
            {marker.type}
          </span>
          <h2>{marker.name}</h2>
          <p className="coords-text">
            {marker.lat.toFixed(5)}, {marker.lng.toFixed(5)}
          </p>
          <button
            className="edit-btn"
            onClick={() => console.log('edit mode', marker)}
          >
            &#9998; Edit
          </button>
        </div>
      </div>
    </div>
  )
}
