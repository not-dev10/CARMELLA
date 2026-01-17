'use client';
import { useEffect, useRef } from 'react';

export function SplashCursor() {
  const canvasRef = useRef(null);
  const animationFrameId = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let isActive = true;
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return;

    gl.clearColor(0, 0, 0, 0);

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let mouseX = 0, mouseY = 0;
    const particles = [];

    function createParticle(x, y) {
      particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        life: 1,
        size: Math.random() * 3 + 2
      });
    }

    function handleMouseMove(e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      for (let i = 0; i < 3; i++) {
        createParticle(mouseX, mouseY);
      }
    }

    window.addEventListener('mousemove', handleMouseMove);

    function animate() {
      if (!isActive) return;

      gl.clear(gl.COLOR_BUFFER_BIT);

      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1;
        p.life -= 0.02;

        if (p.life <= 0) particles.splice(i, 1);
      });

      animationFrameId.current = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      isActive = false;
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 40,
        pointerEvents: 'none',
        width: '100vw',
        height: '100vh',
        display: 'block'
      }}
    />
  );
}
