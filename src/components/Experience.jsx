import React from 'react';
import { motion } from 'framer-motion';

const experienceData = [
  {
    role: "Delivery Manager | Enterprise Operations",
    company: "Zeta Global",
    details: "Currently managing enterprise operations and global marketing automation strategies."
  },
  {
    role: "Assistant Service Delivery Manager",
    company: "Merit",
    details: "Achieved a 95% efficiency improvement in Acoustic campaigns. Managed Amperity CDP implementations and developed Power BI dashboards for 60% faster deployment."
  },
  {
    role: "Senior Application Engineer",
    company: "IDP Education Ltd",
    details: "Led global marketing automation across 35+ countries. Successfully migrated over 10M contacts using Marketo with zero data loss."
  }
];

const Experience = () => {
  return (
    <section id="experience">
      <div className="container">
        <motion.h2 
          className="section-title"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          Experience
        </motion.h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem', marginTop: '4rem' }}>
          {experienceData.map((exp, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className="experience-card"
            >
              <h3 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '0.5rem', fontFamily: "'Outfit', sans-serif" }}>{exp.role}</h3>
              <p style={{ fontSize: '1.25rem', color: 'var(--accent-color)', marginBottom: '1.5rem', fontWeight: 500, letterSpacing: '0.02em' }}>
                @ {exp.company}
              </p>
              <p style={{ fontSize: '1.1rem', color: '#ccc', maxWidth: '800px', lineHeight: 1.6 }}>
                {exp.details}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Experience;
