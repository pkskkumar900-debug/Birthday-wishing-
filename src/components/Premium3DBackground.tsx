import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment, Sparkles, Stars, MeshTransmissionMaterial, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

const FloatingShapes = ({ occasion }: { occasion: string }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  // Determine colors based on occasion
  let color1 = "#d946ef"; // fuchsia
  let color2 = "#4f46e5"; // indigo
  
  if (occasion === 'anniversary' || occasion === 'valentine') {
    color1 = "#e11d48"; // rose
    color2 = "#be123c"; // rose dark
  } else if (occasion === 'newyear') {
    color1 = "#f59e0b"; // amber
    color2 = "#d97706"; // amber dark
  } else if (occasion === 'congrats') {
    color1 = "#10b981"; // emerald
    color2 = "#059669"; // emerald dark
  }

  return (
    <group ref={groupRef}>
      <Float speed={2} rotationIntensity={1.5} floatIntensity={2}>
        <mesh position={[-3, 1, -5]} rotation={[Math.PI / 4, Math.PI / 4, 0]}>
          <octahedronGeometry args={[1.5, 0]} />
          <MeshTransmissionMaterial 
            backside
            samples={4}
            thickness={2}
            chromaticAberration={0.5}
            anisotropy={0.3}
            distortion={0.5}
            distortionScale={0.5}
            temporalDistortion={0.1}
            iridescence={1}
            iridescenceIOR={1}
            iridescenceThicknessRange={[0, 1400]}
            color={color1}
          />
        </mesh>
      </Float>

      <Float speed={1.5} rotationIntensity={2} floatIntensity={1.5}>
        <mesh position={[3, -2, -3]} rotation={[0, Math.PI / 3, 0]}>
          <torusGeometry args={[1.2, 0.4, 16, 32]} />
          <meshPhysicalMaterial 
            color={color2}
            metalness={0.9}
            roughness={0.1}
            clearcoat={1}
            clearcoatRoughness={0.1}
          />
        </mesh>
      </Float>

      <Float speed={2.5} rotationIntensity={1} floatIntensity={2.5}>
        <mesh position={[0, 3, -8]}>
          <icosahedronGeometry args={[2, 0]} />
          <MeshTransmissionMaterial 
            backside
            samples={4}
            thickness={1}
            chromaticAberration={1}
            color="#ffffff"
          />
        </mesh>
      </Float>
    </group>
  );
};

export default function Premium3DBackground({ occasion = 'birthday' }: { occasion?: string }) {
  let overlayGradient = "from-fuchsia-950/40 via-zinc-950/80 to-zinc-950";
  if (occasion === 'anniversary' || occasion === 'valentine') {
    overlayGradient = "from-rose-950/40 via-zinc-950/80 to-zinc-950";
  } else if (occasion === 'newyear') {
    overlayGradient = "from-amber-950/40 via-zinc-950/80 to-zinc-950";
  } else if (occasion === 'congrats') {
    overlayGradient = "from-emerald-950/40 via-zinc-950/80 to-zinc-950";
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
        <color attach="background" args={['#09090b']} />
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} castShadow />
        <pointLight position={[-10, -10, -10]} intensity={1} />
        
        <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
        <Sparkles count={100} scale={12} size={2} speed={0.4} opacity={0.2} color="#ffffff" />
        
        <FloatingShapes occasion={occasion} />
        
        <Environment preset="city" />
      </Canvas>
      
      {/* Premium Overlay Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-b ${overlayGradient} pointer-events-none`} />
    </div>
  );
}
