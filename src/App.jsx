import React, { useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import CanvasBackground from './components/CanvasBackground';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Projects from './components/Projects';
import AIVentures from './components/AIVentures';
import SkillsTimeline from './components/SkillsTimeline';
import Contact from './components/Contact';

function App() {
  useEffect(() => {
    // Select elements after render
    const cards = document.querySelectorAll(".tilt-card");
    const magneticItems = document.querySelectorAll(".magnetic");
    const revealItems = document.querySelectorAll(".section, .metric-strip, .project-card, .lab-card, .proof-grid article, .contact-section");

    const handleCardMove = (event) => {
      const card = event.currentTarget;
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const rotateY = ((x / rect.width) - 0.5) * 12;
      const rotateX = ((y / rect.height) - 0.5) * -12;
      card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    };

    const handleCardLeave = (event) => {
      event.currentTarget.style.transform = "";
    };

    cards.forEach((card) => {
      card.addEventListener("mousemove", handleCardMove);
      card.addEventListener("mouseleave", handleCardLeave);
    });

    const handleMagneticMove = (event) => {
      const item = event.currentTarget;
      const rect = item.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      item.style.transform = `translate(${x * 0.16}px, ${y * 0.22}px)`;
    };

    const handleMagneticLeave = (event) => {
      event.currentTarget.style.transform = "";
    };

    magneticItems.forEach((item) => {
      item.addEventListener("mousemove", handleMagneticMove);
      item.addEventListener("mouseleave", handleMagneticLeave);
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.14 }
    );

    revealItems.forEach((item) => {
      item.classList.add("reveal");
      observer.observe(item);
    });

    return () => {
      cards.forEach((card) => {
        card.removeEventListener("mousemove", handleCardMove);
        card.removeEventListener("mouseleave", handleCardLeave);
      });
      magneticItems.forEach((item) => {
        item.removeEventListener("mousemove", handleMagneticMove);
        item.removeEventListener("mouseleave", handleMagneticLeave);
      });
      observer.disconnect();
    };
  }, []);

  return (
    <>
      <CanvasBackground />
      <Navbar />
      <main>
        <Hero />
        <About />
        <Projects />
        <AIVentures />
        <SkillsTimeline />
        <Contact />
      </main>
      <Analytics />
    </>
  );
}

export default App;
