"use client";

import React, { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface NeuralSphereProps {
  particleCount: number;
  accentColor: string;
  isPaused: boolean;
}

function NeuralSphere({ particleCount, accentColor, isPaused }: NeuralSphereProps) {
  const groupRef = useRef<THREE.Group>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  // Generate particles arranged on a sphere
  const [positions, basePositions] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const base = new Float32Array(particleCount * 3);
    const radius = 2.05;

    for (let i = 0; i < particleCount; i++) {
      // Golden spiral distribution on sphere
      const y = 1 - (i / (particleCount - 1)) * 2; // -1 to 1
      const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y));
      const phi = i * 2.3999632; // golden angle in radians (~137.5 deg)

      // Slight radius variation for organic neural-globe feel
      const r = radius * (0.94 + Math.random() * 0.12);
      const x = Math.cos(phi) * radiusAtY * r;
      const z = Math.sin(phi) * radiusAtY * r;
      const actualY = y * r;

      pos[i * 3] = x;
      pos[i * 3 + 1] = actualY;
      pos[i * 3 + 2] = z;

      base[i * 3] = x;
      base[i * 3 + 1] = actualY;
      base[i * 3 + 2] = z;
    }
    return [pos, base];
  }, [particleCount]);

  const maxLines = Math.floor((particleCount * (particleCount - 1)) / 3.5);
  const linePositions = useMemo(() => new Float32Array(maxLines * 6), [maxLines]);
  const lineColors = useMemo(() => new Float32Array(maxLines * 6), [maxLines]);

  const pointsGeoRef = useRef<THREE.BufferGeometry>(null);
  const linesGeoRef = useRef<THREE.BufferGeometry>(null);

  // Colors: blue (#3b82f6) to violet (#8b5cf6)
  const blueColor = useMemo(() => new THREE.Color("#3b82f6"), []);
  const violetColor = useMemo(() => new THREE.Color("#8b5cf6"), []);
  const cyanColor = useMemo(() => new THREE.Color("#38bdf8"), []);

  // Mouse parallax tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = (e.clientX / window.innerWidth - 0.5) * 0.45;
      mouseRef.current.targetY = (e.clientY / window.innerHeight - 0.5) * 0.45;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useFrame((state) => {
    if (isPaused) return;

    const t = state.clock.getElapsedTime();

    // Smooth mouse parallax
    mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
    mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

    if (groupRef.current) {
      // Gentle constant rotation + mouse tilt
      groupRef.current.rotation.y = t * 0.12 + mouseRef.current.x * 0.6;
      groupRef.current.rotation.x = Math.sin(t * 0.08) * 0.1 - mouseRef.current.y * 0.6;
    }

    // Organic subtle breathing motion on nodes
    for (let i = 0; i < particleCount; i++) {
      const idx = i * 3;
      const pulse = 1 + Math.sin(t * 1.5 + i * 0.4) * 0.025;
      positions[idx] = basePositions[idx] * pulse;
      positions[idx + 1] = basePositions[idx + 1] * pulse;
      positions[idx + 2] = basePositions[idx + 2] * pulse;
    }

    if (pointsGeoRef.current) {
      pointsGeoRef.current.attributes.position.needsUpdate = true;
    }

    // Connect nodes within proximity threshold
    let lineIdx = 0;
    const connectDistance = 1.05;

    for (let i = 0; i < particleCount; i++) {
      for (let j = i + 1; j < particleCount; j++) {
        const dx = positions[i * 3] - positions[j * 3];
        const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
        const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (dist < connectDistance && lineIdx < maxLines) {
          const alpha = Math.max(0, 1 - dist / connectDistance);

          linePositions[lineIdx * 6] = positions[i * 3];
          linePositions[lineIdx * 6 + 1] = positions[i * 3 + 1];
          linePositions[lineIdx * 6 + 2] = positions[i * 3 + 2];

          linePositions[lineIdx * 6 + 3] = positions[j * 3];
          linePositions[lineIdx * 6 + 4] = positions[j * 3 + 1];
          linePositions[lineIdx * 6 + 5] = positions[j * 3 + 2];

          // Blend blue to violet
          const tFactor = (positions[i * 3 + 1] + 2) / 4;
          const r = THREE.MathUtils.lerp(blueColor.r, violetColor.r, tFactor) * alpha * 0.75;
          const g = THREE.MathUtils.lerp(blueColor.g, violetColor.g, tFactor) * alpha * 0.75;
          const b = THREE.MathUtils.lerp(blueColor.b, violetColor.b, tFactor) * alpha * 0.85;

          lineColors[lineIdx * 6] = r;
          lineColors[lineIdx * 6 + 1] = g;
          lineColors[lineIdx * 6 + 2] = b;
          lineColors[lineIdx * 6 + 3] = r;
          lineColors[lineIdx * 6 + 4] = g;
          lineColors[lineIdx * 6 + 5] = b;

          lineIdx++;
        }
      }
    }

    if (linesGeoRef.current) {
      linesGeoRef.current.setDrawRange(0, lineIdx * 2);
      linesGeoRef.current.attributes.position.needsUpdate = true;
      linesGeoRef.current.attributes.color.needsUpdate = true;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Outer subtle glow sphere mesh */}
      <mesh>
        <sphereGeometry args={[1.95, 24, 24]} />
        <meshBasicMaterial
          color="#3b82f6"
          transparent
          opacity={0.03}
          wireframe
        />
      </mesh>

      {/* Glowing Neural Nodes */}
      <points>
        <bufferGeometry ref={pointsGeoRef}>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.08}
          color={cyanColor}
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* Connecting Neural Synapse Lines */}
      <lineSegments>
        <bufferGeometry ref={linesGeoRef}>
          <bufferAttribute attach="attributes-position" args={[linePositions, 3]} />
          <bufferAttribute attach="attributes-color" args={[lineColors, 3]} />
        </bufferGeometry>
        <lineBasicMaterial
          vertexColors
          transparent
          opacity={0.55}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>
    </group>
  );
}

