import * as THREE from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import { WORDS } from "@/components/ds/wordmark";
import { M, Q, box, prep, type Batch, type Fire, type Palette } from "./kit";

// The name as the world's monument: "Design Mastermind" in his own lettering (the outlines Wordmark carries), cast in
// gilt bronze, two lines standing on a plinth in the gate court, square to the viewer, the lit gate behind it.
// Footlights set into the plinth light the faces from below. Each letter rises out of the plinth when the ignition
// wave reaches it, so the name arrives with the fire on load; still frames show it risen.

const LINE = 32;

export function buildTitle(o: { B: Batch; m: Palette; gilt: THREE.Material; scene: THREE.Scene; geos: THREE.BufferGeometry[]; at: THREE.Vector3 }) {
  const L = M(o.at.x, o.at.y, o.at.z, Q);
  const add = (mat: THREE.Material, g: THREE.BufferGeometry, l: THREE.Matrix4) => o.B.add(mat, g, L.clone().multiply(l));
  add(o.m.pale, box(37, 0.5, 7.4, 0.08), M(0, 0, 0));
  add(o.m.stone, box(35.6, 1.1, 6, 0.12), M(0, 0.5, 0));
  add(o.m.dark, box(35.9, 0.3, 6.3, 0.06), M(0, 1.6, 0));
  const top = 1.9;
  const s = LINE / Math.max(...WORDS.map((w) => w.w));
  const svg = new SVGLoader();
  const glyphs: { mesh: THREE.Mesh; k: number }[] = [];
  let k = 0;
  WORDS.forEach((w, row) => {
    const y = top + (WORDS.length - 1 - row) * 8.6;
    for (const d of w.g) {
      const shapes = svg.parse('<svg xmlns="http://www.w3.org/2000/svg"><path d="' + d + '"/></svg>').paths.flatMap((p) => SVGLoader.createShapes(p));
      const g = new THREE.ExtrudeGeometry(shapes, { depth: 120, bevelEnabled: true, bevelThickness: 16, bevelSize: 12, bevelSegments: 2, curveSegments: 6 });
      g.rotateX(Math.PI).scale(s, s, s).translate((-w.w * s) / 2, y, 0.6);
      const geo = prep(g);
      g.dispose();
      o.geos.push(geo);
      const mesh = new THREE.Mesh(geo, o.gilt);
      mesh.castShadow = mesh.receiveShadow = true;
      mesh.matrixAutoUpdate = false;
      mesh.matrix.copy(L);
      o.scene.add(mesh);
      glyphs.push({ mesh, k: k++ });
    }
  });
  const fires: Fire[] = [
    ...[-13, -4.4, 4.4, 13].map((x) => ({ p: new THREE.Vector3(x, 1.2, 4.4).applyMatrix4(L), r: 8.5, soul: false, big: false, lamp: true })),
    ...[-6, 6].map((x) => ({ p: new THREE.Vector3(x, 10.5, 6.5).applyMatrix4(L), r: 10, soul: false, big: false, lamp: true })),
  ];
  const lift = new THREE.Matrix4();
  return {
    fires,
    /** Raise the letters for ignition time `ign` (a letter starts at 0.55 s plus 55 ms per letter and takes 0.8 s). */
    rise(ign: number) {
      for (const { mesh, k } of glyphs) {
        const t = Math.min(1, Math.max(0, (ign - 0.55 - k * 0.055) / 0.8));
        const e = t >= 1 ? 1 : 1 + 2.2 * Math.pow(t - 1, 3) + 1.2 * Math.pow(t - 1, 2);
        mesh.visible = t > 0;
        mesh.matrix.copy(L).multiply(lift.makeTranslation(0, -9.5 * (1 - e), 0));
        mesh.matrixWorldNeedsUpdate = true;
      }
    },
  };
}
