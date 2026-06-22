import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          red: "#CF1721",
          yellow: "#F5C000",
          "yellow-hover": "#E0B000",
          dark: "#1A1A2E",
          gray: "#F4F4F4",
          "gray-border": "#E5E5E5",
          "gray-text": "#6B7280",
        },
      },
    },
  },
  plugins: [],
};

export default config;
