// Whether this device gets live 3D: not on phones, with reduced motion, on low memory or few cores, without WebGL2,
// or on a software or weak mobile GPU. ?world=live|poster overrides it either way.

export function capable() {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches || innerWidth < 768) return false;
  const n = navigator as Navigator & { deviceMemory?: number };
  if ((n.hardwareConcurrency || 8) < 4 || (n.deviceMemory ?? 8) < 4) return false;
  const gl = document.createElement("canvas").getContext("webgl2");
  if (!gl) return false;
  const x = gl.getExtension("WEBGL_debug_renderer_info");
  const name = x ? String(gl.getParameter(x.UNMASKED_RENDERER_WEBGL)) : "";
  gl.getExtension("WEBGL_lose_context")?.loseContext();
  return !/swiftshader|llvmpipe|softpipe|software|mali-[34]|adreno \(tm\) [34]\d\d/i.test(name);
}

export function want3d() {
  const w = new URLSearchParams(location.search).get("world");
  return w === "live" || (w !== "poster" && capable());
}
