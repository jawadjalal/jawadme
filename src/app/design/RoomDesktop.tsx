"use client";

// jawadOS — desktop variant.
//
// The scene markup lives in src/app/design/scene/SceneDesktop.tsx (generated
// from design/templates/desktop.html). This class owns everything imperative:
// the scroll-driven camera, the OS cursor that walks itself to whatever is
// about to open, the per-zone palette, and the brief form.
//
// Almost nothing here goes through React state on purpose. Scroll and pointer
// work writes CSS custom properties straight onto the room element, so a
// 60fps scene never re-renders 1200 nodes. React state is reserved for things
// that genuinely change text.

import { Component } from "react";
import { SceneDesktop } from "./scene/SceneDesktop";
import { BootOverlay } from "./BootOverlay";
import { submitBrief } from "./useBrief";

type Props = { accent?: string };
type State = {
  sound: boolean;
  clock: string;
  tip: string;
  sent: boolean;
  scope: number;
  speed: number;
  band: number;
  words: number;
  ph: number;
  alert: string;
  tab: number;
  poke: number;
  tier: "single" | "edition" | null;
  picks: string[];
  booted: boolean;
};

const SCOPES = [
  { base: 1500, label: "one page" },
  { base: 3600, label: "a small site" },
  { base: 9000, label: "a full site" },
  { base: 14000, label: "a product" },
];
const SPEEDS = [
  { m: 1, label: "no rush" },
  { m: 1.15, label: "a few weeks" },
  { m: 1.6, label: "yesterday" },
];
const BANDS = [
  { range: "under $2k", joke: "ramen mode", ceil: 2000 },
  { range: "$2k to $5k", joke: "sensible", ceil: 5000 },
  { range: "$5k to $10k", joke: "now we are talking", ceil: 10000 },
  { range: "$10k and up", joke: "say less", ceil: 1e9 },
];
const PLACEHOLDERS = [
  "what are we building?",
  "the honest version, not the deck version",
  "who is it for, and what breaks today?",
  "one paragraph. i read all of it.",
];
const POKES = ["stop that", "i am working", "hire me instead", "that tickles", "still here"];

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

const TIERS = {
  single: { code: "A1", label: "The Single", p: 3000, d: 5 },
  edition: { code: "A2", label: "The Edition", p: 7200, d: 12 },
} as const;
const ADD: Record<string, { code: string; label: string; p: number; d: number }> = {
  cms: { code: "B1", label: "CMS", p: 1600, d: 3 },
  pages: { code: "B2", label: "Extra page", p: 900, d: 2 },
  motion: { code: "B3", label: "Motion pass", p: 2400, d: 4 },
  copy: { code: "B4", label: "Copy pass", p: 1200, d: 3 },
};

export default class RoomDesktop extends Component<Props, State> {
  state: State = {
    sound: false, clock: "", tip: "", sent: false, scope: 1, speed: 1, band: 1,
    words: 0, ph: 0, alert: "", tab: 0, poke: 0, tier: null, picks: [], booted: false,
  };

  room: HTMLElement | null = null;
  world: HTMLElement | null = null;
  worldWrap: HTMLElement | null = null;
  screen: HTMLElement | null = null;
  iName: HTMLInputElement | null = null;
  iEmail: HTMLInputElement | null = null;
  iLink: HTMLInputElement | null = null;
  iMsg: HTMLTextAreaElement | null = null;

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
  private nav: number | null = null;
  private clockTimer?: ReturnType<typeof setInterval>;
  private phTimer?: ReturnType<typeof setInterval>;
  private bootTimer?: ReturnType<typeof setTimeout>;
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
    this.applyTheme();
    this.tickClock();
    this.clockTimer = setInterval(() => this.tickClock(), 20000);
    this.phTimer = setInterval(() => {
      if (this.state.words === 0 && !this.typing) this.setState((s) => ({ ph: s.ph + 1 }));
    }, 4200);

    // The CRT warms up before the desktop is interactive.
    this.bootTimer = setTimeout(() => this.setState({ booted: true }), 1500);

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
    clearTimeout(this.bootTimer);
    clearTimeout(this.settleTimer);
    clearInterval(this.clockTimer);
    clearInterval(this.phTimer);
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
    const acc = this.props.accent ?? "#7ac274";
    set("--acc", acc);

