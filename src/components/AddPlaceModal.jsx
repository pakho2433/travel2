import { useState } from 'react'
import { getCityCoordinates, supportedCities } from '../lib/coordinates.js'

function todayString() {
  const today = new Date()
  const offset = today.getTimezoneOffset() * 60_000
  return new Date(today.getTime() - offset).toISOString().slice(0, 10)
}

export default function AddPlaceModal({ onClose, onAdd }) {
  const [form, setForm] = useState({
    placeName: '',
    country: '',
    city: '',
    visitDate: todayString(),
    note: ''
  })

  function updateField(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()

    const placeName = form.placeName.trim()
    const country = form.country.trim()
    const city = form.city.trim()

    if (!placeName || !country || !city) {
      window.alert('請填寫地點名稱、國家／地區及城市。')
      return
    }

    const coordinates = getCityCoordinates(city)
    if (!coordinates) {
      window.alert('暫時未有此城市座標，請先加入內置座標表。')
      return
    }

    onAdd({
      id: crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
      placeName,
      country,
      city,
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      visitDate: form.visitDate,
      note: form.note.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
  }

  return (
    <div className="modal-backdrop" role="presentation" onPointerDown={onClose}>
      <section
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-place-title"
        onPointerDown={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <p className="eyebrow">NEW MEMORY</p>
            <h2 id="add-place-title">新增旅行地點</h2>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="關閉">
            ×
          </button>
        </div>

        <form className="place-form" onSubmit={handleSubmit}>
          <label>
            地點名稱
            <input
              name="placeName"
              value={form.placeName}
              onChange={updateField}
              placeholder="例如：東京鐵塔"
              autoComplete="off"
            />
          </label>

          <label>
            國家／地區
            <input
              name="country"
              value={form.country}
              onChange={updateField}
              placeholder="例如：Japan"
              autoComplete="country-name"
            />
          </label>

          <label>
            城市
            <input
              name="city"
              list="supported-cities"
              value={form.city}
              onChange={updateField}
              placeholder="例如：Tokyo"
              autoComplete="address-level2"
            />
            <datalist id="supported-cities">
              {supportedCities.map((city) => (
                <option key={city} value={city} />
              ))}
            </datalist>
            <span className="field-hint">現支援香港、東京、台北、大阪、首爾、曼谷、新加坡、倫敦、巴黎及紐約。</span>
          </label>

          <label>
            到訪日期
            <input name="visitDate" type="date" value={form.visitDate} onChange={updateField} />
          </label>

          <label>
            旅行備註
            <textarea
              name="note"
              value={form.note}
              onChange={updateField}
              rows="4"
              placeholder="記低當日最難忘的事情……"
            />
          </label>

          <button className="primary-button full-width" type="submit">
            儲存並加入地球
          </button>
        </form>
      </section>
    </div>
  )
}
