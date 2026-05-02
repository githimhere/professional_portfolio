import React from 'react';

const Navbar = () => {
  return (
    <header className="site-header">
      <a className="brand" href="#home" aria-label="Go to home">
        <span className="brand-mark">VD</span>
        <span>Vishal Das</span>
      </a>
      <nav className="nav-links" aria-label="Primary navigation">
        <a href="#work">Projects</a>
        <a href="#ai-lab">AI Lab</a>
        <a href="#skills">Skills</a>
        <a href="#proof">Proof</a>
        <a href="#contact">Contact</a>
      </nav>
      <a className="resume-link" href="#work">Portfolio</a>
    </header>
  );
};

export default Navbar;
