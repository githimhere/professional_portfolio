import React, { useEffect, useRef } from 'react';

const CanvasBackground = () => {
  const canvasRef = useRef(null);
  const glowRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const glow = glowRef.current;
    
    let particles = [];
    let pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    let animationFrameId;
    // Touch phones: render at 1x, about 30 frames a second, and rest while the page is scrolling,
    // so the starfield never competes with scrolling for the frame budget.
    const touch = window.matchMedia && window.matchMedia('(hover: none), (pointer: coarse)').matches;
    let lastFrame = 0;
    let scrolling = false;
    let scrollTimer = 0;
    const onScrollRest = () => {
      scrolling = true;
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => { scrolling = false; }, 160);
    };

    const resizeCanvas = () => {
      const ratio = touch ? 1 : Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * ratio;
      canvas.height = window.innerHeight * ratio;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

      const count = Math.floor((window.innerWidth * window.innerHeight) / 15000);
      particles = Array.from({ length: Math.max(count, 42) }, () => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.32,
        vy: (Math.random() - 0.5) * 0.32,
        r: Math.random() * 1.8 + 0.6
      }));
    };

    const drawParticles = (now) => {
      const paused = document.hidden || document.documentElement.classList.contains('lock-on') || (touch && scrolling);
      if (paused || (touch && now - lastFrame < 33)) {
        animationFrameId = requestAnimationFrame(drawParticles);
        return;
      }
      lastFrame = now;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      particles.forEach((particle, index) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0 || particle.x > window.innerWidth) particle.vx *= -1;
        if (particle.y < 0 || particle.y > window.innerHeight) particle.vy *= -1;

        const distanceToPointer = Math.hypot(pointer.x - particle.x, pointer.y - particle.y);
        if (distanceToPointer < 150) {
          const push = (150 - distanceToPointer) / 150;
          particle.x -= (pointer.x - particle.x) * push * 0.012;
          particle.y -= (pointer.y - particle.y) * push * 0.012;
        }

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(248, 244, 236, 0.58)";
        ctx.fill();

        for (let j = index + 1; j < particles.length; j++) {
          const other = particles[j];
          const distance = Math.hypot(particle.x - other.x, particle.y - other.y);
          if (distance < 125) {
            ctx.strokeStyle = `rgba(85, 240, 194, ${0.16 - distance / 900})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(other.x, other.y);
            ctx.stroke();
          }
        }
      });

      animationFrameId = requestAnimationFrame(drawParticles);
    };

    const setPointer = (event) => {
      pointer = { x: event.clientX, y: event.clientY };
      if (glow) {
        glow.style.left = `${event.clientX}px`;
        glow.style.top = `${event.clientY}px`;
      }
    };

    if (touch) window.addEventListener('scroll', onScrollRest, { passive: true });
    window.addEventListener('pointermove', setPointer);
    window.addEventListener('resize', resizeCanvas);
    
    resizeCanvas();
    animationFrameId = requestAnimationFrame(drawParticles);

    return () => {
      window.removeEventListener('scroll', onScrollRest);
      clearTimeout(scrollTimer);
      window.removeEventListener('pointermove', setPointer);
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <>
      <canvas id="starfield" ref={canvasRef} aria-hidden="true"></canvas>
      <div className="cursor-glow" ref={glowRef} aria-hidden="true"></div>
    </>
  );
};

export default CanvasBackground;
