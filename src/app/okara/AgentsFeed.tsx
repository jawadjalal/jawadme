"use client";

/* Agents Feed panel, ported from the Claude Design source "Agents Feed Panel.dc.html".
   Natural box is 600x845. It is rendered inside a CSS transform scale on /okara, so
   nothing here uses position:fixed or viewport units. Only absolute/relative/sticky
   positioning inside its own box. */

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";

import Octopus from "./Octopus";

/* ---------------------------------------------------------------- types */

type MarkKind =
  | "x"
  | "influencer"
  | "reddit"
  | "seo"
  | "geo"
  | "linkedin"
  | "hn"
  | "articles"
  | "ugc";

type RowKind = "ready" | "arrival" | "locked";
type Priority = "High" | "Medium" | "Low";

type Row = {
  id: string;
  agent: string;
  mark: MarkKind;
  snippet: string;
  kind: RowKind;
  pri: Priority;
  time: string;
  lines?: string[];
  why?: string;
};

type Detail = {
  mark: MarkKind;
  agent: string;
  title: string;
  lines: string[];
  why: string;
};

/* ---------------------------------------------------------------- content

   Every string below is the source's. Nothing here is new copy. */

const PRI: Record<Priority, number> = { High: 0, Medium: 1, Low: 2 };

/* The source's own price map, in credits, keyed by row id. */
const PRICE: Record<string, number> = {
  x: 5,
  thread: 5,
  influencer: 8,
  seo: 10,
  geo: 10,
  articles: 18,
  linkedin: 7,
  paid: 5,
  example: 8,
  ugc: 6,
};

const pricePill: CSSProperties = {
  fontFamily: "'JetBrains Mono',monospace",
  fontSize: 11,
  letterSpacing: ".3px",
  background: "rgba(255,255,255,.14)",
  borderRadius: 9999,
  padding: "3px 8px",
  fontVariantNumeric: "tabular-nums",
};

const POST_LINES = [
  "i've been building in public for a while now.",
  "but i never really knew if anyone was actually finding me.",
  "turns out, they weren't.",
  "my ai cmo flagged that skribbl was basically invisible in three countries where my competitors are getting traction.",
  "i had no idea.",
  "now i do. fixing it this week.",
];

const DETAIL: Record<string, Detail> = {
  paid: {
    mark: "hn",
    agent: "Hacker News Agent",
    title: "Show HN: Skribbl, a home for coding agents",
    lines: [
      "I kept four terminals open all day, one per coding agent, and lost track of which one had authority over which worktree.",
      "Skribbl puts them on one canvas. Draw a line between two agents and one can command the other. Your own keys, your own subscriptions, no relay in the middle, and a meter that says what each run cost.",
      "It is a desktop app. I would rather hear where it breaks than where it shines.",
    ],
    why: "Because your marketing strategy names Hacker News as a buyer channel",
  },
  influencer: {
    mark: "influencer",
    agent: "X Influencer Agent",
    title: "Campaign one, founders on X",
    lines: [
      "1000 creators matched against your ICP, none contacted. The outreach message is written and waiting on one click.",
      "hey, i built skribbl so you can run claude code, codex, gemini and grok side by side on one canvas. if that sounds useful i would rather you tried it than took my word for it.",
    ],
    why: "Because your marketing strategy names founders on X as your buyers",
  },
  seo: {
    mark: "seo",
    agent: "SEO Agent",
    title: "Meta description rewritten to 159 characters",
    lines: [
      "Run Claude, Codex, Gemini and Grok side by side in real terminals, each on its own git worktree. Your keys, your subscriptions, no run cap.",
      "Replaces the 114-character description Google is truncating on your homepage today.",
    ],
    why: "Because your homepage description is cut off in search results today",
  },
  geo: {
    mark: "geo",
    agent: "GEO Agent",
    title: "Three countries where you are missing",
    lines: [
      "Germany, India and Brazil return your competitors for the queries you already rank for at home, and return nothing of yours.",
      "The fix is one hreflang set and three localised landing pages. The agent has drafted all three.",
    ],
    why: "Because search console shows impressions in markets you have no pages for",
  },
  linkedin: {
    mark: "linkedin",
    agent: "LinkedIn Agent",
    title: "1 post scheduled for 9am",
    lines: [
      "Four AI coding agents, one desktop app, no proxy in between. Here is what running them in parallel taught me about authority and blast radius.",
      "Written for founders and engineering leads. 900 characters, no hashtags.",
    ],
    why: "Because your strategy names engineering leads on LinkedIn as a buyer",
  },
  articles: {
    mark: "articles",
    agent: "Articles Agent",
    title: "What agent orchestration actually costs",
    lines: [
      "A 1,400-word piece pricing a full day of four parallel agents against a single-agent workflow, using real token meters rather than list prices.",
      "Ends on why per-run metering matters more than seat pricing.",
    ],
    why: "Because search demand for agent cost comparisons is climbing month over month",
  },
  ugc: {
    mark: "ugc",
    agent: "UGC Videos Agent",
    title: "Running four coding agents at once",
    lines: [
      "A 34-second screen capture: four terminals open, one line drawn between two agents, one command cascading through both.",
      "Script, captions and cut list are written. It needs a screen recording from you.",
    ],
    why: "Because short demo video is your highest-converting format on X",
  },
};

