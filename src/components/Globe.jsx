import { useCallback, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import GoogleEarthGlobe from './GoogleEarthGlobe.jsx'
import { latLngToVector3 } from '../lib/globeMath.js'

const GOOGLE_KEY_STORAGE = 'travel-globe-google-maps-api-key'
const GOOGLE_MODE_STORAGE = 'travel-globe-map-provider'
const ENV_GOOGLE_API_KEY = String(import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '').trim()

function Earth({ places, onSelectPlace }) {
  return (
    <group>
      <mesh>
        <sphereGeometry args={[1, 72, 72]} />
        <meshStandardMaterial
          color="#0b6f83"
          roughness={0.72}
          metalness={0.05}
          emissive="#052a34"
          emissiveIntensity={0.35}
        />
      </mesh>

      <mesh scale={1.006}>
        <sphereGeometry args={[1, 36, 36]} />
        <meshBasicMaterial color="#4dd6c8" wireframe transparent opacity={0.12} />
      </mesh>

      <mesh scale={1.075}>
        <sphereGeometry args={[1, 48, 48]} />
        <meshBasicMaterial color="#4aa8ff" transparent opacity={0.07} side={1} />
      </mesh>

      {places.map((place) => {
        const position = latLngToVector3(place.latitude, place.longitude, 1.035)

        return (
          <mesh
            key={place.id}
            position={position}
            scale={0.035}
            onPointerDown={(event) => {
              event.stopPropagation()
              onSelectPlace(place)
            }}
          >
            <sphereGeometry args={[1, 20, 20]} />
            <meshStandardMaterial
              color="#ff7a45"
              emissive="#ff3b30"
              emissiveIntensity={2.2}
              roughness={0.35}
            />
          </mesh>
        )
      })}
    </group>
  )
}

function StandardGlobe({ places, onSelectPlace }) {
  return (
    <Canvas camera={{ position: [0, 0, 3.15], fov: 43 }} dpr={[1, 1.7]}>
      <color attach="background" args={['#07121f']} />
      <ambientLight intensity={1.2} />
      <directionalLight position={[3, 2, 4]} intensity={2.6} />
      <directionalLight position={[-3, -1, -2]} intensity={0.55} color="#43c6ff" />
      <Stars radius={35} depth={18} count={850} factor={2.1} saturation={0} fade speed={0.35} />
      <Earth places={places} onSelectPlace={onSelectPlace} />
      <OrbitControls
        makeDefault
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.55}
        zoomSpeed={0.7}
        minDistance={1.75}
        maxDistance={4.5}
      />
    </Canvas>
  )
}

function readSavedApiKey() {
  try {
    return localStorage.getItem(GOOGLE_KEY_STORAGE) || ''
  } catch {
    return ''
  }
}

function readSavedProvider(hasGoogleKey) {
  try {
    const saved = localStorage.getItem(GOOGLE_MODE_STORAGE)
    if (saved === 'standard') return 'standard'
    if (saved === 'google' && hasGoogleKey) return 'google'
  } catch {
    // Use the default below.
  }

  return hasGoogleKey ? 'google' : 'standard'
}

export default function Globe({ places, onSelectPlace }) {
  const [apiKey, setApiKey] = useState(() => ENV_GOOGLE_API_KEY || readSavedApiKey())
  const [provider, setProvider] = useState(() => readSavedProvider(Boolean(ENV_GOOGLE_API_KEY || readSavedApiKey())))
  const [googleError, setGoogleError] = useState(null)

  const handleGoogleError = useCallback((error) => {
    setGoogleError(error)
  }, [])

  function selectProvider(nextProvider) {
    if (nextProvider === 'google' && !apiKey) {
      configureGoogleApiKey()
      return
    }

    setGoogleError(null)
    setProvider(nextProvider)
    try {
      localStorage.setItem(GOOGLE_MODE_STORAGE, nextProvider)
    } catch {
      // The selected mode still works for the current session.
    }
  }

  function configureGoogleApiKey() {
    const enteredKey = window.prompt(
      '請貼上 Google Maps JavaScript API 金鑰。需要啟用 Maps JavaScript API 及 3D Maps，並限制只允許你的 GitHub Pages 網址使用。',
      apiKey && !ENV_GOOGLE_API_KEY ? apiKey : ''
    )

    if (!enteredKey?.trim()) return

    const cleanKey = enteredKey.trim()
    try {
      localStorage.setItem(GOOGLE_KEY_STORAGE, cleanKey)
      localStorage.setItem(GOOGLE_MODE_STORAGE, 'google')
    } catch {
      // Continue with the in-memory key if storage is unavailable.
    }

    setApiKey(cleanKey)
    setGoogleError(null)
    setProvider('google')
  }

  const showGoogle = provider === 'google' && apiKey && !googleError

  return (
    <div className="globe-canvas" aria-label="3D 旅行地球儀">
      {showGoogle ? (
        <GoogleEarthGlobe
          apiKey={apiKey}
          places={places}
          onSelectPlace={onSelectPlace}
          onError={handleGoogleError}
        />
      ) : (
        <StandardGlobe places={places} onSelectPlace={onSelectPlace} />
      )}

      <div className="map-provider-controls" aria-label="地球顯示模式">
        <button
          className={provider === 'google' && !googleError ? 'active' : ''}
          type="button"
          onClick={() => selectProvider('google')}
        >
          Google 3D
        </button>
        <button
          className={provider === 'standard' || googleError ? 'active' : ''}
          type="button"
          onClick={() => selectProvider('standard')}
        >
          標準地球
        </button>
        <button className="key-button" type="button" onClick={configureGoogleApiKey} aria-label="設定 Google API 金鑰">
          ⚙︎
        </button>
      </div>

      {googleError && (
        <button className="google-map-warning" type="button" onClick={configureGoogleApiKey}>
          Google 3D 載入失敗，按此檢查 API 金鑰
        </button>
      )}
    </div>
  )
}
