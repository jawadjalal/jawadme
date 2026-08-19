"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Octopus, { OctopusState, usePrefersReducedMotion } from "./Octopus";

export type Morning = "worse" | "better";
export type Theme = "light" | "dark";
export type Motion = "full" | "calm";
type Phase = "report" | "dash" | "chat";

export type MorningReportProps = {
  morning?: Morning;
  theme?: Theme;
  motion?: Motion;
  background?: React.ReactNode;
  showControls?: boolean;
};

/** Unique keyframe/class prefix so nothing here can collide with the rest of the site. */
const K = "okMRpx";

const MONO = '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace';

type Vars = React.CSSProperties & Record<string, string | number>;

const THEMES: Record<Theme, Record<string, string>> = {
  light: {
    "--page": "#e7e4de",
    "--bg": "#fafaf9",
    "--edge": "#d8d3c9",
    "--fg": "#1a1919",
    "--body": "#463f39",
    "--muted": "#726a5a",
    "--muted2": "#8c8578",
    "--faint": "#b6afa1",
    "--faint2": "#c2bcb1",
    "--rule": "#e4ddcd",
    "--rule2": "rgba(228,221,205,.85)",
    "--rule3": "rgba(228,221,205,.7)",
    "--red": "#b30000",
    "--green": "#008f7a",
    "--arrow": "#c9c4ba",
    "--btnbg": "#000000",
    "--btnfg": "#ffffff",
  },
  dark: {
    "--page": "#0c0a09",
    "--bg": "#110f0e",
    "--edge": "#2a2622",
    "--fg": "#f3f0ec",
    "--body": "#d1cabc",
    "--muted": "#b6afa1",
    "--muted2": "#a39b8d",
    "--faint": "#6b6358",
    "--faint2": "#5c554b",
    "--rule": "#463f39",
    "--rule2": "rgba(70,63,57,.95)",
    "--rule3": "rgba(70,63,57,.8)",
    "--red": "#ff6666",
    "--green": "#5fd6c3",
    "--arrow": "#726a5a",
    "--btnbg": "#f3f0ec",
    "--btnfg": "#110f0e",
  },
};

const CSS = `
@keyframes ${K}Rise {
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: none; }
}
@keyframes ${K}Pulse {
  0%, 100% { opacity: .3; }
  50% { opacity: 1; }
}
.${K}-txt { background: transparent; border: 0; padding: 0; margin: 0; font: inherit; cursor: pointer; color: var(--muted); transition: color 180ms; }
.${K}-txt:hover { color: var(--fg); }
.${K}-pill { border: 0; cursor: pointer; font: inherit; background: var(--btnbg); color: var(--btnfg); transition: background 180ms; }
.${K}-pill:hover { background: var(--fg); }
.${K}-ctl { background: transparent; border: 0; cursor: pointer; font: inherit; transition: background 180ms, color 180ms; }
.${K}-ctl:not(.${K}-on):hover { color: var(--fg); }
`;

/** opacity:0 plus the shared rise animation, exactly as every animated element uses it. */
function rise(delay: number, dur = 520): React.CSSProperties {
  return {
    opacity: 0,
    animation: `${K}Rise ${dur}ms cubic-bezier(.2,.7,.3,1) ${delay}ms forwards`,
  };
}

/** Wraps every digit run in JetBrains Mono at the given size. */
function withMono(text: string, size: number, weight?: number): React.ReactNode[] {
  return text.split(/(\d+)/).map((part, i) =>
    /^\d+$/.test(part) ? (
      <span key={i} style={{ fontFamily: MONO, fontSize: size, fontWeight: weight }}>
        {part}
      </span>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    )
  );
}

/* ---------------------------------------------------------------- icons */

type IconProps = { size?: number; color?: string; width?: number };

function Svg({
  size = 20,
  color = "var(--muted)",
  width = 1.75,
  children,
}: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={width}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: "block", flex: "0 0 auto" }}
    >
      {children}
    </svg>
  );
}

const IconSearch = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </Svg>
);

const IconPencilBox = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.4 2.6a1.9 1.9 0 0 1 2.7 2.7l-8.9 8.9-3.5 1 1-3.5z" />
  </Svg>
);

