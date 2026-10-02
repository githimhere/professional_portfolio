import { useEffect, useRef, useState } from 'react';
import Matter from 'matter-js';
import { PLAY_CHIPS } from './playChips';

const { Engine, Bodies, Body, Composite, Constraint } = Matter;

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const touchCapable = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(hover: none) and (pointer: coarse)').matches &&
  'DeviceOrientationEvent' in window;

const PlaygroundStage = () => {
  const stageRef = useRef(null);
  const chipEls = useRef([]);
  const api = useRef({});
  const [reduced] = useState(
    () => typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  const [tilt, setTilt] = useState('off'); // off | on | denied
  const canTilt = !reduced && touchCapable();

  useEffect(() => {
    if (reduced) return undefined;
    const stage = stageRef.current;
    const els = chipEls.current;
    if (!stage) return undefined;

    const engine = Engine.create({ gravity: { x: 0, y: 1 } });
    const world = engine.world;
    let width = stage.clientWidth;
    let height = stage.clientHeight;
    let walls = [];
    let bodies = [];
    let running = false;
    let raf = 0;
    let last = 0;
    let started = false;

    const buildWalls = () => {
      Composite.remove(world, walls);
      const t = 200;
      // closed box: floor, ceiling and both sides flush with the visible stage, long enough to overlap at the corners
      walls = [
        Bodies.rectangle(width / 2, height + t / 2, width + t * 2, t, { isStatic: true }),
        Bodies.rectangle(width / 2, -t / 2, width + t * 2, t, { isStatic: true }),
        Bodies.rectangle(-t / 2, height / 2, t, height + t * 2, { isStatic: true }),
        Bodies.rectangle(width + t / 2, height / 2, t, height + t * 2, { isStatic: true }),
      ];
      Composite.add(world, walls);
    };

    const drop = () => {
      Composite.remove(world, bodies);
      bodies = els.map((el, i) => {
        const w = el.offsetWidth;
        const h = el.offsetHeight;
        const x = clamp(Math.random() * width, w / 2 + 4, width - w / 2 - 4);
        const y = clamp(h / 2 + 6 + (i % 8) * 8 + Math.random() * Math.max(10, height * 0.25), h / 2 + 4, height - h / 2 - 4);
        const b = Bodies.rectangle(x, y, w, h, {
          chamfer: { radius: h / 2 },
          restitution: 0.35,
          friction: 0.25,
          frictionAir: 0.012,
          angle: (Math.random() - 0.5) * 0.8,
        });
        b.plugin = { w, h };
        return b;
      });
      Composite.add(world, bodies);
    };

    const render = () => {
      bodies.forEach((b, i) => {
        const { w, h } = b.plugin;
        els[i].style.transform = `translate3d(${b.position.x - w / 2}px, ${b.position.y - h / 2}px, 0) rotate(${b.angle}rad)`;
      });
    };

    // Hard containment: a fast throw or a sudden flip can never push a chip out of the visible box.
    const keepInside = () => {
      for (let i = 0; i < bodies.length; i += 1) {
        const b = bodies[i];
        const bb = b.bounds;
        let dx = 0;
        let dy = 0;
        if (bb.min.x < 0) dx = -bb.min.x;
        else if (bb.max.x > width) dx = width - bb.max.x;
        if (bb.min.y < 0) dy = -bb.min.y;
        else if (bb.max.y > height) dy = height - bb.max.y;
        if (dx || dy) {
          Body.setPosition(b, { x: b.position.x + dx, y: b.position.y + dy });
          Body.setVelocity(b, { x: dx ? 0 : b.velocity.x, y: dy ? 0 : b.velocity.y });
        }
      }
    };

    const frame = (now) => {
      if (!running) return;
      const dt = Math.min(32, now - last || 16);
      last = now;
      Engine.update(engine, dt);
      keepInside();
      render();
      raf = requestAnimationFrame(frame);
    };
    const start = () => {
      if (running) return;
      running = true;
      last = 0;
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    buildWalls();
    drop();
    render();
    api.current.reset = () => drop();

    // Only simulate while the stage is on screen and the tab is visible
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !document.hidden) {
          started = true;
          start();
        } else {
          stop();
        }
      },
      { threshold: 0.25 }
    );
    io.observe(stage);
    const onVis = () => {
      if (document.hidden) stop();
      else if (started) start();
    };
    document.addEventListener('visibilitychange', onVis);

    const ro = new ResizeObserver(() => {
      const nw = stage.clientWidth;
      const nh = stage.clientHeight;
      if (nw === width && nh === height) return;
      width = nw;
      height = nh;
      buildWalls();
      bodies.forEach((b) => {
        const { w } = b.plugin;
        if (b.position.x > width - w / 2) Body.setPosition(b, { x: width - w / 2 - 4, y: b.position.y });
        if (b.position.y > height) Body.setPosition(b, { x: b.position.x, y: height - 30 });
      });
    });
    ro.observe(stage);

    // Pointer drag with a soft spring so chips can be thrown
    const drags = new Map();
    const toLocal = (e) => {
      const r = stage.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const onDown = (e) => {
      const i = els.indexOf(e.currentTarget);
      if (i < 0) return;
      const b = bodies[i];
      const p = toLocal(e);
      const c = Constraint.create({
        pointA: p,
        bodyB: b,
        pointB: { x: p.x - b.position.x, y: p.y - b.position.y },
        stiffness: 0.18,
        damping: 0.12,
        length: 0,
      });
      Composite.add(world, c);
      drags.set(e.pointerId, c);
      e.currentTarget.setPointerCapture(e.pointerId);
      e.currentTarget.classList.add('is-held');
    };
    const onMove = (e) => {
      const c = drags.get(e.pointerId);
      if (!c) return;
      const p = toLocal(e);
      c.pointA.x = clamp(p.x, 0, width);
      c.pointA.y = clamp(p.y, -100, height);
    };
    const onUp = (e) => {
      const c = drags.get(e.pointerId);
      if (!c) return;
      Composite.remove(world, c);
      drags.delete(e.pointerId);
      e.currentTarget.classList.remove('is-held');
    };
    els.forEach((el) => {
      el.addEventListener('pointerdown', onDown);
      el.addEventListener('pointermove', onMove);
      el.addEventListener('pointerup', onUp);
      el.addEventListener('pointercancel', onUp);
    });

    // Tilt: true 360-degree gravity from device orientation (any direction, any screen rotation).
    // Gravity in the device frame from beta/gamma: (cos b * sin g, -sin b, -cos b * cos g).
    // On screen (x right, y down) that is gx = cos b * sin g, gy = sin b; then rotate by screen angle.
    const onOrient = (e) => {
      if (e.gamma == null || e.beta == null) return;
      const b = (e.beta * Math.PI) / 180;
      const g = (e.gamma * Math.PI) / 180;
      const mx = Math.cos(b) * Math.sin(g);
      const my = Math.sin(b);
      const a = (((window.screen.orientation && window.screen.orientation.angle) || window.orientation || 0) * Math.PI) / 180;
      let gx = mx * Math.cos(a) + my * Math.sin(a);
      let gy = -mx * Math.sin(a) + my * Math.cos(a);
      // lying flat leaves almost no in-plane pull; keep the chips lively
      const len = Math.hypot(gx, gy);
      if (len > 0.001 && len < 0.35) {
        gx = (gx / len) * 0.35;
        gy = (gy / len) * 0.35;
      }
      engine.gravity.x = clamp(gx * 1.15, -1.2, 1.2);
      engine.gravity.y = clamp(gy * 1.15, -1.2, 1.2);
    };
    api.current.enableTilt = () => window.addEventListener('deviceorientation', onOrient);
    api.current.disableTilt = () => {
      window.removeEventListener('deviceorientation', onOrient);
      engine.gravity.x = 0;
      engine.gravity.y = 1;
    };

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('deviceorientation', onOrient);
      els.forEach((el) => {
        if (!el) return;
        el.removeEventListener('pointerdown', onDown);
        el.removeEventListener('pointermove', onMove);
        el.removeEventListener('pointerup', onUp);
        el.removeEventListener('pointercancel', onUp);
      });
      Composite.clear(world, false);
      Engine.clear(engine);
    };
  }, [reduced]);

  const toggleTilt = async () => {
    if (tilt === 'on') {
      api.current.disableTilt?.();
      setTilt('off');
      return;
    }
    const D = window.DeviceOrientationEvent;
    if (D && typeof D.requestPermission === 'function') {
      try {
        const res = await D.requestPermission();
        if (res !== 'granted') {
          setTilt('denied');
          return;
        }
      } catch {
        setTilt('denied');
        return;
      }
    }
    api.current.enableTilt?.();
    setTilt('on');
  };

  if (reduced) {
    return (
      <ul className="play-static" aria-label="Platforms and skills">
        {PLAY_CHIPS.map((c) => (
          <li key={c} className="play-chip play-chip--static">{c}</li>
        ))}
      </ul>
    );
  }

  return (
    <div className="play-wrap">
      <div className="play-stage" ref={stageRef} role="group" aria-label="Interactive playground: draggable skill chips (decorative)">
        {PLAY_CHIPS.map((c, i) => (
          <span
            key={c}
            className="play-chip"
            ref={(el) => { chipEls.current[i] = el; }}
          >
            {c}
          </span>
        ))}
      </div>
      <div className="play-controls">
        <button type="button" className="play-btn" onClick={() => api.current.reset?.()}>Reset</button>
        {canTilt && (
          <button type="button" className="play-btn" onClick={toggleTilt} aria-pressed={tilt === 'on'}>
            {tilt === 'on' ? 'Tilt on' : 'Enable tilt'}
          </button>
        )}
        {tilt === 'denied' && <span className="play-note">Motion access was denied. Allow it in your browser settings to tilt.</span>}
      </div>
    </div>
  );
};

export default PlaygroundStage;
