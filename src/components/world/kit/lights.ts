import * as THREE from "three";
import { flicker, seedOf, type FlameSpec } from "./flame";
import { GLOW, NL, SOUL, srgb, type Shared } from "./paint";

const WARM = GLOW.fire;
const COLD = srgb(SOUL, 2);

/** A light source the painted materials see: a brazier (GLOW.fire), a soul flame (SOUL), or a lamp (always lit, no flame). */
export type Fire = { p: THREE.Vector3; r: number; soul: boolean; big: boolean; lamp?: boolean };

/** The flame a fire carries (./flame): its base sits just inside the bowl, below the light point; a big fire burns taller. Lamps have none. */
export const flameOf = (f: Fire): FlameSpec => ({ p: f.p.clone().setY(f.p.y - 0.15), h: f.big ? 5.2 : 4.2, kind: f.soul ? "soul" : "brazier" });

/** Give the NL - 1 fires nearest `c` the shader's light slots, flickering with their flame (the same flicker and seed); `lit` scales each (0 dark, 1 full). Slot NL - 1 stays free for a hand-held light. */
export function lightFires(S: Shared, fires: Fire[], c: THREE.Vector3, lit: (f: Fire) => number = () => 1) {
  const t = S.time.value;
  const order = fires.map((_, i) => i).sort((a, b) => fires[a].p.distanceToSquared(c) - fires[b].p.distanceToSquared(c));
  for (let j = 0; j < NL - 1; j++) {
    const f = fires[order[j]];
    if (!f) {
      S.fc.value[j].set(0, 0, 0);
      continue;
    }
    const fl = flicker(t, seedOf(f.p)) * lit(f);
    S.fl.value[j].set(f.p.x, f.p.y + 0.4, f.p.z, f.r * (f.big ? 1.15 : 1));
    const c = f.soul ? COLD : WARM;
    S.fc.value[j].set(c[0] * fl, c[1] * fl, c[2] * fl);
  }
}
