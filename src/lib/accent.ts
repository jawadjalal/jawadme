/** The one accent. Every accent on the site, CSS and JS, reads from here: the root layout writes these as
 *  --accent, --accent-hi and --accent-ink on :root, and the OG cards, the Cal embed and the route moments import them. */
export const ACCENT = { accent: "#ff5314", hi: "#ff7a45", ink: "#0b0b0b" } as const;

export const ACCENT_CSS = `:root{--accent:${ACCENT.accent};--accent-hi:${ACCENT.hi};--accent-ink:${ACCENT.ink}}`;
