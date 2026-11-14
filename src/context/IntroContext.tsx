import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

export const SPLASH_SEEN_KEY = 'zaed-splash-seen';

/** Splash hanya diputar: di halaman utama, sekali per sesi tab, dan bila user tidak reduced-motion. */
const shouldPlaySplash = () => {
  if (typeof window === 'undefined') return false;
  if (window.location.pathname !== '/') return false;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  try {
    return !sessionStorage.getItem(SPLASH_SEEN_KEY);
  } catch {
    return true;
  }
};

type IntroState = {
  /** true kalau splash memang diputar pada load ini */
  playing: boolean;
  /** Hero boleh mulai menyalakan shader-nya (dipicu splash saat ripple mulai jadi molten) */
  heroShaderReady: boolean;
  /** Splash hampir selesai → teks Hero & Navbar boleh muncul */
  introDone: boolean;
  markHeroShaderReady: () => void;
  markIntroDone: () => void;
};

const IntroContext = createContext<IntroState | null>(null);

export const IntroProvider = ({ children }: { children: ReactNode }) => {
  const [playing] = useState(shouldPlaySplash);
  const [heroShaderReady, setHeroShaderReady] = useState(!playing);
  const [introDone, setIntroDone] = useState(!playing);

  const markHeroShaderReady = useCallback(() => setHeroShaderReady(true), []);
  const markIntroDone = useCallback(() => setIntroDone(true), []);

  const value = useMemo(
    () => ({ playing, heroShaderReady, introDone, markHeroShaderReady, markIntroDone }),
    [playing, heroShaderReady, introDone, markHeroShaderReady, markIntroDone]
  );

  return <IntroContext.Provider value={value}>{children}</IntroContext.Provider>;
};

export const useIntro = () => {
  const ctx = useContext(IntroContext);
  if (!ctx) throw new Error('useIntro harus dipakai di dalam <IntroProvider>');
  return ctx;
};