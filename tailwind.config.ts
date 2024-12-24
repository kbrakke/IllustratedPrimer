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
          lightest: '#cab891',  // Neutral beige
          light: '#70683b',     // Darker beige
          primary: '#81231e',   // Deep red
          dark: '#5f6a54',      // Sage green
          darkest: '#2b2c1e',   // Dark olive
        },
      },
    },
  },
  plugins: [],
};

export default config;
