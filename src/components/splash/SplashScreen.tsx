import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Renderer, Program, Mesh, Triangle } from 'ogl';
import { useTheme } from '@/hooks/useTheme';
import { useLenis } from '@/context/LenisContext';
import { SPLASH_SEEN_KEY, useIntro } from '@/context/IntroContext';
import SplashDroplet, { type SplashDropletHandle } from '@/components/splash/SplashDroplet';

const T = {
  PROG_START: 0.4,
  PROG_DUR: 2.2,
  HOLD: 0.35,
  FALL: 1.9,
  FADE_AFTER: 2.3,
  FADE_DUR: 1.0,
};

const CAM_R = 2.4;
const FOV = 45;
const TAN_HALF = Math.tan((FOV * Math.PI) / 360);
const DROP_H0 = 3.0;
const Q2P = 2 / (CAM_R * TAN_HALF);

const PALETTE = {
  dark: ['#3B82F6', '#2800ff', '#ffffff'],
  light: ['#22D3EE', '#0369A1', '#E0F2FE'],
} as const;

const hexToRgb = (hex: string): [number, number, number] => {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return [1, 1, 1];
  return [parseInt(m[1], 16) / 255, parseInt(m[2], 16) / 255, parseInt(m[3], 16) / 255];
};

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (a: number, b: number, v: number) => {
  const x = clamp((v - a) / (b - a));
  return x * x * (3 - 2 * x);
};
const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);
const easeInOutCubic = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const easeInOutSine = (x: number) => -(Math.cos(Math.PI * x) - 1) / 2;

const vertex = /* glsl */ `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragment = /* glsl */ `#version 300 es
precision highp float;

uniform vec2  iResolution;
uniform float iTime;
uniform vec3  uC;
uniform vec3  uF;
uniform vec3  uU;
uniform float uTanHalf;
uniform float uQ2P;
uniform float uImpact;
uniform float uMorph;
uniform float uDropH;
uniform float uStreak;
uniform float uStreakPhase;
uniform float uTop;
uniform float uDark;
uniform vec3  uColor1;
uniform vec3  uColor2;
uniform vec3  uColor3;
out vec4 fragColor;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

vec3 ramp(float g) {
  const float mid = 0.5;
  vec3 col = mix(uColor1, uColor2, smoothstep(0.0, mid, g));
  return mix(col, uColor3, smoothstep(mid, 1.0, g));
}

// Riak radial. Return vec2(tinggi, kemiringan radial) dalam SATU evaluasi
// (turunan dihitung analitik, bukan 4x finite-difference), noise dibuat halus
// (tanpa hash per-piksel) dan cincin yang jauh dari piksel dilewati.
vec2 rippleHeight(vec2 q, float ti) {
  if (ti <= 0.0) return vec2(0.0);
  float r = length(q);
  float nz = 0.12 * (0.5 + 0.5 * sin(q.x * 1.9 + ti * 0.7))
           + 0.08 * (0.5 + 0.5 * sin(q.y * 2.3 - ti * 0.5));
  float F = 44.0 + nz * 6.0;
  float pj = nz * 1.2;
  float h = 0.0;
  float dh = 0.0;

  for (int i = 0; i < 4; i++) {
    float di = ti - float(i) * 0.24;
    if (di <= 0.0) continue;
    float rf = 0.78 * di;
    float w = (0.05 + 0.03 * di) * (1.0 + nz * 0.25);
    float x = (r - rf) / w;
    if (abs(x) > 3.2) continue;
    float e0 = exp(-x * x);
    float decay = exp(-di * 0.5) * smoothstep(0.0, 0.22, di);
    float amp = 0.020 / (0.55 + 1.8 * rf);
    float ph = (r - rf) * F + pj;
    float c = cos(ph);
    float sn = sin(ph);
    h  += e0 * decay * amp * c;
    dh += decay * amp * e0 * (-2.0 * x / w * c - F * sn);
  }
  return vec2(h, dh);
}

