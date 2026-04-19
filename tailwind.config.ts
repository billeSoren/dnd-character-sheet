import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./contexts/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Theme-aware colors via CSS variables
        "dnd-bg":     "var(--dnd-bg)",
        "dnd-card":   "var(--dnd-card)",
        "dnd-text":   "var(--dnd-text)",
        "dnd-accent": "var(--dnd-accent)",
        "dnd-border": "var(--dnd-border)",
        "dnd-muted":  "var(--dnd-muted)",
        "dnd-subtle": "var(--dnd-subtle)",
      },
    },
  },
  plugins: [],
};
export default config;
