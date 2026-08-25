import type { Config } from "tailwindcss";

/**
 * 선진산업 Business AX — Design Token
 * App Shell(Deep Navy) / Workspace(Cool Gray) / Card(White) 3단 레이어를 전제로 한다.
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // App Shell — Deep Navy
        navy: {
          50: "#EEF2F8",
          100: "#D7E0EE",
          200: "#AFC0DA",
          300: "#7E96BC",
          400: "#4E6C9C",
          500: "#2E4C7B",
          600: "#1D3A63",
          700: "#153052",
          800: "#10294D",
          900: "#0A1F3D",
          925: "#071A33",
          950: "#051327",
        },
        // Corporate Blue
        brand: {
          50: "#EFF4FF",
          100: "#DBE6FE",
          200: "#BFD3FE",
          300: "#93B4FD",
          400: "#608FFA",
          500: "#3B75F6",
          600: "#2563EB",
          700: "#1D4ED8",
          800: "#1E40AF",
          900: "#1E3A8A",
        },
        // Teal Accent
        teal: {
          50: "#EFFBF9",
          100: "#CCF5EF",
          200: "#99EBE0",
          300: "#5FDACB",
          400: "#2DC5B4",
          500: "#14B8A6",
          600: "#0D9488",
          700: "#0F766E",
          800: "#115E59",
        },
        // Gold — 아주 소량만 사용
        gold: {
          100: "#FAF3E0",
          200: "#F0DFB0",
          300: "#E7C36A",
          400: "#D9A93F",
          500: "#C08A2A",
          600: "#9A6C1E",
        },
        // Text
        ink: {
          900: "#0F172A",
          800: "#1E293B",
          700: "#334155",
          600: "#475569",
          500: "#64748B",
          400: "#94A3B8",
          300: "#CBD5E1",
          200: "#E2E8F0",
        },
        // Surface
        surface: {
          DEFAULT: "#F5F7FA",
          subtle: "#FAFBFD",
          sunken: "#EFF3F8",
          card: "#FFFFFF",
          line: "#E8ECF2",
          "line-strong": "#DCE3EC",
        },
        positive: { DEFAULT: "#0F9D6E", soft: "#E8F7F1" },
        warning: { DEFAULT: "#C2790B", soft: "#FDF4E3" },
        critical: { DEFAULT: "#DC5B5B", soft: "#FCEDED" },
      },
      fontFamily: {
        sans: [
          "Pretendard Variable",
          "Pretendard",
          "Inter",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      borderRadius: {
        card: "16px",
        "card-lg": "18px",
        btn: "11px",
        pill: "999px",
      },
      boxShadow: {
        // Soft Ambient — 강한 Drop Shadow 대신 은은한 elevation
        card: "0 1px 2px rgba(11, 33, 69, 0.04), 0 6px 20px -6px rgba(11, 33, 69, 0.06)",
        "card-hover":
          "0 2px 4px rgba(11, 33, 69, 0.05), 0 16px 36px -12px rgba(11, 33, 69, 0.14)",
        hero: "0 1px 2px rgba(11, 33, 69, 0.05), 0 12px 32px -10px rgba(11, 33, 69, 0.10)",
        drawer: "0 -10px 40px rgba(7, 26, 51, 0.16)",
        modal: "0 16px 56px rgba(7, 26, 51, 0.24)",
        inset: "inset 0 1px 0 rgba(255, 255, 255, 0.06)",
      },
      screens: { xs: "430px", "3xl": "1800px" },
      maxWidth: { workspace: "1720px" },
      spacing: { sidebar: "280px" },
      transitionTimingFunction: { premium: "cubic-bezier(0.22, 1, 0.36, 1)" },
    },
  },
  plugins: [],
};

export default config;
