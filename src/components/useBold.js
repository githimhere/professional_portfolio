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

// Bolder motion layer: word-pop headings, floating parallax doodles, click sparkles.
export default function useBold() {
  useEffect(() => {
    if (reduced()) return undefined;
    const cleanups = [];
    document.documentElement.classList.add('bold-on');

    // ---- hero headline: words pop in, last words get a marker highlight ----
    const h1 = document.querySelector('.hero h1');
    if (h1) {
      splitWords(h1, 3, (i, n) => i >= n - 2);
      h1.dataset.hl = '0';
    }

    // ---- section headings: words pop in when scrolled to, last word highlighted ----
    const heads = Array.from(document.querySelectorAll('.section-heading h2, .contact-section h2, .intro-grid h2'));
    const seen = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            seen.unobserve(e.target);
          }
        }),
      { threshold: 0.3 }
    );
    heads.forEach((h, idx) => {
      h.dataset.hl = String(idx + 1);
      splitWords(h, 0, (i, n) => i === n - 1);
      seen.observe(h);
    });
    cleanups.push(() => seen.disconnect());

    // ---- doodles in the margins with scroll parallax ----
    const shapes = ['✦', '✺', '●', '✶', '◆', '✷'];
    const colors = ['var(--mint)', 'var(--sun)', 'var(--rose)', 'var(--blue)'];
    const sections = Array.from(document.querySelectorAll('main > section.section, main > section.contact-section, main section.play-section'));
    const doodles = [];
    sections.forEach((sec, i) => {
      if (getComputedStyle(sec).position === 'static') sec.style.position = 'relative';
      for (let k = 0; k < 2; k += 1) {
        const d = document.createElement('span');
        d.className = 'doodle';
        d.setAttribute('aria-hidden', 'true');
        d.textContent = shapes[(i * 2 + k) % shapes.length];
        d.style.color = colors[(i + k * 2) % colors.length];
        d.style.setProperty('--x', k === 0 ? `${2 + (i % 3) * 3}%` : `${90 - (i % 3) * 3}%`);
        d.style.setProperty('--y', k === 0 ? `${6 + (i % 2) * 6}%` : `${48 + (i % 3) * 10}%`);
        d.style.setProperty('--s', `${1.4 + ((i + k) % 3) * 0.7}rem`);
        d.style.setProperty('--f', String(0.18 + ((i + k) % 3) * 0.1));
        d.style.setProperty('--d', `${(i * 0.7 + k * 1.3).toFixed(1)}s`);
        sec.appendChild(d);
        doodles.push({ d, sec });
      }
    });
    let raf = 0;
    const tick = () => {
      raf = 0;
      const vh = window.innerHeight;
      doodles.forEach(({ d, sec }) => {
        const r = sec.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        const off = (r.top + r.height / 2 - vh / 2) * Number(d.style.getPropertyValue('--f'));
        d.style.translate = `0 ${off.toFixed(1)}px`;
      });
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(tick); };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    tick();
    cleanups.push(() => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(raf);
      doodles.forEach(({ d }) => d.remove());
    });

    // ---- sparkle burst on button / sticker click ----
    const onClick = (e) => {
      const t = e.target.closest && e.target.closest('.primary-button, .secondary-button, .sticker, .resume-link, .play-btn');
      if (!t) return;
      const x = e.clientX || t.getBoundingClientRect().left + t.offsetWidth / 2;
      const y = e.clientY || t.getBoundingClientRect().top + t.offsetHeight / 2;
      const glyphs = ['✦', '★', '✺', '✶', '●'];
      const cols = ['#55f0c2', '#ffd166', '#ff6b9a', '#60a5fa'];
      for (let i = 0; i < 12; i += 1) {
        const p = document.createElement('span');
        p.className = 'burst-particle';
        p.setAttribute('aria-hidden', 'true');
        p.textContent = glyphs[i % glyphs.length];
        p.style.color = cols[i % cols.length];
        p.style.left = `${x}px`;
        p.style.top = `${y}px`;
        document.body.appendChild(p);
        const a = (Math.PI * 2 * i) / 12 + Math.random() * 0.4;
        const dist = 50 + Math.random() * 60;
        const anim = p.animate(
          [
            { transform: 'translate(-50%,-50%) scale(0.3) rotate(0deg)', opacity: 1 },
            { transform: `translate(calc(-50% + ${Math.cos(a) * dist}px), calc(-50% + ${Math.sin(a) * dist - 18}px)) scale(1.2) rotate(${Math.random() * 360}deg)`, opacity: 1, offset: 0.6 },
            { transform: `translate(calc(-50% + ${Math.cos(a) * dist * 1.1}px), calc(-50% + ${Math.sin(a) * dist + 30}px)) scale(0.6) rotate(${Math.random() * 540}deg)`, opacity: 0 },
          ],
          { duration: 750 + Math.random() * 250, easing: 'cubic-bezier(0.2, 0.7, 0.3, 1)' }
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
