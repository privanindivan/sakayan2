import { useState, useRef } from 'react'

export default function SearchBar({ onResult }) {
  const [query, setQuery]     = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const debounce = useRef(null)

  const search = async (q) => {
    if (!q.trim()) { setResults([]); return }
    setLoading(true)
    try {
      const res  = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&countrycodes=ph&limit=5`,
        { headers: { 'Accept-Language': 'en' } }
      )
      const data = await res.json()
      setResults(data)
    } catch (err) {
      console.error('Nominatim error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setQuery(e.target.value)
    clearTimeout(debounce.current)
    debounce.current = setTimeout(() => search(e.target.value), 400)
  }

  const handleSelect = (r) => {
    onResult({ lat: parseFloat(r.lat), lng: parseFloat(r.lon) })
    setQuery(r.display_name.split(',')[0])
    setResults([])
  }

  const handleClear = () => {
    setQuery('')
    setResults([])
  }

  return (
    <div className="search-bar">
      <div className="search-input-wrap">
        <span className="search-icon">&#128269;</span>
        <input
          type="text"
          placeholder="Search places in Philippines..."
          value={query}
          onChange={handleChange}
          autoComplete="off"
        />
        {query && (
          <button className="search-clear" onClick={handleClear} aria-label="Clear">&#x2715;</button>
        )}
      </div>

      {loading && <div className="search-loading">Searching...</div>}

      {results.length > 0 && (
        <ul className="search-results" role="listbox">
          {results.map(r => (
            <li key={r.place_id} onClick={() => handleSelect(r)} role="option">
              <span className="result-icon">&#128205;</span>
              <span className="result-text">{r.display_name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
