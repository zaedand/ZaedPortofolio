import { useTranslation } from 'react-i18next';
import MoltenMetal from '@/components/animated/MoltenMetal';

const Hero = () => {
  const { t, i18n } = useTranslation();

  const today = new Date().toLocaleDateString(i18n.language === 'id' ? 'id-ID' : 'en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <section id="home" className="relative isolate min-h-screen overflow-hidden bg-black">
      <div className="absolute inset-0 -z-10">
        <MoltenMetal
          color1="#3B82F6"
          color2="#2800ff"
          color3="#ffffff"
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

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center text-white pointer-events-none">
        <h1 className="text-3xl font-bold leading-tight sm:text-4xl md:text-5xl lg:text-6xl">
          Zaidan Akmal Mauludi
        </h1>

        <p className="mt-3 max-w-2xl text-sm text-white/80 sm:text-base md:mt-2 md:text-xl">
          <span className="block sm:inline">Software Developer</span>
          <span className="hidden sm:inline"> | </span>
          <span className="block sm:inline">UI/UX Designer</span>
          <span className="hidden sm:inline"> | </span>
          <span className="block sm:inline">Data Engineer</span>
          <span className="hidden sm:inline"> | </span>
          <span className="block sm:inline">Network Engineer</span>
        </p>

        <div className="pointer-events-auto mt-6 flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm">
          <span className="flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-1.5 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
            </span>
            {t('hero.status')}
          </span>

          <span className="rounded-full border border-white/20 bg-white/5 px-4 py-1.5 backdrop-blur-sm">
            {today}
          </span>

          <span className="rounded-full border border-white/20 bg-white/5 px-4 py-1.5 backdrop-blur-sm">
            📍 {t('hero.domicile')}
          </span>
        </div>
      </div>
    </section>
  );
};

export default Hero;