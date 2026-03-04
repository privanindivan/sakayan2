import { useState } from 'react'

export default function ImageCarousel({ images }) {
  const [current, setCurrent] = useState(0)

  const prev = () => setCurrent(i => (i - 1 + images.length) % images.length)
  const next = () => setCurrent(i => (i + 1) % images.length)

  return (
    <div className="carousel">
      <img src={images[current]} alt={`slide ${current + 1}`} />

      <button className="carousel-btn prev" onClick={prev} aria-label="Previous">&#8249;</button>
      <button className="carousel-btn next" onClick={next} aria-label="Next">&#8250;</button>

      <div className="carousel-dots">
        {images.map((_, i) => (
          <button
            key={i}
            className={`dot ${i === current ? 'active' : ''}`}
            onClick={() => setCurrent(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      <div className="carousel-counter">{current + 1} / {images.length}</div>
    </div>
  )
}
