import React, { useCallback, useEffect, useRef, useState } from 'react';
import './lock.css';

const KEY = 'vd-unlocked';
const reduced = () =>
  typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const shouldLock = () => {
  try {
    if (sessionStorage.getItem(KEY)) return false;
  } catch (e) { /* storage blocked: still show it */ }
  if (window.location.hash && window.location.hash !== '#') return false;
  return true;
};

const clockText = () => {
  const d = new Date();
  return {
    time: d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }).replace(/\s?[AP]M/i, ''),
    date: d.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' }),
  };
};


// Photographic Earth (NASA Blue Marble, public domain) drawn as a lit sphere on a small canvas.
const SIZE = 400;
function EarthCanvas() {
  const cv = useRef(null);
  useEffect(() => {
    const canvas = cv.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    let raf = 0; let dead = false; let last = 0;
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
      if (dead) return;
      const W = img.naturalWidth; const H = img.naturalHeight;
      const tc = document.createElement('canvas'); tc.width = W; tc.height = H;
      const tx = tc.getContext('2d'); tx.drawImage(img, 0, 0);
      const tex = new Uint32Array(tx.getImageData(0, 0, W, H).data.buffer);
      const r = SIZE / 2; const tilt = 0.32;
      const idx = []; const row = []; const lon = []; const shade = [];
      for (let py = 0; py < SIZE; py += 1) {
        for (let px = 0; px < SIZE; px += 1) {
          const x = (px + 0.5 - r) / r; const y = (r - py - 0.5) / r;
          const d = x * x + y * y; if (d >= 1) continue;
          const z = Math.sqrt(1 - d);
          const y2 = y * Math.cos(tilt) + z * Math.sin(tilt);
          const z2 = z * Math.cos(tilt) - y * Math.sin(tilt);
          idx.push(py * SIZE + px);
          row.push(Math.min(H - 1, Math.max(0, Math.floor((0.5 - Math.asin(y2) / Math.PI) * H))) * W);
          lon.push((Math.atan2(x, z2) / (2 * Math.PI)) * W);
          shade.push(Math.min(1, 0.5 + 0.7 * Math.pow(z, 0.5)));
        }
      }
      const n = idx.length;
      const out = ctx.createImageData(SIZE, SIZE); const o32 = new Uint32Array(out.data.buffer);
      const draw = (shift) => {
        o32.fill(0);
        for (let i = 0; i < n; i += 1) {
          let t = Math.floor(lon[i] - shift) % W; if (t < 0) t += W;
          const c = tex[row[i] + t]; const k = shade[i];
          o32[idx[i]] = 0xff000000 | (((((c >> 16) & 255) * k) | 0) << 16) | (((((c >> 8) & 255) * k) | 0) << 8) | ((((c & 255) * k) | 0));
        }
        ctx.putImageData(out, 0, 0);
      };
      const start = W * 0.52; // roughly Africa, Europe and Asia
      draw(-start);
      canvas.classList.add('is-ready');
      if (reduced()) return;
      const t0 = performance.now();
      const loop = (now) => {
        raf = requestAnimationFrame(loop);
        if (now - last < 42 || document.hidden) return;
        last = now;
        draw(((t0 - now) / 1000) * (W / 90) - start);
      };
      raf = requestAnimationFrame(loop);
    };
    img.src = '/earth.jpg';
    return () => { dead = true; cancelAnimationFrame(raf); };
  }, []);
  return <canvas ref={cv} className="globe-earth" width={SIZE} height={SIZE} />;
}

