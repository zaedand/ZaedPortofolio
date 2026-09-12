import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Copy, Check, MapPin } from 'lucide-react';
import {
  FaGithub,
  FaLinkedinIn,
  FaInstagram,
} from 'react-icons/fa';
import { DottedMap } from '@/components/ui/dotted-map';
import { useTheme } from '@/hooks/useTheme';

/* ============================================================
   DATA
   ============================================================ */

const socialLinks = [
  {
    key: 'github',
    href: 'https://github.com/zaedand',
    Icon: FaGithub,
    label: 'GitHub',
  },
  {
    key: 'linkedin',
    href: 'https://linkedin.com/in/zaidan-akmal-mauludi/',
    Icon: FaLinkedinIn,
    label: 'LinkedIn',
  },
  {
    key: 'instagram',
    href: 'https://instagram.com/didan__akmal',
    Icon: FaInstagram,
    label: 'Instagram',
  },
];

// Koordinat Turen, Kab. Malang, Jawa Timur
const LOCATION = {
  lat: -8.1,
  lng: 112.7,
  label: 'Turen, Malang',
};

/* ============================================================
   COPY BUTTON
   ============================================================ */

const CopyButton = ({ value }: { value: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      /* fallback: select & copy manual */
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? 'Copied!' : 'Copy email'}
      className="
        inline-flex h-9 w-9 shrink-0
        items-center justify-center
        rounded-lg
        border border-black/10
        bg-white/60
        text-black/60
        transition-all duration-300
        hover:-translate-y-0.5
        hover:border-black/25
        hover:bg-white
        hover:text-black
        dark:border-white/10
        dark:bg-white/5
        dark:text-white/60
        dark:hover:border-white/25
        dark:hover:bg-white/10
        dark:hover:text-white
      "
    >
      {copied ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </button>
  );
};

/* ============================================================
   FOOTER
   ============================================================ */

