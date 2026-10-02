import React from 'react';

const Spark = ({ className }) => (
  <svg className={`spark ${className}`} viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 0c1 6.5 5.5 11 12 12-6.5 1-11 5.5-12 12-1-6.5-5.5-11-12-12C6.5 11 11 6.5 12 0z" fill="currentColor" />
  </svg>
);

// Sticker-style decorations that sit on the hero visual. Purely decorative, except the
// "play" badge which links to the playground.
export const HeroStickers = () => (
  <div className="sticker-layer">
    <div className="sticker sticker-burst" aria-hidden="true">
      <svg viewBox="0 0 120 120" className="burst-shape">
        <polygon
          points="60,2 71,22 93,10 94,35 118,38 104,58 118,80 94,84 93,110 71,98 60,118 49,98 27,110 26,84 2,80 16,58 2,38 26,35 27,10 49,22"
          fill="currentColor"
        />
      </svg>
      <span>Let&apos;s<br />build!</span>
    </div>
    <a className="sticker sticker-play" href="#play" aria-label="Jump to the playground and play with the stack">
      <svg viewBox="0 0 120 120" className="play-ring" aria-hidden="true">
        <defs>
          <path id="ring-path" d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0" />
        </defs>
        <text>
          <textPath href="#ring-path" startOffset="0">DRAG ME ✦ PLAY WITH THE STACK ✦ </textPath>
        </text>
      </svg>
      <span className="play-core" aria-hidden="true">▶</span>
    </a>
    <Spark className="spark-a" />
    <Spark className="spark-b" />
    <Spark className="spark-c" />
  </div>
);

const TAPE = ['ZMP', 'Marketo', 'SAP Hybris', 'Twilio', 'SINCH', 'Agent Chatbot', 'GenAI Workflows', 'Dashboards', 'UAT & QA', 'Lead Conversion'];

const Row = () => (
  <>
    {TAPE.map((t) => (
      <span key={t}>{t}<i aria-hidden="true">✦</i></span>
    ))}
  </>
);

// Two crossing sticker-tape strips. Decorative, repeats words already used on the page.
export const TapeStrips = () => (
  <div className="tape-wrap" aria-hidden="true">
    <div className="tape tape-a"><div className="tape-track"><Row /><Row /></div></div>
    <div className="tape tape-b"><div className="tape-track"><Row /><Row /></div></div>
  </div>
);