    // configurator selection, kept in CSS vars so the markup stays static
    for (let i = 0; i < 4; i++) {
      set("--sc" + i, this.state.scope === i ? acc : "transparent");
      set("--sc" + i + "bg", this.state.scope === i ? "rgba(122,194,116,.16)" : "transparent");
    }
    for (let i = 0; i < 3; i++) {
      set("--tl" + i, this.state.speed === i ? acc : "transparent");
      set("--tl" + i + "bg", this.state.speed === i ? "rgba(122,194,116,.16)" : "transparent");
    }
    set("--bud-fill", (10 + this.state.band * 30).toFixed(1) + "%");
    set("--bud-thumb", (10 + this.state.band * 30).toFixed(1) + "%");

    const s = LOOKS[this.zone === 4 ? 0 : this.zone ?? 0];
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
    // clicks belong to whichever window is actually on screen
    st.style.setProperty("--pe1", p < 0.2 ? "auto" : "none");
    st.style.setProperty("--pe5", p >= 0.2 && p < 0.4 ? "auto" : "none");
    st.style.setProperty("--pe2", p >= 0.4 && p < 0.61 ? "auto" : "none");
    st.style.setProperty("--pe3", p >= 0.61 && p < 0.8 ? "auto" : "none");
    st.style.setProperty("--pe4", p >= 0.8 ? "auto" : "none");

