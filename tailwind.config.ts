import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2B014D",
          dark: "#1A0030",
          light: "#3D0266",
        },
        accent: {
          DEFAULT: "#FFD84D",
          dark: "#FFC700",
          light: "#FFE880",
        },
        background: {
          DEFAULT: "#000000",
          secondary: "#0A0A0A",
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "dark-gradient": "linear-gradient(to bottom, #1A0030, #000000)",
      },
    },
  },
  plugins: [],
};
export default config;