function buildRows(campaignDone: boolean): Row[] {
  const rows: Row[] = [
    {
      id: "x",
      agent: "X Agent",
      mark: "x",
      snippet: "i've been building in public for a while now…",
      kind: "ready",
      pri: "High",
      time: "2:14am",
      lines: [
        "i've been building in public for a while now. but i never really knew if anyone was actually finding me. turns out, they weren't.",
        "my ai cmo flagged that skribbl was basically invisible in three countries where my competitors are getting traction.",
      ],
      why: "Because your marketing strategy says founders on X are your buyers",
    },
    {
      id: "thread",
      agent: "X Agent",
      mark: "x",
      snippet: "four posts on running agents in parallel",
      kind: "arrival",
      pri: "High",
      time: "just now",
      lines: [
        "A four-post thread: one terminal per agent, one worktree each, and the moment two of them tried to write the same file.",
        "Ends on the authority line you drew between Claude and Codex.",
      ],
      why: "Because your first post landed and threads outperform singles on your account",
    },
    {
      id: "influencer",
      agent: "X Influencer Agent",
      mark: "influencer",
      snippet: campaignDone
        ? "1000 briefed, waiting on replies"
        : "1000 creators matched, none contacted yet",
      kind: "locked",
      pri: "High",
      time: "6:40am",
    },
    {
      id: "seo",
      agent: "SEO Agent",
      mark: "seo",
      snippet: "Meta description rewritten to 159 characters",
      kind: "locked",
      pri: "High",
      time: "3:07am",
    },
    {
      id: "geo",
      agent: "GEO Agent",
      mark: "geo",
      snippet: "Three countries where you are missing",
      kind: "locked",
      pri: "High",
      time: "3:41am",
    },
    {
      id: "articles",
      agent: "Articles Agent",
      mark: "articles",
      snippet: "1 topic ready",
      kind: "locked",
      pri: "Medium",
      time: "6:52am",
    },
    {
      id: "linkedin",
      agent: "LinkedIn Agent",
      mark: "linkedin",
      snippet: "1 post scheduled for 9am",
      kind: "locked",
      pri: "Medium",
      time: "6:40am",
    },
    {
      id: "paid",
      agent: "Hacker News Agent",
      mark: "hn",
      snippet: "Show HN: Skribbl, a home for coding agents",
      kind: "locked",
      pri: "Medium",
      time: "yesterday",
    },
    {
      id: "example",
      agent: "Reddit Agent",
      mark: "reddit",
      snippet: "Struggling with [pain point] — what tools do you…",
      kind: "locked",
      pri: "Low",
      time: "yesterday",
    },
    {
      id: "ugc",
      agent: "UGC Videos Agent",
      mark: "ugc",
      snippet: "Running four coding agents at once",
      kind: "locked",
      pri: "Low",
      time: "yesterday",
    },
  ];
  return rows.slice().sort((a, b) => PRI[a.pri] - PRI[b.pri]);
}

/* ---------------------------------------------------------------- scoped css

   Keyframes and the few pseudo-class effects (hover, active) that an inline
   style object cannot express. Everything else is an inline style object. */

const CSS = `
@keyframes afdRise { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:none; } }
@keyframes afdFill { from { width:4%; } to { width:100%; } }
@keyframes afdPulse { 0%,100% { opacity:.35; } 50% { opacity:1; } }
@keyframes afdRow { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:none; } }
@keyframes afdLeave { from { max-height:64px; opacity:1; } to { max-height:0; opacity:0; } }
@keyframes afdDot { 0%,100% { opacity:.55; transform:scale(1); } 50% { opacity:1; transform:scale(1.25); } }
@keyframes afdColour { from { opacity:.35; filter:saturate(0); } to { opacity:1; filter:saturate(1); } }
@keyframes afdDrop { from { opacity:0; transform:translateY(-4px); } to { opacity:1; transform:none; } }

.afd-press:active { transform:scale(.97); }
.afd-blur { filter:blur(3.6px); transition:filter 280ms ease; cursor:pointer; }
.afd-blur:hover { filter:blur(0px); }
.afd-blur-sm { filter:blur(3.2px); transition:filter 280ms ease; cursor:pointer; }
.afd-blur-sm:hover { filter:blur(0px); }
.afd-ink { transition:color 160ms ease; }
.afd-ink:hover { color:#1a1919; }

/* X action row. Grey by default, brand colour and a tinted disc on hover. */
.afd-act { position:relative; display:flex; align-items:center; gap:4px; border:0; background:transparent;
  padding:0; cursor:pointer; color:#536471; transition:color 160ms ease; -webkit-tap-highlight-color:transparent; }
.afd-act .afd-disc { position:absolute; left:50%; top:50%; width:34px; height:34px; margin:-17px 0 0 -17px;
  border-radius:9999px; background:currentColor; opacity:0; transition:opacity 160ms ease; pointer-events:none; }
.afd-act:hover { color:var(--afd-c); }
.afd-act:hover .afd-disc { opacity:.1; }
.afd-act svg { position:relative; }
`;

