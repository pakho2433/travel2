import { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'

const MAP_STYLE = 'https://tiles.openfreemap.org/styles/liberty'
const TERRAIN_SOURCE_ID = 'travel-terrain'
const TERRAIN_TILEJSON = 'https://tiles.mapterhorn.com/tilejson.json'
const HILLSHADE_LAYER_ID = 'travel-hillshade'
const BUILDING_LAYER_ID = 'travel-3d-buildings'

function firstLabelLayerId(map) {
  return map
    .getStyle()
    .layers?.find((layer) => layer.type === 'symbol' && layer.layout?.['text-field'])?.id
}

function addTerrain(map) {
  if (!map.getSource(TERRAIN_SOURCE_ID)) {
    map.addSource(TERRAIN_SOURCE_ID, {
      type: 'raster-dem',
      url: TERRAIN_TILEJSON
    })
  }

  map.setTerrain({ source: TERRAIN_SOURCE_ID, exaggeration: 1.35 })

  if (!map.getLayer(HILLSHADE_LAYER_ID)) {
    map.addLayer(
      {
        id: HILLSHADE_LAYER_ID,
        type: 'hillshade',
        source: TERRAIN_SOURCE_ID,
        paint: {
          'hillshade-exaggeration': 0.38,
          'hillshade-shadow-color': '#26343f',
          'hillshade-highlight-color': '#d6f5ee',
          'hillshade-accent-color': '#526f78'
        }
      },
      firstLabelLayerId(map)
    )
  }
}

function addBuildingExtrusions(map) {
  const existingExtrusion = map.getStyle().layers?.some((layer) => layer.type === 'fill-extrusion')
  if (existingExtrusion || map.getLayer(BUILDING_LAYER_ID)) return

  const vectorSourceId = Object.entries(map.getStyle().sources ?? {}).find(
    ([, source]) => source.type === 'vector'
  )?.[0]

  if (!vectorSourceId) return

  try {
    map.addLayer(
      {
        id: BUILDING_LAYER_ID,
        type: 'fill-extrusion',
        source: vectorSourceId,
        'source-layer': 'building',
        minzoom: 15,
        filter: ['all', ['has', 'render_height'], ['>', ['get', 'render_height'], 0]],
        paint: {
          'fill-extrusion-color': [
            'interpolate',
            ['linear'],
            ['get', 'render_height'],
            0,
            '#d7e0e6',
            40,
            '#b4c1cc',
            160,
            '#8ea1b2'
          ],
          'fill-extrusion-height': ['get', 'render_height'],
          'fill-extrusion-base': ['coalesce', ['get', 'render_min_height'], 0],
          'fill-extrusion-opacity': 0.76
        }
      },
      firstLabelLayerId(map)
    )
  } catch (error) {
    console.info('3D building layer is not available in this map style.', error)
  }
}

function configureEarth(map) {
  map.setProjection({ type: 'globe' })
  addTerrain(map)
  addBuildingExtrusions(map)
}

function createMarkerElement(place, onSelect, map) {
  const markerButton = document.createElement('button')
  markerButton.type = 'button'
  markerButton.className = 'travel-map-marker'
  markerButton.setAttribute('aria-label', `查看 ${place.placeName}`)
  markerButton.title = `${place.placeName} · ${place.city}`

  const glow = document.createElement('span')
  glow.className = 'travel-map-marker-glow'

  const pin = document.createElement('span')
  pin.className = 'travel-map-marker-pin'

  const label = document.createElement('span')
  label.className = 'travel-map-marker-name'
  label.textContent = place.placeName

  markerButton.append(glow, pin, label)
  markerButton.addEventListener('click', (event) => {
    event.preventDefault()
    event.stopPropagation()
    onSelect(place)
    map.easeTo({
      center: [Number(place.longitude), Number(place.latitude)],
      zoom: Math.max(map.getZoom(), 12.5),
      pitch: 62,
      duration: 900
    })
  })

  return markerButton
}

export default function Globe({ places, onSelectPlace }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const markersRef = useRef([])
  const [status, setStatus] = useState('loading')
  const [zoomLevel, setZoomLevel] = useState(1.35)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return undefined

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE,
      center: [114, 22],
      zoom: 1.35,
      pitch: 0,
      bearing: 0,
      maxZoom: 18,
      maxPitch: 85,
      attributionControl: true,
      cooperativeGestures: false,
      antialias: true
    })

    mapRef.current = map

    const loadingTimeout = window.setTimeout(() => {
      if (!map.loaded()) setStatus('error')
    }, 20_000)

    map.on('style.load', () => {
      try {
        configureEarth(map)
      } catch (error) {
        console.warn('Terrain could not be enabled; the labelled map remains available.', error)
      }
    })

    map.on('load', () => {
      window.clearTimeout(loadingTimeout)
      setStatus('ready')
    })

    map.on('zoom', () => setZoomLevel(map.getZoom()))

    map.addControl(
      new maplibregl.NavigationControl({
        visualizePitch: true,
        showCompass: true,
        showZoom: true
      }),
      'top-right'
    )

    if (maplibregl.GlobeControl) {
      map.addControl(new maplibregl.GlobeControl(), 'top-right')
    }

    return () => {
      window.clearTimeout(loadingTimeout)
      markersRef.current.forEach((marker) => marker.remove())
      markersRef.current = []
      map.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map || status !== 'ready') return

    markersRef.current.forEach((marker) => marker.remove())
    markersRef.current = places.map((place) => {
      const element = createMarkerElement(place, onSelectPlace, map)
      return new maplibregl.Marker({ element, anchor: 'bottom' })
        .setLngLat([Number(place.longitude), Number(place.latitude)])
        .addTo(map)
    })
  }, [places, onSelectPlace, status])

  function resetToGlobe() {
    mapRef.current?.easeTo({
      center: [114, 22],
      zoom: 1.35,
      pitch: 0,
      bearing: 0,
      duration: 1100
    })
  }

  return (
    <div className="globe-canvas open-earth-globe" aria-label="開源 3D 旅行地球儀">
      <div ref={containerRef} className="open-earth-map" />

      <div className="earth-map-toolbar">
        <button type="button" onClick={resetToGlobe}>
          🌍 全球
        </button>
        <span>{zoomLevel < 5 ? '地球模式' : zoomLevel < 13 ? '地方名稱' : '街道／3D 地形'}</span>
      </div>

      {status === 'loading' && (
        <div className="earth-map-overlay" role="status">
          <span>🌍</span>
          <p>正在載入地球、街道及地形……</p>
        </div>
      )}

      {status === 'error' && (
        <div className="earth-map-overlay earth-map-error" role="alert">
          <span>!</span>
          <p>地圖暫時未能載入，請檢查網絡後重新整理。</p>
        </div>
      )}
    </div>
  )
}
