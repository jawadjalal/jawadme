"use client";

// jawadOS — mobile variant. A phone on a plinth rather than a CRT; the same
// scroll-zone model, minus the OS cursor (there is no pointer to fake).

import { Component } from "react";
import { SceneMobile } from "./scene/SceneMobile";
import { submitBrief } from "./useBrief";
import { ROLES, SOCIALS, PROFILE } from "@/lib/content";

type Props = { accent?: string };
type State = {
  clock: string;
  sent: boolean;
  words: number;
  ph: number;
  alert: string;
  tier: "single" | "edition" | null;
  picks: string[];
};

const PLACEHOLDERS = [
  "what are we building?",
  "the honest version, not the deck version",
  "who is it for, and what breaks today?",
  "one paragraph. i read all of it.",
];

const LOOKS = [
  { top: "#0b0d0b", mid: "#121a13", bot: "#1f2e20", sun: "#7ac274",
    far: "#1a231b", near: "#0f1411", river: "#0c1210", rlit: "#2b4130", emb: "#0a0e0b", fore: "#080b09", flit: "#131a14" },
  { top: "#0b0a0f", mid: "#15131e", bot: "#272138", sun: "#a79ade",
    far: "#1d1a2a", near: "#111019", river: "#0f0e17", rlit: "#302a47", emb: "#0b0a10", fore: "#09080d", flit: "#15131c" },
  { top: "#100c08", mid: "#1c170f", bot: "#302514", sun: "#e0b263",
    far: "#241d12", near: "#15110a", river: "#130f08", rlit: "#3d3017", emb: "#0e0b06", fore: "#0b0905", flit: "#181308" },
  { top: "#090d0f", mid: "#101a1e", bot: "#1b3036", sun: "#6fc0c7",
    far: "#172327", near: "#0d1416", river: "#0b1214", rlit: "#243f46", emb: "#070c0d", fore: "#060a0b", flit: "#111919" },
  { top: "#0d090f", mid: "#1a1220", bot: "#2e1c38", sun: "#c68ede",
    far: "#231a2a", near: "#140f19", river: "#110c17", rlit: "#392a47", emb: "#0d0910", fore: "#0a070d", flit: "#18111c" },
];

const TIERS = {
  single: { label: "The Single", p: 3000, d: 5 },
  edition: { label: "The Edition", p: 7200, d: 12 },
} as const;
const ADD: Record<string, { label: string; p: number; d: number }> = {
  cms: { label: "CMS", p: 1600, d: 3 },
  pages: { label: "Extra page", p: 900, d: 2 },
  motion: { label: "Motion pass", p: 2400, d: 4 },
  copy: { label: "Copy pass", p: 1200, d: 3 },
};

export default class RoomMobile extends Component<Props, State> {
  state: State = {
    clock: "", sent: false, words: 0, ph: 0, alert: "",
    tier: null, picks: [],
  };

  room: HTMLElement | null = null;
  iName: HTMLInputElement | null = null;
  iEmail: HTMLInputElement | null = null;
  iMsg: HTMLTextAreaElement | null = null;

  private tx = 0;
  private ty = 0;
  private rx = 0;
  private ry = 0;
  private p = 0;
  private nav: number | null = null;
  private queued = false;
  private looping = false;
  private raf = 0;
  private typing = false;
  private clockTimer?: ReturnType<typeof setInterval>;
  private phTimer?: ReturnType<typeof setInterval>;
  private settleTimer?: ReturnType<typeof setTimeout>;
  private onScroll?: () => void;
  private onResize?: () => void;
  private onMove?: (e: MouseEvent) => void;

  componentDidMount() {
    this.tickClock();
    this.clockTimer = setInterval(() => this.tickClock(), 20000);
    this.phTimer = setInterval(() => {
      if (this.state.words === 0 && !this.typing) this.setState((s) => ({ ph: s.ph + 1 }));
    }, 4200);

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
    clearInterval(this.phTimer);
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
    const s = LOOKS[this.nav ?? 0];
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
    const nav = p < 0.17 ? 0 : p < 0.39 ? 1 : p < 0.61 ? 2 : p < 0.83 ? 3 : 4;
    for (let i = 0; i < 5; i++) st.style.setProperty("--pe" + i, i === nav ? "auto" : "none");
    if (nav !== this.nav) {
      this.nav = nav;
      for (let i = 0; i < 5; i++) st.style.setProperty("--nav" + i, i === nav ? "1" : "0");
      st.dataset.zone = String(nav);
      this.applyTheme();
    }
  }