/* ---------------------------------------------------------------- agent mark

   The platform's own logo in its true brand colour where a platform exists,
   and a single-weight lucide stroke in a neutral sand circle where it does not.
   Reddit and Hacker News use the real brand assets from /okara/icons/. */

const SAND = "#eee8db";
const STROKE = "#57514a";

function AgentMark({ which, size = 22 }: { which: MarkKind; size?: number }) {
  const box: CSSProperties = {
    flex: `0 0 ${size}px`,
    width: size,
    height: size,
    borderRadius: 9999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    boxSizing: "border-box",
  };

  if (which === "reddit") {
    // The file carries its own colour, so the box stays transparent.
    return (
      <span style={{ ...box, background: "transparent" }}>
        <img
          src="/okara/icons/reddit.svg"
          alt="Reddit"
          style={{ width: size, height: size, display: "block", objectFit: "contain" }}
        />
      </span>
    );
  }

  if (which === "hn") {
    return (
      <span
        style={{
          ...box,
          borderRadius: 6,
          background: "#ff6600",
        }}
      >
        <img
          src="/okara/icons/hacker-news.png"
          alt="Hacker News"
          style={{ width: size, height: size, display: "block", objectFit: "contain" }}
        />
      </span>
    );
  }

  if (which === "x") {
    const g = Math.round(size * 0.58);
    return (
      <span style={{ ...box, background: "#000000" }}>
        <svg width={g} height={g} viewBox="0 0 24 24" fill="#ffffff" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </span>
    );
  }

  if (which === "linkedin") {
    const g = Math.round(size * 0.6);
    return (
      <span style={{ ...box, background: "#0A66C2" }}>
        <svg width={g} height={g} viewBox="0 0 24 24" fill="#ffffff" aria-hidden="true">
          <path d="M6.94 5a2 2 0 1 1-4-.002 2 2 0 0 1 4 .002zM7 8.48H3V21h4V8.48zm6.32 0H9.34V21h3.94v-6.57c0-3.66 4.77-4 4.77 0V21H22v-7.93c0-6.17-7.06-5.94-8.72-2.91l.04-1.68z" />
        </svg>
      </span>
    );
  }

  // No platform: one lucide stroke at a single weight, in a neutral sand circle.
  const g = Math.round(size * 0.56);
  const stroke: CSSProperties = { display: "block" };
  let glyph: React.ReactNode = null;

  if (which === "seo") {
    glyph = (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20.5 20.5-4.2-4.2" />
      </>
    );
  } else if (which === "geo") {
    glyph = <path d="M12 3l2.2 6.8L21 12l-6.8 2.2L12 21l-2.2-6.8L3 12l6.8-2.2z" />;
  } else if (which === "articles") {
    glyph = (
      <>
        <path d="M14 3v5h5M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8Z" />
        <path d="M9 13h6M9 17h4" />
      </>
    );
  } else if (which === "ugc") {
    glyph = (
      <>
        <rect x="2.5" y="6.5" width="13" height="11" rx="2" />
        <path d="m15.5 11 5-2.6v7.2l-5-2.6z" />
      </>
    );
  } else {
    // influencer, a paper plane
    glyph = (
      <>
        <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" />
        <path d="m21.854 2.147-10.94 10.939" />
      </>
    );
  }

  return (
    <span style={{ ...box, background: SAND }}>
      <svg
        style={stroke}
        width={g}
        height={g}
        viewBox="0 0 24 24"
        fill="none"
        stroke={STROKE}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {glyph}
      </svg>
    </span>
  );
}

/* ---------------------------------------------------------------- x post card

   A genuine X post: 40px avatar, 15px semibold name, grey handle and relative
   time on the same line, the body at 15px with its line breaks preserved, then
   the six-icon action row. */

type ActionSpec = { key: string; label: string; hover: string; path: string; fill: boolean };

const X_ACTIONS: ActionSpec[] = [
  {
    key: "reply",
    label: "Reply",
    hover: "#1d9bf0",
    fill: true,
    path: "M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z",
  },
  {
    key: "retweet",
    label: "Repost",
    hover: "#00ba7c",
    fill: true,
    path: "M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z",
  },
  {
    key: "like",
    label: "Like",
    hover: "#f91880",
    fill: true,
    path: "M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.667-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z",
  },
  {
    key: "views",
    label: "Views",
    hover: "#1d9bf0",
    fill: true,
    path: "M8.75 21V3h2v18h-2zM18 21V8.5h2V21h-2zM4 21l.004-10h2L6 21H4zm9.248 0v-7h2v7h-2z",
  },
  {
    key: "bookmark",
    label: "Bookmark",
    hover: "#1d9bf0",
    fill: true,
    path: "M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5zM6.5 4c-.276 0-.5.22-.5.5v14.56l6-4.29 6 4.29V4.5c0-.28-.224-.5-.5-.5h-11z",
  },
  {
    key: "share",
    label: "Share",
    hover: "#1d9bf0",
    fill: true,
    path: "M12 2.59l5.7 5.7-1.41 1.42L13 6.41V16h-2V6.41l-3.29 3.3-1.41-1.42L12 2.59zM21 15l-.02 3.51c0 1.38-1.12 2.49-2.5 2.49H5.5C4.11 21 3 19.88 3 18.5V15h2v3.5c0 .28.22.5.5.5h12.98c.28 0 .5-.22.5-.5L19 15h2z",
  },
];

