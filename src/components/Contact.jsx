import React from 'react';

const Contact = () => {
  return (
    <>
      <section className="section proof-section" id="proof">
        <div className="section-heading">
          <p className="eyebrow">Proof</p>
          <h2>Proof points.</h2>
        </div>
        <div className="proof-grid">
          <article>
            <span>Certification</span>
            <h3>Claude Code in Action</h3>
            <p>Anthropic, issued Mar 2026</p>
          </article>
          <article>
            <span>Certification</span>
            <h3>Foundations of Digital Marketing and E-commerce</h3>
            <p>Google, issued Jan 2026</p>
          </article>
          <article>
            <span>Certification</span>
            <h3>Prompt Engineering</h3>
            <p>LinkedIn learning signal from resume</p>
          </article>
          <article>
            <span>Recognition</span>
            <h3>Employee of the Quarter</h3>
            <p>IDP Education Ltd, Mar 2024</p>
          </article>
          <article>
            <span>Education</span>
            <h3>B.Tech in Information Technology</h3>
            <p>Hindustan University</p>
          </article>
          <article>
            <span>Writing</span>
            <h3>The Death of the Marketing Tool</h3>
            <p>LinkedIn article on agentic agency models, Apr 2026</p>
          </article>
        </div>
      </section>

      <section className="contact-section" id="contact">
        <div>
          <p className="eyebrow">Contact</p>
          <h2>Let’s talk MarTech, automation, and delivery leadership.</h2>
        </div>
        <div className="contact-card">
          <a href="mailto:vishaldas94@outlook.com">Email</a>
          <a href="https://www.linkedin.com/in/vishaldas-marketing-automation/" target="_blank" rel="noreferrer">LinkedIn</a>
          <a href="https://github.com/githimhere" target="_blank" rel="noreferrer">GitHub</a>
          <a href="https://drive.google.com/file/d/1uPnwInl84k13sh-dS-cB1zb1Owck0zDJ/view?usp=sharing" target="_blank" rel="noreferrer">Request Resume</a>
        </div>
      </section>
    </>
  );
};

export default Contact;
