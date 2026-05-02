import React from 'react';

const Hero = () => {
  return (
    <section className="hero" id="home">
      <div className="hero-copy">
        <p className="eyebrow">Marketing automation / Enterprise delivery / GenAI operations</p>
        <h1>I turn complex marketing platforms into reliable growth engines.</h1>
        <p className="hero-text">
          Delivery Manager helping teams launch cleaner campaigns, stronger automation,
          and smarter customer journeys across enterprise MarTech stacks.
        </p>
        <div className="hero-actions">
          <a className="primary-button magnetic" href="#work">Explore Work</a>
          <a className="secondary-button magnetic" href="#contact">Contact Me</a>
        </div>
      </div>

      <div className="hero-visual" aria-label="Profile visual area">
        <div className="orbit-ring ring-one"></div>
        <div className="orbit-ring ring-two"></div>
        <div className="profile-card tilt-card">
          <div className="profile-image">
            <img src="/assets/vishal-das.jpg" alt="Portrait of Vishaldas Mohandas" />
          </div>
          <div className="profile-meta">
            <strong>Vishaldas Mohandas</strong>
            <span>Delivery Manager | Marketing Automation</span>
          </div>
        </div>
        <div className="skill-halo" aria-label="Core platform strengths">
          <div className="floating-chip">ZMP</div>
          <div className="floating-chip">Marketo</div>
          <div className="floating-chip">GenAI</div>
          <div className="floating-chip">Agent Chatbot</div>
          <div className="floating-chip">Lead Conversion Expert</div>
          <div className="floating-chip">SAP Hybris</div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
