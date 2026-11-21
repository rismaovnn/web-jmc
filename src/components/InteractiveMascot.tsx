import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react';
import * as THREE from 'three';
import { clamp, DEG, LookHistory, Spring } from './mascot-spring';
import './interactive-mascot.css';

/** UV anchors use bottom-left origin. Align these when replacing the character. */
export type MascotRig = {
  head: [number, number];
  neck: [number, number];
  shoulder: [number, number];
  hair: [number, number];
  eyes: [number, number];
  mouth: [number, number];
};
export const DEFAULT_MASCOT_RIG: MascotRig = {
  head: [0.53, 0.835], neck: [0.535, 0.700], shoulder: [0.525, 0.625],
  hair: [0.53, 0.930], eyes: [0.525, 0.845], mouth: [0.49, 0.765],
};

export type InteractiveMascotProps = {
  src?: string;
  /** Optional eye-only transparent PNG on the original image's canvas. Required for REAL visible eye tracking/blinking. */
  eyesSrc?: string;
  rig?: MascotRig;
  alt?: string;
  className?: string;
  onReact?: () => void;
};

// Each anatomical layer receives a different spring's pose. This uses actual vertex
// deformation (pseudo-3D head pivot + curved face), NOT CSS rotation of one flat image.
// A single PNG cannot reveal unseen side/back facial pixels at extreme yaw.
const vertexShader = /* glsl */ `
  varying vec2 vUv;
  uniform vec3 uHeadPose;   // yaw, pitch, roll (radians)
  uniform vec2 uNeckPose;   // yaw, pitch
  uniform vec2 uShoulderPose; // yaw and roll
  uniform vec2 uHairPose;   // delayed swing and vertical drag
  uniform vec2 uEyePose;    // quicker micro-shift on visor; true eyes use optional overlay
  uniform vec2 uHeadAnchor;
  uniform vec2 uNeckAnchor;
  uniform vec2 uShoulderAnchor;
  uniform vec2 uHairAnchor;
  uniform vec2 uEyeAnchor;
  uniform vec2 uMouthAnchor;
  uniform float uTime;
  uniform float uHover;
  uniform float uClick;
  uniform float uMotion;

  float zone(vec2 p, vec2 c, vec2 r, float a, float b) {
    float n = length((p-c)/r);
    return 1.0-smoothstep(a,b,n);
  }
  mat3 rotateY(float a){ float c=cos(a),s=sin(a); return mat3(c,0.,-s, 0.,1.,0., s,0.,c); }
  mat3 rotateX(float a){ float c=cos(a),s=sin(a); return mat3(1.,0.,0., 0.,c,s, 0.,-s,c); }
  mat3 rotateZ(float a){ float c=cos(a),s=sin(a); return mat3(c,s,0., -s,c,0., 0.,0.,1.); }

  void main() {
    vUv = uv;
    vec3 p = position;
    vec2 neckPivot = (uNeckAnchor - 0.5) * vec2(2.0, 3.0);
    vec2 headCenter = (uHeadAnchor - 0.5) * vec2(2.0, 3.0);

    // Anatomical segmentation masks are smoothly blended to avoid seams when
    // using a single unsegmented PNG texture.
    float head = zone(uv, uHeadAnchor, vec2(.270,.192), .37, 1.15);
    float neck = zone(uv, uNeckAnchor, vec2(.14,.091), .22, 1.11) * (1. - head*.60);
    float torso = zone(uv, uShoulderAnchor, vec2(.43,.190), .21, 1.25) * (1. - head*.82);
    float hair = zone(uv, uHairAnchor, vec2(.27,.135), .16, 1.22);
    // Eyes are physically occluded by this particular mascot's VR visor.
    float visor = zone(uv, uEyeAnchor, vec2(.195,.079), .29, 1.12);
    float mouth = zone(uv, uMouthAnchor, vec2(.091,.040), .20, 1.05);

    // 1) Shoulders and chest: opposite near/far displacement creates depth.
    float side = smoothstep(.42,.62,uv.x)*2. - 1.;
    float breath = sin(uTime * 1.55) * .010 * uMotion;
    p.x += torso * (uShoulderPose.x * -.029 + uShoulderPose.y * side * .022);
    p.y += torso * (breath - side * uShoulderPose.y * .008);
    p.z += torso * side * uShoulderPose.x * .20;

    // 2) Neck follows head after a delay and bends at the base of the skull.
    p.x += neck * sin(uNeckPose.x) * .085 * uMotion;
    p.y += neck * (-sin(uNeckPose.y) * .040 + max(0.,uNeckPose.y) * .034) * uMotion;
    p.z += neck * sin(uNeckPose.x) * .060 * uMotion;

    // 3) Head turns in 3D around a NECK pivot, with approximate facial depth.
    // Curvature is engaged as the character turns: a better silhouette than a
    // simple rigid planar rotation but still no invented side-view geometry.
    vec3 relative = p - vec3(neckPivot, 0.);
    float dx = (uv.x - uHeadAnchor.x) / .33;
    float faceCurve = sqrt(max(0., 1. - dx*dx));
    relative.z += head * faceCurve * .24 * abs(sin(uHeadPose.x));
    vec3 turned = rotateZ(uHeadPose.z) * rotateX(-uHeadPose.y) * rotateY(uHeadPose.x) * relative;
    p += (turned-relative) * head * uMotion;
    p.x += head * sin(uHeadPose.x) * .042 * uMotion;
    p.y += head * (sin(uHeadPose.y) * .036 + sin(uTime*1.16)*.004) * uMotion;

    // 4) Eyes react first. This tiny visor response implies attention when
    // eyes are hidden. Use the transparent eyesSrc overlay for real pupils.
    p.x += visor * uEyePose.x * .006 * uMotion;
    p.y += visor * uEyePose.y * .005 * uMotion;

    // 5) Hair inertia: spring lags head; high tufts overshoot with velocity.
    float tips = smoothstep(.86,.99,uv.y);
    p.x += hair * (uHairPose.x * (.032 + tips*.033) + sin(uTime*1.5)*.003) * uMotion;
    p.y += hair * (uHairPose.y*.022 + sin(uTime*1.8)*.004) * uMotion;

    // Hover/click subtly expands the existing visible smile.
    p.x += (uv.x-uMouthAnchor.x) * mouth * (uHover*.026 + uClick*.038) * uMotion;
    p.y += mouth * uClick * .010 * uMotion;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(p,1.);
  }
`;

