import * as THREE from "three";
import { bag, drop } from "./bag";
import { shared } from "./paint";
import { post } from "./post";

// The finish for the baked, lit GLB rooms, kept as the rooms' entry point to the one post chain (./post in its PBR
// mode): the scene drawn in linear HDR, optional GTAO, bloom only on what emits (light above `bloom`, default 1, so
// stone never blooms), MSAA on the scene target (no SMAA pass needed), then AgX Punchy at exposure 2^0.25 (the bakes'
// grade) and sRGB output. Call render() once a frame; it follows the renderer's size and pixel ratio.

export function finish(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera, o: { ao?: boolean; bloom?: number; exposure?: number } = {}) {
  const b = bag();
  const P = post(renderer, shared(), b, { small: false, still: true, flat: true, bloom: o.bloom ?? 1, pbr: { agx: o.exposure ?? Math.pow(2, 0.25), ao: o.ao } });
  return {
    render() {
      P.render(scene, camera, 1);
    },
    dispose() {
      P.dispose();
      drop(b);
    },
  };
}
