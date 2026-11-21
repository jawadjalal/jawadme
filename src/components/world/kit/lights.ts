import * as THREE from "three";
import { GLOW } from "./accent";
import { NL, type Shared } from "./paint";

/** A light source the painted materials see: a brazier (warm), a soul flame (cyan), or a lamp (always lit, no flame). */
export type Fire = { p: THREE.Vector3; r: number; soul: boolean; big: boolean; lamp?: boolean };

/** Give the NL - 1 fires nearest `c` the shader's light slots, flickering; `lit` scales each (0 dark, 1 full). Slot NL - 1 stays free for a hand-held light. */
export function lightFires(S: Shared, fires: Fire[], c: THREE.Vector3, lit: (f: Fire) => number = () => 1) {
  const t = S.time.value;
  const order = fires.map((_, i) => i).sort((a, b) => fires[a].p.distanceToSquared(c) - fires[b].p.distanceToSquared(c));
  for (let j = 0; j < NL - 1; j++) {
    const f = fires[order[j]];
    if (!f) {
      S.fc.value[j].set(0, 0, 0);
      continue;
    }
    const fl = (0.84 + 0.16 * Math.sin(t * 11 + j * 1.7) * Math.sin(t * 6.3 + j)) * lit(f);
    S.fl.value[j].set(f.p.x, f.p.y + 0.4, f.p.z, f.r * (f.big ? 1.15 : 1));
    if (f.soul) S.fc.value[j].set(0.7 * fl, 1.8 * fl, 2.0 * fl);
    else S.fc.value[j].set(GLOW.fire[0] * fl, GLOW.fire[1] * fl, GLOW.fire[2] * fl);
  }
}
