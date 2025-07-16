'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { Suspense, useMemo, useRef, useState, useEffect } from 'react';
import * as THREE from 'three';

interface AudioWaveform3DProps {
  audioData: Float32Array;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
}

const AudioWaveform3D: React.FC<AudioWaveform3DProps> = ({ 
  audioData, 
  currentTime, 
  duration, 
  isPlaying 
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);
  const progressRef = useRef<THREE.Mesh>(null);
  
  // Erstelle 3D-Geometrie aus Audio-Daten
  const { geometry, progressGeometry } = useMemo(() => {
    const segments = Math.min(audioData.length, 512); // Begrenzen für Performance
    const step = Math.floor(audioData.length / segments);
    
    // Hauptwaveform
    const geo = new THREE.PlaneGeometry(10, 1, segments - 1, 50);
    const vertices = geo.attributes.position.array as Float32Array;
    
    // Erstelle 3D-Waveform mit Frequenz-Verteilung
    for (let i = 0; i < segments; i++) {
      const amplitude = audioData[i * step] || 0;
      const normalizedAmplitude = amplitude * 3; // Verstärken für bessere Sichtbarkeit
      
      // Setze Y-Koordinaten (Höhe) basierend auf Audio-Amplitude
      for (let j = 0; j <= 50; j++) {
        const vertexIndex = (i * 51 + j) * 3;
        if (vertexIndex < vertices.length) {
          // Erstelle Wellen-Effekt
          const waveHeight = normalizedAmplitude * Math.sin((j / 50) * Math.PI);
          vertices[vertexIndex + 1] = waveHeight;
          
          // Füge Z-Tiefe hinzu für 3D-Effekt
          vertices[vertexIndex + 2] = Math.sin((i / segments) * Math.PI * 4) * 0.3;
        }
      }
    }
    
    geo.attributes.position.needsUpdate = true;
    geo.computeVertexNormals();
    
    // Progress-Indikator
    const progressGeo = new THREE.PlaneGeometry(0.1, 2, 1, 1);
    
    return { geometry: geo, progressGeometry: progressGeo };
  }, [audioData]);

  // Animation
  useFrame((state) => {
    if (meshRef.current && materialRef.current) {
      // Rotiere die Waveform leicht
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.3) * 0.05;
      
      // Ändere Farbe basierend auf Wiedergabe-Status
      if (isPlaying) {
        const hue = (state.clock.elapsedTime * 0.1) % 1;
        materialRef.current.color.setHSL(hue, 0.8, 0.6);
        materialRef.current.opacity = 0.8 + Math.sin(state.clock.elapsedTime * 2) * 0.2;
      } else {
        materialRef.current.color.setHex(0x7c3aed);
        materialRef.current.opacity = 0.7;
      }
    }
    
    // Aktualisiere Progress-Indikator
    if (progressRef.current && duration > 0) {
      const progress = currentTime / duration;
      progressRef.current.position.x = -5 + (progress * 10);
      progressRef.current.visible = isPlaying;
    }
  });

  return (
    <group>
      {/* Hauptwaveform */}
      <mesh ref={meshRef} geometry={geometry}>
        <meshBasicMaterial 
          ref={materialRef}
          color="#7c3aed"
          wireframe
          transparent
          opacity={0.7}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Progress-Indikator */}
      <mesh ref={progressRef} geometry={progressGeometry}>
        <meshBasicMaterial 
          color="#fbbf24"
          transparent
          opacity={0.9}
        />
      </mesh>
      
      {/* Partikel-Effekte */}
      <ParticleField isPlaying={isPlaying} audioData={audioData} />
    </group>
  );
};

