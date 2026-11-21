// Which 3D a device gets, read once on the client:
// - "full": a desktop or laptop with a hardware GPU. DPR up to 1.75, shadows, MSAA, every light and particle.
// - "lite": a mid-range phone or tablet (a touch-first or narrow screen with 4+ cores, 4+ GB and a hardware GPU that
//   isn't an old Mali or Adreno). DPR 1, no shadows, 8 lights, a third of the particles, drawn at 30 fps.
// - "poster": the baked poster and no three.js at all. Reduced motion, Save-Data, under 4 cores or 4 GB, no WebGL2,
//   or a software or weak mobile GPU.
// ?world=live|lite|poster overrides it.

export type Tier = "full" | "lite" | "poster";

export function tier(): Tier {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return "poster";
  const n = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  if (n.connection?.saveData) return "poster";
  if ((n.hardwareConcurrency || 4) < 4 || (n.deviceMemory ?? 4) < 4) return "poster";
  const gl = document.createElement("canvas").getContext("webgl2");
  if (!gl) return "poster";
  const x = gl.getExtension("WEBGL_debug_renderer_info");
  const name = x ? String(gl.getParameter(x.UNMASKED_RENDERER_WEBGL)) : "";
  gl.getExtension("WEBGL_lose_context")?.loseContext();
  if (/swiftshader|llvmpipe|softpipe|software|mali-[34t]|mali-g(31|51|52|57)\b|adreno \(tm\) [345]\d\d/i.test(name)) return "poster";
  return innerWidth < 768 || matchMedia("(pointer: coarse)").matches ? "lite" : "full";
}

/** The tier this page gets: ?world=live (full), ?world=lite or ?world=poster, else what the device can carry. */
export function pickTier(): Tier {
  const w = new URLSearchParams(location.search).get("world");
  return w === "live" ? "full" : w === "lite" || w === "poster" ? w : tier();
}

/** Whether a stage other than the home world goes live: only the full tier, so phones keep the poster. */
export const want3d = () => pickTier() === "full";
