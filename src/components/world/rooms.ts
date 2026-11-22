import * as THREE from "three";
import { KTX2Loader } from "three/examples/jsm/loaders/KTX2Loader.js";
import { ACCENT } from "@/lib/accent";
import { GLOW, INK, RV, UP, aim, isoCamera, view } from "./kit";
import { finish } from "./kit/finish";
import { flames, type FlameSpec } from "./kit/flame";
import { loadRoom } from "./kit/room";

// The home stage built from the baked chambers (?world=rooms): each chamber is a lit PBR GLB from the Blender pipeline
// (public/world/rooms/<name>/), its lightmap on uv1, its flame_<n> empties lit with the shader flames, all in one
// scene under the iso camera and drawn through the kit's finish (GTAO, emissive-only bloom, SMAA, AgX). The camera
// follows the page's keys: the gate court at the top, then the walk down the hall of ads. The theatre and the river
// have no chamber yet, so past the hall the stage stops drawing and World shows their posters. The court is the first
// view (its GLB and lightmap, under 600 KB); the hall and the court's HD textures load after the first frame.
//
// Every banner_<n> node shows an ad by id (its extras.ad, else scene.json's default_ad). Each gets a real anchor laid
// over it (World renders them; this moves them onto the banner every frame), and hover or focus lights the banner.
// A software renderer gets DPR 1, no GTAO and no HD textures; a GPU starts at DPR 2 and steps down while the frame
// time does not hold.

export type RoomBanner = { id: string; chamber: string; p: number };
export type RoomsOpts = {
  progress: () => number;
  still: boolean;
  src: (id: string) => string | undefined;
  banners: (list: RoomBanner[]) => void;
  el: (i: number) => HTMLElement | null;
  ready: () => void;
};

type Shot = { t: THREE.Vector3; h: number };
type Framer = (aspect: number) => Shot;
type Chamber = { name: string; at: THREE.Vector3 };
type Stop = { frustum_h: number; frustum_w: number; target_three: [number, number, number] };
type CameraJson = {
  gate_top_up?: number;
  framing?: { desktop: { fh: number; top: number }; phone: { width: number; top: number } };
  d?: { start: Stop; end: Stop };
  m?: { start: Stop; end: Stop };
};
type SceneJson = { portal?: { w: number; h: number; spring: number; r: number; centre: number }; banners?: { name: string; default_ad?: string; ad?: string }[] };
type LightJson = { file: string; encoding: string; three_lightMapIntensity: number };
type HdJson = { materials: Record<string, { albedo: string; normal: string }> };
type Banner = { id: string; chamber: string; mat: THREE.MeshBasicMaterial | THREE.MeshStandardMaterial; white: number; box: THREE.Box3; hot: number };

/** The court sits at the origin; the hall's floor (its origin, the west-front corner) lies past the court's stair, 6 below. */
const COURT: Chamber = { name: "court", at: new THREE.Vector3(0, 0, 0) };
const HALL: Chamber = { name: "hall", at: new THREE.Vector3(22, -6, 0) };
const BRONZE_METALNESS = 0.35;
const MAX_LIGHTS = 8;
/** AgX greys an unlit white, so unlit ads are scaled until their white lands near white on screen. */
const AD_WHITE = 1.7;

function software() {
  const gl = document.createElement("canvas").getContext("webgl2", { failIfMajorPerformanceCaveat: true });
  if (!gl) return true;
  const x = gl.getExtension("WEBGL_debug_renderer_info");
  const name = String(gl.getParameter(x ? x.UNMASKED_RENDERER_WEBGL : gl.RENDERER));
  gl.getExtension("WEBGL_lose_context")?.loseContext();
  return /swiftshader|llvmpipe|softpipe|software/i.test(name);
}

const json = <T>(url: string): Promise<T | null> =>
  fetch(url)
    .then((r) => (r.ok ? (r.json() as Promise<T>) : null))
    .catch(() => null);

