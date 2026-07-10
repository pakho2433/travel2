function formatDate(value) {
  if (!value) return '未設定日期'
  return new Intl.DateTimeFormat('zh-HK', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(`${value}T00:00:00`))
}

export default function PlaceDetailSheet({ place, onClose, onDeletePlace }) {
  if (!place) return null

  return (
    <section className="detail-sheet" aria-live="polite">
      <div className="sheet-handle" />
      <div className="detail-header">
        <div>
          <p className="eyebrow">TRAVEL MEMORY</p>
          <h2>{place.placeName}</h2>
          <p className="place-location">{place.city} · {place.country}</p>
        </div>
        <button className="icon-button" type="button" onClick={onClose} aria-label="關閉詳情">
          ×
        </button>
      </div>

      <div className="detail-grid">
        <div className="detail-item">
          <span>到訪日期</span>
          <strong>{formatDate(place.visitDate)}</strong>
        </div>
        <div className="detail-item">
          <span>座標</span>
          <strong>{place.latitude.toFixed(2)}, {place.longitude.toFixed(2)}</strong>
        </div>
      </div>

      <p className="detail-note">{place.note || '這段旅程暫時未有備註。'}</p>

      <button
        className="danger-button full-width"
        type="button"
        onClick={() => {
          if (window.confirm(`確定刪除「${place.placeName}」嗎？`)) {
            onDeletePlace(place.id)
          }
        }}
      >
        刪除此旅行記錄
      </button>
    </section>
  )
}
