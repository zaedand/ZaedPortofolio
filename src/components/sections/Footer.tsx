import { useTranslation } from 'react-i18next';

const socialLinks: Record<string, string> = {
  github: 'https://github.com/username',
  linkedin: 'https://linkedin.com/in/username',
  instagram: 'https://instagram.com/username',
};

const Footer = () => {
  const { t } = useTranslation();
  const socials = t('footer.socials', { returnObjects: true }) as Record<string, string>;

  return (
    <footer id="contact" className="relative bg-white dark:bg-black px-6 py-20 md:py-28">
      <div className="mx-auto max-w-4xl text-center">
        <p className="font-mono text-sm tracking-wide text-[#3B5FE0] dark:text-[#7C9CFF]">{t('footer.eyebrow')}</p>
        <h2 className="mt-3 text-3xl font-semibold text-black dark:text-[#F2F1EC] md:text-4xl">{t('footer.heading')}</h2>
        <p className="mt-4 text-black/60 dark:text-white/60">{t('footer.subtext')}</p>

        <a
          href={`mailto:${t('footer.email')}`}
          className="mt-8 inline-block rounded-full bg-[#3B82F6] px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-[#2f6fd6]"
        >
          {t('footer.email')}
        </a>

        <div className="mt-10 flex flex-wrap justify-center gap-6">
          {Object.entries(socials).map(([key, label]) => (
            <a
              key={key}
              href={socialLinks[key]}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-black/50 dark:text-white/50 transition-colors hover:text-black dark:hover:text-white"
            >
              {label}
            </a>
          ))}
        </div>

        <p className="mt-16 text-xs text-black/30 dark:text-white/30">
          © {new Date().getFullYear()} Zaidan Akmal Mauludi. {t('footer.rights')}
        </p>
      </div>
    </footer>
  );
};

export default Footer;