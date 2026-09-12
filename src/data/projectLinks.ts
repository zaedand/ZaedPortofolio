export type ProjectLinks = {
  live?: string;        // link hosting (kalau sudah di-deploy)
  manualBook?: string;  // link drive manual book
  hki?: string;         // link drive HKI
};

export type ProjectImages = {
  desktop?: string;     // screenshot untuk Safari mockup
  mobile?: string;      // screenshot untuk iPhone mockup
};

// ── LINK PER PROJECT (fleksibel, semua opsional) ──
// Isi hanya yang tersedia. Kosongkan kalau tidak ada.
export const linksMap: Record<string, ProjectLinks> = {
  studev: {
    live: 'https://studev.my.id/',
    manualBook: 'https://drive.google.com/file/d/xxx/view',
    hki: 'https://drive.google.com/file/u/3/d/1MC8MkQApDh0sB0o4dTcbjn8ofY52lNdl/view',
  },
  simira: {
    manualBook: 'https://drive.google.com/file/d/zzz/view',
  },
  'smoking-detection': {},
  'smart-townhall': {},
  'ez-zaon': {
    live: 'https://ez-zaon.example.com',
  },
  profads: {
    live: 'https://profads.my.id/index',
  },
  'desa-bangeran': {
    live: 'https://bumdesbangeran.vercel.app/',
  },
  molekular: {
    hki: 'https://drive.google.com/file/d/mmm/view',
  },
  eduweb: {
    live: 'https://edu-web-one.vercel.app/',
  },
};

// ── SCREENSHOT (desktop = Safari, mobile = iPhone) ──
export const imageMap: Record<string, ProjectImages> = {
  studev: { desktop: '/projects/studev.png', mobile: '/projects/studev-mobile.png' },
  simira: { desktop: '/projects/simira.png', mobile: '/projects/simira-mobile.png' },
  'smoking-detection': { desktop: '/projects/smoking.png' },
  'smart-townhall': { desktop: '/projects/stown.png', mobile: '/projects/stown-mobile.png' },
  'ez-zaon': { desktop: '/projects/ez-zaon.png', mobile: '/projects/ez-zaon-mobile.png' },
  profads: { desktop: '/projects/profads.png', mobile: '/projects/profads-mobile.png' },
  'desa-bangeran': { desktop: '/projects/bangeran.png', mobile: '/projects/bangeran-mobile.png' },
  molekular: { mobile: '/projects/molekular.png' },
  eduweb: { desktop: '/projects/eduweb.png', mobile: '/projects/eduweb-mobile.png' },
};