function XActions() {
  // X spreads the first 4 evenly and groups bookmark and share as a pair at the
  // right edge, rather than spacing all 6 alike. Measured off a live post.
  const spread = X_ACTIONS.slice(0, 4);
  const pair = X_ACTIONS.slice(4);
  const btn = (a: ActionSpec) => (
    <button
      key={a.key}
      type="button"
      className="afd-act"
      aria-label={a.label}
      style={{ ["--afd-c" as string]: a.hover } as CSSProperties}
    >
      <span className="afd-disc" />
      <svg width="18.5" height="18.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d={a.path} />
      </svg>
    </button>
  );
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        paddingTop: 12,
        maxWidth: 425,
      }}
    >
      {spread.map(btn)}
      <span style={{ display: "flex", alignItems: "center", gap: 2 }}>{pair.map(btn)}</span>
    </div>
  );
}

function SkribblAvatar() {
  return (
    <img
      src="/okara/icons/skribbl-avatar.png"
      alt="Skribbl"
      width={40}
      height={40}
      style={{
        flex: "0 0 40px",
        width: 40,
        height: 40,
        borderRadius: 9999,
        objectFit: "cover",
        display: "block",
      }}
    />
  );
}

function XPost({ time }: { time: string }) {
  return (
    <div style={{ border: "1px solid #e4ddcd", borderRadius: 10, padding: 14 }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 11 }}>
        <SkribblAvatar />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4, minWidth: 0 }}>
            <span
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: "#0f1419",
                whiteSpace: "nowrap",
                letterSpacing: "-.1px",
              }}
            >
              Skribbl
            </span>
            <span style={{ fontSize: 15, color: "#536471", whiteSpace: "nowrap" }}>@skribbldev</span>
            <span style={{ fontSize: 15, color: "#536471" }}>·</span>
            <span style={{ fontSize: 15, color: "#536471", whiteSpace: "nowrap" }}>{time}</span>
          </div>
          <div
            style={{
              marginTop: 3,
              fontSize: 15,
              lineHeight: "21px",
              color: "#0f1419",
              maxWidth: "58ch",
            }}
          >
            {POST_LINES.map((l, i) => (
              <span key={i} style={{ display: "block" }}>
                {l}
              </span>
            ))}
          </div>
          <XActions />
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- icons */

const doc = (size: number, mt = 0): React.ReactNode => (
  <svg
    style={{ flex: `0 0 ${size}px`, marginTop: mt }}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M14 3v5h5M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8Z" />
  </svg>
);

const lock = (size: number, colour: string, mt = 0): React.ReactNode => (
  <svg
    style={{ flex: `0 0 ${size}px`, marginTop: mt }}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={colour}
    strokeWidth={1.9}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="5" y="11" width="14" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </svg>
);

const tick = (size: number): React.ReactNode => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.4}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="m5 12.5 4.2 4.2L19 7" />
  </svg>
);

/* ---------------------------------------------------------------- component */

