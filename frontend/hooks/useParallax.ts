'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Returns the current window scroll position, updated via rAF for buttery smoothness.
 */
export function useScrollY(): number {
  const [scrollY, setScrollY] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const onScroll = () => {
      if (rafRef.current !== null) return; // already scheduled
      rafRef.current = requestAnimationFrame(() => {
        setScrollY(window.scrollY);
        rafRef.current = null;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return scrollY;
}

/**
 * Returns whether a ref element is "in view" (entered viewport), useful for
 * scroll-triggered fade-in/slide-up animations. 
 * @param threshold  fraction of element visible before triggering (default 0.15)
 */
export function useInView(
  ref: React.RefObject<Element | null>,
  threshold = 0.15
): boolean {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect(); // fire once
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, threshold]);

  return inView;
}
