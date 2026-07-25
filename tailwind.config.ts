import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: false,

  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {
    extend: {
      colors: {
        brand: {
          /* Primary */
          primary: "#3B82F6",
          primaryHover: "#2563EB",
          primaryLight: "#DBEAFE",

          /* Accent */
          accent: "#FBBF24",
          accentHover: "#F59E0B",
          accentLight: "#FEF3C7",

          /* Backgrounds */
          page: "#F8FAFC",
          section: "#F1F5F9",
          card: "#FFFFFF",

          /* Text */
          heading: "#1E293B",
          body: "#475569",
          muted: "#64748B",

          /* Borders */
          border: "#E2E8F0",

          /* Status */
          success: "#22C55E",
          warning: "#F59E0B",
          danger: "#EF4444",
        },
      },

      fontFamily: {
        serif: ["var(--font-merriweather)"],
      },

      borderRadius: {
        xl: "16px",
        "2xl": "24px",
      },

      boxShadow: {
        card: "0 8px 24px rgba(15,23,42,.08)",
        hover: "0 12px 30px rgba(59,130,246,.18)",
      },
    },
  },

  plugins: [],
};

export default config;