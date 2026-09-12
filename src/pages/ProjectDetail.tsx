import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/sections/Footer';
import { linksMap, imageMap } from '../data/projectLinks';

type ProjectDetailData = {
  title: string;
  period: string;
  stack: string[];
  overview: string;
  background?: string;
  features: string[];
  architecture?: string;
  contributions: string[];
  challenges?: string;
  results: string;
};

/* ── Icons ── */
const ExternalIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
  </svg>
);
const BookIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);
const ShieldIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const ProjectDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  const detail = slug
    ? (t(`projects.details.${slug}`, { returnObjects: true }) as ProjectDetailData)
    : null;

  const links = slug ? linksMap[slug] ?? {} : {};
  const images = slug ? imageMap[slug] ?? {} : {};
  const hasAnyLink = !!(links.live || links.manualBook || links.hki);

  if (!detail || typeof detail !== 'object' || !detail.title) {
    return (
      <>
        <Navbar />
        <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white px-6 pt-24 text-center dark:bg-[#0d151a]">
          <p className="text-black dark:text-white">Project tidak ditemukan.</p>
          <Link to="/" className="text-[#3B5FE0] hover:underline dark:text-[#7C9CFF]">
            ← Kembali ke beranda
          </Link>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white px-6 pb-24 pt-32 dark:bg-[#0d151a]">
        <div className="mx-auto max-w-3xl">
          <Link
            to="/#projects"
            className="text-sm text-[#3B5FE0] hover:underline dark:text-[#7C9CFF]"
          >
            ← {t('nav.projects')}
          </Link>

          {images.desktop && (
            <img
              src={images.desktop}
              alt={detail.title}
              className="mt-6 w-full rounded-xl"
            />
          )}

          <h1 className="mt-6 text-3xl font-semibold text-black dark:text-[#F2F1EC] md:text-4xl">
            {detail.title}
          </h1>
          <p className="mt-1 text-sm text-black/50 dark:text-white/50">{detail.period}</p>

          {/* Stack tags */}
          <div className="mt-4 flex flex-wrap gap-2">
            {detail.stack.map((item) => (
              <span
                key={item}
                className="rounded-full border border-black/10 px-3 py-1 font-mono text-xs text-black/60 dark:border-white/10 dark:text-white/60"
              >
                {item}
              </span>
            ))}
          </div>

          {/* ── ACTION BUTTONS (semua opsional) ── */}
          {hasAnyLink && (
            <div className="mt-6 flex flex-wrap gap-3">
              {links.live && (
                <a
                  href={links.live}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-[#3B82F6] px-5 py-2.5 text-sm font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#2f6fd6] hover:shadow-lg"
                >
                  <ExternalIcon />
                  Live Demo
                </a>
              )}
              {links.manualBook && (
                <a
                  href={links.manualBook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-black/20 bg-white px-5 py-2.5 text-sm font-medium text-black transition-all duration-300 hover:-translate-y-0.5 hover:border-black/40 hover:bg-black/5
                    dark:border-white/20 dark:bg-white/5 dark:text-white dark:hover:border-white/40 dark:hover:bg-white/10"
                >
                  <BookIcon />
                  Manual Book
                </a>
              )}
              {links.hki && (
                <a
                  href={links.hki}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-black/20 bg-white px-5 py-2.5 text-sm font-medium text-black transition-all duration-300 hover:-translate-y-0.5 hover:border-black/40 hover:bg-black/5
                    dark:border-white/20 dark:bg-white/5 dark:text-white dark:hover:border-white/40 dark:hover:bg-white/10"
                >
                  <ShieldIcon />
                  HKI
                </a>
              )}
            </div>
          )}

          {/* Sections */}
          <section className="mt-10">
            <h2 className="text-xl font-semibold text-black dark:text-[#F2F1EC]">Overview</h2>
            <p className="mt-3 leading-relaxed text-black/70 dark:text-white/70">{detail.overview}</p>
          </section>

          {detail.background && (
            <section className="mt-10">
              <h2 className="text-xl font-semibold text-black dark:text-[#F2F1EC]">Latar Belakang</h2>
              <p className="mt-3 leading-relaxed text-black/70 dark:text-white/70">{detail.background}</p>
            </section>
          )}

          <section className="mt-10">
            <h2 className="text-xl font-semibold text-black dark:text-[#F2F1EC]">Fitur Utama</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-black/70 dark:text-white/70">
              {detail.features.map((f, i) => <li key={i}>{f}</li>)}
            </ul>
          </section>

          {detail.architecture && (
            <section className="mt-10">
              <h2 className="text-xl font-semibold text-black dark:text-[#F2F1EC]">Arsitektur Sistem</h2>
              <p className="mt-3 leading-relaxed text-black/70 dark:text-white/70">{detail.architecture}</p>
            </section>
          )}

          <section className="mt-10">
            <h2 className="text-xl font-semibold text-black dark:text-[#F2F1EC]">Kontribusi</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-black/70 dark:text-white/70">
              {detail.contributions.map((c, i) => <li key={i}>{c}</li>)}
            </ul>
          </section>

          {detail.challenges && (
            <section className="mt-10">
              <h2 className="text-xl font-semibold text-black dark:text-[#F2F1EC]">Tantangan Teknis</h2>
              <p className="mt-3 leading-relaxed text-black/70 dark:text-white/70">{detail.challenges}</p>
            </section>
          )}

          <section className="mt-10">
            <h2 className="text-xl font-semibold text-black dark:text-[#F2F1EC]">Hasil</h2>
            <p className="mt-3 leading-relaxed text-black/70 dark:text-white/70">{detail.results}</p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default ProjectDetail;