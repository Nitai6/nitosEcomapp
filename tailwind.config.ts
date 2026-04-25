import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Light blue primary (sky family)
        primary: {
          50: "#F0F9FF",
          100: "#E0F2FE",
          200: "#BAE6FD",
          300: "#7DD3FC",
          400: "#38BDF8",
          500: "#0EA5E9",
          600: "#0284C7",
          700: "#0369A1",
          DEFAULT: "#0EA5E9",
          soft: "#7DD3FC",
          bg: "#F0F9FF",
        },
        // Blonde-hair accent (warm tan/honey family)
        accent: {
          50: "#FDF8EE",
          100: "#FAF0D7",
          200: "#F5DEB3",
          300: "#E8C987",
          400: "#D4A574",
          500: "#BC8A5F",
          600: "#9B6F4A",
          DEFAULT: "#D4A574",
          soft: "#F5DEB3",
          warm: "#FDF8EE",
        },
        ink: {
          DEFAULT: "#0F172A",
          muted: "#64748B",
          subtle: "#94A3B8",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          tint: "#F8FAFC",
          warm: "#FDF8EE",
          border: "#E2E8F0",
        },
        status: {
          success: "#10B981",
          warn: "#F59E0B",
          crit: "#EF4444",
          info: "#0EA5E9",
        },
      },
      fontFamily: {
        sans: ["system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1rem",
      },
      boxShadow: {
        card: "0 1px 2px rgba(15, 23, 42, 0.04), 0 1px 3px rgba(15, 23, 42, 0.06)",
        pop: "0 4px 12px rgba(14, 165, 233, 0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
