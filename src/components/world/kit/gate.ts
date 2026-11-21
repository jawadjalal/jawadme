// Whether this device gets the live 3D, read once on the client. Only a desktop or laptop with a hardware GPU does.
// Phones and tablets (a narrow or touch-first screen) keep the designed posters and never load three.js, even after
// they interact, as do reduced motion, Save-Data, under 4 cores or 4 GB, no WebGL2 and software or weak GPUs (a
// context that only exists with a major performance caveat counts as software). ?world=live|poster overrides it.

function capable(): boolean {
  if (innerWidth < 768 || matchMedia("(pointer: coarse)").matches) return false;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  const n = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  if (n.connection?.saveData) return false;
  if ((n.hardwareConcurrency || 4) < 4 || (n.deviceMemory ?? 4) < 4) return false;
  const gl = document.createElement("canvas").getContext("webgl2", { failIfMajorPerformanceCaveat: true });
  if (!gl) return false;
  const x = gl.getExtension("WEBGL_debug_renderer_info");
  const name = String(gl.getParameter(gl.RENDERER)) + " " + (x ? String(gl.getParameter(x.UNMASKED_RENDERER_WEBGL)) : "");
  gl.getExtension("WEBGL_lose_context")?.loseContext();
  return !/swiftshader|llvmpipe|softpipe|software|mali-[34t]|mali-g(31|51|52|57)\b|adreno \(tm\) [345]\d\d/i.test(name);
}

/** Whether this page's stages go live: ?world=live or ?world=poster, else what the device can carry. */
export function want3d(): boolean {
  const w = new URLSearchParams(location.search).get("world");
  return w === "live" || (w !== "poster" && capable());
}
