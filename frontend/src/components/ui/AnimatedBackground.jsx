import { useCallback } from "react";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";

export default function AnimatedBackground() {
  const particlesInit = useCallback(async (engine) => {
    // Initializes the tsparticles engine with the slim package
    await loadSlim(engine);
  }, []);

  const options = {
    background: {
      color: { value: "transparent" },
    },
    fpsLimit: 60,
    interactivity: {
      events: {
        onHover: {
          enable: true,
          mode: "grab",
        },
      },
      modes: {
        grab: {
          distance: 140,
          links: { opacity: 0.5 },
        },
      },
    },
    particles: {
      color: { value: "#22d3ee" }, // accent color
      links: {
        color: "#0e7490", // accentDim
        distance: 150,
        enable: true,
        opacity: 0.3,
        width: 1,
      },
      move: {
        direction: "none",
        enable: true,
        outModes: {
          default: "bounce",
        },
        random: false,
        speed: 0.8,
        straight: false,
      },
      number: {
        density: {
          enable: true,
          area: 800,
        },
        value: 60,
      },
      opacity: {
        value: 0.4,
      },
      shape: {
        type: "circle",
      },
      size: {
        value: { min: 1, max: 2.5 },
      },
    },
    detectRetina: true,
  };

  return (
    <div className="fixed inset-0 w-full h-full z-[-1] overflow-hidden bg-bg pointer-events-auto">
      {/* Neural Network Particles */}
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={options}
        className="absolute inset-0 w-full h-full"
      />

      {/* Subtle Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-10"
      />
      
      {/* Background Glowing Orbs for the premium AI feel */}
      <div className="absolute pointer-events-none top-0 -left-4 w-72 h-72 bg-accent rounded-full mix-blend-multiply filter blur-[128px] opacity-10 animate-blob" />
      <div className="absolute pointer-events-none top-0 -right-4 w-72 h-72 bg-accentDim rounded-full mix-blend-multiply filter blur-[128px] opacity-10 animate-blob" style={{ animationDelay: '2s' }} />
      <div className="absolute pointer-events-none -bottom-8 left-20 w-72 h-72 bg-accent rounded-full mix-blend-multiply filter blur-[128px] opacity-10 animate-blob" style={{ animationDelay: '4s' }} />
    </div>
  );
}
