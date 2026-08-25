import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: "#f0f4fa",
          100: "#dce5f2",
          200: "#bccce4",
          300: "#92abd0",
          400: "#6386b8",
          500: "#42689f",
          600: "#325285",
          700: "#2a436c",
          800: "#213453",
          900: "#16233b",
          925: "#101b30",
          950: "#0b1426",
        },
        brand: {
          50: "#eef4ff",
          100: "#d9e6ff",
          200: "#bcd3ff",
          300: "#8eb6ff",
          400: "#598eff",
          500: "#3366ff",
          600: "#2050e8",
          700: "#1b3fc4",
          800: "#1c369c",
          900: "#1c317b",
        },
        teal: {
          50: "#effcfa",
          100: "#c8f5ef",
          200: "#92eae2",
          300: "#54d8d0",
          400: "#26bcb8",
          500: "#0e9f9e",
          600: "#0a7f81",
          700: "#0c6567",
          800: "#0e5053",
          900: "#104345",
        },
        gold: {
          100: "#faf3dd",
          200: "#f3e3ac",
          300: "#eace74",
          400: "#dfb548",
          500: "#c9982f",
          600: "#a97a24",
          700: "#87591f",
        },
        surface: {
          DEFAULT: "#f4f6fb",
          soft: "#f8fafd",
          line: "#e5eaf3",
        },
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
        btn: "11px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(16, 27, 48, 0.04), 0 4px 16px rgba(16, 27, 48, 0.05)",
        "card-hover":
          "0 2px 4px rgba(16, 27, 48, 0.05), 0 10px 28px rgba(16, 27, 48, 0.09)",
        drawer: "0 -8px 32px rgba(16, 27, 48, 0.14)",
        modal: "0 12px 48px rgba(16, 27, 48, 0.22)",
      },
      screens: {
        xs: "430px",
      },
      maxWidth: {
        shell: "1520px",
      },
    },
  },
  plugins: [],
};

export default config;
