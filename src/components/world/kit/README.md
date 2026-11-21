# World kit

Everything a route needs for its own 3D moment in the same world: the iso camera, the painted toon materials, the
props, fire light, particles, the ink-outline and bloom finish, one shared renderer, a React `Stage` with a poster
first paint, and a headless poster renderer. The home world (`../scene.ts`) and the route moments (`../../moments`) are
built on it; read `../../moments/mount.ts` as the smallest complete example. The footer (`../pillarScene.ts`) uses only
its Stage and view, around a baked GLB.

## A stage in four parts

1. **Page (React):** `<Stage load={() => import("./myScene").then((m) => m.mount)} poster={{ d: "/world/poster/x-d.webp", m: "/world/poster/x-m.webp" }} className="...">links, headings</Stage>`
   Poster first; the scene module (and three.js) loads only on a capable device, near the screen. `data-mode` is
   `poster` or `live`, `data-live` appears after the first frame. Gate: `./gate` (`?world=live|poster` overrides).
2. **Scene module:** `export function mount(host, { still, small, ready }) { ...; return dispose; }` using:
   - `bag()` / `drop(b)`: collect every geometry, material, texture and render target; free them on dispose.
   - `shared()`: time and the 16 fire-light slots all painted materials read.
   - `painter(S, b)` gives `{ mk, palette }`: `palette.stone | pale | dark | rock | bronze | wood | trim`, and
     `mk(color, kind)` for more (`{ k: "floor", rect: [x0, z0, x1, z1], border, tile }` carves flagstones and a running-key border).
   - `new Batch()`, `B.add(mat, geo, M(x, y, z, ry, scale))`, `B.build(scene, b.geos)`: static props, merged per material.
     Pieces: `box`, `column(h, r, broken)`, `lathe(BRAZIER | AMPHORA)`, `rock(w, d, depth)`, `stone(seed)`.
     Moving meshes: `prep(geo)` first (painted materials need its `aH` attribute).
   - `Fire` + `lightFires(S, fires, center)` every frame: up to 15 nearest fires light the paint.
   - `fx(scene, S, b)`: `flames(fires, soul)`, `halos(fires, color)`, `drift(n, box, size, up, color, alpha, soft)`; update `u.center` and `u.ppu` each frame.
   - `isoCamera()` + `aim(camera, target, h, w, aspect)` (returns the framed height `vh`); `Q`, `RV`, `DV`, `UP`, `COS` for placing things square to the viewer.
   - `view(host, frame, { dpr })`: the one renderer; `frame(dt, fresh)` runs only while this host is the most visible stage and the tab is shown (`fresh`: you just got the canvas, so redraw shadows).
   - `post(renderer, S, b, { small, still, flat })`: `render(scene, camera, vh)` draws with the ink outline, bloom and sky (`flat` = plain ink for pages). `u.uFade` fades to ink.
3. **Rules:** DPR at most 1.75 live (`small` 1.25, 2 when `still`); call `ready()` after the first frame; no second renderer.
4. **Poster:** `import { posters } from "./kit/posters.mjs"`; see the header of that file. Runs headless with SwiftShader; `CHROME=/usr/bin/google-chrome` on the boxes.
