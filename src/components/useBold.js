import { useEffect } from 'react';

const reduced = () =>
  typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const HL = ['hl-mint', 'hl-sun', 'hl-rose'];

// Splits a heading into word spans (visible text unchanged, accessible name kept).
function splitWords(el, startIndex = 0, highlight) {
  if (el.dataset.split) return;
  const text = el.textContent;
  el.setAttribute('aria-label', text);
  el.dataset.split = '1';
  el.textContent = '';
  const words = text.split(/\s+/).filter(Boolean);
  words.forEach((word, i) => {
    const w = document.createElement('span');
    w.className = 'w';
    w.setAttribute('aria-hidden', 'true');
    w.style.setProperty('--i', String(startIndex + i));
    w.textContent = word;
    if (highlight && highlight(i, words.length)) w.classList.add('hl', HL[(el.dataset.hl || 0) % 3]);
    el.appendChild(w);
    if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
  });
}

// Bold motion layer. Nothing here runs per scroll frame: the headline words animate once on load,
// section headings only get a static marker, and animated blocks pause while off screen.
export default function useBold() {
  useEffect(() => {
    if (reduced()) return undefined;
    const cleanups = [];
    document.documentElement.classList.add('bold-on');

    const h1 = document.querySelector('.hero h1');
    if (h1) {
      splitWords(h1, 3, (i, n) => i >= n - 2);
      h1.dataset.hl = '0';
    }
    const heads = Array.from(document.querySelectorAll('.section-heading h2, .contact-section h2, .intro-grid h2'));
    heads.forEach((h, idx) => {
      h.dataset.hl = String(idx + 1);
      splitWords(h, 0, (i, n) => i === n - 1);
    });

    // pause infinite animations on blocks that are not on screen
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(
        (entries) => entries.forEach((e) => e.target.classList.toggle('is-offscreen', !e.isIntersecting)),
        { rootMargin: '80px 0px' }
      );
      document.querySelectorAll('.hero, .tape-wrap, .vendor-strip, .play-section, .marquee').forEach((el) => io.observe(el));
      cleanups.push(() => io.disconnect());
    }

    // sparkle burst on button / sticker click
    const onClick = (e) => {
      const t = e.target.closest && e.target.closest('.primary-button, .secondary-button, .sticker, .resume-link, .play-btn');
      if (!t) return;
      const x = e.clientX || t.getBoundingClientRect().left + t.offsetWidth / 2;
      const y = e.clientY || t.getBoundingClientRect().top + t.offsetHeight / 2;
      const glyphs = ['✦', '★', '✺', '✶', '●'];
      const cols = ['#55f0c2', '#ffd166', '#ff6b9a', '#60a5fa'];
      for (let i = 0; i < 10; i += 1) {
        const p = document.createElement('span');
        p.className = 'burst-particle';
        p.setAttribute('aria-hidden', 'true');
        p.textContent = glyphs[i % glyphs.length];
        p.style.color = cols[i % cols.length];
        p.style.left = `${x}px`;
        p.style.top = `${y}px`;
        document.body.appendChild(p);
        const a = (Math.PI * 2 * i) / 10 + Math.random() * 0.4;
        const dist = 50 + Math.random() * 60;
        const anim = p.animate(
          [
            { transform: 'translate(-50%,-50%) scale(0.3)', opacity: 1 },
            { transform: `translate(calc(-50% + ${Math.cos(a) * dist}px), calc(-50% + ${Math.sin(a) * dist - 18}px)) scale(1.2)`, opacity: 1, offset: 0.6 },
            { transform: `translate(calc(-50% + ${Math.cos(a) * dist * 1.1}px), calc(-50% + ${Math.sin(a) * dist + 30}px)) scale(0.6)`, opacity: 0 },
          ],
          { duration: 700, easing: 'cubic-bezier(0.2, 0.7, 0.3, 1)' }
        );
        anim.onfinish = () => p.remove();
      }
    };
    document.addEventListener('click', onClick);
    cleanups.push(() => document.removeEventListener('click', onClick));

    return () => {
      cleanups.forEach((fn) => fn());
      document.documentElement.classList.remove('bold-on');
    };
  }, []);
}
