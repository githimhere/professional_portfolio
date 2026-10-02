import React, { Suspense, lazy, useEffect, useRef, useState } from 'react';
import './playground.css';
import { PLAY_CHIPS } from './playChips';

// The physics engine lives in a separate chunk. It is only requested when the
// playground is close to the viewport, so first load is unaffected.
const PlaygroundStage = lazy(() => import('./PlaygroundStage'));

const TEASERS = [
  { n: 'Marketo', x: '2%', y: '2%', r: '-8deg', d: '0s', c: '#55f0c2' },
  { n: 'GenAI', x: '55%', y: '0%', r: '7deg', d: '0.5s', c: '#ff6b9a' },
  { n: 'ZMP', x: '30%', y: '32%', r: '4deg', d: '1s', c: '#ffd166' },
  { n: 'Twilio', x: '66%', y: '36%', r: '-6deg', d: '1.5s', c: '#60a5fa' },
  { n: 'SAP Hybris', x: '0%', y: '64%', r: '6deg', d: '0.8s', c: '#ffd166' },
  { n: 'Agent Chatbot', x: '38%', y: '70%', r: '-5deg', d: '1.2s', c: '#55f0c2' },
];

const StaticChips = () => (
  <ul className="play-static" aria-label="Platforms and skills">
    {PLAY_CHIPS.map((c) => (
      <li key={c} className="play-chip play-chip--static">{c}</li>
    ))}
  </ul>
);

class StageBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? <StaticChips /> : this.props.children;
  }
}

const Playground = () => {
  const holder = useRef(null);
  const [near, setNear] = useState(() => typeof window !== 'undefined' && !('IntersectionObserver' in window));

  useEffect(() => {
    const el = holder.current;
    if (!el) return undefined;
    if (!('IntersectionObserver' in window)) return undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: '600px 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section className="section play-section" id="play">
      <div className="section-heading play-head">
        <p className="eyebrow">Playground</p>
        <h2>The stack, as toys.</h2>
        <p className="play-lede">Drag, throw and pile up the platforms I work with. On a phone, turn on tilt and move the device.</p>
        <div className="play-teasers" aria-hidden="true">
          {TEASERS.map((t) => (
            <span key={t.n} className="play-chip" style={{ '--x': t.x, '--y': t.y, '--r': t.r, '--d': t.d, '--c': t.c }}>{t.n}</span>
          ))}
          <span className="play-hint">drag me! ↓</span>
        </div>
      </div>
      <div className="play-holder" ref={holder}>
        {near ? (
          <StageBoundary>
            <Suspense fallback={<StaticChips />}>
              <PlaygroundStage />
            </Suspense>
          </StageBoundary>
        ) : (
          <StaticChips />
        )}
      </div>
    </section>
  );
};

export default Playground;
