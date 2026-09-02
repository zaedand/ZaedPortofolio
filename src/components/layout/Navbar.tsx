import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import GooeyNav from '../animated/GooeyNav';
import type { GooeyNavItem } from '../animated/GooeyNav';
import GlitchText from '../animated/GlitchText';

const Navbar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  // Versi flat khusus mobile — dropdown "More" dipecah jadi link sejajar biasa,
  // supaya nggak perlu accordion bersarang di layar sempit.
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
    className="relative flex h-8 w-20 shrink-0 items-center justify-between rounded-full border border-white/30 bg-white/5 px-2 transition-colors duration-300 hover:bg-white/10 text-white"
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

  return (
    <header className="fixed top-0 inset-x-0 z-50">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href="#home" className="text-white">
          <GlitchText
            enableOnHover
            speed={0.4}
            className="!mx-0 !cursor-pointer !text-lg !font-semibold !tracking-wide"
          >
            MyPortofolio
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
          />
        </div>

        <div className="flex items-center gap-3">
          {/* Desktop: toggle bahasa */}
          <div className="hidden md:block">{LanguageToggle}</div>

          {/* Mobile: toggle bahasa + hamburger */}
          <div className="flex items-center gap-3 md:hidden">
            {LanguageToggle}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(prev => !prev)}
              className="flex h-9 w-9 flex-col items-center justify-center gap-[5px]"
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMobileMenuOpen}
            >
              <span
                className={`h-[2px] w-6 bg-white transition-transform duration-300 ${
                  isMobileMenuOpen ? 'translate-y-[7px] rotate-45' : ''
                }`}
              />
              <span
                className={`h-[2px] w-6 bg-white transition-opacity duration-200 ${
                  isMobileMenuOpen ? 'opacity-0' : ''
                }`}
              />
              <span
                className={`h-[2px] w-6 bg-white transition-transform duration-300 ${
                  isMobileMenuOpen ? '-translate-y-[7px] -rotate-45' : ''
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile: panel dropdown, link flat biasa (tanpa efek particle) */}
      <div
        className={`overflow-hidden bg-black/90 backdrop-blur-md transition-[max-height] duration-300 ease-out md:hidden ${
          isMobileMenuOpen ? 'max-h-[420px]' : 'max-h-0'
        }`}
      >
        <ul className="flex flex-col px-6 py-4">
          {mobileFlatItems.map(item => (
            <li key={item.href}>
              <a
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-3 text-white/90 transition-colors hover:text-white"
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