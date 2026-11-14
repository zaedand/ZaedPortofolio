import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import BlobCursor, {
  type BlobCursorHandle,
  type BlobCursorProps,
} from '@/components/animated/BlobCursor';

export interface SplashDropletHandle {
  /**
   * Dipanggil SplashScreen tiap frame (satu-satunya "jam" animasi).
   * @param u   progres jatuh 0..1 (1 = menyentuh air)
   * @param ti  detik sejak menyentuh air (<0 = belum)
   */
  update: (u: number, ti: number) => void;
}

export interface SplashDropletProps
  extends Omit<BlobCursorProps, 'mode' | 'className' | 'style'> {
  active: boolean;
  startOffset?: number;
  /** Seberapa "mendahului" target dibanding posisi ideal, untuk meniadakan lag spring BlobCursor */
  lead?: number;
  /** Jarak (px) tetesan tenggelam ke permukaan setelah menyentuh air */
  sink?: number;
  /** Lama tetesan menyatu/memudar ke air (detik) */
  absorb?: number;
}

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const easeInQuad = (x: number) => x * x;
const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);

const SplashDroplet = forwardRef<SplashDropletHandle, SplashDropletProps>(
  function SplashDroplet(
    { active, startOffset = 80, lead = 0.045, sink = 22, absorb = 0.55, ...blobProps },
    ref,
  ) {
    const cursorRef = useRef<BlobCursorHandle>(null);
    const wrapRef = useRef<HTMLDivElement>(null);
    const geo = useRef({ cx: 0, startY: 0, endY: 0 });
    const impacted = useRef(false);

    // Posisi awal (di luar layar atas) saat aktif
    useEffect(() => {
      if (!active) return;
      impacted.current = false;
      const cx = window.innerWidth / 2;
      const startY = -startOffset;
      const endY = window.innerHeight / 2;
      geo.current = { cx, startY, endY };
      cursorRef.current?.placeAt(cx, startY);
      cursorRef.current?.setTarget(cx, startY, false);
      if (wrapRef.current) wrapRef.current.style.opacity = '1';
    }, [active, startOffset]);

    useImperativeHandle(
      ref,
      () => ({
        update(u, ti) {
          const { cx, startY, endY } = geo.current;
          const wrap = wrapRef.current;
          const c = cursorRef.current;
          if (!c || !wrap) return;

          if (ti < 0) {
            // Jatuh dipercepat (gravitasi). Target sedikit mendahului supaya
            // spring/lag BlobCursor tiba tepat saat u = 1.
            const e = easeInQuad(clamp(u + lead));
            c.setTarget(cx, startY + (endY - startY) * e);
            wrap.style.opacity = '1';
            return;
          }

          // Kontak: sekali saja percikan
          if (!impacted.current) {
            impacted.current = true;
            c.splash();
          }

          // Tenggelam pelan + memudar (bukan teleport)
          const k = clamp(ti / absorb);
          c.setTarget(cx, endY + sink * easeOutCubic(k));
          wrap.style.opacity = String(1 - clamp((ti - 0.08) / absorb));
        },
      }),
      [lead, sink, absorb],
    );

    return (
      <div ref={wrapRef} style={{ opacity: 0 }} className="pointer-events-none">
        <BlobCursor
          ref={cursorRef}
          mode="droplet"
          material="chrome"
          color="#22D3EE"
          size={110}
          morph={0.4}
          morphSpeed={0.5}
          depth={1}
          trail={10}
          lag={0.22}
          goo={1}
          stretch={0.45}
          wobble={0.55}
          splash
          splashCount={10}
          splashSpeed={0.7}
          splashSize={0.5}
          splashGravity={0.4}
          regrow={0.7}
          shine={1}
          shadow={false}
          hideCursor={false}
          className="z-20"
          {...blobProps}
        />
      </div>
    );
  },
);

export default SplashDroplet;