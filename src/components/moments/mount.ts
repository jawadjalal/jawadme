import { ACCENT } from "@/lib/accent";
import * as THREE from "three";
import { Batch, INK, NL, RV, UP, aim, bag, drop, fx, isoCamera, lightFires, painter, post, shared, view } from "@/components/world/kit";
import type { Mount } from "@/components/world/kit/Stage";
import { SETS, type SetName } from "./sets";

// One route moment on the world kit: a set from ./sets on its own floating platform, lit by its fires, on flat ink,
// with the kit's outline and bloom. The camera holds the set's shot and sways a little with the pointer.

export function mount(host: HTMLElement, ctx: Parameters<Mount>[1], name: SetName) {
  const S = shared();
  const b = bag();
  const scene = new THREE.Scene();
  scene.background = INK;
  const camera = isoCamera();
  const { mk, palette } = painter(S, b);
  const B = new Batch();
  const set = SETS[name]({ B, m: palette, mk, scene, b, time: S.time, family: getComputedStyle(host).fontFamily });
  B.build(scene, b.geos);

  scene.add(new THREE.HemisphereLight("#6660a6", "#140c0a", 1.15));
  const key = new THREE.DirectionalLight("#ffcf9e", 1.1);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.bias = -0.0004;
  key.shadow.normalBias = 0.05;
  Object.assign(key.shadow.camera, { near: 1, far: 200, left: -24, right: 24, top: 24, bottom: -24 });
  key.shadow.camera.updateProjectionMatrix();
  key.target.position.copy(set.shot.t);
  key.position.copy(set.shot.t).addScaledVector(new THREE.Vector3(-0.5, 1, 0.12).normalize(), 90);
  scene.add(key, key.target);

  const F = fx(scene, S, b);
  const n = (k: number) => Math.round(k * (ctx.small ? 0.6 : 1));
  F.flames(set.fires.filter((f) => !f.soul && !f.lamp), false, n(22));
  F.flames(set.fires.filter((f) => f.soul && !f.lamp), true, n(22));
  F.halos(set.fires.filter((f) => !f.soul && !f.lamp), ACCENT.hi);
  F.drift(n(110), [set.shot.w, 16, set.shot.w], 0.11, 1.1, ACCENT.hi, 1.4, 0);
  F.drift(n(36), [set.shot.w, 12, set.shot.w], 0.4, 0.35, "#63e6ff", 0.42, 1);

  const dpr = Math.min(window.devicePixelRatio || 1, ctx.still ? 2 : ctx.small ? 1.25 : 1.75);
  const v = view(host, frame, { dpr });
  const P = post(v.renderer, S, b, { small: ctx.small, still: ctx.still, flat: true });

  const ptr = { x: 0, y: 0, tx: 0, ty: 0 };
  const move = (e: PointerEvent) => {
    ptr.tx = (e.clientX / innerWidth) * 2 - 1;
    ptr.ty = -((e.clientY / innerHeight) * 2 - 1);
  };
  addEventListener("pointermove", move);

  const cur = set.shot.t.clone();
  const want = new THREE.Vector3();
  let shown = false;
  function frame(dt: number) {
    S.time.value += dt;
    if (!ctx.still) {
      ptr.x += (ptr.tx - ptr.x) * (1 - Math.exp(-dt * 2.5));
      ptr.y += (ptr.ty - ptr.y) * (1 - Math.exp(-dt * 2.5));
    }
    want.copy(set.shot.t).addScaledVector(RV, ptr.x * 0.35).addScaledVector(UP, ptr.y * 0.2);
    cur.lerp(want, ctx.still ? 1 : 1 - Math.exp(-dt * 6));
    const [W, H] = v.size();
    const vh = aim(camera, cur, set.shot.h, set.shot.w, W / H);
    F.u.center.value.copy(cur);
    F.u.ppu.value = (H * dpr) / vh;
    lightFires(S, set.fires, cur);
    S.fl.value[NL - 1].set(0, -999, 0, 0.001);
    set.update?.(dt, S.time.value);
    v.renderer.shadowMap.needsUpdate = true;
    P.render(scene, camera, vh);
    if (!shown) {
      shown = true;
      ctx.ready();
    }
  }

  return () => {
    v.stop();
    removeEventListener("pointermove", move);
    drop(b);
  };
}
