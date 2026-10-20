// src/components/animated/JellyfishBackground.tsx
import { useEffect, useRef, useState } from 'react';

const SKETCHFAB_SRC =
  'https://sketchfab.com/models/d8bce53c36d046cb84310e941bdfc169/embed' +
  '?autospin=0.2' +        // spin lambat
  '&autostart=1' +          // langsung play
  '&ui_infos=0' +           // sembunyikan info bar
  '&ui_watermark=0' +       // sembunyikan watermark (kalau Pro)
  '&ui_controls=0' +        // sembunyikan kontrol
  '&ui_stop=0' +
  '&ui_annotations=0' +
  '&ui_fullscreen=0' +
  '&ui_settings=0' +
  '&ui_vr=0' +
  '&ui_help=0' +
  '&ui_theme=dark' +
  '&transparent=1' +        // background transparan
  '&preload=1' +
  '&dnt=1';                 // do-not-track

export function JellyfishBackground({ opacity = 0.4 }: { opacity?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // ── Hanya mount iframe saat section terlihat ──
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: '200px', threshold: 0 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // ── Cek preferensi reduced motion & device ──
  const shouldRender =
    inView &&
    typeof window !== 'undefined' &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
    window.matchMedia('(min-width: 768px)').matches; // skip di mobile

  return (
    <div
      ref={ref}
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{ opacity }}
      aria-hidden="true"
    >
      {/* Placeholder gradient — muncul sebelum iframe ready */}
      {!loaded && (
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 50% 40%, rgba(59,130,246,0.15), transparent 70%)',
          }}
        />
      )}

      {shouldRender && (
        <iframe
          title="Jellyfish background"
          src={SKETCHFAB_SRC}
          frameBorder="0"
          allow="autoplay; fullscreen; xr-spatial-tracking"
          allowFullScreen
          onLoad={() => setLoaded(true)}
          className="absolute inset-0 h-full w-full"
          style={{
            border: 0,
            // Sedikit blur biar menyatu dengan background
            filter: 'blur(1px) saturate(1.2)',
            // Scale up untuk nutup tepi blur
            transform: 'scale(1.05)',
          }}
        />
      )}
    </div>
  );
}

export default JellyfishBackground;