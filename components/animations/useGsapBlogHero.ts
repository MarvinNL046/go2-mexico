/**
 * useGsapBlogHero — subtle entrance animation for blog hero section.
 *
 * Effects (all under 1.2s, respects prefers-reduced-motion):
 *  - Hero image: scale 1.06 → 1.0 + opacity 0 → 1 (Ken-Burns-lite)
 *  - Title: y +24px → 0 + opacity 0 → 1 (stagger 100ms after image)
 *  - Meta row: opacity 0 → 1 (200ms after title)
 *
 * Usage in blog/[slug].tsx:
 *   const heroRef = useGsapBlogHero();
 *   <section ref={heroRef} className="...">...</section>
 */

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export function useGsapBlogHero<T extends HTMLElement = HTMLElement>() {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Respect user's motion preferences — never override
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      const img = el.querySelector('img');
      const h1 = el.querySelector('h1');
      const meta = el.querySelector('.flex.items-center.gap-4');

      const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

      if (img) {
        tl.fromTo(img, { scale: 1.06, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.1 }, 0);
      }
      if (h1) {
        tl.fromTo(h1, { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 }, 0.25);
      }
      if (meta) {
        tl.fromTo(meta, { opacity: 0 }, { opacity: 1, duration: 0.5 }, 0.55);
      }
    }, el);

    return () => ctx.revert();
  }, []);

  return ref;
}
