import React, { useEffect, useRef } from 'react';
import { Renderer, Program, Mesh, Triangle } from 'ogl';

export type MoltenMetalColorMode = 'molten' | 'ember' | 'frost';

export interface MoltenMetalProps {
  color1?: string;
  color2?: string;
  color3?: string;
  speed?: number;
  scale?: number;
  detail?: number;
  glow?: number;
  coreSize?: number;
  swirl?: number;
  fold?: number;
  blackPoint?: number;
  brightness?: number;
  colorMode?: MoltenMetalColorMode;
  grain?: boolean;
  grainIntensity?: number;
  mouseInteraction?: boolean;
  mouseStrength?: number;
  opacity?: number;
  // === RIPPLE ===
  ripple?: number;          // 0 = mati, ~0.05 = halus, ~0.15 = kuat
  rippleSpeed?: number;     // kecepatan gelombang
  rippleFrequency?: number; // kerapatan riak
  // === PERFORMA ===
  maxDpr?: number;          // batas devicePixelRatio (default 1.5)
  paused?: boolean;         // true = berhenti render (context tetap hidup, tanpa re-create)
  maxFps?: number;          // 0 = ikut monitor; mis. 45 untuk hemat GPU
  className?: string;
}

const hexToRgb = (hex: string): [number, number, number] => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return [1, 1, 1];
  return [parseInt(result[1], 16) / 255, parseInt(result[2], 16) / 255, parseInt(result[3], 16) / 255];
};

const colorModeToFloat = (mode: MoltenMetalColorMode): number => (mode === 'ember' ? 1 : mode === 'frost' ? 2 : 0);

const vertex = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragment = `#version 300 es
precision highp float;
uniform vec2 iResolution;
uniform float iTime;
uniform float uSpeed;
uniform float uScale;
uniform float uDetail;
uniform float uGlow;
uniform float uCoreSize;
uniform float uSwirl;
uniform float uFold;
uniform float uBlackPoint;
uniform float uBrightness;
uniform float uColorMode;
uniform float uGrain;
uniform float uGrainIntensity;
uniform float uOpacity;
uniform vec2 uMouse;
uniform float uMouseStrength;
uniform vec2 uDrift;      // sudah dihitung di CPU (mouse drift)
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
// === RIPPLE UNIFORMS ===
uniform float uRipple;
uniform float uRippleSpeed;
uniform float uRippleFreq;
uniform float uRipPhase;   // iTime * speed * 2PI (CPU)
uniform vec2  uRipMouse;   // posisi mouse di ruang p (CPU)
uniform vec2  uRipAmb;     // pusat ripple ambient (CPU)
uniform float uRipAmbPhase;
out vec4 fragColor;

// Noise grain tanpa sin() (interleaved gradient noise) — lebih murah
float grainNoise(vec2 p) {
  return fract(52.9829189 * fract(dot(p, vec2(0.06711056, 0.00583715))));
}

void main() {
  float time = iTime * uSpeed;
  vec2 p = uScale * ((gl_FragCoord.xy - 0.5 * iResolution.xy) / iResolution.y) - 0.5;

  p += uDrift;

  // ============================================================
  // RIPPLE DISPLACEMENT (konstanta waktu/mouse dihitung di CPU)
  // ============================================================
  if (uRipple > 0.0) {
    vec2 rp = p - uRipMouse;
    float rd2 = dot(rp, rp);
    float rd = sqrt(rd2);
    vec2 dir = rp * inversesqrt(rd2 + 1e-8);
    float wave = sin(rd * uRippleFreq - uRipPhase) * exp(-rd * 1.5);

    vec2 ap = p - uRipAmb;
    float ad2 = dot(ap, ap);
    float ad = sqrt(ad2);
    vec2 adir = ap * inversesqrt(ad2 + 1e-8);
    float aw = sin(ad * uRippleFreq * 0.65 - uRipAmbPhase) * exp(-ad) * 0.5;

    p += (dir * wave + adir * aw) * uRipple;
  }
  // ============================================================

  vec2 i = p;
  float c = 0.0;
  float r = length(p + vec2(sin(time), sin(time * 0.3 + 5.0)) * 0.5);
  float d = length(p);
  float rot = d + time + p.x * uSwirl;

  float cosRot = cos(rot);
  mat2 warp = mat2(cos(rot - sin(time / 5.0)), sin(rot), -sin(cosRot - time), cosRot) * uFold;
  float glowCore = uGlow * uCoreSize;

  for (float n = 0.0; n < 8.0; n++) {
    if (n >= uDetail) break;
    p *= warp;
    float t = r - time / (n + 3.0);
    i -= p + vec2(cos(t - i.x - r) + sin(t + i.y), sin(t - i.y) + cos(t + i.x) + r);
    c += glowCore / length(vec2(sin(i.x + t), cos(i.y + t)));
  }

  c /= 6.0;

  float intensity = max(c - uBlackPoint, 0.0) * uBrightness;

  float g = clamp(intensity, 0.0, 1.0);

  float mid = 0.5;
  if (uColorMode > 1.5) {
    mid = 0.65;
  } else if (uColorMode > 0.5) {
    mid = 0.35;
  }

  vec3 col = mix(uColor1, uColor2, smoothstep(0.0, mid, g));
  col = mix(col, uColor3, smoothstep(mid, 1.0, g));

  float a = g;
  if (uGrain > 0.5) {
    float gr = grainNoise(gl_FragCoord.xy + fract(iTime) * 97.0);
    a += (gr - 0.5) * uGrainIntensity;
  }
  a = clamp(a, 0.0, 1.0) * uOpacity;
  fragColor = vec4(col * a, a);
}
`;

