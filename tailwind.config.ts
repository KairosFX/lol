import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        abyss: "#050812",
        ink: "#09111f",
        panel: "#0e1828",
        gold: "#c8a85f",
        brightgold: "#f4d58a",
        arcane: "#2dd4bf",
        rift: "#3b82f6",
        ember: "#f97316",
      },
      boxShadow: {
        glow: "0 0 38px rgba(45, 212, 191, 0.16)",
        gold: "0 0 28px rgba(244, 213, 138, 0.16)",
      },
    },
  },
  plugins: [],
};

export default config;
