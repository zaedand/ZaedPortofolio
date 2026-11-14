import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  motion,
  useScroll,
  useTransform,
  useMotionTemplate,
  useMotionValueEvent,
  useReducedMotion,
  type Variants,
} from 'framer-motion';
import MoltenMetal from '@/components/animated/MoltenMetal';
import { useTheme } from '@/hooks/useTheme';
import { useIntro } from '@/context/IntroContext';

const reveal: Variants = {
  hidden: { opacity: 0, y: 28, filter: 'blur(14px)' },
  show: (delay: number) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 1.1, ease: [0.22, 1, 0.36, 1] as const, delay },
  }),
};

/**
 * Hero pinned selama 160vh scroll (h-[260vh]). Di 100vh terakhir, About (Home.tsx)
 * ditahan di atas layar lalu zoom mendekat (scale .86 → 1 + fade), sementara
 * hero terus zoom-in dan menggelap. Kalau h-[...] diubah, tetap 100vh + durasi pin.
 */
const ABOUT_BG_DARK = '#0d151a';
const ABOUT_BG_LIGHT = '#ffffff';

const Hero = () => {
  const { t, i18n } = useTranslation();
  const isDark = useTheme();
  const reduced = useReducedMotion();
  const { heroShaderReady, introDone } = useIntro();

  const outerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: outerRef,
    offset: ['start start', 'end end'],
  });

  const [inView, setInView] = useState(true);
  useEffect(() => {
    const el = outerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => setInView(e.isIntersecting),
      { rootMargin: '200px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  /* ── Shader dimatikan saat hero sudah tertutup penuh oleh About ── */
  const [covered, setCovered] = useState(false);
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    const c = v >= 0.92;
    setCovered((prev) => (prev === c ? prev : c));
  });

  /* ── Intro latch: jangan pernah replay reveal ── */
  const [everShown, setEverShown] = useState(false);
  useEffect(() => {
    if (introDone) setEverShown(true);
  }, [introDone]);

  /* ── TEXT: bidirectional smooth (scroll down = fade out+zoom+blur, scroll up = reverse) ── */
  const ZOOM_END = 0.22; // teks selesai memudar di ±35vh pertama

  const textOpacity = useTransform(scrollYProgress, [0, ZOOM_END], [1, 0]);
  const textScale   = useTransform(scrollYProgress, [0, ZOOM_END], [1, 1.18]);
  const textY       = useTransform(scrollYProgress, [0, ZOOM_END], [0, -50]);

  const blurAmount = useTransform(scrollYProgress, [0, ZOOM_END], [0, 18]);
  const textBlur   = useMotionTemplate`blur(${blurAmount}px)`;

  /* ── Shader & depth ── */
  const bgScale       = useTransform(scrollYProgress, [0, 1], [1, 2.1]);
  // Menggelap bertahap saat About meluncur masuk (progress ≈ 0.4 → 1)
  const depthOpacity  = useTransform(scrollYProgress, [0.4, 1.0], [0, 0.85]);
  const hintOpacity   = useTransform(scrollYProgress, [0, 0.05], [1, 0]);

  const rawRoles = t('hero.roles', { returnObjects: true });
  const roles: string[] = Array.isArray(rawRoles) ? (rawRoles as string[]) : [];

  const today = new Date().toLocaleDateString(
    i18n.language === 'id' ? 'id-ID' : 'en-US',
    { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
  );

  const state = everShown ? 'show' : 'hidden';

  return (
    <section
      id="home"
      ref={outerRef}
      className={`relative ${reduced ? 'min-h-screen' : 'h-[260vh]'}`}
    >
      <div
        className={`isolate h-screen overflow-hidden bg-white dark:bg-black ${
          reduced ? 'relative' : 'sticky top-0'
        }`}
      >
        {/* ── MOLTEN METAL ── */}
        <motion.div
          className="absolute inset-0 -z-10 will-change-transform"
          style={reduced ? undefined : { scale: bgScale }}
        >
          {inView && heroShaderReady && !covered && (
            <MoltenMetal
              color1={isDark ? '#3B82F6' : '#22D3EE'}
              color2={isDark ? '#2800ff' : '#0369A1'}
              color3={isDark ? '#ffffff' : '#E0F2FE'}
              colorMode="molten"
              speed={0.1}
              scale={4}
              detail={3}
              glow={1.5}
              coreSize={0.15}
              swirl={1}
              fold={-0.4}
              blackPoint={0.11}
              brightness={1.3}
              opacity={1}
              grain
              grainIntensity={0}
              mouseInteraction
              mouseStrength={0.3}
            />
          )}
        </motion.div>

        {/* ── DEPTH ── */}
        {!reduced && (
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-[5]"
            style={{
              opacity: depthOpacity,
              background: isDark ? ABOUT_BG_DARK : ABOUT_BG_LIGHT,
            }}
          />
        )}

        {/* ── KONTEN HERO (bidirectional smooth) ── */}
        <motion.div
          className="pointer-events-none relative z-10 flex h-full flex-col items-center justify-center px-6 text-center text-black dark:text-white"
          style={
            reduced
              ? undefined
              : {
                  opacity: textOpacity,
                  scale: textScale,
                  y: textY,
                  filter: textBlur,
                }
          }
        >
          <motion.h1
            custom={0}
            variants={reveal}
            initial="hidden"
            animate={state}
            className="text-3xl font-bold leading-tight sm:text-4xl md:text-5xl lg:text-6xl"
          >
            Zaidan Akmal Mauludi
          </motion.h1>

          <motion.p
            custom={0.18}
            variants={reveal}
            initial="hidden"
            animate={state}
            className="mt-3 max-w-2xl text-sm text-black/70 dark:text-white/80 sm:text-base md:mt-2 md:text-xl"
          >
            {roles.map((role, i) => (
              <span key={role}>
                {i > 0 && <span className="hidden sm:inline"> | </span>}
                <span className="block sm:inline">{role}</span>
              </span>
            ))}
          </motion.p>

          <motion.div
            custom={0.36}
            variants={reveal}
            initial="hidden"
            animate={state}
            className="pointer-events-auto mt-6 flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm"
          >
            <span className="flex items-center gap-2 rounded-full border border-black/15 bg-black/5 px-4 py-1.5 backdrop-blur-sm dark:border-white/20 dark:bg-white/5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75 dark:bg-green-400" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500 dark:bg-green-400" />
              </span>
              {t('hero.status')}
            </span>

            <span className="rounded-full border border-black/15 bg-black/5 px-4 py-1.5 backdrop-blur-sm dark:border-white/20 dark:bg-white/5">
              {today}
            </span>

            <span className="rounded-full border border-black/15 bg-black/5 px-4 py-1.5 backdrop-blur-sm dark:border-white/20 dark:bg-white/5">
              📍 {t('hero.domicile')}
            </span>
          </motion.div>
        </motion.div>

        {/* ── SCROLL HINT ── */}
        {!reduced && (
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-8 z-10"
            style={{ opacity: hintOpacity }}
          >
            <motion.div
              custom={0.7}
              variants={reveal}
              initial="hidden"
              animate={state}
              className="flex flex-col items-center gap-2 text-xs uppercase tracking-widest text-black/60 dark:text-white/60"
            >
              {t('hero.scrollHint', { defaultValue: 'Scroll' })}
              <svg
                className="h-4 w-4 animate-bounce"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </motion.div>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default Hero;