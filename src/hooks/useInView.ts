// src/hooks/useInView.ts
import { useEffect, useRef, useState } from 'react';

interface UseInViewOptions {
  threshold?: number; // 0 - 1, seberapa persen section harus kelihatan dulu
  rootMargin?: string; // geser "garis trigger" lebih awal/telat dari viewport asli
  triggerOnce?: boolean; // true = animasi cuma main sekali, false = replay tiap discroll ulang
}

export function useInView<T extends HTMLElement>({
  threshold = 0.25,
  rootMargin = '0px 0px -10% 0px',
  triggerOnce = true,
}: UseInViewOptions = {}) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (triggerOnce) observer.disconnect();
        } else if (!triggerOnce) {
          setInView(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin, triggerOnce]);

  return { ref, inView };
}