const IconEye = (p: IconProps) => (
  <Svg {...p}>
    <path d="M2.06 12.35a1 1 0 0 1 0-.7 10.75 10.75 0 0 1 19.88 0 1 1 0 0 1 0 .7 10.75 10.75 0 0 1-19.88 0" />
    <circle cx="12" cy="12" r="3" />
  </Svg>
);

const IconCheck = (p: IconProps) => (
  <Svg {...p}>
    <path d="M20 6 9 17l-5-5" />
  </Svg>
);

const IconCheckCircle = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="10" />
    <path d="m9 12 2 2 4-4" />
  </Svg>
);

const IconTrendingUp = (p: IconProps) => (
  <Svg {...p}>
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
    <polyline points="16 7 22 7 22 13" />
  </Svg>
);

const IconTrendingDown = (p: IconProps) => (
  <Svg {...p}>
    <polyline points="22 17 13.5 8.5 8.5 13.5 2 6" />
    <polyline points="16 17 22 17 22 11" />
  </Svg>
);

const IconMessage = (p: IconProps) => (
  <Svg {...p}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </Svg>
);

const IconClock = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </Svg>
);

const IconRotateCcw = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
  </Svg>
);

const IconActivity = (p: IconProps) => (
  <Svg {...p}>
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </Svg>
);

const IconSun = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
  </Svg>
);