/** A chamber's camera stops: the court's one framing (gate top at a fixed line), or a walk from start to end. */
function stopsOf(cam: CameraJson | null, at: THREE.Vector3): Framer[] {
  const { d, m } = cam ?? {};
  if (d && m)
    return (["start", "end"] as const).map((k) => (aspect: number) => {
      const s = aspect >= 1 ? d[k] : m[k];
      return { t: new THREE.Vector3(...s.target_three).add(at), h: aspect >= 1 ? s.frustum_h : s.frustum_w / aspect };
    });
  const gtu = cam?.gate_top_up ?? 0;
  const fr = cam?.framing ?? { desktop: { fh: 32.5, top: 0.19 }, phone: { width: 38, top: 0.3 } };
  return [
    (aspect) => {
      const desk = aspect >= 1;
      const vh = desk ? fr.desktop.fh : fr.phone.width / aspect;
      return { t: at.clone().addScaledVector(UP, gtu + (desk ? fr.desktop.top : fr.phone.top) * vh - vh / 2), h: vh };
    },
  ];
}

export function mount(host: HTMLElement, o: RoomsOpts) {
  const sw = software();
  let dpr = Math.min(window.devicePixelRatio || 1, sw ? 1 : 2);
  const scene = new THREE.Scene();
  scene.background = INK.clone();
  const camera = isoCamera();
  let v = view(host, (dt) => tick(dt), { dpr });
  const renderer = v.renderer;
  const P = finish(renderer, scene, camera, { ao: !sw });
  const ktx = new KTX2Loader().setTranscoderPath("/world/basis/").detectSupport(renderer);
  const trash: { dispose: () => void }[] = [P, ktx];
  const fl: ReturnType<typeof flames>[] = [];
  const banners: Banner[] = [];
  const stops = new Map<string, Framer[]>();
  let shown = false, gone = false;
  const time = { value: 0 };

  // a small warm sky and dark ground for the bronze to reflect
  const env = (() => {
    const s = new THREE.Scene();
    const g = new THREE.SphereGeometry(10, 16, 8);
    const pos = g.attributes.position, cols: number[] = [];
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i) / 10;
      cols.push(...(y > 0.1 ? [1.0, 0.72, 0.46] : y > -0.3 ? [0.22, 0.3, 0.24] : [0.05, 0.08, 0.06]));
    }
    g.setAttribute("color", new THREE.Float32BufferAttribute(cols, 3));
    const m = new THREE.MeshBasicMaterial({ side: THREE.BackSide, vertexColors: true });
    s.add(new THREE.Mesh(g, m));
    const pm = new THREE.PMREMGenerator(renderer);
    const t = pm.fromScene(s).texture;
    pm.dispose();
    g.dispose();
    m.dispose();
    trash.push(t);
    return t;
  })();

  async function load(c: Chamber) {
    const base = "/world/rooms/" + c.name + "/";
    const [meta, cam, lm] = await Promise.all([json<SceneJson>(base + "scene.json"), json<CameraJson>(base + "camera.json"), json<LightJson>(base + "lightmap.json")]);
    const room = await loadRoom(renderer, base + "chamber.glb", lm ? { lightmap: base + lm.file, lightmapIntensity: lm.three_lightMapIntensity, lightmapSRGB: /srgb/i.test(lm.encoding) } : {});
    if (room.lightmap) trash.push(room.lightmap);
    if (gone) return null;
    room.root.position.copy(c.at);
    scene.add(room.root);
    room.root.updateMatrixWorld(true);
    const defaults = new Map((meta?.banners ?? []).map((b) => [b.name, b.default_ad ?? b.ad]));
    const mats = new Map<string, THREE.MeshStandardMaterial>();
    room.root.traverse((n) => {
      if (!(n instanceof THREE.Mesh)) return;
      trash.push(n.geometry);
      for (const m of ([] as THREE.Material[]).concat(n.material)) {
        trash.push(m);
        if (!(m instanceof THREE.MeshStandardMaterial)) continue;
        mats.set(m.name, m);
        if (m.metalness === 0) continue;
        m.metalness = BRONZE_METALNESS;
        m.envMap = env;
        m.envMapIntensity = 0.7;
      }
      if (n.name === "portal" && meta?.portal) {
        n.material = portal(meta.portal);
        return;
      }
      const id = /^banner_\d+$/.test(n.name) ? ((n.userData.ad as string | undefined) ?? defaults.get(n.name)) : undefined;
      const mat = n.material;
      if (!id || !(mat instanceof THREE.MeshBasicMaterial || mat instanceof THREE.MeshStandardMaterial)) return;
      const url = o.src(id);
      if (url)
        new THREE.TextureLoader().load(url, (t) => {
          if (gone) return t.dispose();
          t.flipY = false;
          t.colorSpace = THREE.SRGBColorSpace;
          t.anisotropy = renderer.capabilities.getMaxAnisotropy();
          mat.map = t;
          mat.needsUpdate = true;
          trash.push(t);
        });
      const white = mat instanceof THREE.MeshBasicMaterial ? AD_WHITE : 1;
      mat.color.setScalar(white);
      banners.push({ id, chamber: c.name, mat, white, box: new THREE.Box3().setFromObject(n), hot: 0 });
    });

    const specs: FlameSpec[] = room.flames.map((f) => ({ ...f, p: f.p.clone().add(c.at) }));
    const lit = [...specs].sort((a, b) => b.h - a.h).slice(0, MAX_LIGHTS).filter((f) => f.h >= 3);
    fl.push(flames(scene, lit), flames(scene, specs.filter((f) => !lit.includes(f)), { lights: false }));
    stops.set(c.name, stopsOf(cam, c.at));
    announce();
    return mats;
  }

  // the anchors, each with the page progress where the camera faces its banner (the court 0, the hall 1 to 2)
  function announce() {
    const walk = stops.get("hall");
    const a = walk?.[0](16 / 10).t, b = walk?.[walk.length - 1](16 / 10).t;
    const along = (x: THREE.Vector3) => (a && b ? Math.min(1, Math.max(0, x.clone().sub(a).dot(RV) / Math.max(1e-3, b.clone().sub(a).dot(RV)))) : 0);
    o.banners(banners.map((x) => ({ id: x.id, chamber: x.chamber, p: x.chamber === "hall" ? 1 + along(x.box.getCenter(new THREE.Vector3())) : 0 })));
  }

  // the gate's portal (the pipeline's own shader, from its proof): an arch of mint arms and rings winding inward,
  // flat cel bands with motes falling toward the centre
  function portal(P: NonNullable<SceneJson["portal"]>) {
    const m = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      uniforms: { uT: time, uEm: { value: new THREE.Color(GLOW.emissive) }, uCore: { value: new THREE.Color(GLOW.core) }, uInk: { value: new THREE.Color(ACCENT.ink) }, uGeo: { value: new THREE.Vector4(P.w, P.h, P.spring, P.r) }, uCy: { value: P.centre } },
      vertexShader: "varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
      fragmentShader: `
        uniform float uT, uCy; uniform vec3 uEm, uCore, uInk; uniform vec4 uGeo; varying vec2 vUv;
        float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        float vnoise(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y); }
        float fbm(vec2 p) { float s = 0.0, a = 0.5; for (int i = 0; i < 4; i++) { s += a * vnoise(p); p = p * 2.03 + 1.7; a *= 0.5; } return s; }
        float band(float v, float e) { float w = fwidth(v) * 0.75 + 1e-4; return smoothstep(e - w, e + w, v); }
        void main() {
          vec2 p = vec2((vUv.x - 0.5) * uGeo.x, (1.0 - vUv.y) * uGeo.y);
          float d = p.y > uGeo.z ? length(p - vec2(0.0, uGeo.z)) - uGeo.w : abs(p.x) - uGeo.w;
          float aa = fwidth(d) * 0.75;
          vec2 q = (p - vec2(0.0, uCy)) / vec2(uGeo.w, 4.4);
          float r = length(q), ang = atan(q.y, q.x), s = log(r + 0.015);
          float depth = 0.3 / (r + 0.05);
          float warp = fbm(q * 3.0 + vec2(uT * 0.05, 0.0)) - 0.5;
          float tw = ang + depth * 3.2 + warp * 0.5 - uT * 0.1;
          float arms = 0.5 + 0.5 * sin(9.0 * tw);
          float outer = smoothstep(0.08, 0.95, r);
          vec3 col = uInk;
          col = mix(col, uEm * 0.3, band(outer + 0.18 * (fbm(vec2(cos(tw), sin(tw)) * 2.0 + depth) - 0.5), 0.22));
          col = mix(col, uEm, band(arms * (0.35 + 0.65 * outer), 0.8));
          float ring = fract(depth * 0.7 - uT * 0.12);
          col = mix(col, uEm * 0.3, band(1.0 - abs(ring - 0.5) * 2.0, 0.93) * outer);
          vec2 lp = vec2(ang / 6.2832 * 18.0 + s * 3.0, s * 7.0 + uT * 0.8);
          vec2 id = floor(lp), fr = fract(lp) - 0.5;
          vec2 off = vec2(hash(id + 3.1), hash(id + 7.7)) - 0.5;
          float dm = length(fr - off * 0.5);
          float fm = fwidth(dm) * 0.75 + 1e-4;
          float mote = (1.0 - smoothstep(0.13 - fm, 0.13 + fm, dm)) * step(0.62, hash(id)) * smoothstep(0.05, 0.2, r);
          col = mix(col, uCore, mote);
          col = mix(col, uInk, smoothstep(-0.2 - aa, -0.2 + aa, d) * (1.0 - smoothstep(-0.15 - aa, -0.15 + aa, d)));
          col = mix(col, uCore, smoothstep(-0.13 - aa, -0.13 + aa, d));
          gl_FragColor = vec4(col, 1.0 - smoothstep(-aa, aa, d));
        }`,
    });
    trash.push(m);
    return m;
  }

  async function hd(c: Chamber, mats: Map<string, THREE.MeshStandardMaterial>) {
    const base = "/world/rooms/" + c.name + "/";
    const j = await json<HdJson>(base + "hd.json");
    for (const [k, f] of Object.entries(j?.materials ?? {})) {
      const m = mats.get(k);
      if (!m || gone) continue;
      const [al, nm] = await Promise.all([ktx.loadAsync(base + f.albedo), ktx.loadAsync(base + f.normal)]);
      trash.push(al, nm);
      if (gone) return;
      al.colorSpace = THREE.SRGBColorSpace;
      nm.colorSpace = THREE.NoColorSpace;
      al.anisotropy = nm.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
      m.map = al;
      m.normalMap = nm;
      m.needsUpdate = true;
    }
  }

  const court = load(COURT);
  const later = () => {
    load(HALL).catch(() => {});
    if (!sw) court.then((m) => m && hd(COURT, m)).catch(() => {});
  };

  // the camera's shots along the page's keys: 0 the court, 1 and 2 the hall's walk (the court again until it lands)
  const shots = (aspect: number): Shot[] => {
    const c = stops.get("court")![0](aspect);
    const hall = stops.get("hall");
    return hall ? [c, hall[0](aspect), hall[hall.length - 1](aspect)] : [c, c, c];
  };

  const ptr = { x: 0, y: 0, tx: 0, ty: 0 };
  const move = (e: PointerEvent) => {
    ptr.tx = (e.clientX / innerWidth) * 2 - 1;
    ptr.ty = -((e.clientY / innerHeight) * 2 - 1);
  };
  addEventListener("pointermove", move, { passive: true });

  const cur = new THREE.Vector3(), want = new THREE.Vector3(), c3 = new THREE.Vector3();
  let curH = 0, frames = 0, spent = 0, waited = 0;
  const smoother = (f: number) => f * f * f * (f * (f * 6 - 15) + 10);

  // each banner's anchor covers the banner's box on screen; hover or keyboard focus lights the banner
  const place = (W: number, H: number) => {
    banners.forEach((b, i) => {
      const el = o.el(i);
      if (!el) return;
      let x0 = 1, y0 = 1, x1 = -1, y1 = -1;
      for (let k = 0; k < 8; k++) {
        c3.set(k & 1 ? b.box.max.x : b.box.min.x, k & 2 ? b.box.max.y : b.box.min.y, k & 4 ? b.box.max.z : b.box.min.z).project(camera);
        x0 = Math.min(x0, c3.x);
        x1 = Math.max(x1, c3.x);
        y0 = Math.min(y0, c3.y);
        y1 = Math.max(y1, c3.y);
      }
      el.style.transform = "translate(" + (((x0 + 1) / 2) * W).toFixed(1) + "px," + (((1 - y1) / 2) * H).toFixed(1) + "px)";
      el.style.width = Math.max(0, ((x1 - x0) / 2) * W).toFixed(1) + "px";
      el.style.height = Math.max(0, ((y1 - y0) / 2) * H).toFixed(1) + "px";
      const on = el.firstElementChild?.matches(":hover, :focus-visible") ? 1 : 0;
      b.hot += (on - b.hot) * (o.still ? 1 : 0.2);
      b.mat.color.setScalar(b.white * (1 + 0.25 * b.hot));
    });
  };

  function tick(dt: number) {
    if (!stops.has("court")) return;
    const p = Math.min(4, Math.max(0, o.progress()));
    if (shown && p > 2.6) return;
    time.value += dt;
    const [W, H] = v.size();
    const S = shots(W / H);
    const q = Math.min(p, 2);
    const i = Math.min(1, Math.floor(q));
    const f = i === 1 ? q - i : smoother(q - i);
    want.lerpVectors(S[i].t, S[i + 1].t, f);
    const h = S[i].h + (S[i + 1].h - S[i].h) * f;
    if (!o.still) {
      ptr.x += (ptr.tx - ptr.x) * (1 - Math.exp(-dt * 2.5));
      ptr.y += (ptr.ty - ptr.y) * (1 - Math.exp(-dt * 2.5));
      want.addScaledVector(RV, ptr.x * 0.35).addScaledVector(UP, ptr.y * 0.2);
    }
    const k = o.still || !shown ? 1 : 1 - Math.exp(-dt * 6);
    cur.lerp(want, k);
    curH += (h - curH) * k;
    const vh = aim(camera, cur, curH, 0, W / H);
    for (const x of fl) x.update(time.value, (H * dpr) / vh);
    place(W, H);

    const t0 = performance.now();
    P.render();
    spent += performance.now() - t0;

    if (!shown) {
      shown = true;
      o.ready();
      later();
      return;
    }
    frames++;
    waited += dt;
    if (frames < 60) return;
    host.dataset.ms = ((waited / frames) * 1000).toFixed(1);
    host.dataset.cpu = (spent / frames).toFixed(1);
    host.dataset.dpr = String(dpr) + (sw ? " software" : "");
    if (!o.still && waited / frames > 0.021 && dpr > 1) {
      dpr = Math.max(1, dpr - 0.5);
      v.stop();
      v = view(host, (d) => tick(d), { dpr });
    }
    frames = 0;
    spent = 0;
    waited = 0;
  }

  return () => {
    gone = true;
    v.stop();
    removeEventListener("pointermove", move);
    fl.forEach((x) => x.dispose());
    trash.forEach((x) => x.dispose());
    scene.clear();
  };
}
