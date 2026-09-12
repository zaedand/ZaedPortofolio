import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Meteors } from '@/components/ui/meteors';
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
   CARD — konten experience (dibungkus ElectricBorder)
   ============================================================ */
const ExperienceCard = ({
  item,
  align,
  isDark,
  accent,
}: {
  item: ExperienceItem;
  align: 'left' | 'right';
  isDark: boolean;
  accent: string;
}) => {
  return (
    <div className="group/card relative h-full w-full transition-transform duration-300 ease-out hover:-translate-y-1">
      {/* Glow belakang card saat hover */}
      <div
        className="pointer-events-none absolute -inset-2 rounded-2xl blur-xl transition-all duration-500"
        style={{ background: 'transparent' }}
      />
      <div
        className="pointer-events-none absolute -inset-2 rounded-2xl opacity-0 blur-xl transition-all duration-500 group-hover/card:opacity-100"
        style={{ background: `${accent}33` }}
      />

      <ElectricBorder
        color={accent}
        speed={1}
        chaos={0.12}
        borderRadius={16}
        className="relative h-full w-full"
      >
        <div
          className={`relative h-full w-full rounded-2xl bg-white/80 p-5 backdrop-blur-sm
            transition-all duration-300 group-hover/card:bg-white
            dark:bg-[#0B0D10]/80 dark:group-hover/card:bg-[#0B0D10]
            ${align === 'right' ? 'md:text-right' : ''}`}
          style={{
            boxShadow: `0 0 0 0 ${accent}00`,
          }}
        >
          {/* Period badge */}
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1
              font-mono text-[11px] font-medium uppercase tracking-wider
              transition-colors duration-300"
            style={{
              background: isDark ? 'rgba(59,130,246,0.15)' : 'rgba(56,189,248,0.15)',
              color: isDark ? '#7C9CFF' : '#0284C7',
            }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full transition-transform duration-300 group-hover/card:scale-150"
              style={{ background: accent }}
            />
            {item.period}
          </span>

          <h3
            className="mt-3 text-xl font-semibold text-black transition-colors duration-300
              dark:text-[#F2F1EC]"
          >
            {item.title}
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-black/60 transition-colors duration-300 group-hover/card:text-black/80 dark:text-white/60 dark:group-hover/card:text-white/80">
            {item.subtitle}
          </p>

          {/* Aksen garis kecil di bawah — muncul saat hover */}
          <div
            className={`mt-4 h-px transition-all duration-500 w-0 opacity-0
              group-hover/card:w-12 group-hover/card:opacity-100
              ${align === 'right' ? 'ml-auto' : ''}`}
            style={{
              background: align === 'right'
                ? `linear-gradient(to left, ${accent}, transparent)`
                : `linear-gradient(to right, ${accent}, transparent)`,
            }}
          />
        </div>
      </ElectricBorder>
    </div>
  );
};

/* ============================================================
   FOLDER BLOCK
   ============================================================ */
const FolderBlock = ({
  docs,
  title,
  align,
  viewDocsLabel,
  isDark,
}: {
  docs: string[];
  title: string;
  align: 'left' | 'right';
  viewDocsLabel: string;
  isDark: boolean;
  accent: string;
}) => {
  const folderItems = docs.map((src, i) => (
    <a
      key={i}
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
        className="h-full w-full object-cover"
      />
    </a>
  ));

  return (
    <div className={`flex flex-col gap-3 ${align === 'right' ? 'items-end' : 'items-start'}`}>
      <Folder color='#cdcd00' size={1} items={folderItems} />
      <span
        className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1
          text-[11px] font-medium
          border-black/10 bg-white/70 text-black/60
          dark:border-white/10 dark:bg-white/5 dark:text-white/60"
      >
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
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
};

/* ============================================================
   MAIN SECTION
   ============================================================ */
const Experience = () => {
  const { t } = useTranslation();
  const isDark = useTheme();
  const sectionRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const total = rect.height + viewportHeight;
      const scrolled = viewportHeight - rect.top;
      const pct = Math.min(Math.max(scrolled / total, 0), 1);
      setProgress(pct);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const items = t('experience.items', { returnObjects: true }) as ExperienceItem[];

  // 🎨 Palet theme-aware
  const accent = isDark ? '#3B82F6' : '#38BDF8';
  const accentSoft = isDark ? '#7C9CFF' : '#7DD3FC';

  return (
    <section
      id="experience"
      className="relative overflow-hidden bg-white px-6 py-24 dark:bg-[#0B0D10] md:py-32"
    >
      {/* ── FULL METEORS LAYER ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-60 dark:opacity-100">
        <Meteors number={80} />
      </div>

      {/* Radial glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/3 h-[600px] w-[600px] -translate-x-1/2 rounded-full blur-[140px]"
        style={{
          background: isDark ? 'rgba(59,130,246,0.2)' : 'rgba(56,189,248,0.15)',
        }}
      />

      <div className="relative mx-auto max-w-5xl">
        {/* Heading tengah */}
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

        <div ref={sectionRef} className="relative mt-16 md:mt-20">
          {/* ── GARIS MOBILE ── */}
          <div className="absolute left-3 top-0 h-full w-px bg-black/10 dark:bg-white/10 md:hidden" />
          <div
            className="absolute bottom-0 left-3 w-px origin-bottom md:hidden"
            style={{
              height: '100%',
              transform: `scaleY(${progress})`,
              background: `linear-gradient(to bottom, ${accent}, ${accentSoft})`,
              boxShadow: `0 0 12px ${accent}cc`,
            }}
          />

          {/* ── GARIS DESKTOP ── */}
          <div
            className="absolute left-1/2 top-0 hidden h-full w-px bg-black/10 dark:bg-white/10 md:block"
            style={{ transform: 'translateX(-50%)' }}
          />
          <div
            className="absolute bottom-0 left-1/2 hidden w-px origin-bottom md:block"
            style={{
              height: '100%',
              transform: `translateX(-50%) scaleY(${progress})`,
              background: `linear-gradient(to bottom, ${accent}, ${accentSoft})`,
              boxShadow: `0 0 12px ${accent}cc`,
            }}
          />

          <div className="flex flex-col gap-12 md:gap-20">
            {items.map((item, i) => {
              const docs = docsMap[item.id] ?? [];
              const folderOnLeft = i % 2 === 0;

              return (
                <div key={item.id} className="relative">
                  {/* Dot mobile */}
                  <span
                    className="absolute -left-7 top-6 z-10 h-3 w-3 -translate-x-1/2 rounded-full ring-4 ring-white dark:ring-[#0B0D10] md:hidden"
                    style={{ background: accent }}
                  >
                    <span
                      className="absolute inset-0 animate-ping rounded-full"
                      style={{ background: `${accent}99` }}
                    />
                  </span>
                  {/* Dot desktop */}
                  <span
                    className="absolute left-1/2 top-6 z-10 hidden h-4 w-4 rounded-full ring-4 ring-white dark:ring-[#0B0D10] md:block"
                    style={{ background: accent, transform: 'translateX(-50%)' }}
                  >
                    <span
                      className="absolute inset-0 animate-ping rounded-full"
                      style={{ background: `${accent}80` }}
                    />
                    <span className="absolute inset-1 rounded-full bg-white/90" />
                  </span>

                  {/* ───── MOBILE ───── */}
                  <div className="flex flex-col gap-4 pl-10 md:hidden">
                    <ExperienceCard item={item} align="left" isDark={isDark} accent={accent} />
                    {docs.length > 0 && (
                      <FolderBlock
                        docs={docs}
                        title={item.title}
                        align="left"
                        viewDocsLabel={t('experience.viewDocs')}
                        isDark={isDark}
                        accent={accent}
                      />
                    )}
                  </div>

                  {/* ───── DESKTOP ───── */}
                  <div className="hidden md:grid md:grid-cols-2 md:items-center md:gap-x-16">
                    {folderOnLeft ? (
                      <>
                        <div className="flex justify-end pr-12">
                          {docs.length > 0 && (
                            <FolderBlock
                              docs={docs}
                              title={item.title}
                              align="right"
                              viewDocsLabel={t('experience.viewDocs')}
                              isDark={isDark}
                              accent={accent}
                            />
                          )}
                        </div>
                        <div className="pl-12">
                          <ExperienceCard item={item} align="left" isDark={isDark} accent={accent} />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-end pr-12">
                          <ExperienceCard item={item} align="right" isDark={isDark} accent={accent} />
                        </div>
                        <div className="pl-12">
                          {docs.length > 0 && (
                            <FolderBlock
                              docs={docs}
                              title={item.title}
                              align="left"
                              viewDocsLabel={t('experience.viewDocs')}
                              isDark={isDark}
                              accent={accent}
                            />
                          )}
                        </div>
                      </>
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