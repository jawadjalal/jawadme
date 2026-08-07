"use client";

// jawadOS — the personal homepage, desktop variant.
//
// Same machine as /design (a CRT on a desk, scrolled through rather than
// clicked around) with different software loaded: this one is about him, not
// about hiring him. Four windows instead of five — Me, Experience, Writing and
// Contact — so every zone threshold, cursor waypoint and nav index here is
// derived for four, not copied from RoomDesktop.
//
// The scene markup lives in src/app/design/scene/SceneHomeDesktop.tsx
// (generated from design/templates/home-desktop.html). This class owns
// everything imperative: the scroll-driven camera, the OS cursor that walks
// itself to whatever is about to open, the per-zone palette, and the newsletter
// form.
//
// Almost nothing goes through React state on purpose. Scroll and pointer work
// writes CSS custom properties straight onto the room element, so a 60fps scene
// never re-renders 1200 nodes.

import { Component } from "react";
import { SceneHomeDesktop } from "./scene/SceneHomeDesktop";
import { ROLES, VENTURES, WEB_WORK, SOCIALS, PROFILE } from "@/lib/content";

type Props = { accent?: string };
type SubState = "idle" | "pending" | "ok" | "error";
type State = {
  sound: boolean;
  clock: string;
  tip: string;
  sub: SubState;
  subError: string;
};

// Four zones, evenly split. Everything downstream — pointer-events, nav
// highlight, palette, cursor path, dock jumps — reads these and only these.
const ZONES = 4;
const EDGES = [0.25, 0.5, 0.75];
const zoneOf = (p: number) => {
  let z = 0;
  while (z < EDGES.length && p >= EDGES[z]) z++;
  return z;
};
// Middle of each zone: where a nav or dock click should land you.
const CENTRES = [0.1, 0.36, 0.62, 0.88];