type MoltenMetalCtx = {
  renderer: InstanceType<typeof Renderer>;
  program: InstanceType<typeof Program>;
  mesh: InstanceType<typeof Mesh>;
};
const ctxMap = new WeakMap<HTMLDivElement, MoltenMetalCtx>();

const MoltenMetal: React.FC<MoltenMetalProps> = ({
  color1 = '#5227FF',
  color2 = '#FF9FFC',
  color3 = '#FFFFFF',
  speed = 0.35,
  scale = 4,
  detail = 3,
  glow = 1.6,
  coreSize = 0.1,
  swirl = 1,
  fold = -0.2,
  blackPoint = 0.05,
  brightness = 1.3,
  colorMode = 'molten',
  grain = true,
  grainIntensity = 0.05,
  mouseInteraction = true,
  mouseStrength = 0.3,
  opacity = 1.0,
  // === RIPPLE ===
  ripple = 0.05,
  rippleSpeed = 1.2,
  rippleFrequency = 6.0,
  maxDpr = 1.5,
  maxFps = 0,
  paused = false,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  // Nilai terbaru untuk loop RAF (tanpa re-create effect)
  const cfgRef = useRef({ mouseInteraction, mouseStrength, ripple, rippleSpeed, scale });
  const pausedRef = useRef(paused);
  pausedRef.current = paused;
  cfgRef.current = { mouseInteraction, mouseStrength, ripple, rippleSpeed, scale };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const renderer = new Renderer({
      webgl: 2,
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      dpr: Math.min(window.devicePixelRatio || 1, Math.max(1, maxDpr))
    });

    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    const canvas = gl.canvas;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    container.appendChild(canvas);

    const geometry = new Triangle(gl);
    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        iTime: { value: 0 },
        iResolution: { value: new Float32Array([1, 1]) },
        uSpeed: { value: 0.35 },
        uScale: { value: 4 },
        uDetail: { value: 3 },
        uGlow: { value: 1.6 },
        uCoreSize: { value: 0.1 },
        uSwirl: { value: 1 },
        uFold: { value: -0.2 },
        uBlackPoint: { value: 0.05 },
        uBrightness: { value: 1.3 },
        uColorMode: { value: 0 },
        uGrain: { value: 1 },
        uGrainIntensity: { value: 0.05 },
        uOpacity: { value: 1.0 },
        uMouse: { value: new Float32Array([0.5, 0.5]) },
        uMouseStrength: { value: 0.3 },
        uDrift: { value: new Float32Array([0, 0]) },
        uColor1: { value: new Float32Array([1, 1, 1]) },
        uColor2: { value: new Float32Array([1, 1, 1]) },
        uColor3: { value: new Float32Array([1, 1, 1]) },
        // === RIPPLE ===
        uRipple: { value: 0.05 },
        uRippleSpeed: { value: 1.2 },
        uRippleFreq: { value: 6.0 },
        uRipPhase: { value: 0 },
        uRipMouse: { value: new Float32Array([0, 0]) },
        uRipAmb: { value: new Float32Array([0, 0]) },
        uRipAmbPhase: { value: 0 }
      }
    });

    const mesh = new Mesh(gl, { geometry, program });
    ctxMap.set(container, { renderer, program, mesh });

    const setSize = () => {
      // clientWidth/Height = ukuran layout, TIDAK terpengaruh transform scale induk.
      // (getBoundingClientRect ikut ter-scale → canvas membesar permanen setelah
      // resize/mount saat hero sedang zoom.)
      const w = Math.max(1, Math.floor(container.clientWidth));
      const h = Math.max(1, Math.floor(container.clientHeight));
      renderer.setSize(w, h);
      // ogl menimpa style ke px; kembalikan ke 100% supaya selalu mengikuti container
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      const res = program.uniforms.iResolution.value as Float32Array;
      res[0] = gl.drawingBufferWidth;
      res[1] = gl.drawingBufferHeight;
      renderer.render({ scene: mesh });
    };

    const ro = new ResizeObserver(setSize);
    ro.observe(container);
    setSize();

    const targetMouse: [number, number] = [0.5, 0.5];
    const currentMouse: [number, number] = [0.5, 0.5];

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      targetMouse[0] = (e.clientX - rect.left) / rect.width;
      targetMouse[1] = 1.0 - (e.clientY - rect.top) / rect.height;
    };
    const handleMouseLeave = () => {
      targetMouse[0] = 0.5;
      targetMouse[1] = 0.5;
    };
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    let raf = 0;
    let isVisible = true;
    let isPageVisible = !document.hidden;
    const t0 = performance.now();

    const minFrame = maxFps > 0 ? 1000 / maxFps - 1 : 0;
    let lastDraw = 0;

    const loop = (t: number) => {
      raf = requestAnimationFrame(loop);
      if (pausedRef.current) return;
      if (minFrame && t - lastDraw < minFrame) return;
      lastDraw = t;

      const u = program.uniforms;
      const time = (t - t0) * 0.001;
      u.iTime.value = time;

      currentMouse[0] += 0.05 * (targetMouse[0] - currentMouse[0]);
      currentMouse[1] += 0.05 * (targetMouse[1] - currentMouse[1]);
      const m = u.uMouse.value as Float32Array;
      m[0] = currentMouse[0];
      m[1] = currentMouse[1];

      const cfg = cfgRef.current;
      const res = u.iResolution.value as Float32Array;
      const aspect = res[0] / res[1];

      // Drift mouse (CPU)
      const dr = u.uDrift.value as Float32Array;
      if (cfg.mouseInteraction) {
        dr[0] = (m[0] - 0.5) * cfg.mouseStrength * 2;
        dr[1] = (m[1] - 0.5) * cfg.mouseStrength * 2;
      } else {
        dr[0] = 0;
        dr[1] = 0;
      }

      // Konstanta ripple (CPU) — dulu dihitung per-piksel di shader
      if (cfg.ripple > 0) {
        const rm = u.uRipMouse.value as Float32Array;
        rm[0] = cfg.scale * ((m[0] - 0.5) * aspect) - 0.5;
        rm[1] = cfg.scale * (m[1] - 0.5) - 0.5;
        const ra = u.uRipAmb.value as Float32Array;
        ra[0] = Math.sin(time * 0.6) * 0.35;
        ra[1] = Math.cos(time * 0.45) * 0.35;
        u.uRipPhase.value = time * cfg.rippleSpeed * 6.28318;
        u.uRipAmbPhase.value = time * cfg.rippleSpeed * 4.0;
      }

      renderer.render({ scene: mesh });
    };

    const tryStart = () => {
      if (isVisible && isPageVisible && raf === 0) raf = requestAnimationFrame(loop);
    };
    const tryStop = () => {
      if (raf !== 0) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        isVisible ? tryStart() : tryStop();
      },
      { threshold: 0 }
    );
    io.observe(container);

    const onVisibility = () => {
      isPageVisible = !document.hidden;
      isPageVisible ? tryStart() : tryStop();
    };
    document.addEventListener('visibilitychange', onVisibility);

    tryStart();

    return () => {
      tryStop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      ctxMap.delete(container);
      try {
        container.removeChild(canvas);
      } catch {}
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const ctx = ctxMap.get(container);
    if (!ctx) return;
    const u = ctx.program.uniforms;

    u.uSpeed.value = speed;
    u.uScale.value = scale;
    u.uDetail.value = detail;
    u.uGlow.value = glow;
    u.uCoreSize.value = Math.max(coreSize, 0.001);
    u.uSwirl.value = swirl;
    u.uFold.value = fold;
    u.uBlackPoint.value = blackPoint;
    u.uBrightness.value = brightness;
    u.uColorMode.value = colorModeToFloat(colorMode);
    u.uGrain.value = grain ? 1 : 0;
    u.uGrainIntensity.value = grainIntensity;
    u.uOpacity.value = opacity;
    u.uMouseStrength.value = mouseStrength;
    // === RIPPLE ===
    u.uRipple.value = ripple;
    u.uRippleSpeed.value = rippleSpeed;
    u.uRippleFreq.value = rippleFrequency;

    const c1 = hexToRgb(color1);
    const c2 = hexToRgb(color2);
    const c3 = hexToRgb(color3);
    const uc1 = u.uColor1.value as Float32Array;
    const uc2 = u.uColor2.value as Float32Array;
    const uc3 = u.uColor3.value as Float32Array;
    uc1[0] = c1[0];
    uc1[1] = c1[1];
    uc1[2] = c1[2];
    uc2[0] = c2[0];
    uc2[1] = c2[1];
    uc2[2] = c2[2];
    uc3[0] = c3[0];
    uc3[1] = c3[1];
    uc3[2] = c3[2];
  }, [
    color1,
    color2,
    color3,
    speed,
    scale,
    detail,
    glow,
    coreSize,
    swirl,
    fold,
    blackPoint,
    brightness,
    colorMode,
    grain,
    grainIntensity,
    mouseInteraction,
    mouseStrength,
    opacity,
    // === RIPPLE ===
    ripple,
    rippleSpeed,
    rippleFrequency
  ]);

  return <div ref={containerRef} className={`relative h-full w-full overflow-hidden ${className}`.trim()} />;
};

export default MoltenMetal;