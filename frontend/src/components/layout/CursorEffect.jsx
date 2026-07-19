import { useEffect, useRef } from "react";

export default function CursorEffect() {
  const canvasRef = useRef(null);
  const particles = useRef([]);
  const ripples = useRef([]);
  const isTouch = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // ---- Desktop: glow particle trail ----
    const handleMouseMove = (e) => {
      isTouch.current = false;
      for (let i = 0; i < 2; i++) {
        particles.current.push({
          x: e.clientX,
          y: e.clientY,
          radius: Math.random() * 3 + 1,
          alpha: 1,
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 1.5,
        });
      }
      if (particles.current.length > 120) {
        particles.current.splice(0, particles.current.length - 120);
      }
    };

    // ---- Mobile: water ripple on tap ----
    const handleTouch = (e) => {
      isTouch.current = true;
      const touch = e.touches[0];
      ripples.current.push({
        x: touch.clientX,
        y: touch.clientY,
        radius: 0,
        alpha: 0.6,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchstart", handleTouch);

    let animId;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // particles (desktop trail)
      particles.current.forEach((p, i) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(34, 211, 238, ${p.alpha})`; // accent cyan
        ctx.fill();
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.02;
        p.radius *= 0.98;
      });
      particles.current = particles.current.filter((p) => p.alpha > 0);

      // ripples (mobile tap)
      ripples.current.forEach((r) => {
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(34, 211, 238, ${r.alpha})`;
        ctx.lineWidth = 2;
        ctx.stroke();
        r.radius += 3;
        r.alpha -= 0.02;
      });
      ripples.current = ripples.current.filter((r) => r.alpha > 0);

      animId = requestAnimationFrame(render);
    };
    render();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchstart", handleTouch);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 pointer-events-none z-[9999]"
    />
  );
}