const fragmentShader = /* glsl */ `
  uniform sampler2D uTexture;
  varying vec2 vUv;
  void main() {
    vec4 c = texture2D(uTexture, vUv);
    if (c.a < 0.008) discard;
    gl_FragColor = c;
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

// Optional eye-only overlay. Supply separate transparent eyes PNG, aligned with
// exactly the same UV coordinate system, to enable visible gaze and blinking.
const eyeVertexShader = /* glsl */ `
  uniform vec2 uEye;
  uniform float uBlink;
  uniform vec2 uEyeAnchor;
  uniform vec2 uNeckAnchor;
  uniform vec3 uHeadPose;
  varying vec2 vUv;
  void main(){
    vUv=uv;
    vec3 p=position;
    float d=length((uv-uEyeAnchor)/vec2(.16,.072));
    float w=1.0-smoothstep(.25,1.2,d);
    // The eyes inherit the head's transformation, then apply fast local gaze.
    vec3 pivot=vec3((uNeckAnchor-.5)*vec2(2.,3.),0.);
    vec3 r=p-pivot;
    float cy=cos(uHeadPose.x),sy=sin(uHeadPose.x);
    r=vec3(cy*r.x+sy*r.z,r.y,-sy*r.x+cy*r.z);
    float cx=cos(-uHeadPose.y),sx=sin(-uHeadPose.y);
    r=vec3(r.x,cx*r.y-sx*r.z,sx*r.y+cx*r.z);
    float cr=cos(uHeadPose.z),sr=sin(uHeadPose.z);
    r=vec3(cr*r.x-sr*r.y,sr*r.x+cr*r.y,r.z);
    p=pivot+r;
    p.x+=uEye.x*.034*w;
    p.y+=uEye.y*.028*w;
    p.y+=(uEyeAnchor.y-uv.y)*uBlink*w*.86*3.;
    p.z+=.19;
    gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);
  }
