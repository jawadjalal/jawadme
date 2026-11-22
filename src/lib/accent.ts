/** Hades 2 Spectral Viridian + Gilded Gold accent system.
 *  Every surface (CSS, OG cards, Cal embed, GitHub graph) reads from these tokens. */
export const ACCENT = {
  accent: "#5fe3b8",
  hi: "#a8f7dc",
  glow: "#5fe3b8",
  ink: "#0c1210",
  paper: "#147a5b",
  gold: "#d4a84b",
  goldHi: "#f0d07a",
  goldDim: "#8f6e28",
} as const;

export const ACCENT_CSS = `:root{--accent:${ACCENT.accent};--accent-hi:${ACCENT.hi};--accent-glow:${ACCENT.glow};--accent-ink:${ACCENT.ink};--accent-paper:${ACCENT.paper};--gold:${ACCENT.gold};--gold-hi:${ACCENT.goldHi};--gold-dim:${ACCENT.goldDim}}`;