    const nav = p < 0.2 ? 0 : p < 0.4 ? 1 : p < 0.61 ? 2 : p < 0.8 ? 3 : 4;
    if (nav !== this.nav) {
      this.nav = nav;
      for (let i = 0; i < 5; i++) st.style.setProperty("--nav" + i, i === nav ? "1" : "0");
      // Drives the [data-zone] reveal rules: arriving in a zone replays its
      // staggered content entrance rather than having it pop in fully formed.
      st.dataset.zone = String(nav);
    }
    const z = p < 0.2 ? 0 : p < 0.4 ? 4 : p < 0.61 ? 1 : p < 0.8 ? 2 : 3;
    if (z !== this.zone) {
      this.zone = z;
      for (let i = 1; i <= 5; i++) st.style.setProperty("--w" + i, "1");
      this.applyTheme();
    }
  }

  // Where the OS cursor goes for a scroll position: to the dock tile of the
  // window that is about to open, then back into the content.
  target(p: number): [number, number, string] {
    const path: [number, number, number, string][] = [
      [0, 720, 660, ""], [0.05, 544, 802, "home"], [0.14, 660, 420, ""],
      [0.2, 632, 802, "about"], [0.32, 760, 430, ""], [0.42, 720, 802, "work"],
      [0.52, 830, 430, "pan >>"], [0.62, 808, 802, "prices"], [0.72, 980, 460, ""],
      [0.8, 896, 802, "hire me"], [0.9, 420, 600, "send it"], [1, 420, 600, "send it"],
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
      this.vx = this.vx * 0.74 + (tx - this.cx) * 0.15;
      this.vy = this.vy * 0.74 + (ty - this.cy) * 0.15;
      this.cx += this.vx;
      this.cy += this.vy;
    }
    st.style.setProperty("--sprite", this.overText || this.typing ? "0" : "1");
    st.style.setProperty("--cx", this.cx.toFixed(1) + "px");
    st.style.setProperty("--cy", this.cy.toFixed(1) + "px");
    st.style.setProperty("--tip", tip ? "1" : "0");
    if (tip !== this.state.tip) this.setState({ tip });

    // eased tilt, so the display leans rather than snaps
    this.rx += (-this.ty * 5.5 - this.rx) * 0.07;
    this.ry += (this.tx * 7.5 - this.ry) * 0.07;
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
    window.scrollTo({ top: to, behavior: far ? "smooth" : "auto" });
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

  // ── form ───────────────────────────────────────────────────────────────────

  estimateValue() {
    return Math.round((SCOPES[this.state.scope].base * SPEEDS[this.state.speed].m) / 100) * 100;
  }

  setScope = (i: number) => { this.setState({ scope: i }); this.press(); };
  setSpeed = (i: number) => { this.setState({ speed: i }); this.press(); };

  onBudget = (e: React.MouseEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const t = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    this.setState({ band: Math.min(3, Math.round(t * 3)) });
    this.press();
  };

  onBody = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const words = e.target.value.trim() ? e.target.value.trim().split(/\s+/).length : 0;
    if (words !== this.state.words) this.setState({ words });
  };

  // Alerts are modal on purpose: you have to acknowledge being told off.
  yell = (line: string) => {
    this.setState({ alert: line });
    const st = this.room;
    if (!st) return;
    st.style.setProperty("--alert-o", "1");
    st.style.setProperty("--alert-pe", "auto");
    requestAnimationFrame(() => st.style.setProperty("--alert-s", "1"));
  };

  dismissAlert = () => {
    const st = this.room;
    if (st) {
      st.style.setProperty("--alert-o", "0");
      st.style.setProperty("--alert-pe", "none");
      st.style.setProperty("--alert-s", ".9");
    }
    this.setState({ alert: "" });
    this.press();
  };

  sendMail = () => {
    const name = (this.iName?.value ?? "").trim();
    const email = (this.iEmail?.value ?? "").trim();
    const msg = (this.iMsg?.value ?? "").trim();
    if (!name) { this.yell("A brief with no name on it. Bold."); this.iName?.focus(); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      this.yell("That email will not reach anyone. Not even you.");
      this.iEmail?.focus();
      return;
    }
    if (msg.split(/\s+/).filter(Boolean).length < 3) {
      this.yell("Three words minimum. I build sites, not tarot.");
      this.iMsg?.focus();
      return;
    }

    void submitBrief({
      name,
      email,
      link: (this.iLink?.value ?? "").trim() || undefined,
      message: msg,
      scope: SCOPES[this.state.scope].label,
      speed: SPEEDS[this.state.speed].label,
      band: BANDS[this.state.band].range,
      estimate: this.estimateValue(),
      tier: this.state.tier ?? undefined,
      addons: this.state.picks,
      variant: "desktop",
    });

    const st = this.room;
    if (st) {
      st.style.setProperty("--sent-s", ".05");
      st.style.setProperty("--sent-o", "0");
      st.style.setProperty("--badge", "1");
    }
    this.setState({ sent: true });
    this.press();
  };

  unsend = () => {
    const st = this.room;
    if (st) {
      st.style.setProperty("--sent-s", "1");
      st.style.setProperty("--sent-o", "1");
      st.style.setProperty("--badge", "0");
    }
    this.setState({ sent: false });
  };

  // Tab-ish flow between the fields; cmd/ctrl+enter fires it off.
  onKey = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); this.sendMail(); return; }
    if (e.key === "Escape") {
      [this.iName, this.iEmail, this.iLink, this.iMsg].forEach((el) => { if (el) el.value = ""; });
      this.setState({ words: 0 });
      (e.target as HTMLElement).blur();
      return;
    }
    if (e.key === "Enter" && (e.target as HTMLElement).tagName === "INPUT") {
      e.preventDefault();
      const order = [this.iName, this.iEmail, this.iLink, this.iMsg];
      const next = order[order.indexOf(e.target as HTMLInputElement) + 1];
      next?.focus();
    }
  };

  onFieldFocus = () => { this.typing = true; this.mouseOwned = true; };
  onFieldBlur = () => { this.typing = false; };

  setTab = (i: number) => { this.setState({ tab: i }); this.press(); };
  pokeIn = () => this.setState({ poke: 1 + Math.floor(Math.random() * POKES.length) });
  pokeOut = () => this.setState({ poke: 0 });

  // ── prices.app vending machine ─────────────────────────────────────────────

  machine() {
    const tier = this.state.tier;
    const picks = this.state.picks;
    const money = (n: number) => "$" + n.toLocaleString("en-US");

    let rangeText: string;
    let narrowNote: string;
    let daysText: string;
    if (!tier) {
      rangeText = "$3,000 to $18,000";
      narrowNote = "";
      daysText = "5 to 20 days";
    } else {
      const t = TIERS[tier];
      const sub = t.p + picks.reduce((a, k) => a + ADD[k].p, 0);
      const days = t.d + picks.reduce((a, k) => a + ADD[k].d, 0);
      const slack = Math.max(0.05, 0.28 - 0.07 * picks.length);
      rangeText = money(sub) + " to " + money(Math.round((sub * (1 + slack)) / 50) * 50);
      narrowNote = picks.length >= 3
        ? "About as tight as it gets before we talk."
        : "Add-ons narrow it further. Nothing here is padded.";
      daysText = days + " to " + (days + Math.ceil(days * slack * 1.4)) + " days";
    }

    const trayItems: { code: string; label: string }[] = [];
    if (tier) trayItems.push({ code: TIERS[tier].code, label: TIERS[tier].label });
    picks.forEach((k) => trayItems.push({ code: ADD[k].code, label: ADD[k].label }));

    const toggle = (k: string) => () =>
      this.setState((s) => ({
        picks: s.picks.indexOf(k) >= 0 ? s.picks.filter((x) => x !== k) : s.picks.concat([k]),
      }));

    return {
      selSingle: tier === "single",
      selEdition: tier === "edition",
      pCms: picks.indexOf("cms") >= 0,
      pPages: picks.indexOf("pages") >= 0,
      pMotion: picks.indexOf("motion") >= 0,
      pCopy: picks.indexOf("copy") >= 0,
      trayItems,
      trayEmpty: trayItems.length === 0,
      rangeText, narrowNote, daysText,
      machineStatus: trayItems.length === 0
        ? "Ready. Pick a plan."
        : trayItems.length + (trayItems.length === 1 ? " item" : " items") + " selected" +
          (tier ? "" : ". Still need a plan."),
      pickSingle: () => { this.setState((s) => ({ tier: s.tier === "single" ? null : "single" })); this.press(); },
      pickEdition: () => { this.setState((s) => ({ tier: s.tier === "edition" ? null : "edition" })); this.press(); },
      toggleCms: toggle("cms"),
      togglePages: toggle("pages"),
      toggleMotion: toggle("motion"),
      toggleCopy: toggle("copy"),
      resetMachine: () => { this.setState({ tier: null, picks: [] }); this.press(); },
    };
  }

  renderVals() {
    const t = this.state.tab;
    return {
      tabBio: () => this.setTab(0), tabStack: () => this.setTab(1),
      tabNow: () => this.setTab(2), tabRand: () => this.setTab(3),
      isBio: t === 0, isStack: t === 1, isNow: t === 2, isRand: t === 3,
      notBio: t !== 0, notStack: t !== 1, notNow: t !== 2,
      poked: !!this.state.poke,
      pokeLine: POKES[this.state.poke - 1] ?? "",
      pokeIn: this.pokeIn,
      pokeOut: this.pokeOut,
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
      refName: (el: HTMLInputElement | null) => { if (el) this.iName = el; },
      refEmail: (el: HTMLInputElement | null) => { if (el) this.iEmail = el; },
      refMsg: (el: HTMLTextAreaElement | null) => { if (el) this.iMsg = el; },
      refLink: (el: HTMLInputElement | null) => { if (el) this.iLink = el; },
      sendMail: this.sendMail,
      setScope0: () => this.setScope(0), setScope1: () => this.setScope(1),
      setScope2: () => this.setScope(2), setScope3: () => this.setScope(3),
      setSpeed0: () => this.setSpeed(0), setSpeed1: () => this.setSpeed(1),
      setSpeed2: () => this.setSpeed(2),
      onBudget: this.onBudget,
      onBody: this.onBody,
      onKey: this.onKey,
      onFieldFocus: this.onFieldFocus,
      onFieldBlur: this.onFieldBlur,
      dismissAlert: this.dismissAlert,
      alertText: this.state.alert || "Something went sideways.",
      bandRange: BANDS[this.state.band].range,
      bandJoke: BANDS[this.state.band].joke,
      estimate: "$" + (this.estimateValue() / 1000).toFixed(1).replace(".0", "") + "k",
      estimateNote: this.estimateValue() > BANDS[this.state.band].ceil
        ? "Over your band. We can cut pages, not corners."
        : SCOPES[this.state.scope].label + ", " + SPEEDS[this.state.speed].label + ".",
      judge: this.state.words === 0 ? ""
        : this.state.words < 8 ? "keep going"
        : this.state.words < 70 ? this.state.words + " words"
        : this.state.words + " words, I will read it all",
      bodyPlaceholder: PLACEHOLDERS[this.state.ph % PLACEHOLDERS.length],
      clock: this.state.clock,
      cursorTip: this.state.tip,
      soundLabel: this.state.sound ? "Sound on" : "Sound off",
      toggleSound: () => this.setState((s) => ({ sound: !s.sound }), () => this.click()),
      jTop: () => this.jump(0),
      jHello: () => this.jump(0.06),
      jAbout: () => this.jump(0.27),
      jWork: () => this.jump(0.47),
      jPrices: () => this.jump(0.68),
      jMail: () => { if (this.state.sent) this.unsend(); this.jump(0.91); },
      close1: () => this.closeWin(1), close2: () => this.closeWin(2),
      close3: () => this.closeWin(3), close4: () => this.closeWin(4),
      close5: () => this.closeWin(5),
      ...this.machine(),
    };
  }

  render() {
    return (
      <div className={this.state.booted ? "jos jos-booted" : "jos"}>
        <SceneDesktop V={this.renderVals()} />
        <BootOverlay label="jawadOS 1.0" hint="desktop" />
      </div>
    );
  }
}