export default function HeroCanvas() {
  const [mounted, setMounted] = useState(false);
  const [accentColor, setAccentColor] = useState("#3b82f6");
  const [isMobile, setIsMobile] = useState(false);
  const [hasWebGL, setHasWebGL] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(motionQuery.matches);
    const motionListener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    motionQuery.addEventListener("change", motionListener);

    try {
      const testCanvas = document.createElement("canvas");
      const gl = testCanvas.getContext("webgl") || testCanvas.getContext("experimental-webgl");
      if (!gl) setHasWebGL(false);
    } catch {
      setHasWebGL(false);
    }

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile, { passive: true });

    const getComputedAccent = () => {
      const raw = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim();
      if (raw) setAccentColor(raw);
    };
    getComputedAccent();

    const handleVisibilityChange = () => {
      setIsPaused(document.hidden);
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    let observer: IntersectionObserver | null = null;
    if (containerRef.current && "IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            setIsPaused(!entry.isIntersecting);
          });
        },
        { threshold: 0.05 }
      );
      observer.observe(containerRef.current);
    }

    return () => {
      motionQuery.removeEventListener("change", motionListener);
      window.removeEventListener("resize", checkMobile);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (observer) observer.disconnect();
    };
  }, []);

  if (!mounted || prefersReducedMotion || !hasWebGL) {
    return (
      <div ref={containerRef} className="w-full h-full flex items-center justify-center pointer-events-none">
        <div className="w-[280px] sm:w-[360px] h-[280px] sm:h-[360px] rounded-full bg-gradient-to-tr from-blue-600/20 to-violet-600/20 blur-2xl border border-blue-500/20" />
      </div>
    );
  }

  const particleCount = isMobile ? 36 : 68;

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative pointer-events-none select-none flex items-center justify-center"
      style={{ pointerEvents: "none" }}
    >
      {/* Subtle radial backdrop glow */}
      <div className="absolute w-[300px] sm:w-[420px] h-[300px] sm:h-[420px] rounded-full bg-gradient-to-br from-blue-600/15 via-violet-600/15 to-transparent blur-3xl pointer-events-none" />

      <Canvas
        frameloop={isPaused ? "demand" : "always"}
        className="pointer-events-none"
        style={{ pointerEvents: "none", width: "100%", height: "100%" }}
        camera={{ position: [0, 0, 5.2], fov: 50 }}
        dpr={Math.min(1.5, typeof window !== "undefined" ? window.devicePixelRatio : 1)}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
        }}
      >
        <NeuralSphere
          particleCount={particleCount}
          accentColor={accentColor}
          isPaused={isPaused}
        />
      </Canvas>
    </div>
  );
}
