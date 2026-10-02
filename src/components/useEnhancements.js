import { useEffect } from 'react';

const reducedMotion = () =>
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// 1) Cross-fade when the nav / hero buttons jump to a section (View Transitions API).
//    Unsupported browsers and reduced-motion users keep the normal smooth-scroll jump.
// 2) Consistent staggered fade-ups on extra blocks (headings, timeline rows, grid children).
//    Uses the same .reveal / .visible classes the page already has.
export default function useEnhancements() {
  useEffect(() => {
    const cleanups = [];

    // ---- cross-fade section jumps ----
    const onClick = (event) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target.closest && event.target.closest('a[href^="#"]');
      if (!link) return;
      if (!link.closest('.site-header, .hero-actions')) return;
      const id = link.getAttribute('href').slice(1);
      const target = id ? document.getElementById(id) : null;
      if (!target || typeof document.startViewTransition !== 'function' || reducedMotion()) return;
      event.preventDefault();
      document.documentElement.classList.add('vt-nav');
      const t = document.startViewTransition(() => {
        target.scrollIntoView({ behavior: 'instant', block: 'start' });
        if (window.location.hash !== `#${id}`) history.pushState(null, '', `#${id}`);
      });
      t.finished.finally(() => document.documentElement.classList.remove('vt-nav'));
    };
    document.addEventListener('click', onClick);
    cleanups.push(() => document.removeEventListener('click', onClick));

    // ---- staggered fade-ups for additional blocks ----
    if (!reducedMotion() && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver(
        (entries) =>
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const el = entry.target;
              el.classList.add('visible');
              io.unobserve(el);
              // drop the stagger delay after the reveal so hover/tilt transitions stay instant
              setTimeout(() => { el.style.transitionDelay = ''; }, 1100);
            }
          }),
        { threshold: 0.12 }
      );
      const extra = document.querySelectorAll('.section-heading, .timeline-item, .metric-strip > *, .proof-grid article, .project-card, .lab-card');
      extra.forEach((el) => {
        if (el.classList.contains('reveal')) {
          // already handled by the base observer; only add the stagger delay
        } else {
          el.classList.add('reveal');
          io.observe(el);
        }
        const siblings = el.parentElement ? Array.from(el.parentElement.children) : [];
        const i = Math.max(0, siblings.indexOf(el));
        el.style.transitionDelay = `${Math.min(i, 5) * 70}ms`;
      });
      cleanups.push(() => io.disconnect());
    }

    return () => cleanups.forEach((fn) => fn());
  }, []);
}
