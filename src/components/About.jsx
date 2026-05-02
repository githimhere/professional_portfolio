import React from 'react';

const About = () => {
  return (
    <>
      <section className="metric-strip" aria-label="Professional highlights">
        <div>
          <strong>9+ yrs</strong>
          <span>MarTech and delivery experience</span>
        </div>
        <div>
          <strong>3 channels</strong>
          <span>Email, SMS, and WhatsApp automation</span>
        </div>
        <div>
          <strong>500+</strong>
          <span>LinkedIn connections</span>
        </div>
        <div>
          <strong>2024</strong>
          <span>IDP Employee of the Quarter</span>
        </div>
      </section>

      <section className="marquee" aria-label="Portfolio strengths">
        <div className="marquee-track">
          <span>Zeta Marketing Platform</span>
          <span>Marketo</span>
          <span>SAP Hybris</span>
          <span>Twilio</span>
          <span>SINCH</span>
          <span>Dashboards</span>
          <span>GenAI Workflows</span>
          <span>Agile Delivery</span>
        </div>
      </section>

      <section className="section intro-grid" id="story">
        <div>
          <p className="eyebrow">About</p>
          <h2>Marketing automation that feels organized, scalable, and human.</h2>
        </div>
        <p>
          I connect delivery, operations, data, and campaign execution so marketing teams
          can move faster without losing quality, governance, or visibility.
        </p>
      </section>
    </>
  );
};

export default About;
