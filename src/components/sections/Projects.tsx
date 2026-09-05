import { useState } from 'react';
import { useTranslation } from 'react-i18next';

type ProjectItem = { id: number; title: string; desc: string; tags: string[] };

// Path gambar tetap di kode, dipetakan lewat id (bukan teks, jadi tidak masuk locale JSON).
const imageMap: Record<number, string> = {
  1: '/projects/studev.jpg',
  2: '/projects/project2.jpg',
  3: '/projects/project3.jpg',
  4: '/projects/project4.jpg',
  5: '/projects/project5.jpg',
};

const VISIBLE_COUNT = 3;

const ProjectCard = ({ project, viewDetailLabel }: { project: ProjectItem; viewDetailLabel: string }) => (
  <div className="group overflow-hidden rounded-xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] transition-colors hover:border-black/20 dark:hover:border-black/20 dark:border-white/20">
    <div className="aspect-video overflow-hidden bg-black/5 dark:bg-white/5">
      <img
        src={imageMap[project.id]}
        alt={project.title}
        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
    </div>
    <div className="p-5">
      <h3 className="text-lg font-semibold text-black dark:text-[#F2F1EC]">{project.title}</h3>
      <p className="mt-2 text-sm text-black/60 dark:text-black dark:text-white/60">{project.desc}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {project.tags.map(tag => (
          <span key={tag} className="rounded-full border border-black/10 dark:border-white/10 px-3 py-1 font-mono text-xs text-black/50 dark:text-black dark:text-white/50">
            {tag}
          </span>
        ))}
      </div>
      <button type="button" className="mt-4 text-sm font-medium text-[#3B5FE0] dark:text-[#7C9CFF] hover:underline">
        {viewDetailLabel} →
      </button>
    </div>
  </div>
);

const Projects = () => {
  const { t } = useTranslation();
  const [showAll, setShowAll] = useState(false);

  const projects = t('projects.items', { returnObjects: true }) as ProjectItem[];
  const visibleProjects = showAll ? projects : projects.slice(0, VISIBLE_COUNT);

  return (
    <section id="projects" className="relative bg-white dark:bg-[#0d151a] px-6 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <p className="font-mono text-sm tracking-wide text-[#3B5FE0] dark:text-[#7C9CFF]">{t('projects.eyebrow')}</p>
        <h2 className="mt-3 text-3xl font-semibold text-black dark:text-[#F2F1EC] md:text-4xl">{t('projects.heading')}</h2>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visibleProjects.map(project => (
            <ProjectCard key={project.id} project={project} viewDetailLabel={t('projects.viewDetail')} />
          ))}
        </div>

        {projects.length > VISIBLE_COUNT && (
          <div className="mt-10 text-center">
            <button
              type="button"
              onClick={() => setShowAll(prev => !prev)}
              className="rounded-full border border-black/20 dark:border-white/20 px-6 py-2.5 text-sm font-medium text-black dark:text-white transition-colors hover:bg-black/10 dark:hover:bg-white/10"
            >
              {showAll ? t('projects.seeLess') : t('projects.seeMore')}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default Projects;