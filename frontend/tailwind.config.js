/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primaryDark: "#0B0F19",
        secondaryDark: "#111827",
        primaryBlue: "#2563EB",
        accentBlue: "#3B82F6",
        softWhite: "#F8FAFC",
      },
      boxShadow: {
        glow: "0 0 20px rgba(37, 99, 235, 0.35)",
      },
      backdropBlur: {
        glass: "16px",
      },
    },
  },
  plugins: [],
};