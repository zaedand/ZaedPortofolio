import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import LanyardCard from '../animated/LanyardCard';

type TechCategory = 'all' | 'frontend' | 'backend' | 'framework' | 'tools';
type TechItem = { name: string; category: TechCategory[] };
type LanguageItem = { name: string; level: string };

// ---------- Hook kecil buat animasi reveal-on-scroll, dipakai tiap blok di bawah ----------
const useRevealOnView = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => entry.isIntersecting && setInView(true), {
      threshold: 0.2,
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return { ref, inView };
};

// ---------- Blok: Education ----------
const EducationBlock = () => {
  const { t } = useTranslation();
  const { ref, inView } = useRevealOnView();
  const courses = t('about.education.courses', { returnObjects: true }) as string[];

  return (
    <div
      id="education"
      ref={ref}
      className={`scroll-mt-24 transition-all duration-700 ease-out ${
        inView ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
      }`}
    >
      <h3 className="mt-2 text-2xl font-semibold text-black dark:text-[#F2F1EC]">{t('about.education.university')}</h3>
      <p className="mt-1 text-black/60 dark:text-white/60">{t('about.education.major')}</p>
      <p className="mt-1 text-sm text-black/40 dark:text-white/40">{t('about.education.gpa')}</p>

      <div className="mt-6">
        <p className="mb-3 text-sm font-medium text-black/70 dark:text-white/70">{t('about.education.coursesLabel')}</p>
        <div className="flex flex-wrap gap-2">
          {courses.map(course => (
            <span
              key={course}
              className="rounded-full border border-black/10 dark:border-white/10 px-4 py-1.5 font-mono text-xs text-black/50 dark:text-white/50"
            >
              {course}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

// ---------- Blok: Tech Stack ----------
const TechStackBlock = () => {
  const { t } = useTranslation();
  const { ref, inView } = useRevealOnView();
  const [activeTab, setActiveTab] = useState<TechCategory>('all');

  const items = t('about.techstack.items', { returnObjects: true }) as TechItem[];
  const tabs: { key: TechCategory; label: string }[] = [
    { key: 'all', label: t('about.techstack.tabs.all') },
    { key: 'frontend', label: t('about.techstack.tabs.frontend') },
    { key: 'backend', label: t('about.techstack.tabs.backend') },
    { key: 'framework', label: t('about.techstack.tabs.framework') },
    { key: 'tools', label: t('about.techstack.tabs.tools') },
  ];

  const filtered = activeTab === 'all' ? items : items.filter(item => item.category.includes(activeTab));

  return (
    <div
      id="skills"
      ref={ref}
      className={`scroll-mt-24 mt-20 transition-all duration-700 ease-out ${
        inView ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
      }`}
    >
      <h3 className="mt-2 text-2xl font-semibold text-black dark:text-[#F2F1EC]">{t('about.techstack.heading')}</h3>

      <div className="mt-5 flex flex-wrap gap-2">
        {tabs.map(tab => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors duration-200 ${
              activeTab === tab.key
                ? 'border-white bg-white text-black'
                : 'border-white/20 text-black/60 dark:text-white/60 hover:border-white/40 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {filtered.map(item => (
          <span
            key={item.name}
            className="rounded-full border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 px-4 py-1.5 font-mono text-xs text-black/70 dark:text-white/70"
          >
            {item.name}
          </span>
        ))}
      </div>
    </div>
  );
};

// ---------- Blok: Personal Info (soft/hard skills + bahasa) ----------
const TagGroup = ({ title, items }: { title: string; items: string[] }) => (
  <div>
    <p className="mb-3 text-sm font-medium text-black/70 dark:text-white/70">{title}</p>
    <div className="flex flex-wrap gap-2">
      {items.map(item => (
        <span
          key={item}
          className="rounded-full border border-black/10 dark:border-white/10 px-4 py-1.5 font-mono text-xs text-black/50 dark:text-white/50"
        >
          {item}
        </span>
      ))}
    </div>
  </div>
);

const PersonalInfoBlock = () => {
  const { t } = useTranslation();
  const { ref, inView } = useRevealOnView();

  const softSkills = t('about.personal.softSkills', { returnObjects: true }) as string[];
  const hardSkills = t('about.personal.hardSkills', { returnObjects: true }) as string[];
  const languages = t('about.personal.languages', { returnObjects: true }) as LanguageItem[];

  return (
    <div
      ref={ref}
      className={`mt-20 grid gap-8 transition-all duration-700 ease-out sm:grid-cols-2 ${
        inView ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
      }`}
    >
      <TagGroup title={t('about.personal.softSkillsLabel')} items={softSkills} />
      <TagGroup title={t('about.personal.hardSkillsLabel')} items={hardSkills} />

      <div>
        <p className="mb-3 text-sm font-medium text-black/70 dark:text-white/70">{t('about.personal.languagesLabel')}</p>
        <div className="flex flex-col gap-2">
          {languages.map(lang => (
            <div key={lang.name} className="flex items-center justify-between text-sm text-black/60 dark:text-white/60">
              <span>{lang.name}</span>
              <span className="text-black/30 dark:text-white/30">{lang.level}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Reveal berurutan: dipicu atribut data-reveal="on" pada wrapper `group/about` (Home.tsx)
const REVEAL =
  'translate-y-5 opacity-0 transition-[opacity,transform] duration-700 ease-out group-data-[reveal=on]/about:translate-y-0 group-data-[reveal=on]/about:opacity-100';

// ---------- Komponen utama About ----------
const About: React.FC = () => {
  const { t } = useTranslation();

  const tags = t('about.tags', { returnObjects: true }) as string[];

  return (
    <section id="about" className="relative isolate overflow-clip bg-white dark:bg-[#0d151a]">
      {/* Garis permukaan air di tepi atas (tempat tali "menempel") */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-30 h-px bg-gradient-to-r from-transparent via-sky-400/60 to-transparent dark:via-[#3B82F6]/60"
      />

      {/* Lanyard: fade saja (TANPA translate), supaya tali tidak "terbang" */}
      <div
        className="pointer-events-none absolute inset-0 z-20 overflow-hidden opacity-0 transition-opacity duration-700 ease-out group-data-[reveal=on]/about:opacity-100"
      >
        <div className="mx-auto h-full max-w-6xl px-6">
          {/* -translate-y-[12.5%]: titik gantung tali (±12% dari atas canvas) naik tepat
              ke tepi atas section = tepi atas layar/navbar saat About sudah di posisi akhir */}
          <div className="pointer-events-auto absolute left-0 top-0 h-[380px] w-full -translate-y-[12.5%] md:left-0 md:top-0 md:h-[40%] md:w-[45%]">
            {/* TANPA key per-tema: Canvas dibuat SATU kali saja (ganti tema tidak membuat
                WebGL context baru) supaya tidak kena "Context Lost". */}
            <LanyardCard
              photoSrc="/zaidan.jpeg"
              backPhotoSrc="/zaed.jpeg"
            />
          </div>
        </div>
      </div>

      <div className="relative z-10 px-6 pb-24 pt-[440px] md:py-32">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-16 md:grid-cols-[0.85fr_1fr] md:items-center">
            <div aria-hidden className="hidden md:block" />

            <div>
              <h2
                style={{ transitionDelay: '250ms' }}
                className={`mt-3 text-3xl font-semibold leading-tight text-black dark:text-[#F2F1EC] md:text-4xl ${REVEAL}`}
              >
                {t('about.heading')}
              </h2>

              <p
                style={{ transitionDelay: '400ms' }}
                className={`mt-6 text-base leading-relaxed text-black/60 dark:text-white/60 md:text-lg ${REVEAL}`}
              >
                {t('about.bio')}
              </p>

              <div style={{ transitionDelay: '550ms' }} className={`mt-8 flex flex-wrap gap-2 ${REVEAL}`}>
                {tags.map(tag => (
                  <span
                    key={tag}
                    className="rounded-full border border-black/10 dark:border-white/10 px-4 py-1.5 font-mono text-xs text-black/50 dark:text-white/50"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <a
                href="/CV_Zaidan_Akmal_Mauludi_IT.pdf"
                download="CV_Zaidan_Akmal_Mauludi_IT.pdf"
                style={{ transitionDelay: '700ms' }}
                className={`mt-8 inline-flex items-center gap-2 rounded-full bg-[#3B82F6] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#2f6fd6] ${REVEAL}`}
              >
                {t('about.downloadCv')}
                <span aria-hidden>↓</span>
              </a>
            </div>
          </div>

          <EducationBlock />
          <TechStackBlock />
          <PersonalInfoBlock />
        </div>
      </div>
    </section>
  );
};

export default About;