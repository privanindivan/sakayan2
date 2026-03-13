import { useState } from 'react'

export default function RoutePickerSheet({ fromStop, toStop, existingRouteNames, onConfirm, onCancel }) {
  const [input, setInput] = useState('')

  const handleConfirm = (name) => {
    const trimmed = (name || input).trim()
    if (!trimmed) return
    onConfirm(trimmed)
  }

  return (
    <div className="route-picker-overlay" onClick={onCancel}>
      <div className="route-picker-sheet" onClick={e => e.stopPropagation()}>
        <div className="route-picker-header">
          <span className="route-picker-title">Which route line is this?</span>
          <button className="route-picker-close" onClick={onCancel}>✕</button>
        </div>

        <p className="route-picker-stops">
          <span className="rp-stop">{fromStop?.name ?? '…'}</span>
          <span className="rp-arrow"> → </span>
          <span className="rp-stop">{toStop?.name ?? '…'}</span>
        </p>

        {/* Existing route names as quick-pick chips */}
        {existingRouteNames.length > 0 && (
          <div className="route-picker-chips">
            {existingRouteNames.map(name => (
              <button
                key={name}
                className="route-picker-chip"
                onClick={() => handleConfirm(name)}
              >
                {name}
              </button>
            ))}
          </div>
        )}

        {/* New route name input */}
        <div className="route-picker-input-row">
          <input
            className="route-picker-input"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleConfirm()}
            placeholder={existingRouteNames.length ? 'Or type a new route name…' : 'e.g. Jeepney 22B, Bus 5…'}
            autoFocus
          />
          <button
            className="route-picker-add"
            onClick={() => handleConfirm()}
            disabled={!input.trim()}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  )
}
