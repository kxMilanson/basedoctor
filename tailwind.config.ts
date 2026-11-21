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
          DEFAULT: "#FAF8F5",
          subtle: "#F3F0EA",
          muted: "#EAE6DF",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          subtle: "#FAF9F6",
          muted: "#F3F0EA",
          border: "#E8E4DC",
        },
        ink: {
          DEFAULT: "#18181B",
          secondary: "#3F3F46",
          muted: "#71717A",
          subtle: "#A1A1AA",
          inverted: "#FFFFFF",
        },
        brand: {
          50: "#F0FDFA",
          100: "#CCFBF1",
          200: "#99F6E4",
          500: "#14B8A6",
          600: "#0F766E",
          700: "#115E59",
          800: "#134E4A",
          900: "#042F2E",
          DEFAULT: "#0F766E",
          hover: "#115E59",
          light: "#F0FDFA",
          border: "#99F6E4",
        },
        line: {
          DEFAULT: "#E8E4DC",
          subtle: "#F1EFEA",
          strong: "#D6D1C7",
        },
        status: {
          urgent: {
            fg: "#BE123C",
            bg: "#FFF1F2",
            border: "#FECDD3",
            dot: "#E11D48",
          },
          warning: {
            fg: "#B45309",
            bg: "#FFFBEB",
            border: "#FDE68A",
            dot: "#D97706",
          },
          healthy: {
            fg: "#047857",
            bg: "#ECFDF5",
            border: "#A7F3D0",
            dot: "#10B981",
          },
          demo: {
            fg: "#0F766E",
            bg: "#F0FDFA",
            border: "#99F6E4",
            dot: "#0F766E",
          },
        },
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgba(24, 24, 27, 0.03)",
        soft: "0 2px 10px -2px rgba(24, 24, 27, 0.04), 0 1px 2px 0 rgba(24, 24, 27, 0.02)",
        card: "0 2px 10px -2px rgba(24, 24, 27, 0.04), 0 1px 2px 0 rgba(24, 24, 27, 0.02)",
        "card-hover": "0 8px 20px -4px rgba(24, 24, 27, 0.07), 0 2px 6px -1px rgba(24, 24, 27, 0.03)",
        dropdown: "0 12px 28px -4px rgba(24, 24, 27, 0.08), 0 4px 8px -2px rgba(24, 24, 27, 0.03)",
        modal: "0 24px 48px -12px rgba(24, 24, 27, 0.14)",
      },
      fontFamily: {
        sans: [
          "var(--font-inter)",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
      borderRadius: {
        sm: "6px",
        DEFAULT: "8px",
        md: "10px",
        lg: "12px",
        xl: "14px",
        "2xl": "16px",
        "3xl": "20px",
      },
    },
  },
  plugins: [],
};

export default config;
