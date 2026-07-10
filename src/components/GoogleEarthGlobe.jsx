import { useEffect, useRef, useState } from 'react'

let googleMapsLoaderPromise = null

function loadGoogleMaps(apiKey) {
  if (window.google?.maps?.importLibrary) return Promise.resolve(window.google)
  if (googleMapsLoaderPromise) return googleMapsLoaderPromise

  googleMapsLoaderPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector('script[data-travel-globe-google-maps]')
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(window.google), { once: true })
      existingScript.addEventListener('error', () => reject(new Error('Google Maps script failed to load.')), {
        once: true
      })
      return
    }

    const callbackName = '__travelGlobeGoogleMapsReady'
    const script = document.createElement('script')
    script.dataset.travelGlobeGoogleMaps = 'true'
    script.async = true
    script.defer = true
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&v=weekly&loading=async&libraries=maps3d&callback=${callbackName}`

    const fail = (message) => {
      window.clearTimeout(timeout)
      delete window[callbackName]
      script.remove()
      googleMapsLoaderPromise = null
      reject(new Error(message))
    }

    const timeout = window.setTimeout(() => {
      fail('Google Maps took too long to load.')
    }, 20_000)

    window[callbackName] = () => {
      window.clearTimeout(timeout)
      delete window[callbackName]
      resolve(window.google)
    }

    script.onerror = () => fail('Google Maps script failed to load.')
    document.head.appendChild(script)
  })

  return googleMapsLoaderPromise
}

export default function GoogleEarthGlobe({ apiKey, places, onSelectPlace, onError }) {
  const hostRef = useRef(null)
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    let cancelled = false
    const host = hostRef.current

    async function initializeMap() {
      try {
        setStatus('loading')
        await loadGoogleMaps(apiKey)

        const maps3d = await window.google.maps.importLibrary('maps3d')
        const { Map3DElement, Marker3DInteractiveElement, Marker3DElement } = maps3d
        const MarkerClass = Marker3DInteractiveElement || Marker3DElement

        if (!Map3DElement || !MarkerClass) {
          throw new Error('Google 3D Maps is not available for this API key or browser.')
        }

        if (cancelled || !host) return

        const map = new Map3DElement({
          center: { lat: 20, lng: 10, altitude: 0 },
          range: 20_000_000,
          tilt: 0,
          heading: 0,
          mode: 'HYBRID'
        })

        map.className = 'google-earth-map'
        map.setAttribute('aria-label', 'Google 3D 旅行地球儀')

        places.forEach((place) => {
          const marker = new MarkerClass({
            position: {
              lat: Number(place.latitude),
              lng: Number(place.longitude),
              altitude: 0
            },
            label: place.placeName,
            extruded: true
          })

          let lastSelectionTime = 0
          const handleSelect = (event) => {
            const now = Date.now()
            if (now - lastSelectionTime < 250) return
            lastSelectionTime = now
            event?.stopPropagation?.()
            onSelectPlace(place)
          }

          marker.addEventListener('gmp-click', handleSelect)
          marker.addEventListener('click', handleSelect)
          map.append(marker)
        })

        host.replaceChildren(map)
        setStatus('ready')
      } catch (error) {
        console.error('Google 3D Maps could not be initialized.', error)
        if (!cancelled) {
          setStatus('error')
          onError?.(error)
        }
      }
    }

    initializeMap()

    return () => {
      cancelled = true
      host?.replaceChildren()
    }
  }, [apiKey, places, onError, onSelectPlace])

  return (
    <div className="google-earth-container">
      <div className="google-earth-host" ref={hostRef} />
      {status === 'loading' && (
        <div className="map-loading-overlay" role="status">
          <span>🌍</span>
          <p>正在載入 Google 3D 地球……</p>
        </div>
      )}
      {status === 'error' && (
        <div className="map-loading-overlay map-error-overlay" role="alert">
          <span>!</span>
          <p>Google 3D 地球未能載入，已可切換回標準地球。</p>
        </div>
      )}
    </div>
  )
}
