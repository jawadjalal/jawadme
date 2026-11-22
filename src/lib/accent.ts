/** Brass Hands & Outpace Industrial Tactical Orange accent system. */
export const ACCENT = {
  accent: "#ff6200",
  hi: "#ff8533",
  glow: "#ff7235",
  ink: "#141414",
  paper: "#d94e00",
  gold: "#ff6200",
  goldHi: "#ff8533",
  goldDim: "#b84400",
} as const;

export const ACCENT_CSS = `:root{--accent:${ACCENT.accent};--accent-hi:${ACCENT.hi};--accent-glow:${ACCENT.glow};--accent-ink:${ACCENT.ink};--accent-paper:${ACCENT.paper};--gold:${ACCENT.gold};--gold-hi:${ACCENT.goldHi};--gold-dim:${ACCENT.goldDim}}`;
