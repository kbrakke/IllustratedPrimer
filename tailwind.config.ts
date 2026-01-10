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
        primer: {
          lightest: '#FFFFFF',  // Pure White
          light: '#F5F5F5',     // Off-White
          primary: '#000000',   // Pure Black
          dark: '#E0E0E0',      // Light Gray
          darkest: '#C0C0C0',   // Medium Gray
        },
      },
    },
  },
  plugins: [],
};

export default config;
