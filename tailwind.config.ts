import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        // One face, as on ignura.com. `display` and `mono` are kept as names so
        // older markup still resolves, and both land on Satoshi.
        sans: ["Satoshi", "Satoshi Fallback", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Satoshi", "Satoshi Fallback", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["Satoshi", "Satoshi Fallback", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        muted: "var(--muted)",
        "muted-foreground": "var(--muted-foreground)",
        border: "var(--border)",
        ring: "var(--ring)",
      },
      borderRadius: { DEFAULT: "var(--radius)", md: "var(--radius)", lg: "var(--radius)" },
      maxWidth: { column: "760px" },
    },
  },
  plugins: [],
} satisfies Config;
