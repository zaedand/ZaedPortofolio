import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import MoltenMetal from '@/components/animated/MoltenMetal';
import { Safari } from '@/components/ui/safari';
import { Iphone } from '@/components/ui/iphone';
import { useTheme } from '@/hooks/useTheme';
import { linksMap, imageMap } from '@/data/projectLinks';

type ProjectItem = { id: number; slug: string; title: string; desc: string; tags: string[] };

const VISIBLE_COUNT = 3;

/* ============================================================
   ICONS
   ============================================================ */
const ExternalIcon = () => (
  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
  </svg>
);
const ShieldIcon = () => (
  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

/* ============================================================
   PROJECT ROW — mockup + overview + buttons (zig-zag)
   ============================================================ */
const ProjectRow = ({
  project,
  index,
  isDark,
  accent,
  onOpenModal,
}: {
  project: ProjectItem;
  index: number;
  isDark: boolean;
  accent: string;
  onOpenModal: (p: ProjectItem) => void;
}) => {
  const { t } = useTranslation();
  const images = imageMap[project.slug] ?? {};
  const links = linksMap[project.slug] ?? {};
  const isReversed = index % 2 === 1;

const hasDesktop = !!images.desktop;
const hasMobile = !!images.mobile;

const mockup = (
  <motion.div
    initial={{ opacity: 0, x: isReversed ? 40 : -40 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true, margin: '-100px' }}
    transition={{ duration: 0.6, ease: 'easeOut' }}
    className={`relative mx-auto w-full max-w-md ${
      hasDesktop && hasMobile
        ? 'pr-10 pb-16 md:max-w-none md:pr-14 md:pb-20'
        : hasDesktop
          ? 'md:max-w-none'
          : ''
    }`}
  >
    {/* ── SKENARIO 1: Desktop + Mobile → Safari + iPhone overlap ── */}
    {hasDesktop && hasMobile && (
      <>
        <Safari
          url={links.live ? links.live.replace(/^https?:\/\//, '') : `${project.slug}.zaedporto.com`}
          imageSrc={images.desktop}
          className="w-full drop-shadow-[0_25px_50px_-20px_rgba(0,0,0,0.35)]"
        />
        <div className="absolute bottom-0 right-0 w-20 drop-shadow-[0_15px_30px_-10px_rgba(0,0,0,0.5)] sm:w-24 md:w-28">
          <Iphone src={images.mobile} />
        </div>
      </>
    )}

    {/* ── SKENARIO 2: Desktop only → Safari saja ── */}
    {hasDesktop && !hasMobile && (
      <Safari
        url={links.live ? links.live.replace(/^https?:\/\//, '') : `${project.slug}.zaedporto.com`}
        imageSrc={images.desktop}
        className="w-full drop-shadow-[0_25px_50px_-20px_rgba(0,0,0,0.35)]"
      />
    )}

    {/* ── SKENARIO 3: Mobile only → iPhone saja, diperbesar ── */}
    {!hasDesktop && hasMobile && (
      <div className="mx-auto w-44 drop-shadow-[0_25px_50px_-20px_rgba(0,0,0,0.45)] sm:w-52 md:w-60">
        <Iphone src={images.mobile} />
      </div>
    )}

    {/* ── SKENARIO 4: Kosong → placeholder ── */}
    {!hasDesktop && !hasMobile && (
      <div className="flex aspect-video w-full items-center justify-center rounded-xl border border-dashed border-black/15 bg-black/[0.03] text-xs text-black/40 dark:border-white/15 dark:bg-white/[0.03] dark:text-white/40">
        No preview
      </div>
    )}
  </motion.div>
);

  // ── Overview text + buttons ──
  const overview = (
    <motion.div
      initial={{ opacity: 0, x: isReversed ? -40 : 40 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
      className="flex flex-col"
    >
      {/* Nomor project */}
      <span
        className="inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[11px] font-bold tracking-wider"
        style={{
          background: isDark ? 'rgba(59,130,246,0.15)' : 'rgba(56,189,248,0.15)',
          color: accent,
        }}
      >
        #{String(project.id).padStart(2, '0')}
      </span>

      <h3 className="mt-3 text-2xl font-semibold text-black dark:text-[#F2F1EC] md:text-3xl">
        {project.title}
      </h3>
      <p className="mt-3 text-sm leading-relaxed text-black/60 dark:text-white/60 md:text-base">
        {project.desc}
      </p>

      {/* Tags */}
      <div className="mt-4 flex flex-wrap gap-1.5">
        {project.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-black/10 bg-black/[0.03] px-2.5 py-0.5 font-mono text-[11px] text-black/60
              dark:border-white/10 dark:bg-white/[0.03] dark:text-white/60"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Buttons */}
      <div className="mt-6 flex flex-wrap gap-3">
        {/* Lihat Detail → modal */}
        <button
          type="button"
          onClick={() => onOpenModal(project)}
          className="group/btn inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-white
            transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
          style={{
            background: `linear-gradient(to right, ${accent}, ${isDark ? '#7C9CFF' : '#7DD3FC'})`,
            boxShadow: `0 10px 30px -10px ${accent}80`,
          }}
        >
          {t('projects.viewDetail')}
          <span className="transition-transform duration-300 group-hover/btn:translate-x-1">→</span>
        </button>

        {/* HKI — langsung ke drive */}
        {links.hki && (
          <a
            href={links.hki}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-black/15 bg-white/60 px-5 py-2.5 text-sm font-medium text-black/70
              backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-black/30 hover:bg-white
              dark:border-white/15 dark:bg-white/5 dark:text-white/70 dark:hover:border-white/30 dark:hover:bg-white/10"
          >
            <ShieldIcon />
            HKI
          </a>
        )}

        {/* Live URL — kalau sudah hosting */}
        {links.live && (
          <a
            href={links.live}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-black/15 bg-white/60 px-5 py-2.5 text-sm font-medium text-black/70
              backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-black/30 hover:bg-white
              dark:border-white/15 dark:bg-white/5 dark:text-white/70 dark:hover:border-white/30 dark:hover:bg-white/10"
          >
            <ExternalIcon />
            Live
          </a>
        )}
      </div>
    </motion.div>
  );

  return (
    <div className="grid gap-10 md:grid-cols-2 md:items-center md:gap-16 lg:gap-20">
      {isReversed ? (
        <>
          {overview}
          {mockup}
        </>
      ) : (
        <>
          {mockup}
          {overview}
        </>
      )}
    </div>
  );
};

/* ============================================================
   MODAL — ringkas, dengan tombol ke halaman detail
   ============================================================ */
const ProjectModal = ({
  project,
  onClose,
}: {
  project: ProjectItem;
  onClose: () => void;
}) => {
  const { t } = useTranslation();
  const images = imageMap[project.slug] ?? {};

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm dark:bg-black/80"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.25 }}
        className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-black/10 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-[#0d151a]"
        onClick={(e) => e.stopPropagation()}
      >
        {images.desktop && (
          <img
            src={images.desktop}
            alt={project.title}
            className="w-full rounded-lg"
          />
        )}
        <h3 className="mt-4 text-xl font-semibold text-black dark:text-[#F2F1EC]">
          {project.title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-black/60 dark:text-white/60">
          {project.desc}
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-black/10 px-2.5 py-0.5 font-mono text-[11px] text-black/50 dark:border-white/10 dark:text-white/50"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-black/20 px-5 py-2 text-sm text-black transition-colors hover:bg-black/10
              dark:border-white/20 dark:text-white dark:hover:bg-white/10"
          >
            {t('certificates.close')}
          </button>
          <Link
            to={`/projects/${project.slug}`}
            className="rounded-full bg-[#3B82F6] px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-[#2f6fd6]"
          >
            {t('projects.viewFullDetail')} →
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

/* ============================================================
   MAIN SECTION
   ============================================================ */
const Projects = () => {
  const { t } = useTranslation();
  const isDark = useTheme();
  const [showAll, setShowAll] = useState(false);
  const [selected, setSelected] = useState<ProjectItem | null>(null);

  const projects = t('projects.items', { returnObjects: true }) as ProjectItem[];
  const visibleProjects = showAll ? projects : projects.slice(0, VISIBLE_COUNT);
  const accent = isDark ? '#3B82F6' : '#38BDF8';
  const accentSoft = isDark ? '#7C9CFF' : '#7DD3FC';

  return (
    <section
      id="projects"
      className="relative isolate overflow-hidden bg-white px-6 py-24 dark:bg-[#0d151a] md:py-32"
    >
      {/* ── MOLTEN METAL BACKGROUND ── */}
      <div className="absolute inset-0 -z-10">
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
      </div>

      <div className="relative z-10 mx-auto max-w-6xl">
        {/* Heading */}
        <header className="text-center">
          <h2 className="text-3xl font-semibold text-black dark:text-[#F2F1EC] md:text-4xl">
            {t('projects.heading')}
          </h2>
          <div
            className="mx-auto mt-4 h-px w-16"
            style={{
              background: `linear-gradient(to right, transparent, ${accent}, transparent)`,
            }}
          />
        </header>

        {/* Rows */}
        <div className="mt-16 flex flex-col gap-24 md:mt-20 md:gap-32">
          {visibleProjects.map((project, i) => (
            <ProjectRow
              key={project.id}
              project={project}
              index={i}
              isDark={isDark}
              accent={accent}
              onOpenModal={setSelected}
            />
          ))}
        </div>

        {/* See more */}
        {projects.length > VISIBLE_COUNT && (
          <div className="mt-16 text-center md:mt-24">
            <button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              className="group relative overflow-hidden rounded-full border border-black/20 px-6 py-2.5 text-sm font-medium text-black transition-all duration-300 hover:border-transparent hover:text-white
                dark:border-white/20 dark:text-white dark:hover:text-white"
            >
              <span
                className="absolute inset-0 -z-10 origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100"
                style={{
                  background: `linear-gradient(to right, ${accent}, ${accentSoft})`,
                }}
              />
              {showAll ? t('projects.seeLess') : t('projects.seeMore')}
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selected && (
          <ProjectModal project={selected} onClose={() => setSelected(null)} />
        )}
      </AnimatePresence>
    </section>
  );
};

export default Projects;