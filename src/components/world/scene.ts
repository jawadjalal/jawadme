import * as THREE from "three";
import { buildHall, type Shot, type Slot } from "./hall";
import { ACCENT, Batch, GLOW, DV, INK, NL, NOISE, PITCH, Q, RV, SOUL, UP, aim, bag, drop, fx, isoCamera, lightFires, marks, painter, post, setMap, shared, view, type Fire } from "./kit";
import { flames } from "./kit/flame";
import { flameOf } from "./kit/lights";
import { COURT, HALL, LAND, SIGN, THEATRE, buildMap, type Mats } from "./map";

// The underworld under the home page, seen the way an isometric action game sees its rooms: the kit's orthographic
// camera panning across one hand-built map (./map) chamber by chamber as the page scrolls. One canvas does everything,
// the ads included (./hall), drawn through the kit's finish: an ink outline, bloom on fire and souls, smoke in the
// void, vignette and grain. The fires light in a wave out from the gate on load.

export type WorldAd = { id: string; campaign: string; alt: string; src: string };
export type WorldOpts = { progress: () => number; ads: WorldAd[]; small: boolean; still: boolean; bare: boolean; dim: boolean; open: (id: string) => void; enter: () => void; ready: () => void };

export function mount(host: HTMLElement, o: WorldOpts) {
  const dpr = Math.min(window.devicePixelRatio || 1, o.still ? 2 : o.small ? 1.25 : 1.75);
  const S = shared();
  const b = bag();
  const scene = new THREE.Scene();
  scene.background = INK;
  const camera = isoCamera();
  const { mk, palette } = painter(S, b);
  const m: Mats = {
    ...palette,
    court: mk("#504a46", { k: "floor", rect: [COURT.x0, COURT.z0, COURT.x1, COURT.z1], border: 2.4, tile: 2.6 }),
    hall: mk("#4b4541", { k: "floor", rect: [HALL.x0, HALL.z0, HALL.x1 + 22, HALL.z1], border: 2.2, tile: 2.4 }),
    orch: mk("#1c1817", { k: "ring", c: [THEATRE.c.x, THEATRE.c.z], r: THEATRE.r, border: 2.4, tile: 2.6 }),
    land: mk("#47413d", { k: "floor", rect: [LAND.c.x - LAND.half, LAND.c.z - LAND.half, LAND.c.x + LAND.half, LAND.c.z + LAND.half], border: 1.8, tile: 2.2 }),
  };

  const B = new Batch();
  const world = buildMap(B, m);
  const hall = buildHall({ B, m, scene, geos: b.geos, mats: b.mats, time: S.time, n: o.ads.length, pitch: PITCH });
  B.build(scene, b.geos);
  const fires: Fire[] = [...world.fires, ...hall.fires];
  const door = world.door;

  // light: a cool sky and warm ground for the shadows, one warm key that casts, and the fires (in the shader)
  scene.add(new THREE.HemisphereLight("#7c9088", "#1a110c", 1.9));
  const key = new THREE.DirectionalLight("#ffcf9e", 2.0);
  const LDIR = new THREE.Vector3(-0.5, 1, 0.12).normalize();
  key.castShadow = true;
  key.shadow.mapSize.set(o.small ? 1024 : 2048, o.small ? 1024 : 2048);
  key.shadow.bias = -0.0004;
  key.shadow.normalBias = 0.05;
  key.shadow.camera.near = 1;
  key.shadow.camera.far = 260;
  scene.add(key, key.target);

  // the river of souls and the glow in the gate
  const riverMat = new THREE.ShaderMaterial({
    uniforms: { uTime: S.time, uSoul: { value: SOUL } },
    vertexShader: "varying vec3 vWP; void main() { vec4 w = modelMatrix * vec4(position, 1.0); vWP = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }",
    fragmentShader: `
      uniform float uTime; uniform vec3 uSoul; varying vec3 vWP;
      ${NOISE}
      void main() {
        float al = dot(vWP.xz, vec2(0.7071, -0.7071)), ac = dot(vWP.xz, vec2(0.7071, 0.7071)) - ${(LAND.c.x + LAND.c.z) * 0.7071 + 15};
        vec2 p = vec2(al * 0.035 - uTime * 0.09, ac * 0.42);
        float n = fbm(p + vec2(0.0, fbm(p * 1.7 + uTime * 0.03) * 0.8));
        float s = fbm(vec2(al * 0.11 - uTime * 0.32, ac * 1.3) + n);
        float lanes = smoothstep(0.62, 0.7, s) * smoothstep(0.35, 0.6, n);
        float bank = smoothstep(13.0, 8.5, abs(ac));
        vec3 c = mix(vec3(0.006, 0.02, 0.03), vec3(0.02, 0.09, 0.12), smoothstep(0.3, 0.8, n));
        c += uSoul * (lanes * 1.1 + smoothstep(0.78, 0.95, s) * 0.6);
        c += uSoul * 0.25 * smoothstep(0.5, 0.0, abs(abs(ac) - 10.5)) * (0.5 + 0.5 * s);
        c *= mix(0.15, 1.0, bank);
        gl_FragColor = vec4(c, 1.0);
      }`,
  });
  b.mats.push(riverMat);
  const riverGeo = new THREE.PlaneGeometry(520, 26).rotateX(-Math.PI / 2).rotateY(Q);
  b.geos.push(riverGeo);
  const river = new THREE.Mesh(riverGeo, riverMat);
  river.position.copy(LAND.c).addScaledVector(DV, 15).setY(LAND.c.y - 1.7);
  scene.add(river);

  const glowMat = (c: THREE.Color, a: number) => {
    const g = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uC: { value: c }, uA: { value: a }, uTime: S.time },
      vertexShader: "varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
      fragmentShader: "uniform vec3 uC; uniform float uA, uTime; varying vec2 vUv; void main() { vec2 d = (vUv - vec2(0.5, 0.32)) * vec2(1.0, 0.7); float f = smoothstep(0.62, 0.0, length(d)); gl_FragColor = vec4(uC * (f * f * 1.4 + 0.25) * uA * (0.92 + 0.08 * sin(uTime * 1.7)), 1.0); }",
    });
    b.mats.push(g);
    return g;
  };
  const gateGlows: THREE.Mesh[] = [];
  for (const gl of world.glows) {
    const geo = new THREE.PlaneGeometry(gl.w, gl.h);
    b.geos.push(geo);
    const mesh = new THREE.Mesh(geo, glowMat(gl.soul ? SOUL : ACCENT, 1.2));
    mesh.matrixAutoUpdate = false;
    mesh.matrix.copy(gl.m);
    scene.add(mesh);
    if (gl.soul) gateGlows.push(mesh);
  }

  // fire, souls and motes; the ignition wave starts from the gate. Every fire but a lamp carries the kit's flame
  // (./kit/flame), lit by the same wave; a bare poster leaves the flames to CSS and marks where they stand.
  const F = fx(scene, S, b);
  const ign = F.u.ign;
  ign.value = o.still ? (o.dim ? -99 : 99) : -0.5;
  F.u.door.value.copy(door);
  const warm = fires.filter((f) => !f.soul && !f.lamp), cold = fires.filter((f) => f.soul && !f.lamp);
  const burning = fires.filter((f) => !f.lamp);
  const FL = flames(scene, o.bare ? [] : burning.map(flameOf), { lights: false, time: S.time, ppu: F.u.ppu, bag: b, gain: 1.4 });
  const motes = o.small ? 0.5 : 1;
  F.halos(warm, GLOW.glow);
  F.halos(cold, "#" + SOUL.getHexString(THREE.SRGBColorSpace));
  F.drift(Math.round(320 * motes), [70, 26, 70], 0.11, 1.1, GLOW.glow, 1.4, 0);
  F.drift(Math.round(120 * motes), [70, 20, 70], 0.42, 0.35, "#" + SOUL.getHexString(THREE.SRGBColorSpace), 0.42, 1);
  F.drift(Math.round(180 * motes), [60, 16, 60], 0.06, 0.08, "#b49a80", 0.35, 1);

  const v = view(host, (dt, fresh) => tick(dt, fresh), { dpr });
  const renderer = v.renderer;
  const canvas = v.canvas;
  const P = post(renderer, S, b, { small: o.small, still: o.still, flat: false });

  // camera: the five shots (gate, hall in, hall out, theatre, landing), eased between, with a pull back mid-move
  const shots: Shot[] = [
    { t: new THREE.Vector3(0, COURT.y + 3, 0).addScaledVector(UP, 12), h: 56, w: 70, floor: COURT.y },
    hall.shots[0],
    hall.shots[1],
    { t: THEATRE.c.clone().add(new THREE.Vector3(-1, 1.5, -1)), h: 56, w: 74, floor: THEATRE.c.y },
    { t: SIGN.clone().add(new THREE.Vector3(0, 5.3, 0)).addScaledVector(UP, -3), h: 28, w: 40, floor: LAND.c.y },
  ];
  const want = new THREE.Vector3(), cur = shots[0].t.clone();
  let wantH = shots[0].h, curH = shots[0].h, wantW = shots[0].w, curW = shots[0].w, floorY = COURT.y;
  const ptr = { x: 0, y: 0, tx: 0, ty: 0, moved: false, cx: -1, cy: -1, over: false, mouse: false };

  // ad textures and captions, loaded after first paint, nearest the hall's start first
  const family = getComputedStyle(host).fontFamily;
  let gone = false;
  const caption = (a: WorldAd) => {
    const cv = document.createElement("canvas");
    cv.width = 1024;
    cv.height = 200;
    const g = cv.getContext("2d")!;
    g.fillStyle = "#17110d";
    g.fillRect(0, 0, 1024, 200);
    g.fillStyle = "#f4eadb";
    g.font = "700 96px " + family;
    g.fillText(a.campaign, 40, 112, 944);
    const line = a.alt.split(". ")[0].replace(/\.$/, "");
    g.fillStyle = "#cdb89c";
    g.font = "600 42px " + family;
    g.fillText(line.length > 40 ? line.slice(0, 39) + "…" : line, 42, 172, 940);
    const t = new THREE.CanvasTexture(cv);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    b.texs.push(t);
    return t;
  };
  const loader = new THREE.TextureLoader();
  const queue = [...hall.slots];
  const pump = () => {
    const s = queue.shift();
    if (!s || gone) return;
    const a = o.ads[s.i];
    loader.load(
      "/_next/image?url=" + encodeURIComponent(a.src) + "&w=750&q=75",
      (t) => {
        if (gone) return t.dispose();
        t.colorSpace = THREE.SRGBColorSpace;
        t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
        b.texs.push(t);
        s.ad(t);
        pump();
      },
      undefined,
      () => pump(),
    );
  };
  document.fonts.ready.then(() => !gone && hall.slots.forEach((s) => s.cap(caption(o.ads[s.i]))));
  for (let i = 0; i < 4; i++) pump();

  // painted texture slots (public/world/tex/manifest.json), triplanar, multiplying the procedural colour
  const slotMats: Record<string, THREE.Material[]> = { stone: [m.stone, m.pale, m.trim], floor: [m.court, m.hall, m.land], rock: [m.rock], wood: [m.wood] };
  fetch("/world/tex/manifest.json")
    .then((r) => (r.ok ? r.json() : {}))
    .then((j: Record<string, string | null>) => {
      for (const [k, file] of Object.entries(j)) {
        if (!file || !slotMats[k] || gone) continue;
        new THREE.TextureLoader().load("/world/tex/" + file, (t) => {
          if (gone) return t.dispose();
          t.colorSpace = THREE.SRGBColorSpace;
          t.wrapS = t.wrapT = THREE.RepeatWrapping;
          b.texs.push(t);
          slotMats[k].forEach((mm) => setMap(mm, t));
        });
      }
    })
    .catch(() => {});

  // pointer: a sway of the camera, a witch-light in the accent that follows a mouse over the floor, and the ads and the
  // gate answering it. Hover lifts, tilts and lights a banner's border in the accent and brightens the gate; a press
  // knocks the banner on its rod, or flares the gate and walks into the hall. Every answer is a spring. Touch gets the
  // press and a short light-up on tap, not the hover or the witch-light.
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const picks: THREE.Object3D[] = [...hall.slots.map((s) => s.pick), ...gateGlows];
  const GATE = hall.slots.length;
  const mine = () => canvas.parentElement === host;
  const pick = (x: number, y: number) => {
    const r = canvas.getBoundingClientRect();
    ndc.set(((x - r.left) / r.width) * 2 - 1, -((y - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const h = ray.intersectObjects(picks, false)[0];
    return h ? Math.min(GATE, picks.indexOf(h.object)) : -1;
  };
  type Spring = { x: number; v: number };
  const spring = (s: Spring, to: number, dt: number, k: number, z: number) => {
    s.v += (k * (to - s.x) - 2 * z * Math.sqrt(k) * s.v) * dt;
    s.x += s.v * dt;
  };
  const hover = hall.slots.map(() => ({ x: 0, v: 0 })), knock = hall.slots.map(() => ({ x: 0, v: 0 }));
  const gate = { x: 0, v: 0 }, flare = { x: 0, v: 0 }, hand = { x: 0, v: 0 };
  const hp = new THREE.Vector3(), hv = new THREE.Vector3(), hd = new THREE.Vector3();
  let hot = -1, tap = -1, tapT = 0;
  const move = (e: PointerEvent) => {
    ptr.tx = (e.clientX / innerWidth) * 2 - 1;
    ptr.ty = -((e.clientY / innerHeight) * 2 - 1);
    ptr.cx = e.clientX;
    ptr.cy = e.clientY;
    ptr.mouse = e.pointerType !== "touch";
    ptr.over = e.target === canvas && mine();
    ptr.moved = true;
  };
  const down = (e: PointerEvent) => {
    if (e.target !== canvas || !mine() || o.still) return;
    const j = pick(e.clientX, e.clientY);
    if (j < 0) return;
    if (j < GATE) knock[j].v += 7;
    else flare.v += 22;
    if (e.pointerType === "touch") (tap = j), (tapT = S.time.value);
  };
  const click = (e: MouseEvent) => {
    if (e.target !== canvas || !mine()) return;
    const j = pick(e.clientX, e.clientY);
    if (j < 0) return;
    if (j < GATE) o.open(o.ads[hall.slots[j].i].id);
    else o.enter();
  };
  addEventListener("pointermove", move, { passive: true });
  addEventListener("pointerdown", down, { passive: true });
  addEventListener("click", click);

  // a fire lights when the ignition wave reaches it, with a flare
  const lit = (f: Fire) => {
    const d = 0.15 + f.p.distanceTo(door) / 26;
    const x = Math.min(1, Math.max(0, (ign.value - d) / 0.45));
    return 0.08 + 0.92 * x * (1 + 0.7 * Math.exp(-Math.max(0, ign.value - d - 0.45) * 3));
  };

  const unroll: number[] = [];
  let shown = false, shadowH = 0;
  const shadowAt = new THREE.Vector3(1e9, 0, 0);
  const p0 = new THREE.Vector3(), off = new THREE.Vector2();
  const smoother = (f: number) => f * f * f * (f * (f * 6 - 15) + 10);
  function tick(dt: number, fresh: boolean) {
    S.time.value += dt;
    if (!o.still) ign.value += dt;
    const p = Math.min(4, Math.max(0, o.progress()));
    const i = Math.min(3, Math.floor(p));
    const f = i === 1 ? p - i : smoother(p - i);
    const A = shots[i], Z = shots[i + 1];
    want.lerpVectors(A.t, Z.t, f);
    wantH = A.h + (Z.h - A.h) * f + (i === 1 ? 0 : Math.sin(Math.PI * f) * 10);
    wantW = A.w + (Z.w - A.w) * f;
    const [W, H] = v.size();
    if (W / H < 0.8) {
      wantW = Math.min(wantW, 40) - 10 * (i === 0 ? 1 - f : 0);
      want.addScaledVector(UP, -3.5 * (i === 0 ? 1 - f : 0));
    }
    const intro = Math.min(1, Math.max(0, (ign.value - 0.3) / 3.2));
    wantH -= (1 - Math.pow(1 - intro, 3)) * 3 * Math.max(0, 1 - p * 2);
    floorY = A.floor + (Z.floor - A.floor) * f;
    if (!o.still) {
      ptr.x += (ptr.tx - ptr.x) * (1 - Math.exp(-dt * 2.5));
      ptr.y += (ptr.ty - ptr.y) * (1 - Math.exp(-dt * 2.5));
      want.addScaledVector(RV, ptr.x * 0.5).addScaledVector(UP, ptr.y * 0.3);
    }
    const k = o.still ? 1 : 1 - Math.exp(-dt * 6);
    cur.lerp(want, k);
    curH += (wantH - curH) * k;
    curW += (wantW - curW) * k;
    const vh = aim(camera, cur, curH, curW, W / H);
    F.u.ppu.value = (H * dpr) / vh;
    F.u.center.value.copy(cur);
    lightFires(S, fires, cur, lit);
    if (!o.bare) for (let j = 0; j < burning.length; j++) FL.level(j, lit(burning[j]));

    if (ptr.moved && ptr.over && ptr.mouse) {
      ptr.moved = false;
      hot = pick(ptr.cx, ptr.cy);
      canvas.style.cursor = hot >= 0 ? "pointer" : "";
      const t = (floorY + 1.6 - ray.ray.origin.y) / ray.ray.direction.y;
      p0.copy(ray.ray.origin).addScaledVector(ray.ray.direction, t);
    } else if (!ptr.over) hot = -1;
    if (tap >= 0 && S.time.value - tapT > 0.35) tap = -1;
    const focus = Number((document.activeElement as HTMLElement | null)?.dataset?.ad ?? -1);
    hall.slots.forEach((s: Slot, j) => {
      spring(hover[j], j === hot || j === tap || s.i === focus ? 1 : 0, dt, 260, 0.6);
      spring(knock[j], 0, dt, 160, 0.22);
      s.hot(hover[j].x, knock[j].x);
      if (o.still) return s.drop(1);
      if (!unroll[j] && s.pos.distanceTo(cur) < 30) unroll[j] = S.time.value + 0.12 * (j % 4);
      const u = unroll[j] ? Math.min(1, Math.max(0, (S.time.value - unroll[j]) / 0.9)) : 0;
      s.drop(1 - Math.pow(1 - u, 3));
    });
    spring(gate, hot === GATE || tap === GATE ? 1 : 0, dt, 200, 0.7);
    spring(flare, 0, dt, 90, 0.9);
    for (const g of gateGlows) (g.material as THREE.ShaderMaterial).uniforms.uA.value = 1.2 + 0.6 * gate.x + 0.5 * flare.x;
    spring(hand, ptr.over && ptr.mouse && !o.still ? 1 : 0, dt, 120, 1);
    if (hand.x < 0.02) hp.copy(p0), hv.set(0, 0, 0);
    hv.addScaledVector(hd.subVectors(p0, hp), 140 * dt).multiplyScalar(Math.max(0, 1 - 2 * Math.sqrt(140) * dt));
    hp.addScaledVector(hv, dt);
    S.fl.value[NL - 1].set(hp.x, hp.y, hp.z, 0.001 + 8 * Math.max(0, hand.x));
    S.fc.value[NL - 1].set(GLOW.fire[0] * 0.55, GLOW.fire[1] * 0.55, GLOW.fire[2] * 0.55);

    if (fresh || shadowAt.distanceTo(cur) > 1.5 || Math.abs(shadowH - vh) > vh * 0.08) {
      shadowAt.copy(cur);
      shadowH = vh;
      const ext = vh * 1.25 + 8;
      const sc = key.shadow.camera;
      sc.left = -ext;
      sc.right = ext;
      sc.top = ext;
      sc.bottom = -ext;
      sc.updateProjectionMatrix();
      key.target.position.copy(cur);
      key.position.copy(cur).addScaledVector(LDIR, 120);
      key.target.updateMatrixWorld();
      key.updateMatrixWorld();
      renderer.shadowMap.needsUpdate = true;
    }

    P.render(scene, camera, vh, off.set(cur.dot(RV) / vh, cur.dot(UP) / vh));
    if (!shown) {
      shown = true;
      if (o.bare) host.dataset.marks = JSON.stringify(marks(camera, burning.map(flameOf)));
      o.ready();
    }
  }
  scene.updateMatrixWorld(true);

  return () => {
    gone = true;
    v.stop();
    removeEventListener("pointermove", move);
    removeEventListener("pointerdown", down);
    removeEventListener("click", click);
    drop(b);
  };
}
