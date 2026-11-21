// Accent arena harness (throwaway): the 3D accent for ?accent=a|b|c, read from html[data-accent], which the root
// layout sets before paint. No choice keeps ember. core is the gate glow and painted accent, halo the fire halos and
// drifting motes, fire the light the braziers throw (HDR, scaled to ember's luminance), hot/cold the flame particles over their life, rim the
// warm side of the two-colour rim.

type Glow = { core: string; halo: string; fire: [number, number, number]; hot: string; cold: string; rim: string };

const SETS: Record<string, Glow> = {
  ember: { core: "#ff5a1c", halo: "#ff6a24", fire: [3.0, 1.26, 0.36], hot: "1.0, 0.85, 0.45", cold: "1.0, 0.24, 0.05", rim: "1.0, 0.48, 0.18" },
  a: { core: "#5cffb8", halo: "#4dffae", fire: [0.59, 1.9, 1.15], hot: "0.85, 1.0, 0.92", cold: "0.15, 0.95, 0.55", rim: "0.45, 1.0, 0.72" },
  b: { core: "#9cff3a", halo: "#94ff2e", fire: [1.04, 1.84, 0.28], hot: "0.95, 1.0, 0.6", cold: "0.4, 1.0, 0.06", rim: "0.62, 1.0, 0.2" },
  c: { core: "#19f07e", halo: "#10f07a", fire: [0.18, 2.06, 0.75], hot: "0.7, 1.0, 0.78", cold: "0.0, 0.8, 0.3", rim: "0.1, 1.0, 0.45" },
};

export const GLOW = SETS[(typeof document !== "undefined" && document.documentElement.dataset.accent) || "ember"] ?? SETS.ember;
