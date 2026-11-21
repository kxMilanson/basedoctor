import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        canvas: {
          DEFAULT: "#F8F7F4",
          subtle: "#F2F0EB",
          muted: "#EAE7E0",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          raised: "#FFFFFF",
          subtle: "#FAF9F6",
          muted: "#F4F2ED",
          border: "#E5E3DC",
        },
        ink: {
          DEFAULT: "#111315",
          secondary: "#373B40",
          muted: "#5C6168",
          subtle: "#868C94",
          inverted: "#FFFFFF",
        },
        cobalt: {
          50: "#EDF2FF",
          100: "#DBE4FF",
          200: "#BAC8FF",
          500: "#2B6CB0",
          600: "#0052FF",
          700: "#0040CC",
          800: "#003099",
          900: "#0A2158",
          DEFAULT: "#0052FF",
          hover: "#0040CC",
          subtle: "#EDF2FF",
          border: "#C7D7FE",
        },
        line: {
          DEFAULT: "#E5E3DC",
          subtle: "#EFECE6",
          strong: "#CFCBC2",
        },
        status: {
          critical: {
            fg: "#B91C1C",
            bg: "#FEF2F2",
            border: "#FECACA",
            dot: "#DC2626",
          },
          warning: {
            fg: "#B45309",
            bg: "#FFFBEB",
            border: "#FDE68A",
            dot: "#D97706",
          },
          optimal: {
            fg: "#046C4E",
            bg: "#ECFDF5",
            border: "#A7F3D0",
            dot: "#059669",
          },
          info: {
            fg: "#1E40AF",
            bg: "#EFF6FF",
            border: "#BFDBFE",
            dot: "#0052FF",
          },
        },
        brand: {
          50: "#EDF2FF",
          100: "#DBE4FF",
          200: "#BAC8FF",
          300: "#93C5FD",
          400: "#60A5FA",
          500: "#3B82F6",
          600: "#0052FF",
          700: "#0040CC",
          800: "#1E40AF",
          900: "#1E3A8A",
          950: "#111315",
        },
        accent: {
          DEFAULT: "#0052FF",
          hover: "#0040CC",
          subtle: "#EDF2FF",
          dark: "#003099",
        },
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgba(17, 19, 21, 0.04)",
        card: "0 1px 2px 0 rgba(17, 19, 21, 0.03), 0 0 0 1px rgba(229, 227, 220, 0.6)",
        "card-hover": "0 4px 12px -2px rgba(17, 19, 21, 0.06), 0 1px 3px 0 rgba(17, 19, 21, 0.04)",
        dropdown: "0 12px 24px -4px rgba(17, 19, 21, 0.08), 0 4px 8px -2px rgba(17, 19, 21, 0.04)",
        modal: "0 24px 48px -12px rgba(17, 19, 21, 0.14)",
      },
      fontFamily: {
        sans: [
          "var(--font-inter)",
          "Geist",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        mono: [
          "Geist Mono",
          "JetBrains Mono",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
      borderRadius: {
        sm: "4px",
        DEFAULT: "6px",
        md: "6px",
        lg: "8px",
        xl: "10px",
        "2xl": "12px",
      },
    },
  },
  plugins: [],
};

export default config;
