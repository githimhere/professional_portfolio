import React from 'react';

const Projects = () => {
  return (
    <section className="section" id="work">
      <div className="section-heading">
        <p className="eyebrow">Selected Work</p>
        <h2>Selected work recruiters can scan in seconds.</h2>
      </div>
      <div className="recruiter-note">
        <span>Recruiter snapshot</span>
        <p>Enterprise MarTech delivery, automation architecture, campaign operations, dashboards, governance, and adoption.</p>
      </div>
      <div className="project-grid">
        <article className="project-card tilt-card">
          <div className="project-art art-one"></div>
          <div className="project-content">
            <span>Zeta Global</span>
            <h3>Enterprise ZMP Delivery</h3>
            <p>Rollouts, QA, UAT, governance, sprint rhythm, dashboards, and client adoption.</p>
            <div className="quick-tags"><span>ZMP</span><span>Delivery</span><span>Governance</span></div>
          </div>
        </article>
        <article className="project-card tilt-card">
          <div className="project-art art-two"></div>
          <div className="project-content">
            <span>IDP Education</span>
            <h3>Marketo + SAP Hybris Integrations</h3>
            <p>Scaled integrations and multi-channel journeys across email, SMS, and WhatsApp.</p>
            <div className="quick-tags"><span>Marketo</span><span>SAP Hybris</span><span>Twilio</span></div>
          </div>
        </article>
        <article className="project-card tilt-card">
          <div className="project-art art-three"></div>
          <div className="project-content">
            <span>Merit Data Tech</span>
            <h3>Data Operations Modernization</h3>
            <p>Sharper reporting, cleaner workflows, stronger compliance, and better delivery quality.</p>
            <div className="quick-tags"><span>Dashboards</span><span>Compliance</span><span>Ops</span></div>
          </div>
        </article>
        <article className="project-card tilt-card">
          <div className="project-art art-four"></div>
          <div className="project-content">
            <span>Automation Systems</span>
            <h3>GenAI Engagement Flows</h3>
            <p>Dynamic Chat and GenAI paths for faster response, personalization, and visibility.</p>
            <div className="quick-tags"><span>GenAI</span><span>Dynamic Chat</span><span>Journeys</span></div>
          </div>
        </article>
        <article className="project-card tilt-card">
          <div className="project-art art-five"></div>
          <div className="project-content">
            <span>B2B Campaigns</span>
            <h3>Acoustic + BlueVenn Execution</h3>
            <p>B2B campaign execution with clean segments, nurture journeys, and performance insight.</p>
            <div className="quick-tags"><span>B2B</span><span>Segmentation</span><span>Analytics</span></div>
          </div>
        </article>
        <article className="project-card tilt-card">
          <div className="project-art art-six"></div>
          <div className="project-content">
            <span>Thought Leadership</span>
            <h3>Agentic Marketing Perspective</h3>
            <p>Writing on how marketing tools are becoming more intelligent operational partners.</p>
            <div className="quick-tags"><span>AI</span><span>Marketing Ops</span><span>Writing</span></div>
          </div>
        </article>
      </div>
    </section>
  );
};

export default Projects;
