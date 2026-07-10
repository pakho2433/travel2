import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import { latLngToVector3 } from '../lib/globeMath.js'

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

export default function Globe({ places, onSelectPlace }) {
  return (
    <div className="globe-canvas" aria-label="3D 旅行地球儀">
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
    </div>
  )
}
