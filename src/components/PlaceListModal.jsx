function formatDate(value) {
  if (!value) return '未設定日期'
  return new Intl.DateTimeFormat('zh-HK', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(new Date(`${value}T00:00:00`))
}

export default function PlaceListModal({ places, onClose, onSelectPlace, onDeletePlace }) {
  const sortedPlaces = [...places].sort((a, b) =>
    String(b.visitDate).localeCompare(String(a.visitDate))
  )

  return (
    <div className="modal-backdrop" role="presentation" onPointerDown={onClose}>
      <section
        className="modal-card list-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="place-list-title"
        onPointerDown={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <p className="eyebrow">MY JOURNEYS</p>
            <h2 id="place-list-title">所有旅行地點</h2>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="關閉">
            ×
          </button>
        </div>

        <div className="place-list">
          {sortedPlaces.length === 0 ? (
            <div className="empty-state">
              <span>🌍</span>
              <p>暫時未有旅行記錄。</p>
            </div>
          ) : (
            sortedPlaces.map((place) => (
              <article className="place-row" key={place.id}>
                <button
                  className="place-row-main"
                  type="button"
                  onClick={() => {
                    onSelectPlace(place)
                    onClose()
                  }}
                >
                  <span className="place-pin">●</span>
                  <span>
                    <strong>{place.placeName}</strong>
                    <small>{place.city} · {place.country}</small>
                    <small>{formatDate(place.visitDate)}</small>
                  </span>
                </button>
                <button
                  className="delete-mini-button"
                  type="button"
                  aria-label={`刪除 ${place.placeName}`}
                  onClick={() => onDeletePlace(place.id)}
                >
                  刪除
                </button>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  )
}
