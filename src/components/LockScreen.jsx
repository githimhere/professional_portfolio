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
// Drag to spin, tap a spot to zoom toward it, tap again to zoom out.
const SIZE = 400;
const TILT = 0.32;
const PLACES = [
  ['Delhi, India', 28.6, 77.2], ['Mumbai, India', 19.1, 72.9], ['Bengaluru, India', 12.97, 77.6], ['Kolkata, India', 22.6, 88.4],
  ['Dubai', 25.2, 55.3], ['Cairo, Egypt', 30.0, 31.2], ['Cape Town, South Africa', -33.9, 18.4], ['London, UK', 51.5, -0.1],
  ['Paris, France', 48.9, 2.35], ['Moscow, Russia', 55.75, 37.6], ['Singapore', 1.35, 103.8], ['Tokyo, Japan', 35.7, 139.7],
  ['Sydney, Australia', -33.9, 151.2], ['New York, USA', 40.7, -74.0], ['San Francisco, USA', 37.8, -122.4], ['Sao Paulo, Brazil', -23.55, -46.6],
];
const rad = (d) => (d * Math.PI) / 180;
const nearest = (lat, lon) => {
  let best = null; let bd = 1e9;
  PLACES.forEach((p) => {
    const dl = Math.abs(((lon - p[2] + 540) % 360) - 180);
    const d = Math.hypot(lat - p[1], dl * Math.cos(rad(lat)));
    if (d < bd) { bd = d; best = p; }
  });
  return bd < 16 ? best[0] : '';
};

