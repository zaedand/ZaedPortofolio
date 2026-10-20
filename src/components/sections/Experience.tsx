import { memo, useCallback, useEffect, useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Folder from '@/components/animated/Folder';
import ElectricBorder from '@/components/animated/ElectricBorder';
import { useTheme } from '@/hooks/useTheme';

type ExperienceItem = { id: string; title: string; subtitle: string; period: string };

const docsMap: Record<string, string[]> = {
  skripsi: ['/docs/skripsi-1.jpg', '/docs/skripsi-2.jpg'],
  pi: ['/docs/pindad-1.jpg', '/docs/pindad-2.jpg'],
  am: ['/docs/am-1.jpg', '/docs/am-2.jpg'],
  kkn: ['/docs/kkn-1.jpg', '/docs/kkn-2.jpg'],
  akademik: ['/docs/akademik-1.jpg'],
};

/* ============================================================
   HOOKS
   ============================================================ */
const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false
  );

  useEffect(() => {
    const mq = window.matchMedia(query);
    const update = () => setMatches(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, [query]);

  return matches;
};

const useInView = <T extends HTMLElement>(rootMargin = '150px') => {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin, threshold: 0 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [rootMargin]);

  return { ref, inView };
};

/* ============================================================
   JELLYFISH BACKGROUND — SVG + CSS (tanpa filter, pause saat offscreen)
   ============================================================ */
const JELLYFISH_CONFIGS = [
  { top: '8%', left: '12%', size: 90, duration: 7, delay: 0, opacity: 0.9 },
  { top: '42%', left: '78%', size: 60, duration: 9, delay: 1.2, opacity: 0.6 },
  { top: '68%', left: '20%', size: 72, duration: 8, delay: 2.4, opacity: 0.7 },
];

const JELLYFISH_CSS = `
  @keyframes jellyfish-float {
    0%, 100% { transform: translateY(0) translateX(0) rotate(0deg); }
    50% { transform: translateY(-26px) translateX(8px) rotate(3deg); }
  }
  @keyframes jellyfish-bell-pulse {
    0%, 100% { transform: scaleY(1); }
    50% { transform: scaleY(0.82); }
  }
  @keyframes jellyfish-tentacle-sway {
    0%, 100% { transform: rotate(-6deg); }
    50% { transform: rotate(6deg); }
  }
  .jellyfish-float {
    animation-name: jellyfish-float;
    animation-timing-function: ease-in-out;
    animation-iteration-count: infinite;
    will-change: transform;
  }
  .jellyfish-bell {
    transform-origin: 50px 45px;
    animation: jellyfish-bell-pulse 4s ease-in-out infinite;
  }
  .jellyfish-tentacle {
    animation-name: jellyfish-tentacle-sway;
    animation-duration: 3.5s;
    animation-timing-function: ease-in-out;
    animation-iteration-count: infinite;
  }
  .jf-paused .jellyfish-float,
  .jf-paused .jellyfish-bell,
  .jf-paused .jellyfish-tentacle {
    animation-play-state: paused;
  }
`;

const Jellyfish = memo(function Jellyfish({
  size,
  top,
  left,
  duration,
  delay,
  opacity,
  color,
}: {
  size: number;
  top: string;
  left: string;
  duration: number;
  delay: number;
  opacity: number;
  color: string;
}) {
  // Glow dibuat lewat gradient (statis), bukan CSS filter yang di-repaint tiap frame
  const gid = useId().replace(/:/g, '');

  return (
    <div
      className="jellyfish-float"
      style={{
        position: 'absolute',
        top,
        left,
        width: size,
        height: size * 1.3,
        opacity,
        animationDuration: `${duration}s`,
        animationDelay: `${delay}s`,
      }}
    >
      <svg viewBox="0 0 100 130" className="h-full w-full">
        <defs>
          <radialGradient id={gid} cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor={color} stopOpacity="0.85" />
            <stop offset="100%" stopColor={color} stopOpacity="0.3" />
          </radialGradient>
        </defs>
        <path
          className="jellyfish-bell"
          d="M10 55 C10 15, 90 15, 90 55 C90 70, 75 72, 50 72 C25 72, 10 70, 10 55 Z"
          fill={`url(#${gid})`}
        />
        {[0, 1, 2, 3, 4].map((i) => (
          <path
            key={i}
            className="jellyfish-tentacle"
            style={{
              animationDelay: `${delay + i * 0.3}s`,
              transformOrigin: `${18 + i * 16}px 68px`,
            }}
            d={`M${18 + i * 16} 68 C ${14 + i * 16} 90, ${22 + i * 16} 100, ${16 + i * 16} 125`}
            stroke={color}
            strokeWidth="2.2"
            strokeLinecap="round"
            fill="none"
            opacity="0.55"
          />
        ))}
      </svg>
    </div>
  );
});

