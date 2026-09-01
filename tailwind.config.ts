import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Chillax", "Satoshi", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
        pixel: ["var(--font-pixel)", "ui-monospace", "monospace"],
        display: ["Chillax", "Satoshi", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        muted: "var(--muted)",
        "muted-foreground": "var(--muted-foreground)",
        border: "var(--border)",
        ring: "var(--ring)",
      },
      borderRadius: { DEFAULT: "var(--radius)", md: "calc(var(--radius) - 2px)" },
      maxWidth: { column: "715px" },
    },
  },
  plugins: [],
} satisfies Config;