// Classic iPhone slide-to-unlock, rebuilt in plain DOM and CSS. Transform and opacity only.
export default function LockScreen() {
  const [locked, setLocked] = useState(() => typeof window !== 'undefined' && shouldLock());
  const [leaving, setLeaving] = useState(false);
  const [clock, setClock] = useState(clockText);
  const track = useRef(null);
  const knob = useRef(null);
  const state = useRef({ x: 0, max: 1, drag: false, startX: 0, raf: 0, done: false });

  // time and date, updated while the gate is up
  useEffect(() => {
    if (!locked) return undefined;
    const id = setInterval(() => setClock(clockText()), 15000);
    return () => clearInterval(id);
  }, [locked]);

  // lock page scroll and keep the site behind the gate out of reach
  useEffect(() => {
    if (!locked) return undefined;
    const root = document.documentElement;
    root.classList.add('lock-on');
    const hidden = Array.from(document.querySelectorAll('.site-header, main'));
    hidden.forEach((el) => el.setAttribute('inert', ''));
    return () => {
      root.classList.remove('lock-on');
      hidden.forEach((el) => el.removeAttribute('inert'));
    };
  }, [locked]);

  const paint = useCallback((x) => {
    const s = state.current;
    s.x = x;
    if (knob.current) knob.current.style.transform = `translate3d(${x}px,0,0)`;
    if (track.current) track.current.style.setProperty('--p', String(Math.min(1, x / s.max)));
  }, []);

  const measure = useCallback(() => {
    if (!track.current || !knob.current) return;
    state.current.max = Math.max(1, track.current.clientWidth - knob.current.offsetWidth - 8);
  }, []);

  const finish = useCallback(() => {
    const s = state.current;
    if (s.done) return;
    s.done = true;
    try { sessionStorage.setItem(KEY, '1'); } catch (e) { /* ignore */ }
    paint(s.max);
    setLeaving(true);
    const root = document.documentElement;
    root.classList.add('unlocking');
    // restart the hero entrance so it plays as the site zooms in
    root.classList.remove('bold-on');
    // eslint-disable-next-line no-unused-expressions
    root.offsetWidth;
    root.classList.add('bold-on');
    window.scrollTo(0, 0);
    setTimeout(() => {
      setLocked(false);
      root.classList.remove('unlocking');
    }, reduced() ? 300 : 560);
  }, [paint]);

  const springBack = useCallback(() => {
    const s = state.current;
    let v = 0;
    let last = performance.now();
    cancelAnimationFrame(s.raf);
    const step = (now) => {
      const dt = Math.min(0.032, (now - last) / 1000);
      last = now;
      const a = -180 * s.x - 17 * v; // slightly under-damped spring toward 0
      v += a * dt;
      const nx = s.x + v * dt;
      if (Math.abs(nx) < 0.3 && Math.abs(v) < 4) {
        paint(0);
        return;
      }
      paint(Math.max(0, nx));
      s.raf = requestAnimationFrame(step);
    };
    s.raf = requestAnimationFrame(step);
  }, [paint]);

  useEffect(() => {
    if (!locked) return undefined;
    measure();
    window.addEventListener('resize', measure);
    return () => {
      window.removeEventListener('resize', measure);
      cancelAnimationFrame(state.current.raf);
    };
  }, [locked, measure]);

  const onDown = (e) => {
    const s = state.current;
    if (s.done) return;
    measure();
    cancelAnimationFrame(s.raf);
    s.drag = true;
    s.startX = e.clientX - s.x;
    e.currentTarget.setPointerCapture(e.pointerId);
    track.current.classList.add('is-dragging');
  };
  const onMove = (e) => {
    const s = state.current;
    if (!s.drag) return;
    paint(Math.min(s.max, Math.max(0, e.clientX - s.startX)));
  };
  const onUp = () => {
    const s = state.current;
    if (!s.drag) return;
    s.drag = false;
    track.current.classList.remove('is-dragging');
    if (s.x >= s.max * 0.82) finish();
    else springBack();
  };
  const onKey = (e) => {
    if (['Enter', ' ', 'ArrowRight'].includes(e.key)) {
      e.preventDefault();
      measure();
      finish();
    }
  };

  if (!locked) return null;

  return (
    <div className={`lock${leaving ? ' is-leaving' : ''}`} role="dialog" aria-label="Slide to unlock the portfolio">
      <div className="lock-stars" aria-hidden="true" />
      <div className="lock-status" aria-hidden="true">
        <span>Vishal Das</span>
        <svg className="lock-pad" viewBox="0 0 10 13"><rect x="1" y="5.5" width="8" height="7" rx="1.5" fill="currentColor" /><path d="M2.8 5.5V3.8a2.2 2.2 0 0 1 4.4 0v1.7" fill="none" stroke="currentColor" strokeWidth="1.3" /></svg>
        <span className="lock-batt"><i /></span>
      </div>
      <div className="lock-clock">
        <div className="lock-time">{clock.time}</div>
        <div className="lock-date">{clock.date}</div>
        <p className="lock-welcome">Hi, I&apos;m Vishal. Come on in.</p>
      </div>
      <div className="lock-globe" aria-hidden="true">
        <EarthCanvas />
        <div className="globe-shade" />
      </div>
      <div className="lock-bottom">
        <div className="lock-track" ref={track}>
          <span className="lock-label">slide to unlock</span>
          <div
            className="lock-knob"
            ref={knob}
            role="slider"
            tabIndex={0}
            aria-label="Slide to unlock"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={0}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
            onKeyDown={onKey}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
        </div>
        <button type="button" className="lock-skip" onClick={() => { measure(); finish(); }}>Skip</button>
      </div>
    </div>
  );
}
