import React, { useState } from 'react';

const skillsData = [
  {
    name: "Delivery",
    detail: "Enterprise rollout, sprint planning, stakeholder communication, UAT, QA, adoption strategy, SOPs, and platform governance."
  },
  {
    name: "MarTech",
    detail: "Marketing automation architecture across ZMP, Marketo, SAP Hybris, CRM integrations, API touchpoints, and campaign operations."
  },
  {
    name: "Campaigns",
    detail: "Omni-channel journeys across email, SMS, WhatsApp, Twilio, SINCH, Dynamic Chat, segmentation, and nurture programs."
  },
  {
    name: "Operations",
    detail: "Operational dashboards, performance reporting, clean data pipelines, workflow restructuring, compliance, and productivity improvements."
  }
];

const timelineData = [
  {
    year: "2025 - Now",
    role: "Delivery Manager, Zeta Global",
    desc: "ZMP delivery, governance, UAT, QA, optimization, and adoption for global clients."
  },
  {
    year: "2024 - 2025",
    role: "Assistant Service Delivery Manager, Merit Data Tech",
    desc: "Data operations, marketing automation delivery, dashboards, compliance, and workflow cleanup."
  },
  {
    year: "2022 - 2024",
    role: "Senior Application Engineer, IDP Education Ltd",
    desc: "Marketo, SAP Hybris, omni-channel automation, Dynamic Chat, dashboards, and data pipelines."
  },
  {
    year: "2016 - 2021",
    role: "Digital Marketing Specialist, Merit Data Tech",
    desc: "B2B campaigns, segmentation, cleansing, nurture journeys, analytics, and optimization."
  }
];

const SkillsTimeline = () => {
  const [activeSkill, setActiveSkill] = useState(0);

  return (
    <>
      <section className="section split-section" id="skills">
        <div className="section-heading">
          <p className="eyebrow">Capabilities</p>
          <h2>Four ways I create momentum.</h2>
        </div>
        <div className="skill-board">
          {skillsData.map((skill, index) => (
            <button 
              key={index}
              className={`skill ${activeSkill === index ? 'active' : ''}`}
              onClick={() => setActiveSkill(index)}
            >
              {skill.name}
            </button>
          ))}
        </div>
        <div className="skill-detail" key={activeSkill}>
          {skillsData[activeSkill].detail}
        </div>
      </section>

      <section className="section timeline">
        <div className="section-heading">
          <p className="eyebrow">Experience</p>
          <h2>From campaign execution to enterprise delivery leadership.</h2>
        </div>
        <div className="timeline-list">
          {timelineData.map((item, index) => (
            <div className="timeline-item" key={index}>
              <span>{item.year}</span>
              <div>
                <h3>{item.role}</h3>
                <p>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
};

export default SkillsTimeline;
