import { useEffect, useRef, useState } from "react";

export default function CursorEffect() {
  const cursorRef = useRef(null);
  const dotRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    // For smooth trailing effect
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let circleX = mouseX;
    let circleY = mouseY;
    let animId;

    const render = () => {
      // Lerp (Linear Interpolation) for smooth follow
      circleX += (mouseX - circleX) * 0.15;
      circleY += (mouseY - circleY) * 0.15;

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${circleX - 16}px, ${circleY - 16}px, 0)`;
      }
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouseX - 3}px, ${mouseY - 3}px, 0)`;
      }

      animId = requestAnimationFrame(render);
    };
    render();

    const handleMouseMove = (e) => {
      setIsTouch(false);
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const handleTouch = () => {
      setIsTouch(true);
    };

    const handleMouseOver = (e) => {
      const target = e.target;
      // Check if hovering over something clickable
      const clickable = target.closest('a, button, input, textarea, select, [role="button"], label');
      if (clickable) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchstart", handleTouch);
    window.addEventListener("mouseover", handleMouseOver);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchstart", handleTouch);
      window.removeEventListener("mouseover", handleMouseOver);
      cancelAnimationFrame(animId);
    };
  }, []);

  if (isTouch) return null;

  return (
    <>
      {/* Wrapper that handles positioning */}
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 pointer-events-none z-[9999]"
      >
        {/* Inner rotating circle */}
        <div
          className={`w-8 h-8 -ml-4 -mt-4 rounded-full border-2 pointer-events-none transition-all duration-300 ease-out mix-blend-screen flex items-center justify-center animate-spin ${
            isHovering ? "scale-[1.5] opacity-50" : "scale-100 opacity-100"
          }`}
          style={{
            borderColor: 'rgba(34, 211, 238, 0.3)',
            borderBottomColor: 'rgba(34, 211, 238, 1)',
            borderRightColor: 'rgba(34, 211, 238, 0.7)',
          }}
        >
          {/* Tiny inner dashed ring for more tech feel */}
          <div 
            className="w-5 h-5 rounded-full border border-dashed border-accent/70 animate-spin" 
            style={{ animationDirection: 'reverse', animationDuration: '3s' }} 
          />
        </div>
      </div>
    </>
  );
}