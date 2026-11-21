import * as THREE from "three";

// One WebGLRenderer for the page, however many stages it has. Each stage registers a view (its host element and its
// frame function); every animation frame the most visible view draws, and the canvas moves into its host if it is
// elsewhere. Nothing draws while no view is on screen or the tab is hidden.

type V = { host: HTMLElement; frame: (dt: number, fresh: boolean) => void; seen: number; dpr: number; step: number; acc: number };
let R: THREE.WebGLRenderer | null = null;
const views = new Set<V>();
let last = 0;
let owner: V | null = null;

function run() {
  last = performance.now();
  R?.setAnimationLoop(!document.hidden && [...views].some((v) => v.seen > 0) ? tick : null);
}

function tick() {
  const now = performance.now();
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  let best: V | null = null;
  for (const v of views) if (v.seen > (best?.seen ?? 0)) best = v;
  if (!best || !R) return;
  best.acc += dt;
  if (best.acc < best.step) return;
  const step = Math.min(0.05, best.acc);
  best.acc = 0;
  const fresh = owner !== best;
  owner = best;
  if (R.domElement.parentElement !== best.host) best.host.appendChild(R.domElement);
  if (R.getPixelRatio() !== best.dpr) R.setPixelRatio(best.dpr);
  const W = best.host.clientWidth || 1, H = best.host.clientHeight || 1;
  const s = R.getSize(new THREE.Vector2());
  if (s.x !== W || s.y !== H) R.setSize(W, H, false);
  best.frame(step, fresh);
}

/** Register a stage: `frame(dt, fresh)` runs each animation frame while this host is the most visible one (`fresh` when it has just taken the canvas), or at most `fps` times a second when given. */
export function view(host: HTMLElement, frame: (dt: number, fresh: boolean) => void, o: { dpr: number; fps?: number }) {
  if (!R) {
    R = new THREE.WebGLRenderer({ antialias: false, powerPreference: "high-performance" });
    R.outputColorSpace = THREE.SRGBColorSpace;
    R.shadowMap.enabled = true;
    R.shadowMap.type = THREE.PCFShadowMap;
    R.shadowMap.autoUpdate = false;
    R.domElement.style.cssText = "display:block;width:100%;height:100%";
    document.addEventListener("visibilitychange", run);
  }
  const renderer = R;
  const v: V = { host, frame, seen: 0, dpr: o.dpr, step: o.fps ? 1 / o.fps - 0.004 : 0, acc: 0 };
  views.add(v);
  const io = new IntersectionObserver(
    ([e]) => {
      v.seen = e.isIntersecting ? Math.max(0.001, e.intersectionRatio) : 0;
      run();
    },
    { threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] },
  );
  io.observe(host);
  return {
    renderer,
    canvas: renderer.domElement,
    size: () => [host.clientWidth || 1, host.clientHeight || 1] as const,
    stop() {
      views.delete(v);
      io.disconnect();
      if (owner === v) owner = null;
      if (renderer.domElement.parentElement === host) renderer.domElement.remove();
      run();
    },
  };
}