const Footer = () => {
  const { t } = useTranslation();
  const isDark = useTheme();

  const email = t('footer.email');

  const accent = isDark
    ? '#3B82F6'
    : '#38BDF8';

  return (
    <footer
      id="contact"
      className="
        relative overflow-hidden
        bg-white
        px-6 py-20
        dark:bg-black
        md:py-28
      "
    >
      {/* ======================================================
          RADIAL GLOW
      ====================================================== */}

      <div
        className="
          pointer-events-none
          absolute left-1/2 top-1/2
          h-[500px] w-[600px]
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          blur-[140px]
        "
        style={{
          background: isDark
            ? 'rgba(59,130,246,0.1)'
            : 'rgba(56,189,248,0.08)',
        }}
      />

      <div className="relative mx-auto max-w-5xl">

        {/* ====================================================
            HEADING
        ==================================================== */}

        <header className="text-center">
          <h2
            className="
              text-3xl
              font-semibold
              text-black
              dark:text-[#F2F1EC]
              md:text-4xl
            "
          >
            {t('footer.heading')}
          </h2>

          <p
            className="
              mt-3
              text-sm
              text-black/60
              dark:text-white/60
              md:text-base
            "
          >
            {t('footer.subtext')}
          </p>

          <div
            className="mx-auto mt-5 h-px w-16"
            style={{
              background: `linear-gradient(
                to right,
                transparent,
                ${accent},
                transparent
              )`,
            }}
          />
        </header>

        {/* ====================================================
            GRID
            EMAIL + SOCIAL | MAP
        ==================================================== */}

        <div
          className="
            mt-14
            grid
            gap-10
            md:grid-cols-2
            md:items-center
            md:gap-16
          "
        >

          {/* ==================================================
              KIRI: EMAIL + SOCIAL
          ================================================== */}

          <div className="flex flex-col gap-8">

            {/* =================================================
                EMAIL CARD
            ================================================= */}

            <div
              className="
                group
                relative
                rounded-2xl
                border
                border-black/10
                bg-white/70
                p-5
                backdrop-blur-sm
                transition-all
                duration-300

                hover:-translate-y-0.5
                hover:border-black/20
                hover:shadow-[0_20px_50px_-20px_rgba(56,189,248,0.4)]

                dark:border-white/10
                dark:bg-white/[0.03]

                dark:hover:border-white/20
                dark:hover:shadow-[0_20px_50px_-20px_rgba(59,130,246,0.5)]
              "
            >
              <span
                className="
                  font-mono
                  text-[11px]
                  uppercase
                  tracking-wider
                  text-black/40
                  dark:text-white/40
                "
              >
                Email
              </span>

              <div className="mt-2 flex items-center gap-3">

                <a
                  href={`mailto:${email}`}
                  className="
                    flex-1
                    truncate
                    text-sm
                    font-medium
                    text-black
                    transition-colors
                    hover:text-[color:var(--accent)]
                    dark:text-white
                    dark:hover:text-[color:var(--accent)]
                  "
                >
                  {email}
                </a>

                <CopyButton value={email} />

              </div>

              {/* Aksen bawah hover */}

              <div
                className="
                  absolute
                  bottom-0
                  left-0
                  h-px
                  w-0
                  transition-all
                  duration-500
                  group-hover:w-full
                "
                style={{
                  background: `linear-gradient(
                    to right,
                    ${accent},
                    transparent
                  )`,
                }}
              />

              <style>
                {`:where(.group) { --accent: ${accent}; }`}
              </style>
            </div>

            {/* =================================================
                SOCIAL ICONS
            ================================================= */}

            <div className="flex flex-col gap-3">

              <span
                className="
                  font-mono
                  text-[11px]
                  uppercase
                  tracking-wider
                  text-black/40
                  dark:text-white/40
                "
              >
                Social
              </span>

              <div className="flex items-center gap-3">

                {socialLinks.map(
                  ({ key, href, Icon, label }) => (
                    <a
                      key={key}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="
                        group/social
                        relative
                        flex
                        h-12
                        w-12
                        items-center
                        justify-center
                        rounded-xl
                        border
                        border-black/10
                        bg-white/60
                        text-black/60
                        transition-all
                        duration-300

                        hover:-translate-y-1
                        hover:border-transparent
                        hover:shadow-lg

                        dark:border-white/10
                        dark:bg-white/5
                        dark:text-white/60
                      "
                      style={{
                        ['--accent' as string]: accent,
                      }}
                    >

                      {/* Glow saat hover */}

                      <span
                        className="
                          pointer-events-none
                          absolute
                          inset-0
                          rounded-xl
                          opacity-0
                          transition-opacity
                          duration-300
                          group-hover/social:opacity-100
                        "
                        style={{
                          background: `${accent}20`,
                        }}
                      />

                      {/* Icon */}

                      <Icon
                        className="
                          relative
                          h-5
                          w-5
                          transition-colors
                          duration-300
                          group-hover/social:text-[color:var(--accent)]
                        "
                      />

                    </a>
                  )
                )}

              </div>
            </div>

          </div>

          {/* ==================================================
              KANAN: DOTTED MAP
          ================================================== */}

          <div
            className="
              relative
              overflow-hidden
              rounded-2xl
              border
              border-black/10
              bg-white/50
              dark:border-white/10
              dark:bg-white/[0.02]
            "
          >

            <DottedMap
              width={150}
              height={75}
              mapSamples={5000}
              dotColor={
                isDark
                  ? 'rgba(255,255,255,0.35)'
                  : 'rgba(0,0,0,0.25)'
              }
              dotRadius={0.2}
              markers={[
                {
                  lat: LOCATION.lat,
                  lng: LOCATION.lng,
                  size: 2.5,
                  pulse: true,
                },
              ]}
              markerColor={accent}
              pulse
              className="h-full w-full"
            />

            {/* Label lokasi overlay */}

            <div
              className="
                pointer-events-none
                absolute
                bottom-4
                left-4
                flex
                items-center
                gap-2
                rounded-full
                border
                border-black/10
                bg-white/80
                px-3
                py-1.5
                backdrop-blur-sm
                dark:border-white/10
                dark:bg-black/60
              "
            >
              <MapPin
                className="h-3.5 w-3.5"
                style={{
                  color: accent,
                }}
              />

              <span
                className="
                  text-xs
                  font-medium
                  text-black/80
                  dark:text-white/80
                "
              >
                {LOCATION.label}
              </span>
            </div>

          </div>
        </div>

        {/* ====================================================
            BOTTOM: COPYRIGHT
        ==================================================== */}

        <div
          className="
            mt-16
            border-t
            border-black/5
            pt-8
            dark:border-white/5
          "
        >
          <p
            className="
              text-center
              text-xs
              text-black/30
              dark:text-white/30
            "
          >
            © {new Date().getFullYear()} Zaidan Akmal Mauludi.{' '}
            {t('footer.rights')}
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
