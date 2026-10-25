/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#FAF8F5",
        brand: {
          50: "#f0fdf4",
          100: "#dcfce7",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
        },
        health: {
          good: "#15803d",
          "good-bg": "#dcfce7",
          "good-border": "#bbf7d0",
          borderline: "#ca8a04",
          "borderline-bg": "#fef9c3",
          "borderline-border": "#fef08a",
          risk: "#dc2626",
          "risk-bg": "#fee2e2",
          "risk-border": "#fecaca",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
      borderRadius: {
        card: "1.25rem",
      },
    },
  },
  plugins: [],
};
