import * as THREE from "three";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { KTX2Loader } from "three/examples/jsm/loaders/KTX2Loader.js";
import type { FlameKind, FlameSpec } from "./flame";

// A baked room from the Blender pipeline: a GLB with meshopt geometry, KTX2 or WebP textures and PBR materials
// (painted albedo, normal and AO maps), plus its lightmap, an image the bake writes beside it (PNG or KTX2) that every
// static mesh reads through its second UV set (soft shadows and bounce, baked). The room's flame_<n> empties
// (scale = flame height, extras.kind, extras.radius) come back as flame specs for ./flame, which adds the flicker and
// the light on top; each spec rides its empty, so a flame on a moving part (a swinging lantern) moves with it.

let ktx: KTX2Loader | null = null;

export async function loadRoom(renderer: THREE.WebGLRenderer, url: string, o: { lightmap?: string; lightmapIntensity?: number; lightmapSRGB?: boolean } = {}) {
  ktx ??= new KTX2Loader().setTranscoderPath("/world/basis/").detectSupport(renderer);
  const [gltf, lm] = await Promise.all([
    new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).setKTX2Loader(ktx).loadAsync(url),
    o.lightmap ? (o.lightmap.endsWith(".ktx2") ? ktx.loadAsync(o.lightmap) : new THREE.TextureLoader().loadAsync(o.lightmap)) : null,
  ]);
  const root = gltf.scene;
  root.updateMatrixWorld(true);
  if (lm) {
    lm.flipY = false;
    lm.channel = 1;
    lm.colorSpace = o.lightmapSRGB ? THREE.SRGBColorSpace : THREE.LinearSRGBColorSpace;
  }
  const flames: FlameSpec[] = [];
  const s = new THREE.Vector3();
  root.traverse((n) => {
    if (n.name.startsWith("flame_")) {
      n.getWorldScale(s);
      flames.push({ p: n.getWorldPosition(new THREE.Vector3()), h: s.y, kind: (n.userData.kind as FlameKind | undefined) ?? "brazier", r: n.userData.radius as number | undefined, node: n });
      return;
    }
    if (!(n instanceof THREE.Mesh) || !lm || !n.geometry.getAttribute("uv1")) return;
    for (const m of ([] as THREE.Material[]).concat(n.material)) {
      if (!(m instanceof THREE.MeshStandardMaterial)) continue;
      m.lightMap = lm;
      m.lightMapIntensity = o.lightmapIntensity ?? 1;
    }
  });
  return { root, flames, lightmap: lm };
}
