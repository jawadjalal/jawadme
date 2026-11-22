import * as THREE from "three";

/** Everything a stage made that the GPU holds, so one call frees it all when the stage goes. */
export type Bag = { geos: THREE.BufferGeometry[]; mats: THREE.Material[]; texs: THREE.Texture[]; rts: THREE.WebGLRenderTarget[] };
export const bag = (): Bag => ({ geos: [], mats: [], texs: [], rts: [] });
export function drop(b: Bag) {
  b.geos.forEach((g) => g.dispose());
  b.mats.forEach((m) => m.dispose());
  b.texs.forEach((t) => t.dispose());
  b.rts.forEach((r) => r.dispose());
}
