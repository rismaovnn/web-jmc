import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * Hero 3D scene: a floating holographic platform with a glowing portal, a data cube
 * inside it, a soft light beam, rising particles and orbit rings (the "metaverse core").
 *
 * Performance: the scene is STATIC. Nothing animates on its own and no frame is rendered
 * until the pointer enters the illustration. While hovering, the camera tilts towards the
 * cursor and the portal glows; when the pointer leaves, the scene eases back and rendering
 * stops again. The render loop only runs while something is still moving.
 */
export default function ThreeCanvas() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;
    // the interaction area is the whole illustration (this canvas + the technology cards)
    const area = container.parentElement ?? container;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let width = container.clientWidth || 1;
    let height = container.clientHeight || 1;
    const isSmall = () => width < 520;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 1.1, 9);
    const lookTarget = new THREE.Vector3(0, 0.15, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isSmall() ? 1.5 : 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // Palette: royal blue, cyan glow, a touch of violet
    const BLUE = 0x2563eb;
    const CYAN = 0x22d3ee;
    const VIOLET = 0x8b5cf6;

    scene.add(new THREE.AmbientLight(0x7dd3fc, 1.2));
    const keyLight = new THREE.PointLight(CYAN, 6, 14);
    keyLight.position.set(0, 1.2, 2.5);
    scene.add(keyLight);
    const rimLight = new THREE.PointLight(VIOLET, 3, 12);
    rimLight.position.set(-3, -1, 2);
    scene.add(rimLight);

    const root = new THREE.Group();
    scene.add(root);

    // ---------------------------------------------------------------- soft glow sprite texture
    const glowTexture = (() => {
      const c = document.createElement('canvas');
      c.width = c.height = 128;
      const ctx = c.getContext('2d');
      if (ctx) {
        const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
        g.addColorStop(0, 'rgba(255,255,255,1)');
        g.addColorStop(0.25, 'rgba(160,230,255,0.55)');
        g.addColorStop(1, 'rgba(37,99,235,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, 128, 128);
      }
      return new THREE.CanvasTexture(c);
    })();

    // ---------------------------------------------------------------- floating platform
    const platform = new THREE.Group();
    platform.position.y = -1.45;
    root.add(platform);

    const disc = new THREE.Mesh(
      new THREE.CylinderGeometry(2.55, 2.35, 0.14, 72, 1),
      new THREE.MeshPhysicalMaterial({
        color: 0x1e3a8a,
        metalness: 0.4,
        roughness: 0.25,
        transparent: true,
        opacity: 0.55,
        clearcoat: 1,
        emissive: 0x0b2a7a,
        emissiveIntensity: 0.6,
      })
    );
    platform.add(disc);

    const rimRing = new THREE.Mesh(
      new THREE.TorusGeometry(2.56, 0.022, 10, 160),
      new THREE.MeshBasicMaterial({ color: CYAN, transparent: true, opacity: 0.95 })
    );
    rimRing.rotation.x = Math.PI / 2;
    rimRing.position.y = 0.07;
    platform.add(rimRing);

    const innerRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.75, 0.012, 8, 140),
      new THREE.MeshBasicMaterial({ color: 0x60a5fa, transparent: true, opacity: 0.7 })
    );
    innerRing.rotation.x = Math.PI / 2;
    innerRing.position.y = 0.075;
    platform.add(innerRing);

    const polarGrid = new THREE.PolarGridHelper(2.45, 12, 5, 72, 0x38bdf8, 0x1d4ed8);
    (polarGrid.material as THREE.Material).transparent = true;
    (polarGrid.material as THREE.Material).opacity = 0.28;
    polarGrid.position.y = 0.075;
    platform.add(polarGrid);

    // glow pooled under / on the platform
    const floorGlow = new THREE.Mesh(
      new THREE.PlaneGeometry(7, 7),
      new THREE.MeshBasicMaterial({
        map: glowTexture,
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.55,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    floorGlow.rotation.x = -Math.PI / 2;
    floorGlow.position.y = 0.09;
    platform.add(floorGlow);

    // ---------------------------------------------------------------- light beam (hologram column)
    const beamMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      uniforms: { uTime: { value: 0 }, uColor: { value: new THREE.Color(CYAN) } },
      vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: `
        uniform float uTime; uniform vec3 uColor; varying vec2 vUv;
        void main(){
          float fade = pow(1.0 - vUv.y, 1.6);
          float bands = 0.75 + 0.25 * sin(vUv.y * 40.0 - uTime * 3.0);
          float edge = 0.6 + 0.4 * sin(vUv.x * 6.2831 * 3.0 + uTime);
          gl_FragColor = vec4(uColor, fade * bands * edge * 0.22);
        }`,
    });
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 1.8, 3.6, 48, 1, true), beamMat);
    beam.position.y = -1.45 + 1.8;
    root.add(beam);

    // ---------------------------------------------------------------- portal
    const portal = new THREE.Group();
    portal.position.y = 0.35;
    root.add(portal);

    const portalRingMat = new THREE.MeshStandardMaterial({
      color: 0xbfdbfe,
      emissive: BLUE,
      emissiveIntensity: 1.6,
      metalness: 0.6,
      roughness: 0.2,
    });
    const portalRing = new THREE.Mesh(new THREE.TorusGeometry(1.32, 0.075, 20, 140), portalRingMat);
    portal.add(portalRing);

    const portalHaloMat = new THREE.MeshBasicMaterial({
      color: CYAN,
      transparent: true,
      opacity: 0.12,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const portalHalo = new THREE.Mesh(new THREE.TorusGeometry(1.32, 0.2, 12, 120), portalHaloMat);
    portal.add(portalHalo);

    const portalMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uTime: { value: 0 } },
      vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: `
        uniform float uTime; varying vec2 vUv;
        void main(){
          vec2 p = vUv - 0.5;
          float r = length(p) * 2.0;
          float a = atan(p.y, p.x);
          float swirl = 0.5 + 0.5 * sin(a * 3.0 + r * 9.0 - uTime * 1.4);
          float glow = smoothstep(1.0, 0.05, r);
          vec3 blue = vec3(0.10, 0.36, 0.95);
          vec3 cyan = vec3(0.14, 0.83, 0.93);
          vec3 violet = vec3(0.55, 0.36, 0.96);
          vec3 c = mix(blue, cyan, swirl * glow);
          c = mix(c, violet, 0.22 * (0.5 + 0.5 * sin(uTime * 0.6 + r * 5.0)));
          float alpha = glow * (0.28 + 0.42 * swirl) * smoothstep(1.0, 0.9, r);
          gl_FragColor = vec4(c, alpha);
        }`,
    });
    const portalDisc = new THREE.Mesh(new THREE.CircleGeometry(1.28, 96), portalMat);
    portal.add(portalDisc);

    // data cube floating in the portal (static pose)
    const cube = new THREE.Group();
    portal.add(cube);
    const cubeCore = new THREE.Mesh(
      new THREE.BoxGeometry(0.72, 0.72, 0.72),
      new THREE.MeshPhysicalMaterial({
        color: 0x1d4ed8,
        emissive: 0x2563eb,
        emissiveIntensity: 0.9,
        metalness: 0.3,
        roughness: 0.15,
        transparent: true,
        opacity: 0.55,
        clearcoat: 1,
      })
    );
    cube.add(cubeCore);
    const cubeEdges = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(0.74, 0.74, 0.74)),
      new THREE.LineBasicMaterial({ color: 0xa5f3fc, transparent: true, opacity: 0.95 })
    );
    cube.add(cubeEdges);
    const innerCube = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(0.4, 0.4, 0.4)),
      new THREE.LineBasicMaterial({ color: 0xc4b5fd, transparent: true, opacity: 0.85 })
    );
    cube.add(innerCube);
    const cubeGlow = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: glowTexture,
        color: 0x67e8f9,
        transparent: true,
        opacity: 0.7,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    cubeGlow.scale.set(2.2, 2.2, 1);
    cube.add(cubeGlow);

    // ---------------------------------------------------------------- orbit rings with nodes (static pose)
    const nodeGeo = new THREE.SphereGeometry(0.055, 16, 16);
    [
      { radius: 2.15, tiltX: 1.25, tiltZ: 0.35, color: 0x60a5fa, phase: 0 },
      { radius: 2.55, tiltX: 1.4, tiltZ: -0.5, color: CYAN, phase: 2.1 },
      { radius: 1.85, tiltX: 0.25, tiltZ: 0.9, color: VIOLET, phase: 4.2 },
    ].forEach((o) => {
      const g = new THREE.Group();
      g.rotation.set(o.tiltX, 0, o.tiltZ);
      g.position.y = 0.35;
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(o.radius, 0.008, 6, 180),
        new THREE.MeshBasicMaterial({ color: o.color, transparent: true, opacity: 0.45 })
      );
      g.add(ring);
      const node = new THREE.Mesh(nodeGeo, new THREE.MeshBasicMaterial({ color: 0xe0f2fe }));
      node.position.set(Math.cos(o.phase) * o.radius, Math.sin(o.phase) * o.radius, 0);
      const halo = new THREE.Sprite(
        new THREE.SpriteMaterial({ map: glowTexture, color: o.color, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })
      );
      halo.scale.set(0.45, 0.45, 1);
      node.add(halo);
      g.add(node);
      root.add(g);
    });

    // ---------------------------------------------------------------- particles above the platform (static)
    const riseCount = isSmall() ? 70 : 140;
    const riseGeo = new THREE.BufferGeometry();
    const risePos = new Float32Array(riseCount * 3);
    for (let i = 0; i < riseCount; i++) {
      const r = Math.sqrt(Math.random()) * 2.3;
      const t = Math.random() * Math.PI * 2;
      risePos[i * 3] = Math.cos(t) * r;
      risePos[i * 3 + 1] = -1.4 + Math.random() * 3.6;
      risePos[i * 3 + 2] = Math.sin(t) * r;
    }
    riseGeo.setAttribute('position', new THREE.BufferAttribute(risePos, 3));
    const riseParticles = new THREE.Points(
      riseGeo,
      new THREE.PointsMaterial({
        size: 0.07,
        map: glowTexture,
        color: 0x7dd3fc,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    root.add(riseParticles);

    // sparse star field for depth (static)
    const starCount = isSmall() ? 90 : 180;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starPos[i * 3] = (Math.random() - 0.5) * 16;
      starPos[i * 3 + 1] = (Math.random() - 0.5) * 10;
      starPos[i * 3 + 2] = -3 - Math.random() * 6;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const stars = new THREE.Points(
      starGeo,
      new THREE.PointsMaterial({
        size: 0.05,
        map: glowTexture,
        color: 0xbae6fd,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    scene.add(stars);

    // keep the whole composition inside narrow (portrait) canvases
    const fitScene = () => {
      const aspect = width / height;
      // 0.86 leaves room for the technology cards around the portal
      root.scale.setScalar(0.86 * (aspect < 0.9 ? Math.max(0.72, aspect / 0.9) : 1));
    };
    fitScene();

    // ---------------------------------------------------------------- on-demand rendering
    let targetX = 0; // pointer offset, -1..1 (0 = rest)
    let targetY = 0;
    let mouseX = 0; // eased values
    let mouseY = 0;
    let hover = 0; // 0..1 glow amount (eased)
    let hoverTarget = 0;
    let running = false;
    let animId = 0;

    // applies the current eased state to the scene (no time-based motion)
    const applyState = () => {
      mouseX += (targetX - mouseX) * 0.08;
      mouseY += (targetY - mouseY) * 0.08;
      hover += (hoverTarget - hover) * 0.1;

      camera.position.x = mouseX * 0.6;
      camera.position.y = 1.1 - mouseY * 0.4;
      camera.lookAt(lookTarget);

      portalHaloMat.opacity = 0.12 + 0.2 * hover;
      portalRingMat.emissiveIntensity = 1.6 + 0.9 * hover;
      stars.rotation.y = mouseX * 0.04;
    };

    const isSettled = () =>
      Math.abs(targetX - mouseX) < 0.0008 &&
      Math.abs(targetY - mouseY) < 0.0008 &&
      Math.abs(hoverTarget - hover) < 0.002;

    const frame = () => {
      applyState();
      renderer.render(scene, camera);
      if (isSettled()) {
        running = false; // nothing moving any more: stop until the next interaction
        return;
      }
      animId = requestAnimationFrame(frame);
    };

    const requestFrame = () => {
      if (running) return;
      running = true;
      animId = requestAnimationFrame(frame);
    };

    // first paint: static scene, no loop
    applyState();
    renderer.render(scene, camera);

    const handlePointerMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || reduceMotion) return;
      const rect = area.getBoundingClientRect();
      targetX = Math.max(-1, Math.min(1, ((e.clientX - rect.left) / rect.width - 0.5) * 2));
      targetY = Math.max(-1, Math.min(1, ((e.clientY - rect.top) / rect.height - 0.5) * 2));
      hoverTarget = 1;
      requestFrame();
    };
    const handlePointerLeave = () => {
      targetX = 0;
      targetY = 0;
      hoverTarget = 0;
      requestFrame();
    };
    area.addEventListener('pointermove', handlePointerMove, { passive: true });
    area.addEventListener('pointerleave', handlePointerLeave);

    const resizeObserver = new ResizeObserver(() => {
      width = container.clientWidth || 1;
      height = container.clientHeight || 1;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      fitScene();
      applyState();
      renderer.render(scene, camera);
    });
    resizeObserver.observe(container);

    return () => {
      area.removeEventListener('pointermove', handlePointerMove);
      area.removeEventListener('pointerleave', handlePointerLeave);
      resizeObserver.disconnect();
      cancelAnimationFrame(animId);
      running = false;
      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
        else if (mat) mat.dispose();
      });
      glowTexture.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0 w-full h-full" />;
}