export default function AgentsFeed({
  width = 600,
  showPrices = false,
}: {
  width?: number;
  showPrices?: boolean;
}) {
  const [focus, setFocus] = useState<string | null>("x");
  const [whyOpen, setWhyOpen] = useState(false);
  const [arrived, setArrived] = useState(false);
  const [leaving, setLeaving] = useState<string | null>(null);
  const [gone, setGone] = useState<string[]>([]);
  const [snoozed, setSnoozed] = useState<string[]>([]);
  const [posting, setPosting] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [hover, setHover] = useState<string | null>(null);

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const after = useCallback((ms: number, fn: () => void) => {
    const t = setTimeout(fn, ms);
    timers.current.push(t);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setArrived(true), 3000);
    timers.current.push(t);
    const held = timers.current;
    return () => {
      held.forEach(clearTimeout);
      held.length = 0;
    };
  }, []);

  /* The influencer campaign pane is unreachable in the source (onInfluencer is a
     hard false there), so campaign never leaves idle. Kept so the row snippet
     keeps reading from the same place it did. */
  const campaignDone = false;

  const all = buildRows(campaignDone);
  const openRows = all.filter(
    (r) =>
      r.kind !== "locked" &&
      r.id !== focus &&
      gone.indexOf(r.id) === -1 &&
      (r.kind !== "arrival" || arrived)
  );
  const lockedRows = all.filter((r) => r.kind === "locked");

  const heroWaiting = focus === "x" && snoozed.indexOf("x") === -1;
  const waiting = openRows.filter((r) => snoozed.indexOf(r.id) === -1).length + (heroWaiting ? 1 : 0);
  const waitingLabel = waiting === 0 ? "nothing waiting" : `${waiting} waiting`;
  const octoState = waiting > 0 ? "holding" : "idle";
  const octoArms = waiting > 0 ? 1 : 0;

  const det = focus ? DETAIL[focus] : undefined;
  const onX = focus === "x";
  const onPublished = focus === "published";
  const onExample = focus === "example";
  const onPaid = !!det;
  /* Source had an influencer pane behind a hard-false flag, so it never rendered. */
  const onInfluencer = false as boolean;
  /* Source rendered an empty bordered box for a focus with no pane (the thread
     row). Gated so the panel does not show an empty container. */
  const hasFocus = onX || onPublished || onPaid || onExample;

  const approve = () => {
    setPosting(true);
    setWhyOpen(false);
    after(900, () => {
      setPosting(false);
      setFocus("published");
      setGone((g) => (g.indexOf("x") === -1 ? g.concat("x") : g));
    });
  };

  const notNow = () => {
    setFocus(null);
    setWhyOpen(false);
    setSnoozed((s) => (s.indexOf("x") === -1 ? s.concat("x") : s));
  };

  const approveRow = (id: string) => (e: React.MouseEvent) => {
    e.stopPropagation();
    setLeaving(id);
    setExpanded((x) => ({ ...x, [id]: false }));
    after(260, () => {
      setGone((g) => g.concat(id));
      setLeaving(null);
    });
  };

  const snoozeRow = (id: string) => (e: React.MouseEvent) => {
    e.stopPropagation();
    setSnoozed((s) => (s.indexOf(id) === -1 ? s.concat(id) : s));
    setExpanded((x) => ({ ...x, [id]: false }));
  };

  const toggleRow = (id: string) => (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded((x) => ({ ...x, [id]: !x[id] }));
  };

  /* ---- row renderer, shared by the open list and the locked list ---- */

  const renderRow = (r: Row, locked: boolean) => {
    const isSnoozed = snoozed.indexOf(r.id) !== -1;
    const active = r.id === focus;
    const isLeaving = leaving === r.id;
    const isOpen = !!expanded[r.id];
    const d = DETAIL[r.id];
    const lines = r.lines ?? d?.lines ?? [];
    const why = r.why ?? d?.why ?? "";
    const isHover = hover === r.id;

    const anim = isLeaving
      ? "afdLeave 260ms cubic-bezier(.4,0,1,1) both"
      : r.kind === "arrival"
        ? "afdRow 320ms cubic-bezier(.2,.7,.3,1) both"
        : "none";

    const base = active
      ? "#f3f0ec"
      : r.kind === "arrival"
        ? "#f9fbfa"
        : locked
          ? "transparent"
          : "#ffffff";
    const bg = isHover && !active ? (locked ? "#faf8f4" : "#f9fafb") : base;

    return (
      <div
        key={r.id}
        style={{
          overflow: "hidden",
          borderBottom: `1px solid ${locked ? "rgba(228,221,205,.75)" : "#f3f4f6"}`,
          background: bg,
          transition: "background 220ms ease,opacity 260ms ease,filter 260ms ease",
          animation: anim,
        }}
      >
        <div
          onClick={() => {
            setFocus(r.id);
            setWhyOpen(false);
          }}
          onMouseEnter={() => setHover(r.id)}
          onMouseLeave={() => setHover((h) => (h === r.id ? null : h))}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "11px 12px",
            minHeight: 60,
            boxSizing: "border-box",
            cursor: "pointer",
          }}
        >
          <AgentMark which={r.mark} size={22} />
          <span style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0, flex: 1 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: ".4px",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
                color: locked ? "#463f39" : "#1a1919",
              }}
            >
              {r.agent}
            </span>
            <span
              style={{
                fontSize: 12.5,
                lineHeight: "17px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                color: locked ? "#8c8578" : "#726a5a",
              }}
            >
              {r.snippet}
            </span>
          </span>

          {locked ? (
            lock(14, "#1a1919")
          ) : (
            <span
              style={{
                flex: "0 0 auto",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: ".5px",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
                color: isSnoozed ? "#8c8578" : "#008f7a",
              }}
            >
              {isSnoozed ? "later" : "ready"}
            </span>
          )}

          <span
            style={{
              flex: "0 0 52px",
              fontFamily: "'JetBrains Mono',monospace",
              fontSize: 11,
              textAlign: "right",
              whiteSpace: "nowrap",
              color: locked ? "#8c8578" : "#726a5a",
            }}
          >
            {r.time}
          </span>

          <button
            type="button"
            onClick={toggleRow(r.id)}
            className="afd-ink"
            aria-label={isOpen ? "Collapse" : "Expand"}
            style={{
              flex: "0 0 13px",
              border: 0,
              background: "transparent",
              padding: 0,
              display: "flex",
              cursor: "pointer",
              color: "#b6afa1",
              transition: "transform 240ms cubic-bezier(.2,.7,.3,1),color 160ms ease",
              transform: `rotate(${isOpen ? 180 : 0}deg)`,
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        </div>

        {isOpen && (
          <div
            style={{
              padding: "1px 12px 13px 44px",
              animation: "afdDrop 240ms cubic-bezier(.2,.7,.3,1) both",
            }}
          >
            <div
              className={locked ? "afd-blur-sm" : undefined}
              style={{
                fontSize: 12.5,
                lineHeight: "19px",
                color: "#463f39",
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              {lines.map((l, i) => (
                <span key={i} style={{ display: "block" }}>
                  {l}
                </span>
              ))}
            </div>

            <div
              style={{
                marginTop: 9,
                display: "flex",
                alignItems: "flex-start",
                gap: 7,
                fontSize: 11,
                lineHeight: "17px",
                color: "#8c8578",
              }}
            >
              {doc(11, 3)}
              {why}
            </div>

            {locked ? (
              <div
                style={{
                  marginTop: 8,
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  fontSize: 11,
                  color: "#8c1717",
                }}
              >
                {lock(11, "currentColor")}
                Written. You cannot approve it on the free plan.
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 11 }}>
                <button
                  type="button"
                  onClick={snoozeRow(r.id)}
                  className="afd-ink afd-press"
                  style={{
                    border: 0,
                    background: "transparent",
                    padding: 0,
                    fontFamily: "'DM Sans',sans-serif",
                    fontSize: 12,
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    color: "#726a5a",
                    cursor: "pointer",
                  }}
                >
                  Not now
                </button>
                {/* Approve sits on the right of its row. */}
                <button
                  type="button"
                  onClick={approveRow(r.id)}
                  className="afd-press"
                  style={{
                    marginLeft: "auto",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    border: 0,
                    fontFamily: "'DM Sans',sans-serif",
                    fontSize: 12,
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    color: "#ffffff",
                    background: "#000000",
                    borderRadius: 9999,
                    padding: "6px 14px",
                    cursor: "pointer",
                    transition: "background 160ms ease,transform 120ms ease",
                  }}
                >
                  {tick(12)}
                  Approve
                  {showPrices && !!PRICE[r.id] && (
                    <span style={pricePill}>{PRICE[r.id].toFixed(2)}</span>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const paneHead = (
    mark: MarkKind,
    title: string,
    trail?: React.ReactNode
  ): React.ReactNode => (
    <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 11 }}>
      <button
        type="button"
        onClick={() => {
          setFocus(null);
          setWhyOpen(false);
        }}
        className="afd-ink"
        aria-label="Back"
        style={{
          border: 0,
          background: "transparent",
          padding: 0,
          display: "flex",
          color: "#726a5a",
          cursor: "pointer",
        }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      <AgentMark which={mark} size={26} />
      <span
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: ".4px",
          textTransform: "uppercase",
          whiteSpace: "nowrap",
          color: "#1a1919",
        }}
      >
        {title}
      </span>
      {trail}
    </div>
  );

  return (
    <div
      style={{
        width,
        height: 845,
        position: "relative",
        background: "#ffffff",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        boxSizing: "border-box",
        fontFamily: "'DM Sans',system-ui,-apple-system,sans-serif",
        WebkitFontSmoothing: "antialiased",
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* ---- title bar ---- */}
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
        <svg style={{ flex: "0 0 14px" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#726a5a" strokeWidth={1.8} strokeLinecap="round" aria-hidden="true">
          <path d="M4 11a9 9 0 0 1 9 9M4 4a16 16 0 0 1 16 16" />
          <circle cx="5" cy="19" r="1.4" fill="#726a5a" />
        </svg>
        <span style={{ fontSize: 14, fontWeight: 600, whiteSpace: "nowrap", color: "#1a1919" }}>
          Agents Feed
        </span>
        <span
          style={{
            flex: "0 0 6px",
            width: 6,
            height: 6,
            borderRadius: 9999,
            background: "#00b398",
            animation: "afdDot 2.6s ease-in-out infinite",
          }}
        />
        <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ flex: "0 0 16px", width: 16, color: "#1a1919" }}>
            <Octopus state={octoState} arms={octoArms} />
          </span>
          <span style={{ fontSize: 11, whiteSpace: "nowrap", color: "#726a5a" }}>{waitingLabel}</span>
        </span>
        <button
          type="button"
          className="afd-ink"
          aria-label="Collapse"
          style={{ border: 0, background: "transparent", padding: 0, display: "flex", color: "#9ca3af", cursor: "pointer" }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
      </div>

      {/* ---- focus block ---- */}
      {hasFocus && (
        <div style={{ padding: 12, borderBottom: "1px solid #e5e7eb" }}>
          {onX && (
            <div style={{ animation: "afdRise 300ms cubic-bezier(.2,.7,.3,1) both" }}>
              {paneHead("x", "X Agent")}
              <XPost time="now" />

              {!posting && (
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 12 }}>
                  <button
                    type="button"
                    onClick={notNow}
                    className="afd-ink afd-press"
                    style={{
                      border: 0,
                      background: "transparent",
                      padding: 0,
                      fontFamily: "'DM Sans',sans-serif",
                      fontSize: 12.5,
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                      color: "#726a5a",
                      cursor: "pointer",
                    }}
                  >
                    Not now
                  </button>
                  {/* Approve sits on the right of its row. */}
                  <button
                    type="button"
                    onClick={approve}
                    className="afd-press"
                    style={{
                      marginLeft: "auto",
                      display: "flex",
                      alignItems: "center",
                      gap: 7,
                      border: 0,
                      fontFamily: "'DM Sans',sans-serif",
                      fontSize: 12.5,
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                      color: "#ffffff",
                      background: "#000000",
                      borderRadius: 9999,
                      padding: "7px 16px",
                      cursor: "pointer",
                      transition: "background 160ms ease,transform 120ms ease",
                    }}
                  >
                    {tick(13)}
                    Approve
                    {showPrices && <span style={pricePill}>5.00</span>}
                  </button>
                </div>
              )}

              {posting && (
                <div style={{ marginTop: 13, animation: "afdRise 220ms cubic-bezier(.2,.7,.3,1) both" }}>
                  <div style={{ height: 4, borderRadius: 9999, background: "#f3f0ec", overflow: "hidden" }}>
                    <div
                      style={{
                        height: 4,
                        background: "#008f7a",
                        borderRadius: 9999,
                        animation: "afdFill 900ms cubic-bezier(.3,.7,.4,1) forwards",
                      }}
                    />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 9, fontSize: 12.5, color: "#463f39" }}>
                    <span
                      style={{
                        flex: "0 0 5px",
                        width: 5,
                        height: 5,
                        borderRadius: 9999,
                        background: "#008f7a",
                        animation: "afdPulse 900ms ease-in-out infinite",
                      }}
                    />
                    Posting to X
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => setWhyOpen((w) => !w)}
                className="afd-ink"
                style={{
                  marginTop: 12,
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 7,
                  border: 0,
                  background: "transparent",
                  padding: 0,
                  textAlign: "left",
                  fontFamily: "'DM Sans',sans-serif",
                  fontSize: 12.5,
                  lineHeight: "18px",
                  color: "#726a5a",
                  cursor: "pointer",
                }}
              >
                {doc(12, 3)}
                Because your marketing strategy says founders on X and Hacker News are your buyers
              </button>

              {whyOpen && (
                <div
                  style={{
                    marginTop: 10,
                    paddingLeft: 19,
                    display: "flex",
                    flexDirection: "column",
                    gap: 9,
                    animation: "afdRise 320ms cubic-bezier(.2,.7,.3,1) both",
                  }}
                >
                  <p style={{ margin: 0, fontSize: 12.5, lineHeight: "18px", color: "#463f39" }}>
                    The agent&apos;s own reasoning. It frames it as a personal blindspot story rather
                    than a feature recap, making it feel like a raw founder moment.
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 12.5,
                      lineHeight: "18px",
                      color: "#8c8578",
                      borderLeft: "1px solid #e4ddcd",
                      paddingLeft: 10,
                    }}
                  >
                    Marketing Strategy, 12 Aug. Your ICP lives on X, Hacker News, Discord, r/ClaudeAI
                    and r/LocalLLaMA.
                  </p>
                </div>
              )}
            </div>
          )}

          {onPublished && (
            <div style={{ animation: "afdRise 300ms cubic-bezier(.2,.7,.3,1) both" }}>
              {paneHead(
                "x",
                "X Agent",
                <span
                  style={{
                    marginLeft: "auto",
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: ".4px",
                    textTransform: "uppercase",
                    whiteSpace: "nowrap",
                    color: "#008f7a",
                  }}
                >
                  Published
                </span>
              )}
              <XPost time="just now" />
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginTop: 12,
                  fontSize: 12.5,
                  color: "#008f7a",
                  animation: "afdRise 380ms cubic-bezier(.2,.7,.3,1) both",
                }}
              >
                <svg style={{ flex: "0 0 14px" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="9" />
                  <path d="m8.4 12.4 2.6 2.6 4.8-5.4" />
                </svg>
                Live on X. You approved it, so it went out.
              </div>
              <div style={{ marginTop: 10, fontSize: 12.5, lineHeight: "18px", color: "#726a5a" }}>
                Next up, the thread the X agent drafted this morning.
              </div>
            </div>
          )}

          {onInfluencer && (
            <div style={{ animation: "afdRise 300ms cubic-bezier(.2,.7,.3,1) both" }}>
              {paneHead(
                "influencer",
                "X Influencer Agent",
                <span
                  style={{
                    marginLeft: "auto",
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: ".4px",
                    textTransform: "uppercase",
                    whiteSpace: "nowrap",
                    color: "#008f7a",
                  }}
                >
                  Ready to launch
                </span>
              )}
              <div style={{ border: "1px solid #e4ddcd", borderRadius: 10, padding: 14 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#1a1919", marginBottom: 9 }}>
                  Campaign one, founders on X
                </div>
                {[
                  ["Creators matched", "1000", "#1a1919"],
                  ["Outreach written", "yes", "#008f7a"],
                  ["Contacted so far", "0", "#1a1919"],
                ].map(([k, v, c]) => (
                  <div
                    key={k}
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      gap: 10,
                      padding: "7px 0",
                      borderBottom: "1px solid #f3f4f6",
                    }}
                  >
                    <span style={{ flex: 1, fontSize: 12.5, color: "#463f39" }}>{k}</span>
                    <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12.5, color: c }}>
                      {v}
                    </span>
                  </div>
                ))}
                <div
                  style={{
                    marginTop: 11,
                    fontSize: 14,
                    lineHeight: "20px",
                    color: "#463f39",
                    background: "#fafaf9",
                    borderRadius: 8,
                    padding: 12,
                  }}
                >
                  hey, i built skribbl so you can run claude code, codex, gemini and grok side by side
                  on one canvas. if that sounds useful i would rather you tried it than took my word
                  for it.
                </div>
              </div>
              <div
                style={{
                  marginTop: 12,
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 7,
                  fontSize: 12.5,
                  lineHeight: "18px",
                  color: "#726a5a",
                }}
              >
                {doc(12, 3)}
                Because your marketing strategy names founders on X as your buyers
              </div>
            </div>
          )}

          {onPaid && det && (
            <div style={{ animation: "afdRise 300ms cubic-bezier(.2,.7,.3,1) both" }}>
              {paneHead(
                det.mark,
                det.agent,
                <span
                  style={{
                    marginLeft: "auto",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: ".4px",
                    textTransform: "uppercase",
                    whiteSpace: "nowrap",
                    color: "#1a1919",
                  }}
                >
                  {lock(13, "currentColor")}
                  Locked
                </span>
              )}
              <div
                className="afd-blur"
                style={{ border: "1px solid #e4ddcd", borderRadius: 10, padding: 14 }}
              >
                <div style={{ fontSize: 14, lineHeight: "20px", fontWeight: 600, color: "#1a1919", marginBottom: 8 }}>
                  {det.title}
                </div>
                <div
                  style={{
                    fontSize: 12.5,
                    lineHeight: "19px",
                    color: "#463f39",
                    display: "flex",
                    flexDirection: "column",
                    gap: 7,
                  }}
                >
                  {det.lines.map((l, i) => (
                    <span key={i} style={{ display: "block" }}>
                      {l}
                    </span>
                  ))}
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 7,
                  marginTop: 12,
                  fontSize: 12.5,
                  lineHeight: "18px",
                  color: "#726a5a",
                }}
              >
                <svg style={{ flex: "0 0 13px", marginTop: 3 }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
                  <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                Hover to read it. The agent wrote it, you just cannot send it yet.
              </div>
              <div
                style={{
                  marginTop: 11,
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 7,
                  fontSize: 12.5,
                  lineHeight: "18px",
                  color: "#726a5a",
                }}
              >
                {doc(12, 3)}
                {det.why}
              </div>
            </div>
          )}

          {onExample && (
            <div style={{ animation: "afdRise 300ms cubic-bezier(.2,.7,.3,1) both" }}>
              {paneHead(
                "reddit",
                "Reddit Agent",
                <span
                  style={{
                    marginLeft: "auto",
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: ".4px",
                    textTransform: "uppercase",
                    whiteSpace: "nowrap",
                    color: "#8c8578",
                  }}
                >
                  Example, not a draft
                </span>
              )}
              <div
                style={{
                  border: "1px dashed #d8d3c9",
                  borderRadius: 10,
                  padding: 14,
                  background: "#fafaf9",
                }}
              >
                <div style={{ fontSize: 14, lineHeight: "20px", color: "#8c8578" }}>
                  Struggling with [pain point] — what tools do you recommend?
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    marginTop: 9,
                    fontFamily: "'JetBrains Mono',monospace",
                    fontSize: 11,
                    color: "#b6afa1",
                  }}
                >
                  <span>r/[subreddit]</span>
                  <span>312 upvotes</span>
                  <span>47 comments</span>
                </div>
              </div>
              <div style={{ marginTop: 12, fontSize: 12.5, lineHeight: "18px", color: "#463f39" }}>
                This is the template, not a draft. The Reddit agent has found nothing for you yet, so
                there is no source line under it.
              </div>
            </div>
          )}
        </div>
      )}

      {/* ---- the list ---- */}
      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", display: "flex", flexDirection: "column" }}>
        {openRows.map((r) => renderRow(r, false))}

        <div style={{ marginTop: "auto" }}>
          {/* locked band, with a count taken from the rows themselves */}
          <div
            style={{
              position: "sticky",
              bottom: 0,
              zIndex: 1,
              background: "#ffffff",
              borderTop: "1px solid #e4ddcd",
              padding: "10px 12px",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: 9,
            }}
          >
            <span style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
              {lock(13, "#1a1919", 2)}
              <span style={{ fontSize: 12.5, lineHeight: "18px", color: "#726a5a" }}>
                {lockedRows.length} drafts you cannot approve yet
              </span>
            </span>
            <button
              type="button"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                border: 0,
                background: "#1a1919",
                color: "#ffffff",
                fontFamily: "'DM Sans',sans-serif",
                fontSize: 12.5,
                fontWeight: 600,
                lineHeight: "18px",
                whiteSpace: "nowrap",
                borderRadius: 9999,
                padding: "7px 15px",
                cursor: "pointer",
              }}
            >
              <svg style={{ flex: "0 0 14px", display: "block" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#e8b53c" strokeWidth={2.8} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 19V6.5" />
                <path d="M6 12.5l6-6 6 6" />
              </svg>
              Upgrade to unlock
            </button>
          </div>

          {lockedRows.map((r) => renderRow(r, true))}
        </div>
      </div>
    </div>
  );
}