vec4 molten(vec2 p, float time) {
  vec2 i = p;
  float c = 0.0;
  float r = length(p + vec2(sin(time), sin(time * 0.3 + 5.0)) * 0.5);
  float d = length(p);
  float rot = d + time + p.x * 1.0;
  float cosRot = cos(rot);
  mat2 warp = mat2(cos(rot - sin(time / 5.0)), sin(rot), -sin(cosRot - time), cosRot) * (-0.4);
  float glowCore = 1.5 * 0.15;
  for (float n = 0.0; n < 3.0; n++) {
    p *= warp;
    float t = r - time / (n + 3.0);
    i -= p + vec2(cos(t - i.x - r) + sin(t + i.y), sin(t - i.y) + cos(t + i.x) + r);
    c += glowCore / length(vec2(sin(i.x + t), cos(i.y + t)));
  }
  c /= 6.0;
  float g = clamp(max(c - 0.11, 0.0) * 1.3, 0.0, 1.0);
  return vec4(ramp(g), g);
}

float streaks(vec2 uv, float phase) {
  float x = uv.x * 9.0;
  float id = floor(x);
  float rn = hash(vec2(id, 3.1));
  float fx = fract(x) - 0.5;
  float y = fract(uv.y * 0.35 - phase * (0.5 + rn) + rn * 13.0);
  float len = 0.10 + 0.22 * rn;
  float tail = clamp(y / len, 0.0, 1.0);
  float line = pow(tail, 2.0) * step(y, len);
  float thin = smoothstep(0.05 + 0.04 * rn, 0.0, abs(fx));
  float keep = step(0.62, rn) * smoothstep(0.10, 0.28, abs(uv.x));
  return line * thin * keep;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * iResolution.xy) / (0.5 * iResolution.y);
  vec3 rd = normalize(uF + vec3(1.0, 0.0, 0.0) * uv.x * uTanHalf + uU * uv.y * uTanHalf);

  vec3 base = mix(vec3(1.0), vec3(0.0), uDark);
  vec3 horizon = mix(vec3(0.78, 0.92, 0.98), vec3(0.03, 0.09, 0.17), uDark);
  vec3 deep = mix(vec3(0.90, 0.97, 1.0), vec3(0.0, 0.012, 0.022), uDark);

  vec3 col;
  float ti = uImpact;

  if (rd.y < -1e-4) {
    float t = -uC.y / rd.y;
    vec3 P = uC + t * rd;
    vec2 q = vec2(P.x, -P.z);

    float fres = pow(1.0 - clamp(-rd.y, 0.0, 1.0), 3.0);
    float ry = -rd.y;
    vec3 refl = mix(horizon, base, pow(clamp(ry * 1.6, 0.0, 1.0), 0.6));
    col = mix(deep, refl, clamp(fres * 1.2 + 0.08, 0.0, 1.0));
    col = mix(col, base, uTop);

    vec2 rh = rippleHeight(q, ti);
    float gR = pow(clamp(abs(rh.y) * 0.95, 0.0, 1.0), 1.35);

    float r2 = dot(q, q);
    if (ti > 0.0) {
      gR += 0.8 * exp(-r2 * 420.0) * exp(-ti * 8.0) * smoothstep(0.0, 0.07, ti);
    } else if (uDropH >= 0.0) {
      gR += 0.55 * exp(-r2 / (0.004 + uDropH * 0.05)) / (1.0 + uDropH * 1.5);
    }
    gR = clamp(gR, 0.0, 1.0);
    vec3 cR = ramp(gR);

    float a = gR;
    vec3 cc = cR * gR;
    // Molten hanya dihitung setelah transisi dimulai (uniform branch = murah)
    if (uMorph > 0.001) {
      vec2 pm = q * uQ2P - 0.5;
      pm += q * inversesqrt(dot(q, q) + 1e-8) * rh.x * 7.0 * (1.0 - smoothstep(0.6, 1.0, uMorph));
      vec4 m = molten(pm, iTime * 0.1);
      a = mix(gR, m.w, uMorph);
      cc = mix(cR * gR, m.rgb * m.w, uMorph);
    }
    col = col * (1.0 - a) + cc;
  } else {
    col = mix(horizon, base, pow(clamp(rd.y * 1.6, 0.0, 1.0), 0.6));
  }

  if (uStreak > 0.001) {
    vec3 sc = mix(uColor2, uColor3, uDark);
    col += sc * streaks(uv, uStreakPhase) * 0.22 * uStreak;
  }

  fragColor = vec4(col, 1.0);
}
`;

interface SplashScreenProps {
  logoLight?: string;
  logoDark?: string;
  title?: string;
}

const SplashScreen = ({
  logoLight = '/logo-z-black.png',
  logoDark = '/logo-z-white.png',
  title = 'zaedporto',
}: SplashScreenProps) => {
  const { t, i18n } = useTranslation();
  const isDark = useTheme();
  const lenis = useLenis();
  const { playing, markHeroShaderReady, markIntroDone } = useIntro();

  const [gone, setGone] = useState(false);
  const [dropActive, setDropActive] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const canvasHostRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const pctRef = useRef<HTMLSpanElement>(null);
  const dropActiveRef = useRef(false);
  const dropRef = useRef<SplashDropletHandle>(null);

  const isDarkRef = useRef(isDark);
  isDarkRef.current = isDark;
  const skipRef = useRef(false);

  useEffect(() => {
    if (!playing || gone) return;
    window.scrollTo(0, 0);
    lenis?.stop();
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    return () => {
      lenis?.start();
      document.documentElement.style.overflow = prev;
    };
  }, [playing, gone, lenis]);

  useEffect(() => {
    if (!playing || gone) return;
    const host = canvasHostRef.current;
    const root = rootRef.current;
    if (!host || !root) return;

    const renderer = new Renderer({
      webgl: 2,
      alpha: false,
      antialias: false,
      dpr: Math.min(window.devicePixelRatio || 1, 1.5),
    });
    const gl = renderer.gl;

    if (!gl || gl.isContextLost()) {
      console.warn('WebGL2 unavailable — skipping splash');
      markHeroShaderReady();
      markIntroDone();
      setGone(true);
      return;
    }

    const canvas = gl.canvas as HTMLCanvasElement;
    canvas.style.display = 'block';
    host.appendChild(canvas);

    const vec3 = () => ({ value: new Float32Array(3) });
    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        iResolution: { value: new Float32Array([1, 1]) },
        iTime: { value: 0 },
        uC: vec3(),
        uF: vec3(),
        uU: vec3(),
        uTanHalf: { value: TAN_HALF },
        uQ2P: { value: Q2P },
        uImpact: { value: -1 },
        uMorph: { value: 0 },
        uDropH: { value: -1 },
        uStreak: { value: 0 },
        uStreakPhase: { value: 0 },
        uTop: { value: 0 },
        uDark: { value: 1 },
        uColor1: vec3(),
        uColor2: vec3(),
        uColor3: vec3(),
      },
    });
    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });
    const U = program.uniforms;

    let needsStatic = true;
    const resize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      const res = U.iResolution.value as Float32Array;
      res[0] = gl.drawingBufferWidth;
      res[1] = gl.drawingBufferHeight;
      needsStatic = true;
    };
    window.addEventListener('resize', resize);
    resize();

    let loaded = document.readyState === 'complete';
    const onLoad = () => (loaded = true);
    window.addEventListener('load', onLoad);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter') skipRef.current = true;
    };
    window.addEventListener('keydown', onKey);

    let raf = 0;
    let tStart = -1;
    let lastNow = 0;
    let sceneStart = -1;
    let heroReadyAt = -1;
    let skipAt = -1;
    let introMarked = false;
    let finished = false;
    let streakPhase = 0;
    let lastDark: boolean | null = null;

    const finish = () => {
      if (finished) return;
      finished = true;
      cancelAnimationFrame(raf);
      try {
        sessionStorage.setItem(SPLASH_SEEN_KEY, '1');
      } catch {
        /* abaikan */
      }
      markHeroShaderReady();
      markIntroDone();
      setGone(true);
    };

    const frame = (now: number) => {
      if (tStart < 0) {
        tStart = now;
        lastNow = now;
      }
      if (gl.isContextLost()) {
        finish();
        return;
      }

      const t = (now - tStart) / 1000;
      const dt = Math.min((now - lastNow) / 1000, 0.05);
      lastNow = now;

      const x = clamp((t - T.PROG_START) / T.PROG_DUR);
      let p = easeInOutCubic(x);
      if (!loaded) p = Math.min(p, 0.92);
      if (p >= 1 && sceneStart < 0) sceneStart = t + T.HOLD;

      if (skipRef.current && skipAt < 0) skipAt = t;

      // Aktifkan SplashDroplet saat scene mulai (sekali saja)
      if (sceneStart >= 0 && !dropActiveRef.current) {
        dropActiveRef.current = true;
        setDropActive(true);
      }

      const s = sceneStart < 0 ? -1 : t - sceneStart;
      const sc = Math.max(s, 0);

      // Satu jam untuk semuanya: kamera, tetesan, riak. ti = detik sejak kontak air.
      const ti = s - T.FALL;

      if (heroReadyAt < 0 && ((s >= 0 && ti >= 0.2) || skipAt >= 0)) {
        heroReadyAt = t;
        markHeroShaderReady();
      }
      const fadeStart =
        skipAt >= 0 ? skipAt : s >= 0 ? sceneStart + T.FALL + T.FADE_AFTER : Infinity;
      const fadeDur = skipAt >= 0 ? 0.5 : T.FADE_DUR;
      if (!introMarked && t >= fadeStart + (skipAt >= 0 ? 0.15 : 0.35)) {
        introMarked = true;
        markIntroDone();
      }
      const overlay = 1 - easeInOutCubic(clamp((t - fadeStart) / fadeDur));
      root.style.opacity = String(overlay);
      if (overlay <= 0) {
        finish();
        return;
      }

      const logo = logoRef.current;
      const text = textRef.current;
      if (logo) {
        const w = easeOutCubic(clamp(t / 0.9));
        const k = clamp(s / 0.5);
        logo.style.clipPath = `inset(0 ${(1 - w) * 100}% 0 0)`;
        logo.style.opacity = String(clamp(t / 0.4) * (1 - k));
        logo.style.transform = `scale(${(0.94 + 0.06 * w) * (1 - 0.4 * k)})`;
      }
      if (text) {
        const tin = clamp((t - 0.5) / 0.6);
        text.style.opacity = String(tin * (1 - clamp(s / 0.3)));
        text.style.transform = `translateY(${(1 - easeOutCubic(tin)) * 8}px)`;
      }
      if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;
      if (pctRef.current) pctRef.current.textContent = `${Math.round(p * 100)}%`;

      const u = clamp(sc / T.FALL);
      const h = s < 0 ? DROP_H0 : ti >= 0 ? 0 : DROP_H0 * (1 - u * u);
      if (s >= 0) dropRef.current?.update(u, ti);
      const phiK = easeInOutSine(clamp((sc - 0.15) / (T.FALL - 0.2)));
      const phi = s < 0 ? 0 : (Math.PI / 2) * phiK;
      const sinP = Math.sin(phi);
      const cosP = Math.cos(phi);

      const dark = isDarkRef.current;
      if (lastDark !== dark) {
        const [c1, c2, c3] = (dark ? PALETTE.dark : PALETTE.light).map(hexToRgb);
        (U.uColor1.value as Float32Array).set(c1);
        (U.uColor2.value as Float32Array).set(c2);
        (U.uColor3.value as Float32Array).set(c3);
        U.uDark.value = dark ? 1 : 0;
        lastDark = dark;
        needsStatic = true;
      }

      if (s < 0 && !needsStatic) {
        raf = requestAnimationFrame(frame);
        return;
      }
      needsStatic = false;

      (U.uC.value as Float32Array).set([0, h + CAM_R * sinP, CAM_R * cosP]);
      (U.uF.value as Float32Array).set([0, -sinP, -cosP]);
      (U.uU.value as Float32Array).set([0, cosP, -sinP]);

      streakPhase += dt * (0.3 + 4.0 * u);
      const streakVis =
        s < 0 || ti >= 0 ? 0 : smooth(0, 0.3, s) * (1 - smooth(0.55, 1.0, phiK)) * (0.3 + 0.7 * u);
      U.uStreak.value = streakVis;
      U.uStreakPhase.value = streakPhase;
      U.uTop.value = smooth(0.7, 1.0, sinP);
      // Matikan ghost shadow — visual drop di BlobCursor, tidak aligned dengan shader
      U.uDropH.value = -1;
      U.uImpact.value = ti >= 0 ? ti : -1;
      U.uMorph.value = ti >= 0 ? smooth(0.35, 2.4, ti) : 0;
      U.iTime.value = heroReadyAt >= 0 ? t - heroReadyAt : 0;

      renderer.render({ scene: mesh });
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('load', onLoad);
      window.removeEventListener('keydown', onKey);
      try {
        host.removeChild(canvas);
      } catch {
        /* sudah terlepas */
      }
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, gone]);

  if (!playing || gone) return null;

  const [c1, c2] = isDark ? PALETTE.dark : PALETTE.light;
  const skipLabel = t('splash.skip', {
    defaultValue: i18n.language === 'id' ? 'Lewati' : 'Skip',
  });

  return (
    <div
      ref={rootRef}
      role="status"
      aria-label="Loading"
      className="fixed inset-0 z-[95] overflow-hidden bg-white dark:bg-black"
    >
      <div ref={canvasHostRef} className="absolute inset-0" />

      {/* Tetesan 3D dari BlobCursor, dikontrol via ref */}
      <SplashDroplet
        ref={dropRef}
        active={dropActive}
        color={isDark ? '#0F2A5C' : '#A5F3FC'}
        material="chrome"
      />

      {/* Logo Z */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div
          ref={logoRef}
          className="h-28 w-28 sm:h-32 sm:w-32"
          style={{
            opacity: 0,
            filter: `drop-shadow(0 0 22px ${c1}66)`,
          }}
        >
          <img
            src={logoLight}
            alt="Z"
            className="h-full w-full object-contain dark:hidden"
            draggable={false}
          />
          <img
            src={logoDark}
            alt="Z"
            className="hidden h-full w-full object-contain dark:block"
            draggable={false}
          />
        </div>
      </div>

      {/* Teks + progress */}
      <div
        className="pointer-events-none absolute inset-x-0 top-1/2 flex justify-center"
        style={{ marginTop: 96 }}
      >
        <div ref={textRef} className="flex flex-col items-center gap-4 opacity-0">
          <span className="font-mono text-sm uppercase tracking-[0.45em] text-black/80 dark:text-white/80">
            {title}
          </span>
          <div className="h-[2px] w-44 overflow-hidden rounded-full bg-black/10 dark:bg-white/15">
            <div
              ref={barRef}
              className="h-full w-full origin-left rounded-full"
              style={{
                transform: 'scaleX(0)',
                background: `linear-gradient(to right, ${c1}, ${c2})`,
              }}
            />
          </div>
          <span
            ref={pctRef}
            className="font-mono text-[11px] text-black/40 dark:text-white/40"
          >
            0%
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => (skipRef.current = true)}
        className="absolute bottom-6 right-6 rounded-full border border-black/15 px-4 py-1.5 text-xs text-black/60 backdrop-blur-sm transition-colors hover:bg-black/5 dark:border-white/20 dark:text-white/60 dark:hover:bg-white/10"
      >
        {skipLabel}
      </button>
    </div>
  );
};

export default SplashScreen;