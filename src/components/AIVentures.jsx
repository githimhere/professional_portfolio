import React from 'react';

const AIVentures = () => {
  return (
    <section className="section ai-lab" id="ai-lab">
      <div className="section-heading">
        <p className="eyebrow">AI Build Lab</p>
        <h2>Experiments I actually shipped.</h2>
      </div>
      <div className="lab-grid">
        <article className="lab-card tilt-card">
          <div className="lab-index">01</div>
          <div>
            <span>Agentic automation</span>
            <h3>LinkedIn Growth Agent</h3>
            <p>Automated my LinkedIn profile using OpenClaw Agent to manage posting workflows and publish market-trend updates bi-weekly.</p>
          </div>
          <div className="quick-tags"><span>OpenClaw</span><span>Agents</span><span>LinkedIn</span></div>
        </article>
        <article className="lab-card tilt-card">
          <div className="lab-index">02</div>
          <div>
            <span>Vibe-coded beta app</span>
            <h3>Gen Z AI Journaling Web App</h3>
            <p>Built a beta-stage journaling app that analyzes weekly mood patterns and suggests activities based on emotional signals.</p>
          </div>
          <div className="quick-tags"><span>AI App</span><span>Journaling</span><span>Beta</span></div>
        </article>
      </div>
    </section>
  );
};

export default AIVentures;
