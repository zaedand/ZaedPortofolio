import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import LanyardCard from '../animated/LanyardCard';

const About: React.FC = () => {
  const { t } = useTranslation();

  const [revealed, setRevealed] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setRevealed(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const tags = t('about.tags', { returnObjects: true }) as string[];

  return (
    <section id="about" className="relative isolate bg-[#0d151a]">
      {/* Lanyard — overlay full-bleed, nempel ke tepi section (bukan di dalam kotak/grid) */}
      <div
        className={`pointer-events-none absolute inset-0 z-20 transition-all duration-700 ease-out md:block ${
          revealed ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
        }`}
      >
        <div className="mx-auto h-full max-w-6xl px-6">
          <div className="pointer-events-auto absolute left-0 top-0 h-[480px] w-full md:left-0 md:top-0 md:h-full md:w-[45%]">
            <LanyardCard photoSrc="/zaidan.jpeg" backPhotoSrc="/zaed.jpeg" />
          </div>
        </div>
      </div>

      {/* Konten teks — tetap pakai grid buat spacing, tapi kolom kiri dikosongkan
          (jadi placeholder) karena Lanyard sekarang render di layer terpisah di atas */}
      <div className="relative z-10 px-6 pb-24 pt-[440px] md:py-32">
        <div className="mx-auto grid max-w-6xl gap-16 md:grid-cols-[0.85fr_1fr] md:items-center">
          {/* Placeholder kosong - jaga lebar kolom kiri, Lanyard render di atasnya via overlay */}
          <div aria-hidden className="hidden md:block" />

          <div
            className={`transition-all delay-150 duration-700 ease-out ${
              revealed ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
            }`}
          >
            <p className="font-mono text-sm tracking-wide text-[#7C9CFF]">{t('about.eyebrow')}</p>

            <h2 className="mt-3 text-3xl font-semibold leading-tight text-[#F2F1EC] md:text-4xl">
              {t('about.heading')}
            </h2>

            <p className="mt-6 text-base leading-relaxed text-white/60 md:text-lg">{t('about.bio')}</p>

            <div className="mt-8 flex flex-wrap gap-2">
              {tags.map(tag => (
                <span
                  key={tag}
                  className="rounded-full border border-white/10 px-4 py-1.5 font-mono text-xs text-white/50"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;