function IconX({ size = 18, color = "var(--body)" }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      style={{ display: "block", flex: "0 0 auto" }}
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

/* ------------------------------------------------------------ crossfade */

function Crossfade({ pre, post, on }: { pre: string; post: string; on: boolean }) {
  const sizer = pre.length >= post.length ? pre : post;
  const layer: React.CSSProperties = {
    position: "absolute",
    left: 0,
    top: 0,
    whiteSpace: "nowrap",
    transition: "opacity 300ms ease",
  };
  return (
    <span style={{ position: "relative", display: "inline-block" }}>
      <span style={{ visibility: "hidden" }}>{sizer}</span>
      <span style={{ ...layer, opacity: on ? 0 : 1 }}>{pre}</span>
      <span style={{ ...layer, opacity: on ? 1 : 0 }}>{post}</span>
    </span>
  );
}

/* ----------------------------------------------------------------- copy */

const DESC_159 =
  "Run Claude Code, Codex, Gemini and Grok side by side in real terminals on one canvas. Bring your own keys, chain agents together, and see what every run costs.";

const DESC_LIVE_HEAD =
  "AI agent orchestration for a fleet of coding agents, on one infinite canvas. Claude Code, Codex, Gemini and Grok run as real terminals; draw a line between two ";

const DESC_LIVE_CUT =
  "of them and one can command the other. Multi-agent coding with your own auth, and a meter that says what it costs.";

const PLAIN_HEADLINE: Record<Morning, string> = {
  worse: "8 people saw your newest page. None of them clicked.",
  better: "47 people saw that page this week. 3 of them clicked.",
};

const ASK_PLACEHOLDER: Record<Morning, string> = {
  worse: "Why did only 8 people see it?",
  better: "Why did only 47 people see it?",
};

/* ------------------------------------------------------------ component */

export default function MorningReport({
  morning: morningProp = "worse",
  theme: themeProp = "light",
  motion: motionProp = "full",
  background,
  showControls = true,
}: MorningReportProps) {
  const [phase, setPhase] = useState<Phase>("report");
  const [morningS, setMorningS] = useState<Morning | null>(null);
  const [motionS, setMotionS] = useState<Motion | null>(null);
  const [themeS, setThemeS] = useState<Theme | null>(null);
  const [stage, setStage] = useState<OctopusState>("asleep");
  const [mounted, setMounted] = useState(true);
  const [approved, setApproved] = useState(false);
  const [relaxed, setRelaxed] = useState(false);
  const [askOpen, setAskOpen] = useState(false);
  const [askValue, setAskValue] = useState("");
  const [question, setQuestion] = useState("");

  const reduced = usePrefersReducedMotion();

  // state -> props -> default
  const morning: Morning = morningS ?? morningProp;
  const theme: Theme = themeS ?? themeProp;
  const motionSet: Motion = motionS ?? motionProp;
  const motion: Motion = reduced ? "calm" : motionSet;

  const timers = useRef<number[]>([]);
  const clearTimers = useCallback(() => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  }, []);
  const after = useCallback((ms: number, fn: () => void) => {
    timers.current.push(window.setTimeout(fn, ms));
  }, []);

  const run = useCallback(() => {
    clearTimers();
    setStage("asleep");
    after(240, () => setStage("working"));
    after(1000, () => setStage("holding"));
  }, [clearTimers, after]);

  useEffect(() => {
    run();
    return clearTimers;
  }, [run, clearTimers]);

  const approve = useCallback(() => {
    setApproved(true);
    after(250, () => setRelaxed(true));
  }, [after]);

  const dismiss = useCallback(() => setPhase("dash"), []);

  const restart = useCallback(
    (patch: { morning?: Morning; motion?: Motion; theme?: Theme }) => {
      clearTimers();
      setMounted(false);
      setApproved(false);
      setRelaxed(false);
      setAskOpen(false);
      setAskValue("");
      setQuestion("");
      setPhase("report");
      if (patch.morning !== undefined) setMorningS(patch.morning);
      if (patch.motion !== undefined) setMotionS(patch.motion);
      if (patch.theme !== undefined) setThemeS(patch.theme);
      after(60, () => {
        setMounted(true);
        run();
      });
    },
    [clearTimers, after, run]
  );

  const submitAsk = useCallback(() => {
    const q = askValue.trim() || ASK_PLACEHOLDER[morning];
    setQuestion(q);
    setPhase("chat");
    setRelaxed(true);
  }, [askValue, morning]);

  const onReport = phase === "report";
  const worse = morning === "worse";

  const rootStyle: Vars = {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 20,
    width: 1520,
    padding: "40px 40px 72px",
    background: "var(--page)",
    ...THEMES[theme],
  };

  /* ------------------------------------------------------------ layers */

  const reportLayer: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    background: "var(--bg)",
    transition: "opacity 480ms ease, transform 560ms cubic-bezier(.4,0,.2,1)",
    ...(onReport
      ? { opacity: 1, transform: "none", pointerEvents: "auto" as const }
      : phase === "chat"
        ? { opacity: 0, transform: "translateY(-34px)", pointerEvents: "none" as const }
        : { opacity: 0, transform: "none", pointerEvents: "none" as const }),
  };

  const headCell: React.CSSProperties = {
    gridRow: 1,
    display: "flex",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: 20,
    paddingBottom: 13,
    borderBottom: "1px solid var(--fg)",
  };
  const headLabel: React.CSSProperties = { fontSize: 15, fontWeight: 600, color: "var(--fg)" };
  const headValue: React.CSSProperties = { fontSize: 15, fontWeight: 600 };
  const bodyCell: React.CSSProperties = {
    gridRow: 2,
    paddingTop: 14,
    paddingBottom: 16,
    borderBottom: "1px solid var(--rule)",
  };
  const bodyCopy: React.CSSProperties = { fontSize: 15, lineHeight: "24px" };
  const subNote: React.CSSProperties = {
    marginTop: 12,
    fontSize: 13,
    lineHeight: "19px",
    color: "var(--muted)",
  };
  const listRow: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 16,
    padding: "10px 0",
    borderBottom: "1px solid var(--rule2)",
  };
  const listText: React.CSSProperties = {
    fontSize: 18,
    lineHeight: "26px",
    color: "var(--body)",
  };
  const iconSlot: React.CSSProperties = {
    flex: "0 0 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const monoValue = (n: string, rest: string, color: string) => (
    <span style={{ ...headValue, color }}>
      <span style={{ fontFamily: MONO, fontSize: 14, fontWeight: 500 }}>{n}</span>
      {rest}
    </span>
  );

  /* ------------------------------------------------------------- rows */

  const rows: { icon: React.ReactNode; text: string }[] = worse
    ? [
        { icon: <IconSearch />, text: "The SEO agent found the cause. Your description runs to 274 characters." },
        { icon: <IconPencilBox />, text: "I rewrote it to 159 characters and it is ready for you." },
        { icon: <IconEye />, text: "Across the whole site that is 5 clicks in seven days." },
        { icon: <IconCheck color="var(--green)" width={1.9} />, text: "Nothing went live while you were asleep." },
      ]
    : [
        { icon: <IconTrendingUp color="var(--green)" width={1.9} />, text: "The rewrite you approved on Friday is doing its job." },
        { icon: <IconEye />, text: "That page took 47 impressions and 3 clicks." },
        { icon: <IconX />, text: "The X agent drafted 1 post overnight." },
        { icon: <IconCheck color="var(--green)" width={1.9} />, text: "Nothing went live while you were asleep." },
      ];

  const rowDelays = [240, 300, 360, 420];

  const tableRow = (label: string, oldV: string, newV: string, first: boolean) => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        ...(first
          ? { paddingBottom: 8, marginBottom: 8, borderBottom: "1px solid var(--rule3)" }
          : {}),
      }}
    >
      <span style={{ flex: 1, color: "var(--body)" }}>{label}</span>
      <span
        style={{
          width: 60,
          textAlign: "right",
          fontFamily: MONO,
          fontSize: 14,
          color: "var(--muted)",
        }}
      >
        {oldV}
      </span>
      <span style={{ width: 34, textAlign: "center", color: "var(--muted2)" }}>→</span>
      <span
        style={{
          width: 60,
          textAlign: "right",
          fontFamily: MONO,
          fontSize: 14,
          fontWeight: 500,
          color: "var(--green)",
        }}
      >
        {newV}
      </span>
    </div>
  );

  /* --------------------------------------------------------- controls */

  const ctlBase: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 7,
    fontSize: 12.5,
    fontWeight: 500,
    color: "var(--muted)",
    borderRadius: 9999,
    padding: "6px 13px",
  };
  const ctlOn: React.CSSProperties = {
    fontWeight: 600,
    background: "var(--fg)",
    color: "var(--page)",
  };
  const group: React.CSSProperties = {
    display: "flex",
    gap: 2,
    border: "1px solid var(--rule)",
    background: "var(--bg)",
    borderRadius: 9999,
    padding: 4,
  };

  const ctl = (
    on: boolean,
    icon: React.ReactNode,
    label: string,
    onClick: () => void
  ) => (
    <button
      type="button"
      className={`${K}-ctl${on ? ` ${K}-on` : ""}`}
      style={{ ...ctlBase, ...(on ? ctlOn : {}) }}
      onClick={onClick}
    >
      {icon}
      {label}
    </button>
  );

  const ctlIcon = (Cmp: (p: IconProps) => React.JSX.Element, on: boolean) => (
    <Cmp size={14} color={on ? "var(--page)" : "var(--muted)"} />
  );

  /* ----------------------------------------------------------- render */

  return (
    <div style={rootStyle}>
      <style>{CSS}</style>

      <div
        style={{
          position: "relative",
          width: 1440,
          height: 900,
          overflow: "hidden",
          background: "var(--bg)",
          border: "1px solid var(--edge)",
          borderRadius: 10,
          boxShadow: "0 2px 6px rgba(26,25,25,.06)",
          color: "var(--fg)",
        }}
      >
        {/* 1. background layer, in place of the Dashboard */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            transition: "opacity 620ms ease",
            opacity: onReport ? 0 : 1,
          }}
        >
          {background ?? (
            // Their real dashboard, captured 17 August. The note's whole claim is
            // that it appears once and then gets out of the way, so dismissing it
            // has to reveal the thing it was covering rather than an empty page.
            // The capture is 2880 wide, which is exactly 2x this 1440 screen.
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage: "url('/okara/shots/dashboard.png')",
                backgroundSize: "1440px 900px",
                backgroundPosition: "top left",
                backgroundRepeat: "no-repeat",
                backgroundColor: "var(--bg)",
              }}
            />
          )}
        </div>

        {/* 2. report layer */}
        <div style={reportLayer}>
          {mounted && (
            <div style={{ position: "absolute", left: 274, top: 96, width: 976 }}>
              <div style={{ fontSize: 16, color: "var(--muted)", ...rise(0) }}>
                Good morning, Jawad.
              </div>

              {/* headline */}
              <div
                style={{
                  fontSize: 38,
                  lineHeight: "48px",
                  fontWeight: 600,
                  letterSpacing: -1,
                  color: "var(--fg)",
                  ...rise(60),
                }}
              >
                {worse ? (
                  <>
                    <span
                      style={{
                        fontFamily: MONO,
                        fontSize: 35,
                        fontWeight: 500,
                        letterSpacing: -0.5,
                        color: "var(--red)",
                      }}
                    >
                      8
                    </span>{" "}
                    people saw your newest page. None of them clicked.
                  </>
                ) : (
                  <>
                    <span
                      style={{
                        fontFamily: MONO,
                        fontSize: 35,
                        fontWeight: 500,
                        letterSpacing: -0.5,
                        color: "var(--green)",
                      }}
                    >
                      47
                    </span>{" "}
                    people saw that page this week.{" "}
                    <span
                      style={{
                        fontFamily: MONO,
                        fontSize: 35,
                        fontWeight: 400,
                        letterSpacing: -0.5,
                        color: "var(--fg)",
                      }}
                    >
                      3
                    </span>{" "}
                    of them clicked.
                  </>
                )}
              </div>

              {/* diff grid */}
              <div
                style={{
                  marginTop: 42,
                  display: "grid",
                  gridTemplateColumns: "1fr 1px 1fr",
                  columnGap: 44,
                }}
              >
                <div style={{ gridColumn: 2, gridRow: "1 / span 2", background: "var(--rule)" }} />

                {/* left head */}
                <div style={{ ...headCell, gridColumn: 1, ...rise(120) }}>
                  <span style={headLabel}>
                    {worse ? <Crossfade pre="Live now" post="Replaced" on={approved} /> : "Live now"}
                  </span>
                  {worse
                    ? monoValue("274", " characters", "var(--red)")
                    : monoValue("159", " characters", "var(--green)")}
                </div>

                {/* right head */}
                <div style={{ ...headCell, gridColumn: 3, ...rise(150) }}>
                  <span style={headLabel}>
                    {worse ? (
                      <Crossfade pre="Ready for you" post="Live now" on={approved} />
                    ) : (
                      "What it did"
                    )}
                  </span>
                  {worse ? (
                    monoValue("159", " characters", "var(--green)")
                  ) : (
                    <span style={{ ...headValue, color: "var(--muted)" }}>Four days live</span>
                  )}
                </div>

                {/* left body */}
                <div style={{ ...bodyCell, gridColumn: 1, ...rise(180) }}>
                  {worse ? (
                    <>
                      <div style={{ ...bodyCopy, color: "var(--body)" }}>
                        {DESC_LIVE_HEAD}
                        <span
                          style={{
                            color: "var(--faint)",
                            textDecorationLine: "line-through",
                            textDecorationColor: "var(--red)",
                            textDecorationThickness: "1.5px",
                            transition: "opacity 420ms ease 120ms",
                            opacity: approved ? 0 : 1,
                          }}
                        >
                          {DESC_LIVE_CUT}
                        </span>
                      </div>
                      <div style={subNote}>
                        Google shows the first{" "}
                        <span style={{ fontFamily: MONO, fontSize: 12.5 }}>160</span>. The{" "}
                        <span
                          style={{
                            fontFamily: MONO,
                            fontSize: 12.5,
                            fontWeight: 600,
                            color: "var(--red)",
                          }}
                        >
                          114
                        </span>{" "}
                        struck through never {approved ? "appeared" : "appear"}.
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ ...bodyCopy, color: "var(--fg)" }}>{DESC_159}</div>
                      <div style={subNote}>
                        {withMono(
                          "You approved this on Friday. It replaced 274 characters Google was cutting at 160.",
                          12.5
                        )}
                      </div>
                    </>
                  )}
                </div>

                {/* right body */}
                <div style={{ ...bodyCell, gridColumn: 3, ...rise(210) }}>
                  {worse ? (
                    <>
                      <div style={{ ...bodyCopy, color: "var(--fg)" }}>{DESC_159}</div>
                      <div style={subNote}>
                        {withMono("Whole thing fits inside the 160 with room to spare.", 12.5)}
                      </div>
                    </>
                  ) : (
                    <div style={bodyCopy}>
                      {tableRow("Impressions", "8", "47", true)}
                      {tableRow("Clicks", "0", "3", false)}
                    </div>
                  )}
                </div>
              </div>

              {/* list */}
              <div style={{ marginTop: 38 }}>
                {rows.map((r, i) => (
                  <div key={i} style={{ ...listRow, ...rise(rowDelays[i]) }}>
                    <span style={iconSlot}>{r.icon}</span>
                    <span style={listText}>{withMono(r.text, 17)}</span>
                  </div>
                ))}
              </div>

              {/* approval bar */}
              <div
                key={approved ? "approved" : "pending"}
                style={{
                  marginTop: 34,
                  paddingTop: 20,
                  borderTop: "1px solid var(--rule)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  ...(approved ? rise(120, 420) : rise(480)),
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  {approved ? (
                    <IconCheckCircle size={22} color="var(--green)" />
                  ) : (
                    <IconClock size={22} color="var(--fg)" width={1.75} />
                  )}
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ fontSize: 16, fontWeight: 600, color: "var(--fg)" }}>
                      {approved
                        ? worse
                          ? "The meta description is live"
                          : "The X post is live"
                        : worse
                          ? "The meta description rewrite"
                          : "The X post the agent drafted"}
                    </span>
                    <span style={{ fontSize: 14, color: "var(--muted)" }}>
                      {approved
                        ? "Nothing waiting for your approval"
                        : "One item waiting for your approval"}
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
                  {approved ? (
                    <button
                      type="button"
                      className={`${K}-pill`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        borderRadius: 9999,
                        padding: "11px 26px",
                        fontSize: 14,
                        fontWeight: 600,
                      }}
                      onClick={dismiss}
                    >
                      Got it
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        className={`${K}-txt`}
                        style={{ fontSize: 14, fontWeight: 600 }}
                        onClick={dismiss}
                      >
                        Not now
                      </button>
                      <button
                        type="button"
                        className={`${K}-pill`}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          borderRadius: 9999,
                          padding: "11px 24px",
                          fontSize: 14,
                          fontWeight: 600,
                        }}
                        onClick={approve}
                      >
                        <IconCheck size={15} color="currentColor" width={2.4} />
                        Approve
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* ask row */}
              {askOpen ? (
                <div
                  style={{
                    marginTop: 20,
                    display: "flex",
                    alignItems: "center",
                    gap: 11,
                  }}
                >
                  <IconMessage size={16} color="var(--muted)" />
                  <input
                    autoFocus
                    value={askValue}
                    placeholder={ASK_PLACEHOLDER[morning]}
                    onChange={(e) => setAskValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") submitAsk();
                    }}
                    style={{
                      flex: 1,
                      maxWidth: 520,
                      fontSize: 14,
                      fontFamily: "inherit",
                      background: "transparent",
                      border: "1px solid var(--rule)",
                      borderRadius: 9999,
                      padding: "9px 16px",
                      outline: "none",
                      color: "var(--fg)",
                    }}
                  />
                  <button
                    type="button"
                    className={`${K}-txt`}
                    style={{ fontSize: 14, fontWeight: 600 }}
                    onClick={submitAsk}
                  >
                    Ask
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className={`${K}-txt`}
                  style={{
                    marginTop: 20,
                    display: "flex",
                    alignItems: "center",
                    gap: 9,
                    fontSize: 14,
                    ...rise(560),
                  }}
                  onClick={() => setAskOpen(true)}
                >
                  <IconMessage size={16} color="currentColor" />
                  {ASK_PLACEHOLDER[morning]}
                </button>
              )}
            </div>
          )}
        </div>

        {/* 3. chat panel */}
        {phase === "chat" && (
          <div
            style={{
              position: "absolute",
              left: 1063,
              top: 55,
              width: 377,
              height: 845,
              background: "#ffffff",
              borderLeft: "1px solid #e5e7eb",
              display: "flex",
              flexDirection: "column",
              zIndex: 4,
              ...rise(300, 460),
            }}
          >
            <div
              style={{
                height: 32,
                flex: "0 0 32px",
                display: "flex",
                alignItems: "center",
                gap: 7,
                padding: "0 12px",
                borderBottom: "1px solid #e5e7eb",
              }}
            >
              <IconMessage size={14} color="#726a5a" />
              <span style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>
                Talk to AI CMO
              </span>
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 9999,
                  background: "#00b398",
                  boxShadow: "0 0 3px 1px rgba(0,143,121,.6)",
                }}
              />
            </div>

            <div
              style={{
                flex: 1,
                padding: 12,
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <div
                style={{
                  border: "1px solid #e4ddcd",
                  borderRadius: 8,
                  background: "#fafaf9",
                  padding: "10px 12px",
                  display: "flex",
                  gap: 10,
                }}
              >
                <div style={{ width: 18, flex: "0 0 18px", color: "#110f0e" }}>
                  <Octopus state="idle" arms={0} motion={motion} />
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#111827" }}>
                    Morning report, 18 Aug
                  </div>
                  <div style={{ fontSize: 11.5, lineHeight: "16px", color: "#726a5a" }}>
                    {PLAIN_HEADLINE[morning]}
                  </div>
                </div>
              </div>

              <div
                style={{
                  alignSelf: "flex-end",
                  maxWidth: "86%",
                  background: "#f3f0ec",
                  borderRadius: 12,
                  padding: "9px 13px",
                  fontSize: 13,
                  lineHeight: "19px",
                  color: "#1a1919",
                }}
              >
                {question}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                {[0, 0.2, 0.4].map((d) => (
                  <span
                    key={d}
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: 9999,
                      background: "#c9c4ba",
                      animation: `${K}Pulse 1.2s ease-in-out infinite`,
                      animationDelay: `${d}s`,
                    }}
                  />
                ))}
              </div>
            </div>

            <div style={{ padding: "12px 12px 14px" }}>
              <div
                style={{
                  border: "1px solid #e4ddcd",
                  borderRadius: 8,
                  padding: "12px 16px 10px",
                  fontSize: 14,
                  color: "#9ca3af",
                }}
              >
                Ask me anything…
              </div>
            </div>
          </div>
        )}

        {/* 4. octopus */}
        <div
          style={{
            position: "absolute",
            zIndex: 5,
            transition:
              "left 920ms cubic-bezier(.5,0,.2,1), top 920ms cubic-bezier(.5,0,.2,1), width 920ms cubic-bezier(.5,0,.2,1), color 700ms ease 220ms",
            left: 130,
            top: onReport ? 96 : 17,
            width: onReport ? 112 : 20,
            color: onReport ? (theme === "dark" ? "#f3f0ec" : "#110f0e") : "#fafaf9",
          }}
        >
          <Octopus
            state={onReport && !relaxed ? stage : "idle"}
            arms={1}
            motion={motion}
          />
        </div>
      </div>

      {/* controls */}
      {showControls && (
        <div style={{ display: "flex", gap: 12 }}>
          <div style={group}>
            {ctl(
              worse,
              ctlIcon(IconTrendingDown, worse),
              "Something got worse",
              () => restart({ morning: "worse" })
            )}
            {ctl(
              !worse,
              ctlIcon(IconTrendingUp, !worse),
              "Something got better",
              () => restart({ morning: "better" })
            )}
          </div>

          <div style={group}>
            {ctl(false, ctlIcon(IconRotateCcw, false), "Replay", () => restart({}))}
            {ctl(
              motion === "calm",
              ctlIcon(IconActivity, motion === "calm"),
              `Motion ${motion === "calm" ? "reduced" : "full"}`,
              () => restart({ motion: motionSet === "calm" ? "full" : "calm" })
            )}
            {ctl(
              theme === "dark",
              ctlIcon(IconSun, theme === "dark"),
              theme === "dark" ? "dark" : "light",
              () => setThemeS(theme === "dark" ? "light" : "dark")
            )}
          </div>
        </div>
      )}
    </div>
  );
}