function EarthCanvas() {
  const cv = useRef(null);
  const box = useRef(null);
  const [place, setPlace] = useState('');
  useEffect(() => {
    const canvas = cv.current;
    const wrap = box.current;
    if (!canvas || !wrap) return undefined;
    const ctx = canvas.getContext('2d');
    let raf = 0; let dead = false; let last = 0;
    const img = new Image();
    img.decoding = 'async';
    const cleanups = [];
    img.onload = () => {
      if (dead) return;
      const W = img.naturalWidth; const H = img.naturalHeight;
      const tc = document.createElement('canvas'); tc.width = W; tc.height = H;
      const tx = tc.getContext('2d'); tx.drawImage(img, 0, 0);
      const tex = new Uint32Array(tx.getImageData(0, 0, W, H).data.buffer);
      const r = SIZE / 2;
      const idx = []; const row = []; const lon = []; const shade = [];
      for (let py = 0; py < SIZE; py += 1) {
        for (let px = 0; px < SIZE; px += 1) {
          const x = (px + 0.5 - r) / r; const y = (r - py - 0.5) / r;
          const d = x * x + y * y; if (d >= 1) continue;
          const z = Math.sqrt(1 - d);
          const y2 = y * Math.cos(TILT) + z * Math.sin(TILT);
          const z2 = z * Math.cos(TILT) - y * Math.sin(TILT);
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
      const st = { shift: -W * 0.52, vel: 0, drag: false, target: null, zoomed: false, dirty: true };
      const auto = reduced() ? 0 : W / 110; // texture px per second, west to east
      canvas.classList.add('is-ready');
      const setZoom = (s, tx2, ty2) => { canvas.style.transform = `translate(${tx2}px, ${ty2}px) scale(${s})`; };
      let px0 = 0; let py0 = 0; let moved = 0; let lx = 0; let lt = 0;
      const down = (e) => {
        st.drag = true; st.target = null; moved = 0; px0 = lx = e.clientX; py0 = e.clientY; lt = performance.now(); st.vel = 0;
        try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
      };
      const move = (e) => {
        if (!st.drag) return;
        const diam = canvas.getBoundingClientRect().width / (st.zoomed ? 1.7 : 1);
        const dx = e.clientX - lx; lx = e.clientX; moved += Math.abs(dx) + Math.abs(e.clientY - py0) * 0 ;
        const k = (W / 2) / diam / (st.zoomed ? 1.7 : 1);
        const dsh = dx * k; st.shift += dsh; st.dirty = true;
        const now = performance.now(); const dt = Math.max(1, now - lt); lt = now;
        st.vel = st.vel * 0.6 + ((dsh / dt) * 1000) * 0.4;
      };
      const up = (e) => {
        if (!st.drag) return;
        st.drag = false;
        if (Math.abs(e.clientX - px0) + Math.abs(e.clientY - py0) < 8) tap(e);
      };
      const tap = (e) => {
        if (st.zoomed) { st.zoomed = false; setZoom(1, 0, 0); setPlace(''); st.vel = 0; return; }
        const rc = canvas.getBoundingClientRect(); const rr = rc.width / 2;
        const x = (e.clientX - rc.left - rr) / rr; const y = (rr - (e.clientY - rc.top)) / rr;
        const d = x * x + y * y; if (d >= 1) return;
        const z = Math.sqrt(1 - d);
        const y2 = y * Math.cos(TILT) + z * Math.sin(TILT); const z2 = z * Math.cos(TILT) - y * Math.sin(TILT);
        const latD = (Math.asin(y2) * 180) / Math.PI;
        const col = (Math.atan2(x, z2) / (2 * Math.PI)) * W - st.shift;
        let lonD = ((col / W) * 360 - 180); lonD = ((lonD + 540) % 360) - 180;
        st.target = -col; st.vel = 0; st.zoomed = true;
        const s = 1.7; const lat = rad(latD);
        const dyUp = Math.sin(lat - TILT) * rr; // where the point lands once centred, in px up from centre
        let ty2 = dyUp * s; const lim = rr * (s - 1) * 0.92; ty2 = Math.max(-lim, Math.min(lim, ty2));
        setZoom(s, 0, ty2);
        setPlace(nearest(latD, lonD) || 'Somewhere out there');
      };
      canvas.addEventListener('pointerdown', down);
      canvas.addEventListener('pointermove', move);
      canvas.addEventListener('pointerup', up);
      canvas.addEventListener('pointercancel', () => { st.drag = false; });
      cleanups.push(() => { canvas.removeEventListener('pointerdown', down); canvas.removeEventListener('pointermove', move); canvas.removeEventListener('pointerup', up); });
      draw(st.shift);
      let prev = performance.now();
      const loop = (now) => {
        raf = requestAnimationFrame(loop);
        if (document.hidden || now - last < 40) return;
        const dt = Math.min(0.1, (now - prev) / 1000); prev = now; last = now;
        if (!st.drag) {
          if (st.target !== null) {
            let diff = st.target - st.shift; diff = ((diff + W / 2) % W + W) % W - W / 2;
            st.shift += diff * Math.min(1, dt * 6); st.dirty = true;
            if (Math.abs(diff) < 0.5) st.target = null;
          } else if (Math.abs(st.vel) > 2) {
            st.shift += st.vel * dt; st.vel *= Math.pow(0.04, dt); st.dirty = true;
          } else if (!st.zoomed && auto) { st.shift += auto * dt; st.dirty = true; }
        }
        if (st.dirty) { draw(st.shift); st.dirty = false; }
      };
      raf = requestAnimationFrame(loop);
    };
    import('./earthData.js').then((m) => { if (!dead) img.src = m.default; });
    return () => { dead = true; cancelAnimationFrame(raf); cleanups.forEach((f) => f()); };
  }, []);
  return (
    <div className="globe-box" ref={box}>
      <canvas ref={cv} className="globe-earth" width={SIZE} height={SIZE} />
      {place ? <span className="globe-place">{place}</span> : null}
    </div>
  );
}

// Welcome cue: folded hands (namaste) with a bow, then a hand pointing down at the knob.
function Welcomer() {
  return (
    <div className="welcomer" aria-hidden="true">
      <span className="w-nam">🙏</span>
      <span className="w-pt">👇</span>
    </div>
  );
}

// Fake iOS notification banner: slides down, then tucks away on its own.
function Banner() {
  const [on, setOn] = useState(false);
  const el = useRef(null);
  const drag = useRef(null);
  useEffect(() => {
    const a = setTimeout(() => setOn(true), 1500);
    const b = setTimeout(() => setOn(false), 7000);
    return () => { clearTimeout(a); clearTimeout(b); };
  }, []);
  const down = (e) => { drag.current = { y: e.clientY, dy: 0 }; try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ } if (el.current) el.current.style.transition = 'none'; };
  const move = (e) => {
    const d = drag.current; if (!d || !el.current) return;
    d.dy = Math.min(8, e.clientY - d.y);
    el.current.style.transform = `translate3d(-50%, ${d.dy}px, 0)`;
    el.current.style.opacity = String(Math.max(0.2, 1 + d.dy / 160));
  };
  const up = () => {
    const d = drag.current; drag.current = null;
    if (!el.current) return;
    el.current.style.transition = ''; el.current.style.transform = ''; el.current.style.opacity = '';
    if (!d || d.dy < -24 || Math.abs(d.dy) < 6) setOn(false);
  };
  return (
    <button
      type="button"
      ref={el}
      className={`lock-banner${on ? ' is-on' : ''}`}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
      aria-hidden={!on}
      tabIndex={on ? 0 : -1}
    >
      <span className="lb-icon">VD</span>
      <span className="lb-text"><b>Vishal</b><i>Thanks for stopping by.</i></span>
      <span className="lb-now">now</span>
    </button>
  );
}

// Classic iPhone slide-to-unlock, rebuilt in plain DOM and CSS. Transform and opacity only.
export default function LockScreen() {
  const [locked, setLocked] = useState(() => typeof window !== 'undefined' && shouldLock());
  const [leaving, setLeaving] = useState(false);
  useEffect(() => {
    if (!locked || document.getElementById('lock-font')) return;
    const l = document.createElement('link');
    l.id = 'lock-font'; l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=Fredoka:wght@600&display=swap';
    document.head.appendChild(l);
  }, [locked]);
  const [lit, setLit] = useState(false);
  const [flash, setFlash] = useState(false);
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

  const openCamera = useCallback(() => {
    if (state.current.done) return;
    setFlash(true);
    measure();
    setTimeout(() => {
      finish();
      setTimeout(() => {
        const el = document.querySelector('.profile-card');
        if (el) el.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'center' });
      }, reduced() ? 400 : 900);
    }, 160);
  }, [finish, measure]);

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
    <div className={`lock${leaving ? ' is-leaving' : ''}${lit ? ' is-lit' : ''}`} role="dialog" aria-label="Slide to unlock the portfolio">
      <div className="lock-stars" aria-hidden="true" />
      <div className="lock-beam" aria-hidden="true" />
      <Banner />
      <div className="lock-status" aria-hidden="true">
        <span>Vishal Das</span>
        <svg className="lock-pad" viewBox="0 0 10 13"><rect x="1" y="5.5" width="8" height="7" rx="1.5" fill="currentColor" /><path d="M2.8 5.5V3.8a2.2 2.2 0 0 1 4.4 0v1.7" fill="none" stroke="currentColor" strokeWidth="1.3" /></svg>
        <span className="lock-battwrap"><b>100%</b><span className="lock-batt"><i /></span></span>
      </div>
      <div className="lock-clock">
        <div className="lock-time">{clock.time}</div>
        <div className="lock-date">{clock.date}</div>
        <div className="lock-welcome-row">
          <img className="lock-dp" src="/assets/vishal-das.jpg" alt="" width="40" height="40" decoding="async" />
          <p className="lock-welcome">House blend: strategy, delivery, caffeine.</p>
        </div>
      </div>
      <div className="lock-globe" aria-hidden="true">
        <EarthCanvas />
        <div className="globe-shade" />
      </div>
      <div className="lock-bottom">
        <div className="lock-trackwrap">
        <Welcomer />
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
        </div>
        <button type="button" className="lock-skip" onClick={() => { measure(); finish(); }}>Skip</button>
      </div>
      <button type="button" className={`lock-corner lc-left${lit ? ' is-on' : ''}`} aria-label="Flashlight" aria-pressed={lit} onClick={() => setLit((v) => !v)}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 2h8v4l-1.6 2.4V21a1 1 0 0 1-1 1h-2.8a1 1 0 0 1-1-1V8.4L8 6V2z" fill="currentColor" /><path d="M10 4.5h4" stroke="#0a1426" strokeWidth="1.4" strokeLinecap="round" /></svg>
      </button>
      <button type="button" className="lock-corner lc-right" aria-label="Camera" onClick={openCamera}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4.5 7.6 6.5H5a2 2 0 0 0-2 2V18a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.5a2 2 0 0 0-2-2h-2.6L15 4.5H9z" fill="currentColor" /><circle cx="12" cy="13" r="3.8" fill="#0a1426" /><circle cx="12" cy="13" r="2.2" fill="none" stroke="currentColor" strokeWidth="1.2" /></svg>
      </button>
      {flash ? <div className="lock-flash" aria-hidden="true" /> : null}
    </div>
  );
}
