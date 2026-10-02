import { useEffect, useRef, useState } from 'react';

const LINKS = [
  { href: '#work', label: 'Projects' },
  { href: '#ai-lab', label: 'AI Lab' },
  { href: '#skills', label: 'Skills' },
  { href: '#play', label: 'Play' },
  { href: '#proof', label: 'Proof' },
  { href: '#contact', label: 'Contact' },
];

const Navbar = () => {
  const navRef = useRef(null);
  const pillRef = useRef(null);
  const [active, setActive] = useState('');
  const [open, setOpen] = useState(false);

  // Track which section is in view
  useEffect(() => {
    const els = LINKS.map((l) => document.getElementById(l.href.slice(1))).filter(Boolean);
    if (!els.length || !('IntersectionObserver' in window)) return undefined;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: 0 }
    );
    els.forEach((el) => io.observe(el));
    const onScroll = () => {
      if (window.scrollY < 200) setActive('');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  // Slide the highlight pill under the active link (desktop nav only)
  useEffect(() => {
    const nav = navRef.current;
    const pill = pillRef.current;
    if (!nav || !pill) return undefined;
    const place = () => {
      const link = active ? nav.querySelector(`a[href="#${active}"]`) : null;
      if (!link || nav.offsetParent === null) {
        pill.style.opacity = '0';
        return;
      }
      pill.style.width = `${link.offsetWidth}px`;
      pill.style.transform = `translateX(${link.offsetLeft}px)`;
      pill.style.opacity = '1';
    };
    place();
    window.addEventListener('resize', place);
    return () => window.removeEventListener('resize', place);
  }, [active]);

  // Mobile menu: Escape closes, clicking a link closes
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header className="site-header">
      <a className="brand" href="#home" aria-label="Go to home">
        <span className="brand-mark">VD</span>
        <span>Vishal Das</span>
      </a>
      <nav
        id="primary-nav"
        ref={navRef}
        className={`nav-links${open ? ' is-open' : ''}`}
        aria-label="Primary navigation"
        onClick={(e) => e.target.closest('a') && setOpen(false)}
      >
        <span className="nav-pill" ref={pillRef} aria-hidden="true" />
        {LINKS.map((l) => (
          <a key={l.href} href={l.href} className={active === l.href.slice(1) ? 'is-active' : undefined} aria-current={active === l.href.slice(1) ? 'true' : undefined}>
            {l.label}
          </a>
        ))}
      </nav>
      <a className="resume-link" href="#work">Portfolio</a>
      <button
        type="button"
        className="menu-toggle"
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        aria-controls="primary-nav"
        onClick={() => setOpen((v) => !v)}
      >
        <span /><span /><span />
      </button>
    </header>
  );
};

export default Navbar;
