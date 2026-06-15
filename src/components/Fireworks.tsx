import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  alpha: number;
  decay: number;
  size: number;
  sparkle?: boolean;
}

interface Rocket {
  x: number;
  y: number;
  tx: number; // Target X
  ty: number; // Target Y
  vx: number;
  vy: number;
  color: string;
  size: number;
}

export default function Fireworks() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let particles: Particle[] = [];
    let rockets: Rocket[] = [];

    // Sound-friendly palette based on the glass ludo theme
    const colors = [
      'rgba(244, 63, 94, ',  // Rose/Red
      'rgba(16, 185, 129, ', // Emerald/Green
      'rgba(251, 191, 36, ', // Yellow/Gold
      'rgba(14, 165, 233, ', // Sky Blue
      'rgba(168, 85, 247, ', // Purple
    ];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const spawnRocket = () => {
      const x = Math.random() * canvas.width;
      const y = canvas.height;
      const tx = Math.random() * canvas.width;
      const ty = Math.random() * (canvas.height * 0.5) + canvas.height * 0.1; // Target upper half

      const angle = Math.atan2(ty - y, tx - x);
      const speed = Math.random() * 5 + 10;
      
      const randomColor = colors[Math.floor(Math.random() * colors.length)];

      rockets.push({
        x,
        y,
        tx,
        ty,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: randomColor,
        size: Math.random() * 2 + 2,
      });
    };

    const explode = (x: number, y: number, color: string) => {
      const numParticles = Math.floor(Math.random() * 60) + 60;
      for (let i = 0; i < numParticles; i++) {
        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 6 + 2;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * velocity,
          vy: Math.sin(angle) * velocity + (Math.random() * -1), // Slight upward bias
          color,
          alpha: 1,
          decay: Math.random() * 0.015 + 0.008,
          size: Math.random() * 2.5 + 1.5,
          sparkle: Math.random() > 0.4,
        });
      }
    };

    // Initial rockets
    for (let i = 0; i < 4; i++) {
      setTimeout(spawnRocket, i * 400);
    }

    // Spawn loop
    const spawnTimer = setInterval(spawnRocket, 600);

    const updateAndRender = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Update & Draw Rockets
      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.x += r.vx;
        r.y += r.vy;

        // Draw rocket head
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.size, 0, Math.PI * 2);
        ctx.fillStyle = r.color + '1)';
        ctx.shadowBlur = 10;
        ctx.shadowColor = r.color + '0.8)';
        ctx.fill();

        // Draw light smoke/trail behind rocket
        ctx.beginPath();
        ctx.moveTo(r.x, r.y);
        ctx.lineTo(r.x - r.vx * 1.5, r.y - r.vy * 1.5);
        ctx.strokeStyle = r.color + '0.3)';
        ctx.lineWidth = r.size * 0.8;
        ctx.stroke();

        // Check if rocket reached apex target height or is falling
        if (r.vy >= 0 || r.y <= r.ty) {
          explode(r.x, r.y, r.color);
          rockets.splice(i, 1);
        }
      }

      // Reset shadows for particles to increase performance
      ctx.shadowBlur = 0;

      // 2. Update & Draw Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.vx *= 0.97; // Drag
        p.vy *= 0.97; // Drag
        p.vy += 0.08;  // Gravity
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        const calculatedAlpha = p.sparkle && Math.random() > 0.5 ? p.alpha * 0.5 : p.alpha;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color + calculatedAlpha + ')';
        ctx.fill();
      }

      animationId = requestAnimationFrame(updateAndRender);
    };

    updateAndRender();

    return () => {
      clearInterval(spawnTimer);
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-50"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}