const ParticleField: React.FC<{ isPlaying: boolean; audioData: Float32Array }> = ({ 
  isPlaying, 
  audioData 
}) => {
  const particlesRef = useRef<THREE.Points>(null);
  
  const { geometry, material } = useMemo(() => {
    const particleCount = 100;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      // Zufällige Positionen
      positions[i * 3] = (Math.random() - 0.5) * 15;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 8;
      
      // Lila-Farbtöne
      colors[i * 3] = 0.5 + Math.random() * 0.5;     // R
      colors[i * 3 + 1] = 0.2 + Math.random() * 0.3; // G
      colors[i * 3 + 2] = 0.8 + Math.random() * 0.2; // B
    }
    
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const mat = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
    });
    
    return { geometry: geo, material: mat };
  }, []);

  useFrame((state) => {
    if (particlesRef.current && isPlaying) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.1;
      
      // Reagiere auf Audio-Daten
      const avgAmplitude = audioData.reduce((sum, val) => sum + Math.abs(val), 0) / audioData.length;
      material.size = 0.02 + avgAmplitude * 0.1;
    }
  });

  return (
    <points ref={particlesRef} geometry={geometry} material={material} />
  );
};

interface Waveform3DProps {
  audioUrl: string;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
}

const Waveform3D: React.FC<Waveform3DProps> = ({ 
  audioUrl, 
  isPlaying, 
  currentTime, 
  duration 
}) => {
  const [audioData, setAudioData] = useState<Float32Array>(new Float32Array(0));
  const [error, setError] = useState<string | null>(null);

  // Lade und analysiere Audio-Daten
  useEffect(() => {
    const loadAudioData = async () => {
      try {
        const response = await fetch(audioUrl);
        const arrayBuffer = await response.arrayBuffer();
        
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        
        // Erstelle Waveform-Daten
        const channelData = audioBuffer.getChannelData(0);
        const samples = 1024;
        const blockSize = Math.floor(channelData.length / samples);
        const filteredData = new Float32Array(samples);
        
        for (let i = 0; i < samples; i++) {
          let sum = 0;
          for (let j = 0; j < blockSize; j++) {
            sum += Math.abs(channelData[i * blockSize + j]);
          }
          filteredData[i] = sum / blockSize;
        }
        
        setAudioData(filteredData);
        setError(null);
      } catch (err) {
        console.error('Fehler beim Laden der Audio-Daten:', err);
        setError('Fehler beim Laden der Audio-Daten');
        // Erstelle Fallback-Daten
        const fallbackData = new Float32Array(512);
        for (let i = 0; i < 512; i++) {
          fallbackData[i] = Math.sin(i * 0.1) * 0.5;
        }
        setAudioData(fallbackData);
      }
    };

    if (audioUrl) {
      loadAudioData();
    }
  }, [audioUrl]);

  if (error) {
    return (
      <div className="h-64 w-full bg-slate-900 rounded-lg flex items-center justify-center">
        <p className="text-slate-400 text-sm">3D-Visualisierung nicht verfügbar</p>
      </div>
    );
  }

  return (
    <div className="h-64 w-full bg-slate-900 rounded-lg overflow-hidden relative">
      <Canvas camera={{ position: [0, 2, 8], fov: 50 }}>
        <Suspense fallback={null}>
          {/* Beleuchtung */}
          <ambientLight intensity={0.4} />
          <pointLight position={[10, 10, 10]} intensity={0.8} />
          <pointLight position={[-10, -10, -10]} intensity={0.3} color="#7c3aed" />
          
          {/* 3D-Waveform */}
          <AudioWaveform3D 
            audioData={audioData}
            currentTime={currentTime}
            duration={duration}
            isPlaying={isPlaying}
          />
          
          {/* Kamera-Kontrollen */}
          <OrbitControls 
            enableZoom={true}
            enablePan={false}
            maxPolarAngle={Math.PI / 1.5}
            minPolarAngle={Math.PI / 4}
            autoRotate={isPlaying}
            autoRotateSpeed={0.5}
          />
        </Suspense>
      </Canvas>
      
      {/* Overlay-Informationen */}
      <div className="absolute top-2 right-2 bg-black/30 backdrop-blur-sm rounded px-2 py-1">
        <p className="text-xs text-white">
          {isPlaying ? '🎵 Playing' : '⏸️ Paused'} | 3D View
        </p>
      </div>
    </div>
  );
};

export default Waveform3D;