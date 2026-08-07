"use client";

// jawadOS — the personal homepage, mobile variant. A phone on a plinth rather
// than a CRT; the same four-zone model as RoomHome, minus the OS cursor (there
// is no pointer to fake).

import { Component } from "react";
import { SceneHomeMobile } from "./scene/SceneHomeMobile";
import { contentVals } from "./RoomHome";

type Props = { accent?: string };
type SubState = "idle" | "pending" | "ok" | "error";
type State = { clock: string; sub: SubState; subError: string };

// Four zones, evenly split — same edges as the desktop room, and the same edges
// the template's opacity clamps are tuned to.
const ZONES = 4;
const EDGES = [0.25, 0.5, 0.75];
const zoneOf = (p: number) => {
  let z = 0;
  while (z < EDGES.length && p >= EDGES[z]) z++;
  return z;
};
const CENTRES = [0.1, 0.36, 0.62, 0.88];

const LOOKS = [
  { top: "#0b0d0b", mid: "#121a13", bot: "#1f2e20", sun: "#7ac274",
    far: "#1a231b", near: "#0f1411", river: "#0c1210", rlit: "#2b4130", emb: "#0a0e0b", fore: "#080b09", flit: "#131a14" },
  { top: "#0b0a0f", mid: "#15131e", bot: "#272138", sun: "#a79ade",
    far: "#1d1a2a", near: "#111019", river: "#0f0e17", rlit: "#302a47", emb: "#0b0a10", fore: "#09080d", flit: "#15131c" },
  { top: "#100c08", mid: "#1c170f", bot: "#302514", sun: "#e0b263",
    far: "#241d12", near: "#15110a", river: "#130f08", rlit: "#3d3017", emb: "#0e0b06", fore: "#0b0905", flit: "#181308" },
  { top: "#090d0f", mid: "#101a1e", bot: "#1b3036", sun: "#6fc0c7",
    far: "#172327", near: "#0d1416", river: "#0b1214", rlit: "#243f46", emb: "#070c0d", fore: "#060a0b", flit: "#111919" },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default class RoomHomeMobile extends Component<Props, State> {
  state: State = { clock: "", sub: "idle", subError: "" };

  room: HTMLElement | null = null;
  iSub: HTMLInputElement | null = null;

  private tx = 0;
  private ty = 0;
  private rx = 0;
  private ry = 0;
  private p = 0;
  private zone: number | null = null;
  private queued = false;
  private looping = false;
  private raf = 0;
  private reduced = false;
  private clockTimer?: ReturnType<typeof setInterval>;
  private settleTimer?: ReturnType<typeof setTimeout>;
  private onScroll?: () => void;
  private onResize?: () => void;
  private onMove?: (e: MouseEvent) => void;

  componentDidMount() {
    this.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.tickClock();
    this.clockTimer = setInterval(() => this.tickClock(), 20000);

    this.onScroll = () => {
      this.readScroll();
      if (this.queued) return;
      this.queued = true;
      requestAnimationFrame(() => this.readScroll());
    };
    window.addEventListener("scroll", this.onScroll, { passive: true });

    this.onResize = () => this.fit();
    window.addEventListener("resize", this.onResize, { passive: true });

    // the phone leans toward the pointer, eased in a frame loop
    this.onMove = (e: MouseEvent) => {
      this.tx = (e.clientX / window.innerWidth - 0.5) * 2;
      this.ty = (e.clientY / window.innerHeight - 0.5) * 2;
      this.ensureLoop();
    };
    window.addEventListener("mousemove", this.onMove, { passive: true });

    this.fit();
    this.applyTheme();
    this.readScroll();
    this.ensureLoop();
  }

  componentDidUpdate() {
    this.applyTheme();
  }

  componentWillUnmount() {
    clearInterval(this.clockTimer);
    clearTimeout(this.settleTimer);
    this.looping = false;
    cancelAnimationFrame(this.raf);
    if (this.onScroll) window.removeEventListener("scroll", this.onScroll);
    if (this.onResize) window.removeEventListener("resize", this.onResize);
    if (this.onMove) window.removeEventListener("mousemove", this.onMove);
  }

  tickClock() {
    const d = new Date();
    this.setState({
      clock:
        String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0"),
    });
  }

  // The phone is 462x964 plus tilt overhang, so leave real margin on both axes.
  fit() {
    if (!this.room) return;
    const f = Math.min(1.02, this.room.clientWidth / 620, this.room.clientHeight / 1090);
    this.room.style.setProperty("--fit", f.toFixed(3));
  }

  applyTheme() {
    const st = this.room;
    if (!st) return;
    const set = (k: string, v: string) => st.style.setProperty(k, v);
    const s = LOOKS[this.zone ?? 0];
    set("--sky-top", s.top); set("--sky-mid", s.mid); set("--sky-bot", s.bot);
    set("--city-far", s.far); set("--city-near", s.near);
    set("--river", s.river); set("--river-lit", s.rlit);
    set("--embank", s.emb); set("--fore", s.fore); set("--fore-lit", s.flit);
    set("--glow", s.sun);
    set("--acc", this.props.accent ?? "#7ac274");
  }

  readScroll() {
    this.queued = false;
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const p = Math.min(1, Math.max(0, window.scrollY / max));
    this.p = p;
    const st = this.room;
    if (!st) return;
    st.style.setProperty("--p", p.toFixed(4));
    const z = zoneOf(p);
    for (let i = 0; i < ZONES; i++) st.style.setProperty("--pe" + i, i === z ? "auto" : "none");
    if (z !== this.zone) {
      this.zone = z;
      for (let i = 0; i < ZONES; i++) st.style.setProperty("--nav" + i, i === z ? "1" : "0");
      st.dataset.zone = String(z);
      this.applyTheme();
    }
  }

  ensureLoop() {
    // Reduced motion holds the phone square on: no rAF loop at all.
    if (this.reduced) {
      const st = this.room;
      if (st) {
        st.style.setProperty("--rx", "0deg");
        st.style.setProperty("--ry", "0deg");
      }
      return;
    }
    if (this.looping) return;
    this.looping = true;
    this.loop();
  }

  loop = () => {
    if (!this.looping) return;
    const st = this.room;
    if (!st) {
      this.looping = false;
      return;
    }
    this.rx += (-this.ty * 5 - this.rx) * 0.07;
    this.ry += (this.tx * 8 - this.ry) * 0.07;
    st.style.setProperty("--rx", this.rx.toFixed(2) + "deg");
    st.style.setProperty("--ry", this.ry.toFixed(2) + "deg");
    this.raf = requestAnimationFrame(this.loop);
  };

  jump(frac: number) {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const to = Math.round(max * frac);
    const far = Math.abs(to - window.scrollY) > window.innerHeight * 0.4;
    window.scrollTo({ top: to, behavior: far && !this.reduced ? "smooth" : "auto" });
    clearTimeout(this.settleTimer);
    this.settleTimer = setTimeout(() => this.readScroll(), 900);
  }

  // ── newsletter ─────────────────────────────────────────────────────────────

  subscribe = () => {
    if (this.state.sub === "pending") return;
    const email = (this.iSub?.value ?? "").trim();
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
          body: JSON.stringify({ email, source: "home-mobile" }),
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
      refSub: (el: HTMLInputElement | null) => { if (el) this.iSub = el; },
      clock: this.state.clock,
      jTop: () => this.jump(0),
      jMe: () => this.jump(CENTRES[0]),
      jWork: () => this.jump(CENTRES[1]),
      jWrite: () => this.jump(CENTRES[2]),
      jMail: () => this.jump(CENTRES[3]),
      subscribe: this.subscribe,
      onSubKey: this.onSubKey,
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
        <SceneHomeMobile V={this.renderVals()} />
      </div>
    );
  }
}