`;

const eyeFragmentShader = /* glsl */ `
  uniform sampler2D uTexture;
  varying vec2 vUv;
  void main(){ vec4 c=texture2D(uTexture,vUv); if(c.a<.008) discard; gl_FragColor=c; #include <colorspace_fragment> }
`;

/** Fully self-contained React/WebGL hero mascot. */
export default function InteractiveMascot({
  src = '/images/mascot-vr.png',
  eyesSrc,
  rig = DEFAULT_MASCOT_RIG,
  alt = 'VR mascot that follows the cursor with its head and shoulders',
  className = '',
  onReact,
}: InteractiveMascotProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const clickAt = useRef(-10000);
  const [webglReady, setWebglReady] = useState(false);
  const click = useCallback(() => { clickAt.current = performance.now(); onReact?.(); }, [onReact]);
  const keyboard = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); click(); }
  };

  const anchors = [
    ...rig.head, ...rig.neck, ...rig.shoulder, ...rig.hair, ...rig.eyes, ...rig.mouth,
  ];

  useEffect(() => {
    setWebglReady(false);
    const host = containerRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;
    let destroyed = false;
    let active = true;
    let lastTime = 0;
    let raf = 0;
    let shader: THREE.ShaderMaterial | null = null;
    let eyesShader: THREE.ShaderMaterial | null = null;
    let renderer: THREE.WebGLRenderer | null = null;
    let meshGeometry: THREE.PlaneGeometry | null = null;
    const textures: THREE.Texture[] = [];
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, .1, 20);
    const mouse = { x: 0, y: 0, inside: false, lastMove: -10000 };
    const history = new LookHistory();
    history.push(performance.now() - 400, 0, 0); // ensures the first head motion is delayed too
    const coarseQuery = window.matchMedia('(pointer: coarse)');
    const reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let reduced = reduceQuery.matches;
    let isCoarse = coarseQuery.matches;
    let accumulatedTime = 0;
    let nextBlink = 4.0;
    let lastTouch = 0;
    const springs = {
      eyeX: new Spring(680, 40), eyeY: new Spring(680, 40),
      headYaw: new Spring(170, 22), headPitch: new Spring(164, 22), headRoll: new Spring(150, 23),
      neckYaw: new Spring(90, 17), neckPitch: new Spring(86, 17),
      shoulderYaw: new Spring(74, 18), shoulderRoll: new Spring(70, 19),
      hairX: new Spring(47, 10.8), hairY: new Spring(42, 10.3),
      proximity: new Spring(110, 22),
    };
    const loadTexture = (url: string, done: (texture: THREE.Texture) => void) => {
      new THREE.TextureLoader().load(url, texture => {
        if (destroyed) { texture.dispose(); return; }
        textures.push(texture);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.anisotropy = Math.min(renderer?.capabilities.getMaxAnisotropy() || 1, 4);
        done(texture);
      }, undefined, () => {
        // Fallback image remains visible; optional eyes layer can fail silently.
      });
    };

    function setViewSize() {
      if (!renderer) return;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (width <= 0 || height <= 0) return;
      camera.aspect = width / height;
      const viewHeight = 1.50; // top 50% of source: head, neck, shoulders and upper chest
      const z = viewHeight / (2 * Math.tan((camera.fov * DEG) / 2));
      camera.position.set(0, 1.5 - viewHeight / 2 - .02, z);
      camera.lookAt(0, 1.5 - viewHeight / 2 - .02, 0);
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isCoarse ? 1.5 : 2));
      renderer.setSize(width, height, false);
      renderer.render(scene, camera);
    }

    const pointerMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      mouse.x = event.clientX;
      mouse.y = event.clientY;
      mouse.inside = true;
      mouse.lastMove = performance.now();
      // The event handler only records position; one rAF samples and renders.
    };
    const pointerOut = (event: PointerEvent) => {
      if (!event.relatedTarget) mouse.inside = false;
    };
    const pointerBlur = () => { mouse.inside = false; };
    const touchMove = (event: PointerEvent) => {
      if (event.pointerType !== 'touch') return;
      const rect = host.getBoundingClientRect();
      mouse.x = event.clientX; mouse.y = event.clientY;
      mouse.inside = event.clientX >= rect.left && event.clientX <= rect.right;
      mouse.lastMove = performance.now();
      lastTouch = mouse.lastMove;
    };

    function resetStill() {
      window.cancelAnimationFrame(raf); raf = 0;
      Object.values(springs).forEach(s => s.reset());
      history.clear();
      host?.style.setProperty('--mascot-parallax-x', '0px');
      host?.style.setProperty('--mascot-parallax-y', '0px');
      if (shader) {
        shader.uniforms.uHeadPose.value.set(0,0,0);
        shader.uniforms.uNeckPose.value.set(0,0);
        shader.uniforms.uShoulderPose.value.set(0,0);
        shader.uniforms.uHairPose.value.set(0,0);
        shader.uniforms.uEyePose.value.set(0,0);
        shader.uniforms.uTime.value = 0;
        shader.uniforms.uMotion.value = 0;
        shader.uniforms.uHover.value = 0;
        shader.uniforms.uClick.value = 0;
      }
      if (eyesShader) { eyesShader.uniforms.uBlink.value = 0; eyesShader.uniforms.uEye.value.set(0,0); }
      if (renderer) renderer.render(scene, camera);
    }

    function frame(now: number) {
      raf = 0;
      if (destroyed || reduced || !active || document.hidden || !renderer || !shader) return;
      const dt = clamp((now - (lastTime || now)) / 1000, .001, .05);
      lastTime = now;
      accumulatedTime += dt;
      const rect = host!.getBoundingClientRect();
      const hasPointer = mouse.inside && (!isCoarse || now - lastTouch < 1700);
      const cursorX = hasPointer ? clamp((mouse.x - (rect.left + rect.width*.5)) / (rect.width*.54), -1, 1) : 0;
      const cursorY = hasPointer ? clamp(((rect.top + rect.height*.45) - mouse.y) / (rect.height*.47), -1, 1) : 0;
      const distance = hasPointer ? Math.hypot((mouse.x-rect.left-rect.width*.5)/(rect.width*.56), (mouse.y-rect.top-rect.height*.40)/(rect.height*.60)) : 2;
      const near = clamp(1-distance,0,1);

      // If cursor is idle, periodic gaze wandering stays subtle.
      const idle = now - mouse.lastMove > 1800;
      const idleX = idle ? Math.sin(accumulatedTime * .31) * .085 : 0;
      const idleY = idle ? Math.sin(accumulatedTime * .37) * .055 : 0;
      history.push(now, clamp(cursorX + idleX,-1,1), clamp(cursorY+idleY,-1,1));
      const gaze = history.sample(now);
      const headTarget = history.sample(now - 100);
      const neckTarget = history.sample(now - 185);
      const shoulderTarget = history.sample(now - 212);
      const hairTarget = history.sample(now - 285);
      const s = springs;
      const eyeX = s.eyeX.update(gaze.x, dt);
      const eyeY = s.eyeY.update(gaze.y, dt);
      const headYaw = s.headYaw.update(headTarget.x * 35 * DEG,dt);
      const clickAge = (now-clickAt.current)/1000;
      const clickEffect = clickAge>=0 && clickAge<1.05 ? Math.pow(Math.sin(clickAge/1.05*Math.PI), 2) : 0;
      const headPitch = s.headPitch.update(clamp(headTarget.y * 25 + clickEffect * 4,-25,25) * DEG,dt);
      const headRoll = s.headRoll.update(clamp(-headTarget.x * 5 + near * 3.2 + clickEffect * 4.5,-8,8) * DEG,dt);
      const neckYaw = s.neckYaw.update(neckTarget.x * 17 * DEG,dt);
      const neckPitch = s.neckPitch.update(neckTarget.y * 10 * DEG,dt);
      const shoulderYaw = s.shoulderYaw.update(shoulderTarget.x * 5.5 * DEG,dt);
      const shoulderRoll = s.shoulderRoll.update(shoulderTarget.x * 3.2 * DEG,dt);
      const hairX = s.hairX.update((hairTarget.x-headYaw/(35*DEG))*.9,dt);
      const hairY = s.hairY.update((hairTarget.y-headPitch/(25*DEG))*.9,dt);
      const proximity = s.proximity.update(near,dt);

      shader.uniforms.uEyePose.value.set(eyeX,eyeY);
      shader.uniforms.uHeadPose.value.set(headYaw,headPitch,headRoll);
      shader.uniforms.uNeckPose.value.set(neckYaw,neckPitch);
      shader.uniforms.uShoulderPose.value.set(shoulderYaw,shoulderRoll);
      shader.uniforms.uHairPose.value.set(hairX,hairY);
      shader.uniforms.uHover.value = proximity;
      shader.uniforms.uClick.value = clickEffect;
      shader.uniforms.uTime.value = accumulatedTime;
      shader.uniforms.uMotion.value = 1;
      // Real blinking only if separate eye artwork was supplied.
      if (accumulatedTime >= nextBlink + .20) nextBlink = accumulatedTime + 3 + Math.random()*3;
      const blinkPhase = (accumulatedTime - nextBlink)/.20;
      const blink = blinkPhase>=0 && blinkPhase<=1 ? Math.sin(blinkPhase*Math.PI) : 0;
      if (eyesShader) { eyesShader.uniforms.uEye.value.set(eyeX,eyeY); eyesShader.uniforms.uBlink.value = blink; eyesShader.uniforms.uHeadPose.value.set(headYaw,headPitch,headRoll); }
      host!.style.setProperty('--mascot-parallax-x', `${(cursorX*10).toFixed(1)}px`);
      host!.style.setProperty('--mascot-parallax-y', `${(cursorY*7).toFixed(1)}px`);
      renderer.render(scene,camera);
      raf = window.requestAnimationFrame(frame);
    }
    const start = () => {
      if (!raf && !destroyed && !reduced && active && !document.hidden && renderer && shader) {
        lastTime = 0;
        raf = window.requestAnimationFrame(frame);
      }
    };
    const visibilityChange = () => { if(document.hidden){ window.cancelAnimationFrame(raf);raf=0; } else start(); };
    const reducedChange = () => { reduced = reduceQuery.matches; if (reduced) resetStill(); else start(); };
    const coarseChange = () => { isCoarse = coarseQuery.matches; setViewSize(); };

    const observer = new IntersectionObserver(([item]) => {
      active = item.isIntersecting;
      if (!active) {window.cancelAnimationFrame(raf);raf=0;} else start();
    }, {threshold: .01});
    observer.observe(host);
    const sizeObserver = new ResizeObserver(setViewSize);
    sizeObserver.observe(canvas);

    try {
      renderer = new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'high-performance'});
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.setClearColor(0x000000,0);
      meshGeometry = new THREE.PlaneGeometry(2,3,72,108);
      loadTexture(src, texture => {
        if(destroyed || !meshGeometry) return;
        shader = new THREE.ShaderMaterial({
          vertexShader, fragmentShader, transparent:true, depthWrite:false,
          uniforms: {
            uTexture:{value:texture},
            uHeadPose:{value:new THREE.Vector3()},uNeckPose:{value:new THREE.Vector2()},
            uShoulderPose:{value:new THREE.Vector2()},uHairPose:{value:new THREE.Vector2()},
            uEyePose:{value:new THREE.Vector2()},
            uHeadAnchor:{value:new THREE.Vector2(...rig.head)},
            uNeckAnchor:{value:new THREE.Vector2(...rig.neck)},
            uShoulderAnchor:{value:new THREE.Vector2(...rig.shoulder)},
            uHairAnchor:{value:new THREE.Vector2(...rig.hair)},
            uEyeAnchor:{value:new THREE.Vector2(...rig.eyes)},
            uMouthAnchor:{value:new THREE.Vector2(...rig.mouth)},
            uTime:{value:0},uHover:{value:0},uClick:{value:0},uMotion:{value:reduced?0:1},
          },
          side: THREE.DoubleSide,
        });
        scene.add(new THREE.Mesh(meshGeometry,shader));
        if (eyesSrc) {
          loadTexture(eyesSrc, eyeTexture => {
            if (destroyed || !meshGeometry) return;
            eyesShader = new THREE.ShaderMaterial({
              vertexShader:eyeVertexShader,fragmentShader:eyeFragmentShader,
              transparent:true,depthWrite:false,side:THREE.DoubleSide,
              uniforms:{uTexture:{value:eyeTexture},uEye:{value:new THREE.Vector2()},uEyeAnchor:{value:new THREE.Vector2(...rig.eyes)},uNeckAnchor:{value:new THREE.Vector2(...rig.neck)},uHeadPose:{value:new THREE.Vector3()},uBlink:{value:0}},
            });
            scene.add(new THREE.Mesh(meshGeometry,eyesShader));
          });
        }
        setViewSize();
        setWebglReady(true);
        if(reduced) resetStill(); else start();
      });
    } catch(e) { console.warn('Mascot: WebGL unavailable, using original PNG',e); }

    window.addEventListener('pointermove',pointerMove,{passive:true});
    window.addEventListener('pointerout',pointerOut,{passive:true});
    window.addEventListener('blur',pointerBlur);
    host.addEventListener('pointerdown',touchMove,{passive:true});
    document.addEventListener('visibilitychange',visibilityChange);
    reduceQuery.addEventListener('change',reducedChange);
    coarseQuery.addEventListener('change',coarseChange);

    return () => {
      destroyed = true;
      window.cancelAnimationFrame(raf);
      observer.disconnect();sizeObserver.disconnect();
      window.removeEventListener('pointermove',pointerMove);
      window.removeEventListener('pointerout',pointerOut);
      window.removeEventListener('blur',pointerBlur);
      host.removeEventListener('pointerdown',touchMove);
      document.removeEventListener('visibilitychange',visibilityChange);
      reduceQuery.removeEventListener('change',reducedChange);
      coarseQuery.removeEventListener('change',coarseChange);
      meshGeometry?.dispose();shader?.dispose();eyesShader?.dispose();
      textures.forEach(t=>t.dispose());renderer?.dispose();
    };
  }, [src, eyesSrc, ...anchors]);

  return (
    <div ref={containerRef} className={`mascot-spring-stage ${className}`}>
      <div className="mascot-spring-halo" aria-hidden="true" />
      <div className="mascot-spring-ring mascot-spring-ring-one" aria-hidden="true" />
      <div className="mascot-spring-ring mascot-spring-ring-two" aria-hidden="true" />
      <div
        className="mascot-spring-figure"
        role="button" tabIndex={0} onClick={click} onKeyDown={keyboard}
        aria-label="Interactive VR mascot. Click or press Enter for a friendly reaction."
      >
        <img src={src} draggable={false} alt={alt} className={`mascot-spring-fallback ${webglReady?'is-hidden':''}`} />
        <canvas ref={canvasRef} aria-hidden="true" className={`mascot-spring-canvas ${webglReady?'is-ready':''}`} />
      </div>
      <div className="mascot-spring-bottom" aria-hidden="true">MOVE YOUR CURSOR <span>✦</span> CLICK TO SAY HI</div>
    </div>
  );
}