  ensureLoop() {
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
    window.scrollTo({ top: to, behavior: far ? "smooth" : "auto" });
    clearTimeout(this.settleTimer);
    this.settleTimer = setTimeout(() => this.readScroll(), 900);
  }

  onBody = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const words = e.target.value.trim() ? e.target.value.trim().split(/\s+/).length : 0;
    if (words !== this.state.words) this.setState({ words });
  };

  onKey = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); this.sendMail(); return; }
    if (e.key === "Enter" && (e.target as HTMLElement).tagName === "INPUT") {
      e.preventDefault();
      const order = [this.iName, this.iEmail, this.iMsg];
      const next = order[order.indexOf(e.target as HTMLInputElement) + 1];
      next?.focus();
    }
  };

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
      message: msg,
      tier: this.state.tier ?? undefined,
      addons: this.state.picks,
      variant: "mobile",
    });

    const st = this.room;
    if (st) {
      st.style.setProperty("--sent-s", ".05");
      st.style.setProperty("--sent-o", "0");
      st.style.setProperty("--badge", "1");
    }
    this.setState({ sent: true });
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

  machine() {
    const tier = this.state.tier;
    const picks = this.state.picks;
    const money = (n: number) => "$" + n.toLocaleString("en-US");

    let rangeText: string;
    let daysText: string;
    if (!tier) {
      rangeText = "$3,000 to $18,000";
      daysText = "5 to 20 days";
    } else {
      const t = TIERS[tier];
      const sub = t.p + picks.reduce((a, k) => a + ADD[k].p, 0);
      const days = t.d + picks.reduce((a, k) => a + ADD[k].d, 0);
      const slack = Math.max(0.05, 0.28 - 0.07 * picks.length);
      rangeText = money(sub) + " to " + money(Math.round((sub * (1 + slack)) / 50) * 50);
      daysText = days + " to " + (days + Math.ceil(days * slack * 1.4)) + " days";
    }

    const trayItems: { label: string }[] = [];
    if (tier) trayItems.push({ label: TIERS[tier].label });
    picks.forEach((k) => trayItems.push({ label: ADD[k].label }));

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
      rangeText, daysText,
      pickSingle: () => this.setState((s) => ({ tier: s.tier === "single" ? null : "single" })),
      pickEdition: () => this.setState((s) => ({ tier: s.tier === "edition" ? null : "edition" })),
      toggleCms: toggle("cms"),
      togglePages: toggle("pages"),
      toggleMotion: toggle("motion"),
      toggleCopy: toggle("copy"),
      resetMachine: () => this.setState({ tier: null, picks: [] }),
    };
  }

  // Site content (roles, socials, CV) rendered by the About and Work windows.
  contentVals() {
    return {
      roles: ROLES,
      roleCount: ROLES.length + " roles",
      socials: SOCIALS,
      cvHref: PROFILE.cv,
      cvFilename: PROFILE.cvFilename,
    };
  }

  renderVals() {
    return {
      refRoom: (el: HTMLElement | null) => {
        if (el && el !== this.room) {
          this.room = el;
          this.applyTheme();
          this.fit();
          this.ensureLoop();
        }
      },
      refName: (el: HTMLInputElement | null) => { if (el) this.iName = el; },
      refEmail: (el: HTMLInputElement | null) => { if (el) this.iEmail = el; },
      refMsg: (el: HTMLTextAreaElement | null) => { if (el) this.iMsg = el; },
      clock: this.state.clock,
      onKey: this.onKey,
      onBody: this.onBody,
      sendMail: this.sendMail,
      dismissAlert: this.dismissAlert,
      alertText: this.state.alert || "Something went sideways.",
      bodyPlaceholder: PLACEHOLDERS[this.state.ph % PLACEHOLDERS.length],
      judge: this.state.words === 0 ? ""
        : this.state.words < 8 ? "keep going"
        : this.state.words + " words",
      jTop: () => this.jump(0),
      jHome: () => this.jump(0.04),
      jAbout: () => this.jump(0.26),
      jWork: () => this.jump(0.49),
      jPrices: () => this.jump(0.7),
      jMail: () => { if (this.state.sent) this.unsend(); this.jump(0.93); },
      ...this.machine(),
      ...this.contentVals(),
    };
  }

  render() {
    return (
      <div className="jos">
        <SceneMobile V={this.renderVals()} />
      </div>
    );
  }
}
