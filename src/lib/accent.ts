/** The one accent. Every accent on the site, CSS and JS, reads from here: the root layout writes these as
 *  --accent, --accent-hi, --accent-glow, --accent-ink and --accent-paper on :root, and the OG cards, the Cal embed and the route moments import them. */
export const ACCENT = { accent: "#73e8b5", hi: "#c4ffe4", glow: "#8af5c6", ink: "#06140e", paper: "#0b6a4b" } as const;

export const ACCENT_CSS = `:root{--accent:${ACCENT.accent};--accent-hi:${ACCENT.hi};--accent-glow:${ACCENT.glow};--accent-ink:${ACCENT.ink};--accent-paper:${ACCENT.paper}}`;
