import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const PALETTE = [
  ['#d980ff', 0.55], // violet
  ['#ccff4a', 0.25], // lime
  ['#ececea', 0.2],  // bone
];

// Soft round sprite drawn in code (replaces textures/sprites/disc.png)
function makeSprite() {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.5, 'rgba(255,255,255,0.85)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function pickColor() {
  let r = Math.random();
  for (const [hex, w] of PALETTE) {
    if ((r -= w) <= 0) return new THREE.Color(hex);
  }
  return new THREE.Color(PALETTE[0][0]);
}

/**
 * blur: CSS blur in px (0 disables). dim: 0–1 darkness overlay for text readability.
 */
export default function ParticleBackground({ blur = 3, dim = 0.5 }) {
  const mount = useRef(null);

  useEffect(() => {
    const el = mount.current;
    if (!el) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const small = window.innerWidth < 768;
    const COUNT = small ? 1500 : 3500;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: 'low-power' });
    } catch {
      return; // no WebGL: the plain dark background still works
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.domElement.style.cssText = 'width:100%;height:100%;display:block';
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0e0e10, 0.0011);

    const camera = new THREE.PerspectiveCamera(55, 1, 2, 2000);
    camera.position.z = 1000;

    const positions = new Float32Array(COUNT * 3);
    const colors = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      positions[i * 3] = 2000 * Math.random() - 1000;
      positions[i * 3 + 1] = 2000 * Math.random() - 1000;
      positions[i * 3 + 2] = 2000 * Math.random() - 1000;
      const c = pickColor();
      colors.set([c.r, c.g, c.b], i * 3);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const sprite = makeSprite();
    const material = new THREE.PointsMaterial({
      size: small ? 20 : 24,
      sizeAttenuation: true,
      map: sprite,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
      alphaTest: 0.01,
    });
    const points = new THREE.Points(geometry, material);
    scene.add(points);

    let mx = 0, my = 0;
    const resize = () => {
      const w = el.clientWidth || window.innerWidth;
      const h = el.clientHeight || window.innerHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      if (reduce) draw();
    };

    const draw = () => {
      camera.position.x += (mx - camera.position.x) * 0.03;
      camera.position.y += (-my - camera.position.y) * 0.03;
      camera.lookAt(scene.position);
      renderer.render(scene, camera);
    };

    const frame = (now = performance.now()) => {
      points.rotation.y = now * 0.00002;                 // slow drift
      points.rotation.x = window.scrollY * 0.00025;      // gentle scroll parallax
      draw();
    };

    const onPointer = (e) => {
      if (e.pointerType !== 'mouse') return;
      mx = (e.clientX - window.innerWidth / 2) * 0.35;
      my = (e.clientY - window.innerHeight / 2) * 0.35;
    };

    const onVisibility = () => {
      if (reduce) return;
      renderer.setAnimationLoop(document.hidden ? null : frame);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    if (reduce) {
      draw();
    } else {
      window.addEventListener('pointermove', onPointer, { passive: true });
      document.addEventListener('visibilitychange', onVisibility);
      renderer.setAnimationLoop(frame);
    }

    return () => {
      ro.disconnect();
      window.removeEventListener('pointermove', onPointer);
      document.removeEventListener('visibilitychange', onVisibility);
      renderer.setAnimationLoop(null);
      geometry.dispose();
      material.dispose();
      sprite.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <div aria-hidden="true" className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
      <div
        ref={mount}
        className="absolute inset-0"
        style={{ filter: blur ? `blur(${blur}px)` : undefined, transform: 'scale(1.06)' }}
      />
      <div className="absolute inset-0 bg-ink" style={{ opacity: dim }} />
    </div>
  );
}