const JellyfishBackground = memo(function JellyfishBackground({
  accent,
  playing,
}: {
  accent: string;
  playing: boolean;
}) {
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  if (reducedMotion) return null;

  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${playing ? '' : 'jf-paused'}`}
      aria-hidden="true"
    >
      <style>{JELLYFISH_CSS}</style>
      {JELLYFISH_CONFIGS.map((cfg, i) => (
        <Jellyfish key={i} {...cfg} color={accent} />
      ))}
    </div>
  );
});

/* ============================================================
   CARD — ElectricBorder hanya di-mount saat hover
   ============================================================ */
const ExperienceCard = memo(function ExperienceCard({
  item,
  rightOnDesktop,
  isDark,
  accent,
  hoverable,
}: {
  item: ExperienceItem;
  rightOnDesktop: boolean;
  isDark: boolean;
  accent: string;
  hoverable: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const showElectric = hoverable && hovered;

  const innerContent = (
    <div
      className={`relative h-full w-full rounded-2xl bg-white/90 p-5
        transition-colors duration-300
        dark:bg-[#0B0D10]/90
        ${rightOnDesktop ? 'md:text-right' : ''}`}
      style={{
        // transparent (bukan none) supaya tinggi card tidak loncat 1px saat hover
        border: `1px solid ${
          showElectric
            ? 'transparent'
            : isDark
              ? 'rgba(255,255,255,0.1)'
              : 'rgba(0,0,0,0.08)'
        }`,
      }}
    >
      <span
        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1
          font-mono text-[11px] font-medium uppercase tracking-wider"
        style={{
          background: isDark ? 'rgba(59,130,246,0.15)' : 'rgba(56,189,248,0.15)',
          color: isDark ? '#7C9CFF' : '#0284C7',
        }}
      >
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: accent }} />
        {item.period}
      </span>

      <h3 className="mt-3 text-xl font-semibold text-black dark:text-[#F2F1EC]">
        {item.title}
      </h3>
      <p className="mt-1 text-sm leading-relaxed text-black/60 dark:text-white/60">
        {item.subtitle}
      </p>

      {/* Garis aksen — di desktop yang rata kanan dicerminkan dengan scale-x */}
      <div
        className={`mt-4 h-px transition-[width,opacity] duration-500
          ${hovered ? 'w-12 opacity-100' : 'w-0 opacity-0'}
          ${rightOnDesktop ? 'md:ml-auto md:-scale-x-100' : ''}`}
        style={{ background: `linear-gradient(to right, ${accent}, transparent)` }}
      />
    </div>
  );

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative h-full w-full"
    >
      {showElectric ? (
        <ElectricBorder
          color={accent}
          speed={1}
          chaos={0.12}
          borderRadius={16}
          className="relative h-full w-full"
        >
          {innerContent}
        </ElectricBorder>
      ) : (
        <div className="relative h-full w-full rounded-2xl">{innerContent}</div>
      )}
    </div>
  );
});

/* ============================================================
   FOLDER BLOCK
   ============================================================ */
const FolderBlock = memo(function FolderBlock({
  docs,
  title,
  alignEndOnDesktop,
  viewDocsLabel,
  isDark,
}: {
  docs: string[];
  title: string;
  alignEndOnDesktop: boolean;
  viewDocsLabel: string;
  isDark: boolean;
}) {
  const folderItems = docs.map((src, i) => (
    <a
      key={src}
      href={src}
      target="_blank"
      rel="noopener noreferrer"
      className="block h-full w-full overflow-hidden rounded-md bg-slate-900"
      onClick={(e) => e.stopPropagation()}
    >
      <img
        src={src}
        alt={`${title} ${i + 1}`}
        loading="lazy"
        decoding="async"
        className="h-full w-full object-cover"
      />
    </a>
  ));

  return (
    <div
      className={`flex flex-col items-start gap-3 ${alignEndOnDesktop ? 'md:items-end' : ''}`}
    >
      <Folder color="#cdcd00" size={1} items={folderItems} />
      <span
        className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1
          text-[11px] font-medium
          border-black/10 bg-white/70 text-black/60
          dark:border-white/10 dark:bg-white/5 dark:text-white/60"
      >
        <svg
          className="h-3 w-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
          />
        </svg>
        {viewDocsLabel}
        <span
          className="ml-0.5 rounded-full px-1.5 text-[10px] font-bold"
          style={{
            background: isDark ? 'rgba(59,130,246,0.2)' : 'rgba(56,189,248,0.2)',
            color: isDark ? '#7C9CFF' : '#0284C7',
          }}
        >
          {docs.length}
        </span>
      </span>
    </div>
  );
});

/* ============================================================
   MAIN SECTION
   ============================================================ */
const Experience = () => {
  const { t } = useTranslation();
  const isDark = useTheme();
  const hoverable = useMediaQuery('(hover: hover) and (pointer: fine)');
  const { ref: viewRef, inView } = useInView<HTMLElement>();

  const trackRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);

  // Progress garis ditulis langsung ke DOM (tanpa setState) supaya scroll
  // tidak me-render ulang seluruh section 60x/detik.
  const updateProgress = useCallback(() => {
    rafRef.current = 0;
    const track = trackRef.current;
    const line = lineRef.current;
    if (!track || !line) return;
    const rect = track.getBoundingClientRect();
    const vh = window.innerHeight;
    const pct = Math.min(Math.max((vh - rect.top) / (rect.height + vh), 0), 1);
    line.style.transform = `scaleY(${pct})`;
  }, []);

  const handleScroll = useCallback(() => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(updateProgress);
  }, [updateProgress]);

  useEffect(() => {
    if (!inView) return;
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }
    };
  }, [inView, handleScroll]);

  const items = t('experience.items', { returnObjects: true }) as ExperienceItem[];
  const viewDocsLabel = t('experience.viewDocs');

  const accent = isDark ? '#3B82F6' : '#38BDF8';
  const accentSoft = isDark ? '#7C9CFF' : '#7DD3FC';

  return (
    <section
      id="experience"
      ref={viewRef}
      className="relative overflow-hidden bg-white px-6 py-24 dark:bg-[#0B0D10] md:py-32"
    >
      <JellyfishBackground accent={accent} playing={inView} />

      {/* Glow statis — radial-gradient, bukan blur-[100px] yang mahal di-paint */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/3 h-[500px] w-[500px] -translate-x-1/2"
        style={{
          background: `radial-gradient(circle, ${
            isDark ? 'rgba(59,130,246,0.12)' : 'rgba(56,189,248,0.1)'
          } 0%, transparent 70%)`,
        }}
      />

      <div className="relative mx-auto max-w-5xl">
        <header className="text-center">
          <h2 className="text-3xl font-semibold text-black dark:text-[#F2F1EC] md:text-4xl">
            {t('experience.heading')}
          </h2>
          <div
            className="mx-auto mt-4 h-px w-16"
            style={{
              background: `linear-gradient(to right, transparent, ${accent}, transparent)`,
            }}
          />
        </header>

        <div ref={trackRef} className="relative mt-16 md:mt-20">
          {/* Garis (satu elemen, responsif mobile/desktop) */}
          <div className="absolute left-3 top-0 h-full w-px bg-black/10 dark:bg-white/10 md:left-1/2 md:-ml-[0.5px]" />
          <div
            ref={lineRef}
            className="absolute bottom-0 left-3 h-full w-px origin-bottom will-change-transform md:left-1/2 md:-ml-[0.5px]"
            style={{
              transform: 'scaleY(0)',
              background: `linear-gradient(to bottom, ${accent}, ${accentSoft})`,
            }}
          />

          <div className="flex flex-col gap-12 md:gap-20">
            {items.map((item, i) => {
              const docs = docsMap[item.id] ?? [];
              const cardOnLeft = i % 2 === 1;

              return (
                <div key={item.id} className="relative">
                  {/* Dot mobile */}
                  <span
                    className="absolute -left-7 top-6 z-10 h-3 w-3 -translate-x-1/2 rounded-full ring-4 ring-white dark:ring-[#0B0D10] md:hidden"
                    style={{ background: accent }}
                  />
                  {/* Dot desktop */}
                  <span
                    className="absolute left-1/2 top-6 z-10 hidden h-4 w-4 -translate-x-1/2 rounded-full ring-4 ring-white dark:ring-[#0B0D10] md:block"
                    style={{ background: accent }}
                  >
                    <span className="absolute inset-1 rounded-full bg-white/90" />
                  </span>

                  {/* Satu layout untuk mobile & desktop (tidak ada lagi DOM ganda) */}
                  <div className="grid grid-cols-1 gap-4 pl-10 md:grid-cols-2 md:items-center md:gap-x-16 md:pl-0">
                    <div
                      className={`md:row-start-1 ${
                        cardOnLeft
                          ? 'md:col-start-1 md:flex md:justify-end md:pr-12'
                          : 'md:col-start-2 md:pl-12'
                      }`}
                    >
                      <ExperienceCard
                        item={item}
                        rightOnDesktop={cardOnLeft}
                        isDark={isDark}
                        accent={accent}
                        hoverable={hoverable}
                      />
                    </div>

                    {docs.length > 0 && (
                      <div
                        className={`md:row-start-1 ${
                          cardOnLeft
                            ? 'md:col-start-2 md:pl-12'
                            : 'md:col-start-1 md:flex md:justify-end md:pr-12'
                        }`}
                      >
                        <FolderBlock
                          docs={docs}
                          title={item.title}
                          alignEndOnDesktop={!cardOnLeft}
                          viewDocsLabel={viewDocsLabel}
                          isDark={isDark}
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Experience;