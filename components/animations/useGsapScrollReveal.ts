/**
 * useGsapScrollReveal — fades H2 sections + tables up into view as user scrolls.
 *
 * Targets `data-blog-content` container; finds H2/H3/table elements inside.
 * Uses native IntersectionObserver (no ScrollTrigger plugin = smaller bundle).
 *
 * Usage:
 *   useGsapScrollReveal('[data-blog-content]');
 */

import { useEffect } from 'react';
import gsap from 'gsap';

export function useGsapScrollReveal(containerSelector: string) {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const container = document.querySelector(containerSelector);
    if (!container) return;

    // Targets: every H2 + table — these are the visual anchors that benefit
    // most from a soft reveal. Avoid animating every paragraph (too much).
    const targets = container.querySelectorAll('h2, table, .pro-tip-callout');
    if (!targets.length) return;

    // Set initial hidden state once, then observe
    gsap.set(targets, { opacity: 0, y: 16 });

    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            gsap.to(entry.target, {
              opacity: 1,
              y: 0,
              duration: 0.6,
              ease: 'power2.out',
            });
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -10% 0px' }
    );

    targets.forEach(t => observer.observe(t));

    return () => observer.disconnect();
  }, [containerSelector]);
}
