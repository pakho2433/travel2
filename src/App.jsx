import { useEffect, useMemo, useRef, useState } from 'react'
import Globe from './components/Globe.jsx'
import AddPlaceModal from './components/AddPlaceModal.jsx'
import PlaceListModal from './components/PlaceListModal.jsx'
import PlaceDetailSheet from './components/PlaceDetailSheet.jsx'
import { loadPlaces, requestPersistentStorage, savePlaces } from './lib/storage.js'

const SAMPLE_PLACES = [
  {
    id: 'sample-hong-kong',
    placeName: 'Hong Kong',
    country: 'Hong Kong',
    city: 'Hong Kong',
    latitude: 22.3193,
    longitude: 114.1694,
    visitDate: '2025-01-10',
    note: '維港夜景與城市燈光。',
    createdAt: '2025-01-10T00:00:00.000Z',
    updatedAt: '2025-01-10T00:00:00.000Z'
  },
  {
    id: 'sample-tokyo',
    placeName: 'Tokyo',
    country: 'Japan',
    city: 'Tokyo',
    latitude: 35.6762,
    longitude: 139.6503,
    visitDate: '2025-02-15',
    note: '繁華街道、美食和晴朗天空。',
    createdAt: '2025-02-15T00:00:00.000Z',
    updatedAt: '2025-02-15T00:00:00.000Z'
  },
  {
    id: 'sample-taipei',
    placeName: 'Taipei',
    country: 'Taiwan',
    city: 'Taipei',
    latitude: 25.033,
    longitude: 121.5654,
    visitDate: '2025-03-20',
    note: '夜市、小食與台北 101。',
    createdAt: '2025-03-20T00:00:00.000Z',
    updatedAt: '2025-03-20T00:00:00.000Z'
  }
]

function isValidPlace(place) {
  return Boolean(
    place &&
    typeof place.placeName === 'string' &&
    typeof place.country === 'string' &&
    typeof place.city === 'string' &&
    Number.isFinite(Number(place.latitude)) &&
    Number.isFinite(Number(place.longitude))
  )
}

function normalizeImportedPlaces(input) {
  const source = Array.isArray(input) ? input : input?.places
  if (!Array.isArray(source) || !source.every(isValidPlace)) {
    throw new Error('Invalid travel data')
  }

  return source.map((place) => ({
    ...place,
    id: place.id || crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`,
    latitude: Number(place.latitude),
    longitude: Number(place.longitude),
    visitDate: place.visitDate || '',
    note: place.note || '',
    createdAt: place.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }))
}

export default function App() {
  const [places, setPlaces] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddPlace, setShowAddPlace] = useState(false)
  const [showPlaceList, setShowPlaceList] = useState(false)
  const [selectedPlace, setSelectedPlace] = useState(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    let active = true

    async function initialize() {
      const storedPlaces = await loadPlaces()
      const initialPlaces = storedPlaces === null ? SAMPLE_PLACES : storedPlaces

      if (storedPlaces === null) await savePlaces(initialPlaces)
      await requestPersistentStorage()

      if (active) {
        setPlaces(initialPlaces)
        setLoading(false)
      }
    }

    initialize()
    return () => {
      active = false
    }
  }, [])

  const countryCount = useMemo(() => {
    return new Set(places.map((place) => place.country.trim().toLocaleLowerCase()).filter(Boolean)).size
  }, [places])

  function commitPlaces(nextPlaces) {
    setPlaces(nextPlaces)
    savePlaces(nextPlaces)
  }

  function addPlace(place) {
    const nextPlaces = [...places, place]
    commitPlaces(nextPlaces)
    setShowAddPlace(false)
    setSelectedPlace(place)
  }

  function deletePlace(placeId) {
    const nextPlaces = places.filter((place) => place.id !== placeId)
    commitPlaces(nextPlaces)
    if (selectedPlace?.id === placeId) setSelectedPlace(null)
  }

  function exportData() {
    const payload = JSON.stringify(
      {
        version: 1,
        exportedAt: new Date().toISOString(),
        places
      },
      null,
      2
    )

    const blob = new Blob([payload], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `travel-globe-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  async function importData(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    try {
      const parsedData = JSON.parse(await file.text())
      const importedPlaces = normalizeImportedPlaces(parsedData)
      commitPlaces(importedPlaces)
      setSelectedPlace(null)
      window.alert(`已成功匯入 ${importedPlaces.length} 個旅行地點。`)
    } catch {
      window.alert('未能匯入：請選擇由此 App 匯出的有效 JSON 檔案。')
    }
  }

  function clearAllData() {
    if (!window.confirm('確定清除所有旅行記錄嗎？建議先匯出 JSON 備份。')) return
    commitPlaces([])
    setSelectedPlace(null)
  }

  if (loading) {
    return (
      <main className="loading-screen">
        <div className="loading-globe">🌍</div>
        <p>正在打開你的旅行地球儀……</p>
      </main>
    )
  }

  return (
    <main className="app-shell">
      <header className="top-bar">
        <div>
          <p className="eyebrow">TRAVEL GLOBE</p>
          <h1>我的旅行地球儀</h1>
        </div>
        <button className="add-button" type="button" onClick={() => setShowAddPlace(true)}>
          <span>＋</span> 新增
        </button>
      </header>

      <section className="globe-panel">
        <Globe places={places} onSelectPlace={setSelectedPlace} />
        <div className="globe-tip">拖動旋轉 · 雙指縮放 · 點擊發光圖釘</div>
      </section>

      <section className="stats-grid" aria-label="旅行統計">
        <article className="stat-card">
          <span>已去過</span>
          <strong>{places.length}</strong>
          <small>個地方</small>
        </article>
        <article className="stat-card">
          <span>足跡遍佈</span>
          <strong>{countryCount}</strong>
          <small>個國家／地區</small>
        </article>
      </section>

      <nav className="action-grid" aria-label="旅行資料工具">
        <button type="button" onClick={() => setShowPlaceList(true)}>
          <span>☰</span>
          地點列表
        </button>
        <button type="button" onClick={exportData}>
          <span>⇩</span>
          匯出備份
        </button>
        <button type="button" onClick={() => fileInputRef.current?.click()}>
          <span>⇧</span>
          匯入備份
        </button>
        <button className="muted-danger" type="button" onClick={clearAllData}>
          <span>⌫</span>
          清除資料
        </button>
      </nav>

      <input
        ref={fileInputRef}
        className="visually-hidden"
        type="file"
        accept="application/json,.json"
        onChange={importData}
      />

      <p className="save-status">✓ 已自動儲存在此裝置</p>

      {selectedPlace && (
        <PlaceDetailSheet
          place={selectedPlace}
          onClose={() => setSelectedPlace(null)}
          onDeletePlace={deletePlace}
        />
      )}

      {showAddPlace && <AddPlaceModal onClose={() => setShowAddPlace(false)} onAdd={addPlace} />}

      {showPlaceList && (
        <PlaceListModal
          places={places}
          onClose={() => setShowPlaceList(false)}
          onSelectPlace={setSelectedPlace}
          onDeletePlace={deletePlace}
        />
      )}
    </main>
  )
}
