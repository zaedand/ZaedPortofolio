import { useState } from 'react';
import { useTranslation } from 'react-i18next';

type CertificateItem = { id: number; title: string; issuer: string; year: string };

const imageMap: Record<number, string> = {
  1: '/certs/cert1.jpg',
  2: '/certs/cert2.jpg',
  3: '/certs/cert3.jpg',
  4: '/certs/cert4.jpg',
};

const VISIBLE_COUNT = 3;

const Certificates = () => {
  const { t } = useTranslation();
  const [showAll, setShowAll] = useState(false);
  const [selected, setSelected] = useState<CertificateItem | null>(null);

  const certificates = t('certificates.items', { returnObjects: true }) as CertificateItem[];
  const visible = showAll ? certificates : certificates.slice(0, VISIBLE_COUNT);

  return (
    <section id="certificates" className="relative bg-white dark:bg-[#0B0D10] px-6 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <p className="font-mono text-sm tracking-wide text-[#3B5FE0] dark:text-[#7C9CFF]">{t('certificates.eyebrow')}</p>
        <h2 className="mt-3 text-3xl font-semibold text-black dark:text-[#F2F1EC] md:text-4xl">{t('certificates.heading')}</h2>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map(cert => (
            <button
              key={cert.id}
              type="button"
              onClick={() => setSelected(cert)}
              className="group overflow-hidden rounded-xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] text-left transition-colors hover:border-black/20 dark:hover:border-white/20"
            >
              <div className="aspect-[4/3] overflow-hidden bg-black/5 dark:bg-white/5">
                <img
                  src={imageMap[cert.id]}
                  alt={cert.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-black dark:text-[#F2F1EC]">{cert.title}</h3>
                <p className="mt-1 text-sm text-black/50 dark:text-white/50">{cert.issuer} · {cert.year}</p>
                <span className="mt-2 inline-block text-sm font-medium text-[#3B5FE0] dark:text-[#7C9CFF]">
                  {t('certificates.viewDetail')} →
                </span>
              </div>
            </button>
          ))}
        </div>

        {certificates.length > VISIBLE_COUNT && (
          <div className="mt-10 text-center">
            <button
              type="button"
              onClick={() => setShowAll(prev => !prev)}
              className="rounded-full border border-black/20 dark:border-white/20 px-6 py-2.5 text-sm font-medium text-black dark:text-white transition-colors hover:bg-black/10 dark:hover:bg-white/10"
            >
              {showAll ? t('certificates.seeLess') : t('certificates.seeMore')}
            </button>
          </div>
        )}
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 dark:bg-black/80 p-6"
          onClick={() => setSelected(null)}
        >
          <div className="max-w-lg rounded-xl bg-white dark:bg-[#0d151a] p-6" onClick={e => e.stopPropagation()}>
            <img src={imageMap[selected.id]} alt={selected.title} className="w-full rounded-lg" />
            <h3 className="mt-4 text-xl font-semibold text-black dark:text-[#F2F1EC]">{selected.title}</h3>
            <p className="mt-1 text-black/60 dark:text-white/60">{selected.issuer} · {selected.year}</p>
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="mt-4 rounded-full border border-black/20 dark:border-white/20 px-5 py-2 text-sm text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/10"
            >
              {t('certificates.close')}
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default Certificates;