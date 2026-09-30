/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        soc: {
          bg: "#0b0f17",
          panel: "#131b2e",
          border: "#1e293b",
          primary: "#3b82f6",
          accent: "#06b6d4",
          text: "#f8fafc",
          muted: "#94a3b8",
          success: "#10b981",
          warning: "#f59e0b",
          danger: "#ef4444",
          critical: "#dc2626"
        }
      }
    },
  },
  plugins: [],
};