// Per-zone wallpaper. The sky shifts hue as you travel; nothing else moves.
const LOOKS = [
  { top: "#0b0d0b", mid: "#121a13", bot: "#1f2e20", sun: "#7ac274", star: 0.9, cloud: 0.14, lit: 0.9,
    far: "#1a231b", near: "#0f1411", river: "#0c1210", rlit: "#2b4130", emb: "#0a0e0b", fore: "#080b09", flit: "#131a14" },
  { top: "#0b0a0f", mid: "#15131e", bot: "#272138", sun: "#a79ade", star: 0.9, cloud: 0.14, lit: 0.9,
    far: "#1d1a2a", near: "#111019", river: "#0f0e17", rlit: "#302a47", emb: "#0b0a10", fore: "#09080d", flit: "#15131c" },
  { top: "#100c08", mid: "#1c170f", bot: "#302514", sun: "#e0b263", star: 0.9, cloud: 0.14, lit: 0.9,
    far: "#241d12", near: "#15110a", river: "#130f08", rlit: "#3d3017", emb: "#0e0b06", fore: "#0b0905", flit: "#181308" },
  { top: "#090d0f", mid: "#101a1e", bot: "#1b3036", sun: "#6fc0c7", star: 0.9, cloud: 0.14, lit: 0.9,
    far: "#172327", near: "#0d1416", river: "#0b1214", rlit: "#243f46", emb: "#070c0d", fore: "#060a0b", flit: "#111919" },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default class RoomHome extends Component<Props, State> {
  state: State = { sound: false, clock: "", tip: "", sub: "idle", subError: "" };

  room: HTMLElement | null = null;
  world: HTMLElement | null = null;
  worldWrap: HTMLElement | null = null;
  screen: HTMLElement | null = null;
  iSub: HTMLInputElement | null = null;

  private cx = 720;
  private cy = 660;
  private vx = 0;
  private vy = 0;
  private mx: number | null = null;
  private my = 0;
  private tx = 0;
  private ty = 0;
  private rx = 0;
  private ry = 0;
  private p = 0;
  private mouseOwned = false;
  private overText = false;
  private typing = false;
  private queued = false;
  private looping = false;
  private raf = 0;
  private zone: number | null = null;
  // Read once on mount. The camera tilt and the self-walking cursor are driven
  // from a rAF loop writing transforms, which no CSS media query can reach — so
  // honouring prefers-reduced-motion has to happen here.
  private reduced = false;
  private clockTimer?: ReturnType<typeof setInterval>;
  private settleTimer?: ReturnType<typeof setTimeout>;
  private ac?: AudioContext;
  private onScroll?: () => void;
  private onResize?: () => void;
  private onMove?: (e: MouseEvent) => void;
  private onDown?: () => void;

  // ── lifecycle ──────────────────────────────────────────────────────────────

  componentDidMount() {
    this.cx = 720;
    this.cy = 700;
    this.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (this.reduced && this.room) {
      // No self-walking sprite to stand in for the pointer, so give the real
      // one back rather than leaving the room with no cursor at all.
      this.room.style.cursor = "auto";
      this.room.style.setProperty("--sprite", "0");
    }
    this.applyTheme();
    this.tickClock();
    this.clockTimer = setInterval(() => this.tickClock(), 20000);

    this.onScroll = () => {
      this.ensureLoop();
      this.readScroll(); // sync, so the scene is never stale if rAF is throttled
      if (this.queued) return;
      this.queued = true;
      requestAnimationFrame(() => this.readScroll());
    };
    window.addEventListener("scroll", this.onScroll, { passive: true });

    this.onResize = () => this.fit();
    window.addEventListener("resize", this.onResize, { passive: true });

    // The real mouse wins the moment it moves; the OS cursor eases to it.
    this.onMove = (e: MouseEvent) => {
      const w = this.world;
      if (!w || !this.room) return;
      const r = w.getBoundingClientRect();
      // rect is the tilted bounding box, so scale off the known fit instead
      const s = parseFloat(getComputedStyle(this.room).getPropertyValue("--fit")) || 1;
      this.mx = w.offsetWidth / 2 + (e.clientX - (r.left + r.width / 2)) / s;
      this.my = w.offsetHeight / 2 + (e.clientY - (r.top + r.height / 2)) / s;
      this.mouseOwned = true;
      const t = e.target as HTMLElement | null;
      this.overText = !!(t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA"));
      // the whole display tilts toward the pointer
      this.tx = (e.clientX / window.innerWidth - 0.5) * 2;
      this.ty = (e.clientY / window.innerHeight - 0.5) * 2;
      this.paint(); // never depend on the loop being alive
      this.ensureLoop();
    };
    window.addEventListener("mousemove", this.onMove, { passive: true });

    this.onDown = () => this.press();
    window.addEventListener("mousedown", this.onDown);

    this.fit();
    this.readScroll();
    this.ensureLoop();
  }

  componentDidUpdate() {
    this.applyTheme();
    this.ensureLoop();
  }

  componentWillUnmount() {
    clearTimeout(this.settleTimer);
    clearInterval(this.clockTimer);
    this.looping = false;
    cancelAnimationFrame(this.raf);
    if (this.onScroll) window.removeEventListener("scroll", this.onScroll);
    if (this.onResize) window.removeEventListener("resize", this.onResize);
    if (this.onMove) window.removeEventListener("mousemove", this.onMove);
    if (this.onDown) window.removeEventListener("mousedown", this.onDown);
  }

  // ── scene ──────────────────────────────────────────────────────────────────

  applyTheme() {
    const st = this.room;
    if (!st) return;
    const set = (k: string, v: string | number) => st.style.setProperty(k, String(v));
    set("--acc", this.props.accent ?? "#7ac274");

    const s = LOOKS[this.zone ?? 0];
    set("--sky-top", s.top); set("--sky-mid", s.mid); set("--sky-bot", s.bot);
    set("--sun", s.sun); set("--sun-op", 0); set("--star-op", s.star); set("--cloud-op", s.cloud);
    set("--city-far", s.far); set("--city-near", s.near);
    set("--river", s.river); set("--river-lit", s.rlit);
    set("--embank", s.emb); set("--fore", s.fore); set("--fore-lit", s.flit);
    set("--glow", s.sun);
    set("--lit", s.lit);
  }

  tickClock() {
    const d = new Date();
    this.setState({
      clock:
        String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0"),
    });
  }

  // Fit the 1502x962 room into the viewport.
  fit() {
    if (!this.room) return;
    const f = Math.min(1.04, this.room.clientWidth / 1700, this.room.clientHeight / 1120);
    this.room.style.setProperty("--fit", f.toFixed(3));
  }

  readScroll() {
    this.queued = false;
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const p = Math.min(1, Math.max(0, window.scrollY / max));
    if (Math.abs(p - this.p) > 0.0008) this.mouseOwned = false;
    this.p = p;
    const st = this.room;
    if (!st) return;
    st.style.setProperty("--p", p.toFixed(4));

    // Clicks belong to whichever window is actually on screen. The template's
    // opacity/scale clamps are tuned to the same edges, so the window that is
    // opaque is the window that is clickable.
    const z = zoneOf(p);
    for (let i = 0; i < ZONES; i++) st.style.setProperty("--pe" + i, i === z ? "auto" : "none");

    if (z !== this.zone) {
      this.zone = z;
      for (let i = 0; i < ZONES; i++) st.style.setProperty("--nav" + i, i === z ? "1" : "0");
      // A window closed by its dot stays closed only until you leave the zone.
      for (let i = 0; i < ZONES; i++) st.style.setProperty("--w" + i, "1");
      // Drives the [data-zone] reveal rules: arriving in a zone replays its
      // staggered content entrance rather than having it pop in fully formed.
      st.dataset.zone = String(z);
      this.applyTheme();
    }
  }

  // Where the OS cursor goes for a scroll position: to the dock tile of the
  // window that is about to open, then back into the content. Dock tile centres
  // for the four-tile dock are x = 588 / 676 / 764 / 852 at y = 802.
  target(p: number): [number, number, string] {
    const path: [number, number, number, string][] = [
      [0, 720, 660, ""], [0.05, 588, 802, "me"], [0.14, 620, 430, ""],
      [0.25, 676, 802, "experience"], [0.38, 760, 470, ""],
      [0.5, 764, 802, "writing"], [0.62, 980, 560, "subscribe"],
      [0.75, 852, 802, "contact"], [0.88, 420, 560, "download cv"],
      [1, 420, 560, "download cv"],
    ];
    for (let i = 0; i < path.length - 1; i++) {
      const a = path[i];
      const b = path[i + 1];
      if (p <= b[0] || i === path.length - 2) {
        const t = Math.min(1, Math.max(0, (p - a[0]) / (b[0] - a[0])));
        const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        return [a[1] + (b[1] - a[1]) * e, a[2] + (b[2] - a[2]) * e, t > 0.6 ? b[3] : a[3]];
      }
    }
    return [720, 660, ""];
  }

  // Self-healing: hot reloads and remounts can cancel the frame, so anything
  // that touches the scene re-arms it instead of assuming it is alive.
  ensureLoop() {
    // Reduced motion gets no continuous animation at all: paint once for
    // whatever just changed and stay idle.
    if (this.reduced) {
      this.paint();
      return;
    }
    if (this.looping) return;
    this.looping = true;
    this.loop();
  }

  loop = () => {
    if (!this.looping) return;
    this.raf = requestAnimationFrame(this.loop);
    this.paint();
  };

  paint() {
    const st = this.room;
    if (!st) return;
    let tx: number;
    let ty: number;
    let tip: string;
    if (this.mouseOwned && this.mx != null) {
      tx = this.mx;
      ty = this.my;
      tip = "";
      // the drawn cursor sits exactly where a click will land
      this.cx = tx;
      this.cy = ty;
      this.vx = 0;
      this.vy = 0;
    } else {
      const t = this.target(this.p);
      tx = t[0];
      ty = t[1];
      tip = t[2];
      if (!Number.isFinite(this.cx)) {
        this.cx = tx;
        this.cy = ty;
      }
      if (this.reduced) {
        // Snap rather than glide: the walk is the animation.
        this.cx = tx;
        this.cy = ty;
        this.vx = 0;
        this.vy = 0;
      } else {
        this.vx = this.vx * 0.74 + (tx - this.cx) * 0.15;
        this.vy = this.vy * 0.74 + (ty - this.cy) * 0.15;
        this.cx += this.vx;
        this.cy += this.vy;
      }
    }
    st.style.setProperty(
      "--sprite",
      this.reduced || this.overText || this.typing ? "0" : "1",
    );
    st.style.setProperty("--cx", this.cx.toFixed(1) + "px");
    st.style.setProperty("--cy", this.cy.toFixed(1) + "px");
    st.style.setProperty("--tip", tip ? "1" : "0");
    if (tip !== this.state.tip) this.setState({ tip });

    // eased tilt, so the display leans rather than snaps. Reduced motion holds
    // the display square on instead — this is the parallax that actually makes
    // people queasy, so it is the first thing to go.
    if (this.reduced) {
      this.rx = 0;
      this.ry = 0;
    } else {
      this.rx += (-this.ty * 5.5 - this.rx) * 0.07;
      this.ry += (this.tx * 7.5 - this.ry) * 0.07;
    }
    st.style.setProperty("--rx", this.rx.toFixed(2) + "deg");
    st.style.setProperty("--ry", this.ry.toFixed(2) + "deg");
  }

  press() {
    const st = this.room;
    if (!st) return;
    st.style.setProperty("--press", ".84");
    setTimeout(() => st.style.setProperty("--press", "1"), 110);
    this.click();
  }

  // Nav and dock both land here. Smooth so the jump reads as travel, not a cut,
  // and the OS cursor is handed back to the scripted path for the ride.
  jump(frac: number) {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const to = Math.round(max * frac);
    this.mouseOwned = false;
    const far = Math.abs(to - window.scrollY) > window.innerHeight * 0.4;
    window.scrollTo({ top: to, behavior: far && !this.reduced ? "smooth" : "auto" });
    clearTimeout(this.settleTimer);
    this.settleTimer = setTimeout(() => {
      this.readScroll();
      this.ensureLoop();
    }, 900);
    this.press();
  }

  closeWin(n: number) {
    if (this.room) this.room.style.setProperty("--w" + n, "0");
    this.click();
  }

  // ── sound ──────────────────────────────────────────────────────────────────

  click() {
    if (this.state.sound) this.tone(720, 0.06, "square", 0.05);
  }

  tone(freq: number, dur: number, type: OscillatorType, vol: number) {
    try {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ac = this.ac ?? new AC();
      const o = this.ac.createOscillator();
      const g = this.ac.createGain();
      o.type = type;
      o.frequency.value = freq;
      g.gain.value = vol;
      o.connect(g).connect(this.ac.destination);
      o.start();
      g.gain.exponentialRampToValueAtTime(0.0001, this.ac.currentTime + dur);
      o.stop(this.ac.currentTime + dur + 0.02);
    } catch {
      /* autoplay blocked, fine */
    }
  }

  // ── newsletter ─────────────────────────────────────────────────────────────

  // Same shape as design/useBrief.ts: validate here, post JSON, and treat any
  // non-2xx (including a 404 while the route is still being built) as a
  // readable error state rather than a crash.
  subscribe = () => {
    if (this.state.sub === "pending") return;
    const email = (this.iSub?.value ?? "").trim();
    this.press();
    if (!EMAIL_RE.test(email)) {
      this.setState({ sub: "error", subError: "That email will not reach anyone. Not even you." });
      this.iSub?.focus();
      return;
    }
    this.setState({ sub: "pending", subError: "" });
    void (async () => {
      try {
        const res = await fetch("/api/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, source: "home-desktop" }),
        });
        if (!res.ok) {
          const body = (await res.json().catch(() => null)) as { error?: string } | null;
          this.setState({
            sub: "error",
            subError: body?.error ?? "Could not sign you up (HTTP " + res.status + "). Try again.",
          });
          return;
        }
        if (this.iSub) this.iSub.value = "";
        this.setState({ sub: "ok", subError: "" });
      } catch {
        this.setState({ sub: "error", subError: "Network had other plans. Try again." });
      }
    })();
  };

  onSubKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      this.subscribe();
      return;
    }
    if (this.state.sub !== "idle") this.setState({ sub: "idle", subError: "" });
  };

  onFieldFocus = () => { this.typing = true; this.mouseOwned = true; };
  onFieldBlur = () => { this.typing = false; };

  // ── values handed to the generated scene ───────────────────────────────────

  renderVals() {
    const sub = this.state.sub;
    return {
      refRoom: (el: HTMLElement | null) => {
        if (el && el !== this.room) {
          this.room = el;
          this.applyTheme();
          this.fit();
          this.ensureLoop();
        }
      },
      refWorldWrap: (el: HTMLElement | null) => { if (el) this.worldWrap = el; },
      refScreen: (el: HTMLElement | null) => { if (el) this.screen = el; },
      refWorld: (el: HTMLElement | null) => { if (el) this.world = el; },
      refSub: (el: HTMLInputElement | null) => { if (el) this.iSub = el; },

      clock: this.state.clock,
      cursorTip: this.state.tip,
      soundLabel: this.state.sound ? "Sound on" : "Sound off",
      toggleSound: () => this.setState((s) => ({ sound: !s.sound }), () => this.click()),

      jTop: () => this.jump(0),
      jMe: () => this.jump(CENTRES[0]),
      jWork: () => this.jump(CENTRES[1]),
      jWrite: () => this.jump(CENTRES[2]),
      jMail: () => this.jump(CENTRES[3]),
      close0: () => this.closeWin(0), close1: () => this.closeWin(1),
      close2: () => this.closeWin(2), close3: () => this.closeWin(3),

      subscribe: this.subscribe,
      onSubKey: this.onSubKey,
      onFieldFocus: this.onFieldFocus,
      onFieldBlur: this.onFieldBlur,
      subLabel: sub === "pending" ? "Sending…" : sub === "ok" ? "Subscribed" : "Subscribe",
      subOk: sub === "ok",
      subErr: sub === "error",
      subError: this.state.subError,

      ...contentVals(),
    };
  }

  render() {
    return (
      <div className="jos">
        <SceneHomeDesktop V={this.renderVals()} />
      </div>
    );
  }
}

// Everything the windows say about him comes from src/lib/content.ts. The two
// counted lines are derived from those lists rather than written down twice.
export function contentVals() {
  return {
    ventures: VENTURES,
    roles: ROLES,
    webWork: WEB_WORK,
    socials: SOCIALS,
    ventureCount: VENTURES.length + " of mine",
    roleCount: ROLES.length + " roles",
    builtLine: VENTURES.length + " ventures, " + ROLES.length + " roles",
    nowLine: VENTURES.length + " ventures, all mine",
    bio: PROFILE.bio,
    email: PROFILE.email,
    mailto: "mailto:" + PROFILE.email,
    cvHref: PROFILE.cv,
    cvFilename: PROFILE.cvFilename,
  };
}
