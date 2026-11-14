import { useEffect, useRef, useState } from 'react';
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion';
import Navbar from '../components/layout/Navbar';
import LazySection from '../components/layout/LazySection';
import Hero from '../components/sections/Hero';

import Footer from '../components/sections/Footer';

/**
 * About "muncul dari kedalaman": selama 100vh terakhir pin hero, panel About
 * ditahan di atas layar (bukan naik dari bawah), lalu zoom mendekat
 * (scale .86 → 1 + fade). Setelah itu teks/lanyard muncul berurutan
 * (diatur lewat data-reveal + group/about di About.tsx).
 */
const AboutReveal = () => {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  // p: 0 saat atas wrapper di dasar layar → 1 saat di atas layar (hero selesai pin)
  const { scrollYProgress: p } = useScroll({
    target: ref,
    offset: ['start end', 'start start'],
  });

  // Tahan panel di atas layar sampai p = 1 (membatalkan gerak naik alami)
  // (p = 0: posisi alami di luar layar, supaya tidak ter-mount/dirender sebelum waktunya)
  const y = useTransform(p, (v) => (v <= 0 ? '0vh' : `${(v - 1) * 100}vh`));
  const opacity = useTransform(p, [0.12, 0.6], [0, 1]);
  const scale = useTransform(p, [0.12, 0.85], [0.86, 1]);
  const pointer = useTransform(p, (v) => (v > 0.95 ? 'auto' : 'none'));
  const vis = useTransform(p, (v) => (v <= 0.001 ? 'hidden' : 'visible'));

  useMotionValueEvent(p, 'change', (v) => {
    // hysteresis supaya tidak berkedip di batas
    setRevealed((prev) => (prev ? v > 0.7 : v > 0.82));
  });

  return (
    <div
      ref={ref}
      className="relative z-20 -mt-[100vh] motion-reduce:mt-0"
    >
      <motion.div
        data-reveal={reduced || revealed ? 'on' : 'off'}
        className="group/about"
        style={
          reduced
            ? undefined
            : {
                y,
                opacity,
                scale,
                pointerEvents: pointer,
                visibility: vis,
                transformOrigin: '50% 50vh',
              }
        }
      >
        <LazySection
          id="about"
          importFn={() => import('../components/sections/About')}
          minHeight="100vh"
          bgColor="#0d151a"
        />
      </motion.div>
    </div>
  );
};

const Home = () => {
  // Preload chunk saat idle supaya About langsung tampil saat zoom masuk
  useEffect(() => {
    const load = () => {
      void import('../components/sections/About');
      void import('../components/sections/Experience');
    };
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    if (w.requestIdleCallback) {
      const id = w.requestIdleCallback(load, { timeout: 2500 });
      return () => w.cancelIdleCallback?.(id);
    }
    const id = window.setTimeout(load, 1200);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <>
      <Navbar />
      <Hero />

      <AboutReveal />

      <LazySection
        id="experience"
        importFn={() => import('../components/sections/Experience')}
        minHeight="100vh"
        bgColor="#0B0D10"
      />
      <LazySection
        id="projects"
        importFn={() => import('../components/sections/Projects')}
        minHeight="100vh"
        bgColor="#0d151a"
      />
      <LazySection
        id="certificates"
        importFn={() => import('../components/sections/Certificates')}
        minHeight="100vh"
        bgColor="#0B0D10"
      />

      <Footer />
    </>
  );
};

export default Home;