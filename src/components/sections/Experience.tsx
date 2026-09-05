import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

type ExperienceItem = { id: string; title: string; subtitle: string; period: string };

// Path dokumentasi tetap di kode (bukan teks, jadi tidak masuk locale JSON).
// Urutan array translation SUDAH dari atas (Skripsi) ke bawah (Akademik), sesuai instruksi.
const docsMap: Record<string, string[]> = {
  skripsi: ['/docs/skripsi-1.jpg', '/docs/skripsi-2.jpg'],
  pi: ['/docs/pindad-1.jpg', '/docs/pindad-2.jpg'],
  am: ['/docs/am-1.jpg', '/docs/am-2.jpg'],
  kkn: ['/docs/kkn-1.jpg', '/docs/kkn-2.jpg'],
  akademik: ['/docs/akademik-1.jpg'],
};

const FolderToggle = ({ docs, viewLabel, closeLabel }: { docs: string[]; viewLabel: string; closeLabel: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        className="inline-flex items-center gap-2 text-xs font-medium text-black/50 dark:text-white/50 transition-colors hover:text-white"
      >
        📁 {open ? closeLabel : viewLabel}
      </button>

      {open && (
        <div className="mt-3 grid grid-cols-3 gap-2 sm:max-w-xs">
          {docs.map(src => (
            <div key={src} className="aspect-square overflow-hidden rounded-md bg-black/5 dark:bg-white/5">
              <img src={src} alt="Dokumentasi kegiatan" className="h-full w-full object-cover" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const Experience = () => {
  const { t } = useTranslation();
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

  return (
    <section id="experience" className="relative bg-white dark:bg-[#0B0D10] px-6 py-24 md:py-32">
      <div className="mx-auto max-w-4xl">
        <p className="font-mono text-sm tracking-wide text-[#3B5FE0] dark:text-[#7C9CFF]">{t('experience.eyebrow')}</p>
        <h2 className="mt-3 text-3xl font-semibold text-black dark:text-[#F2F1EC] md:text-4xl">{t('experience.heading')}</h2>

        <div ref={sectionRef} className="relative mt-16 pl-10">
          <div className="absolute left-3 top-0 h-full w-[2px] bg-black/10 dark:bg-white/10" />
          <div
            className="absolute left-3 bottom-0 w-[2px] origin-bottom bg-[#3B82F6]"
            style={{ height: '100%', transform: `scaleY(${progress})` }}
          />

          <div className="flex flex-col gap-16">
            {items.map(item => (
              <div key={item.id} className="relative">
                <span className="absolute -left-10 top-1.5 h-3 w-3 -translate-x-1/2 rounded-full bg-[#3B82F6] ring-4 ring-white dark:ring-[#0B0D10]" />
                <p className="text-xs uppercase tracking-wider text-black/30 dark:text-white/30">{item.period}</p>
                <h3 className="mt-1 text-xl font-semibold text-black dark:text-[#F2F1EC]">{item.title}</h3>
                <p className="mt-1 text-sm text-black/60 dark:text-white/60">{item.subtitle}</p>
                <FolderToggle
                  docs={docsMap[item.id] ?? []}
                  viewLabel={t('experience.viewDocs')}
                  closeLabel={t('experience.closeDocs')}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Experience;