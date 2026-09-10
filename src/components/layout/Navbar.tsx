import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import GooeyNav from '../animated/GooeyNav';
import type { GooeyNavItem } from '../animated/GooeyNav';
import GlitchText from '../animated/GlitchText';
import { useLenis } from '../../context/LenisContext';
import { AnimatedThemeToggler } from '@/components/ui/animated-theme-toggler';

const Navbar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const lenis = useLenis();

  const handleNavigate = (href: string) => {
    const correctionDelays = [150, 350, 600, 900, 1300];

    const scrollToFresh = (target: string, duration: number) => {
      const freshEl = document.querySelector(target);
      if (freshEl) {
        lenis?.scrollTo(freshEl as HTMLElement, { offset: -80, duration });
      }
      return freshEl;
    };

    const el = scrollToFresh(href, 1.5);

    if (el) {
      correctionDelays.forEach(delay => {
        setTimeout(() => scrollToFresh(href, 0.6), delay);
      });
      return;
    }

    const fallbackId = href === '#education' || href === '#skills' ? '#about' : href;
    const fallbackEl = scrollToFresh(fallbackId, 1.5);

    if (fallbackEl) {
      setTimeout(() => {
        const retryEl = scrollToFresh(href, 1);
        if (retryEl) {
          correctionDelays.forEach(delay => {
            setTimeout(() => scrollToFresh(href, 0.6), delay);
          });
        }
      }, 700);
    }
  };

  const navItems: GooeyNavItem[] = [
    { label: t('nav.about'), href: '#about' },
    { label: t('nav.experience'), href: '#experience' },
    { label: t('nav.projects'), href: '#projects' },
    {
      label: t('nav.more'),
      href: '#more',
      children: [
        { label: t('nav.education'), href: '#education' },
        { label: t('nav.skills'), href: '#skills' },
        { label: t('nav.certificates'), href: '#certificates' }
      ]
    },
    { label: t('nav.contact'), href: '#contact' }
  ];

  const mobileFlatItems = [
    { label: t('nav.about'), href: '#about' },
    { label: t('nav.experience'), href: '#experience' },
    { label: t('nav.projects'), href: '#projects' },
    { label: t('nav.education'), href: '#education' },
    { label: t('nav.skills'), href: '#skills' },
    { label: t('nav.certificates'), href: '#certificates' },
    { label: t('nav.contact'), href: '#contact' }
  ];

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'id' ? 'en' : 'id');
  };

  const LanguageToggle = (
    <button
      type="button"
      onClick={toggleLanguage}
      className="relative flex h-8 w-20 shrink-0 items-center justify-between rounded-full border border-black/20 dark:border-white/30 bg-black/5 dark:bg-white/5 px-2 text-black dark:text-white transition-colors duration-300 hover:bg-black/10 dark:hover:bg-white/10"
      aria-label="Toggle language"
    >
      <span
        className={`z-0 text-[10px] font-bold tracking-wide transition-opacity duration-300 ${
          i18n.language === 'id' ? 'opacity-0' : 'opacity-70'
        }`}
      >
        EN
      </span>
      <span
        className={`z-0 text-[10px] font-bold tracking-wide transition-opacity duration-300 ${
          i18n.language === 'en' ? 'opacity-0' : 'opacity-70'
        }`}
      >
        ID
      </span>

      <span
        className={`absolute top-1/2 left-1 z-10 flex h-6 w-6 -translate-y-1/2 items-center justify-center overflow-hidden rounded-full bg-white shadow-md transition-transform duration-300 ease-out ${
          i18n.language === 'id' ? 'translate-x-0' : 'translate-x-[50px]'
        }`}
      >
        <img
          src={i18n.language === 'id' ? '/indonesia.png' : '/united-kingdom.png'}
          alt={i18n.language === 'id' ? 'Bendera Indonesia' : 'UK Flag'}
          className="h-full w-full object-cover"
        />
      </span>
    </button>
  );

  const ThemeToggle = (
    <AnimatedThemeToggler className="flex h-8 w-8 items-center justify-center rounded-full border border-black/20 dark:border-white/30 bg-black/5 dark:bg-white/5 text-black dark:text-white transition-colors hover:bg-black/10 dark:hover:bg-white/10" />
  );

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-transparent dark:bg-transparent backdrop-blur-none dark:backdrop-blur-none border-b border-transparent dark:border-transparent">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a
          href="#home"
          onClick={e => {
            e.preventDefault();
            handleNavigate('#home');
          }}
          className="flex items-center gap-2 text-black dark:text-white"
        >
          <div className="h-8 w-8">
            {/* Light Mode */}
            <img
              src="/LogoZdarkRemBg.png"
              alt="Z"
              className="h-8 w-8 object-contain dark:hidden"
            />

            {/* Dark Mode */}
            <img
              src="/LogoZremBg.png"
              alt="Z"
              className="hidden h-8 w-8 object-contain dark:block"
            />
          </div>

          <GlitchText
            enableOnHover
            speed={0.4}
            className="!mx-0 !cursor-pointer !text-lg !font-bold !tracking-wide !text-[color:inherit]"
          >
            Portofolio
          </GlitchText>
        </a>

        {/* Desktop: GooeyNav penuh dengan efek particle */}
        <div className="hidden md:block">
          <GooeyNav
            items={navItems}
            particleCount={12}
            particleDistances={[80, 8]}
            particleR={80}
            initialActiveIndex={-1}
            animationTime={500}
            timeVariance={200}
            onNavigate={handleNavigate}
          />
        </div>

        <div className="flex items-center gap-3">
          {/* Desktop: toggle bahasa + toggle tema */}
          <div className="hidden items-center gap-3 md:flex">
            {LanguageToggle}
            {ThemeToggle}
          </div>

          {/* Mobile: toggle bahasa + toggle tema + hamburger */}
          <div className="flex items-center gap-3 md:hidden">
            {LanguageToggle}
            {ThemeToggle}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(prev => !prev)}
              className="flex h-9 w-9 flex-col items-center justify-center gap-[5px]"
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMobileMenuOpen}
            >
              <span
                className={`h-[2px] w-6 bg-black dark:bg-white transition-transform duration-300 ${
                  isMobileMenuOpen ? 'translate-y-[7px] rotate-45' : ''
                }`}
              />
              <span
                className={`h-[2px] w-6 bg-black dark:bg-white transition-opacity duration-200 ${
                  isMobileMenuOpen ? 'opacity-0' : ''
                }`}
              />
              <span
                className={`h-[2px] w-6 bg-black dark:bg-white transition-transform duration-300 ${
                  isMobileMenuOpen ? '-translate-y-[7px] -rotate-45' : ''
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile: panel dropdown, link flat biasa (tanpa efek particle) */}
      <div
        className={`overflow-hidden bg-white/95 dark:bg-black/90 backdrop-blur-md transition-[max-height] duration-300 ease-out md:hidden ${
          isMobileMenuOpen ? 'max-h-[420px]' : 'max-h-0'
        }`}
      >
        <ul className="flex flex-col px-6 py-4">
          {mobileFlatItems.map(item => (
            <li key={item.href}>
              <a
                href={item.href}
                onClick={e => {
                  e.preventDefault();
                  setIsMobileMenuOpen(false);
                  handleNavigate(item.href);
                }}
                className="block py-3 text-black/80 dark:text-white/90 transition-colors hover:text-black dark:hover:text-white"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
};

export default Navbar;