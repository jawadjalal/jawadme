import * as THREE from "three";
import { buildFoot, type Exit, type FootState, type FootV } from "./foot";
import { Batch, INK, NL, RV, UP, aim, bag, drop, fx, isoCamera, lightFires, painter, post, shared, view } from "./kit";
import type { Mount } from "./kit/Stage";

// The footer's chamber alone on flat ink (./foot builds the take), on the world kit. The links laid over it come from
// the page: hover and focus make a target hot, a click picks it (the camera walks in, the frame goes to ink, then the
// page navigates; links that open a new tab just go), and the die rolls on a click or follows a drag.

export type FootOpts = { v: FootV; exits: Exit[]; el: (key: string) => HTMLElement | null; go: (href: string) => void; face: (key: string) => void };
const LEAVE = 0.9;

export function mount(host: HTMLElement, ctx: Parameters<Mount>[1], o: FootOpts) {
  const S = shared();
  const b = bag();
  const scene = new THREE.Scene();
  scene.background = INK;
  const camera = isoCamera();
  const { mk, palette } = painter(S, b);
  const floor = mk("#47413d", { k: "floor", rect: [-15, -15, 15, 15], border: 2, tile: 2.4 });
  const B = new Batch();
  const foot = buildFoot({ B, m: palette, floor, scene, geos: b.geos, mats: b.mats, texs: b.texs, time: S.time, family: getComputedStyle(host).fontFamily, O: new THREE.Vector3() }, o.v, o.exits);
  B.build(scene, b.geos);

  scene.add(new THREE.HemisphereLight("#6660a6", "#140c0a", 1.15));
  const key = new THREE.DirectionalLight("#ffcf9e", 1.1);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.bias = -0.0004;
  key.shadow.normalBias = 0.05;
  Object.assign(key.shadow.camera, { near: 1, far: 260, left: -40, right: 40, top: 40, bottom: -40 });
  key.shadow.camera.updateProjectionMatrix();
  key.target.position.copy(foot.shot.t);
  key.position.copy(foot.shot.t).addScaledVector(new THREE.Vector3(-0.5, 1, 0.12).normalize(), 120);
  scene.add(key, key.target);

  const F = fx(scene, S, b);
  F.flames(foot.fires.filter((f) => !f.soul && !f.lamp), false, ctx.small ? 14 : 24);
  F.flames(foot.fires.filter((f) => f.soul && !f.lamp), true, ctx.small ? 14 : 24);
  F.halos(foot.fires.filter((f) => !f.soul && !f.lamp), "#ff6a24");
  F.drift(ctx.small ? 100 : 200, [60, 26, 60], 0.11, 1.1, "#ff6a24", 1.4, 0);
  F.drift(ctx.small ? 40 : 80, [60, 20, 60], 0.42, 0.35, "#63e6ff", 0.42, 1);

  const dpr = Math.min(window.devicePixelRatio || 1, ctx.still ? 2 : ctx.small ? 1.25 : 1.75);
  const v = view(host, frame, { dpr });
  const P = post(v.renderer, S, b, { small: ctx.small, still: ctx.still, flat: true });

  const st: FootState = { hot: null, pick: null, pickT: 0, tilt: new THREE.Vector2(), drag: null };
  const els = foot.targets.map((t) => o.el(t.key));
  const offs: (() => void)[] = [];
  const on = <E extends Event>(el: EventTarget, type: string, fn: (e: E) => void) => {
    el.addEventListener(type, fn as EventListener);
    offs.push(() => el.removeEventListener(type, fn as EventListener));
  };
  let leaveTo = "", dragged = 0, dx = 0, dy = 0;
  const ptr = { x: 0, y: 0, tx: 0, ty: 0 };
  on<PointerEvent>(window, "pointermove", (e) => {
    ptr.tx = (e.clientX / innerWidth) * 2 - 1;
    ptr.ty = -((e.clientY / innerHeight) * 2 - 1);
  });
  on(window, "pageshow", () => ((st.pick = null), (P.u.uFade.value = 0)));
  foot.face?.(o.face);
  els.forEach((el, i) => {
    if (!el) return;
    const k = foot.targets[i].key;
    const cool = () => void (st.hot === k && (st.hot = null));
    on(el, "pointerenter", () => (st.hot = k));
    on(el, "pointerleave", cool);
    on(el, "focus", () => (st.hot = k));
    on(el, "blur", cool);
    on<PointerEvent>(el, "pointermove", (e) => {
      const r = el.getBoundingClientRect();
      st.tilt.set(((e.clientX - r.left) / r.width) * 2 - 1, -(((e.clientY - r.top) / r.height) * 2 - 1));
      if (!st.drag) return;
      st.drag.x += e.clientX - dx;
      st.drag.y += e.clientY - dy;
      dragged += Math.abs(e.clientX - dx) + Math.abs(e.clientY - dy);
      dx = e.clientX;
      dy = e.clientY;
    });
    if (k === "die") {
      on<PointerEvent>(el, "pointerdown", (e) => {
        st.drag = new THREE.Vector2();
        dragged = 0;
        dx = e.clientX;
        dy = e.clientY;
        el.setPointerCapture(e.pointerId);
      });
      on(el, "pointerup", () => (st.drag = null));
      on(el, "pointercancel", () => (st.drag = null));
      on<MouseEvent>(el, "click", (e) => {
        e.preventDefault();
        if (dragged < 6) foot.roll?.();
      });
      return;
    }
    on<MouseEvent>(el, "click", (e) => {
      const a = el as HTMLAnchorElement;
      if (!a.getAttribute("href") || a.target === "_blank" || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || st.pick) return;
      e.preventDefault();
      st.pick = k;
      st.pickT = 0;
      leaveTo = a.getAttribute("href")!;
    });
  });

  const cur = foot.shot.t.clone(), want = new THREE.Vector3(), tmp = new THREE.Vector3();
  let h = foot.shot.h, w = foot.shot.w, shown = false;
  const placed: string[] = [];
  function frame(dt: number) {
    S.time.value += dt;
    if (!ctx.still) {
      ptr.x += (ptr.tx - ptr.x) * (1 - Math.exp(-dt * 2.5));
      ptr.y += (ptr.ty - ptr.y) * (1 - Math.exp(-dt * 2.5));
    }
    want.copy(foot.shot.t).addScaledVector(RV, ptr.x * 0.5).addScaledVector(UP, ptr.y * 0.3);
    let wh = foot.shot.h, ww = foot.shot.w;
    if (st.pick) {
      st.pickT += dt;
      const u = Math.min(1, st.pickT / LEAVE);
      want.lerp(foot.focus(st.pick), u * u * 0.8);
      wh *= 1 - 0.62 * u * u;
      ww *= 1 - 0.62 * u * u;
      P.u.uFade.value = Math.max(0, (u - 0.55) / 0.45);
      if (u >= 1 && leaveTo) {
        o.go(leaveTo);
        leaveTo = "";
        setTimeout(() => ((st.pick = null), (P.u.uFade.value = 0)), 1500);
      }
    }
    const k = ctx.still ? 1 : 1 - Math.exp(-dt * (st.pick ? 3 : 6));
    cur.lerp(want, k);
    h += (wh - h) * k;
    w += (ww - w) * k;
    const [W, H] = v.size();
    const vh = aim(camera, cur, h, w, W / H);
    F.u.center.value.copy(cur);
    F.u.ppu.value = (H * dpr) / vh;
    lightFires(S, foot.fires, cur);
    S.fl.value[NL - 1].set(0, -999, 0, 0.001);
    foot.update(dt, st);
    const px = H / vh;
    els.forEach((el, j) => {
      if (!el) return;
      const t = foot.targets[j];
      tmp.copy(t.at).project(camera);
      const css = "translate(" + (((tmp.x + 1) / 2) * W).toFixed(1) + "px," + (((1 - tmp.y) / 2) * H).toFixed(1) + "px)|" + (t.w * px).toFixed(1) + "|" + (t.h * px).toFixed(1);
      if (placed[j] === css) return;
      placed[j] = css;
      const [tr, ew, eh] = css.split("|");
      el.style.transform = tr;
      if (!t.w) return;
      el.style.width = ew + "px";
      el.style.height = eh + "px";
    });
    v.renderer.shadowMap.needsUpdate = true;
    P.render(scene, camera, vh);
    if (!shown) {
      shown = true;
      ctx.ready();
    }
  }

  return () => {
    v.stop();
    offs.forEach((f) => f());
    drop(b);
  };
}
