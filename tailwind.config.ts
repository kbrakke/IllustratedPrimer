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
        earth: {
          lightest: '#cab891', // sand color
          light: '#70683b',    // olive
          medium: '#5f6a54',   // sage
          dark: '#2b2c1e',     // dark olive
          accent: '#81231e',   // rust red
        },
      },
    },
  },
  plugins: [],
};

export default config;
