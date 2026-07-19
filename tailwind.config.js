/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0a0e14",
        surface: "#111826",
        surfaceHover: "#161f30",
        border: "#1f2937",
        accent: "#22d3ee",       // cyan accent
        accentDim: "#0e7490",
        text: "#e5e7eb",
        textDim: "#9ca3af",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
        display: ["Space Grotesk", "sans-serif"],
      },
    },
  },
  plugins: [],
};