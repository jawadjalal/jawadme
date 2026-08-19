"use client";

/* Credits drawer over the dashboard scene. Ported from the port spec.
   Natural box is 1440x900; the page renders it inside a CSS transform scale,
   so there is no position:fixed and no viewport unit anywhere in here. */

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";

/* ------------------------------------------------------------------ */
/* type                                                                */
/* ------------------------------------------------------------------ */

const SANS = '"DM Sans", system-ui, -apple-system, sans-serif';
const MONO = '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace';
const DISPLAY = '"Sora", "DM Sans", system-ui, sans-serif';

const NUM: CSSProperties = { fontFamily: MONO, fontVariantNumeric: "tabular-nums" };

/* ------------------------------------------------------------------ */
/* palette                                                             */
/* ------------------------------------------------------------------ */

const SHELL_BG = "#f9fafb";
const SHELL_EDGE = "#dcd8d0";
const BAR = "#110f0e";
const WHITE = "#ffffff";

const HAIR = "#e5e7eb";
const HAIR_WARM = "#e4ddcd";
const HAIR_SOFT = "#f3f0ec";

const INK = "#1a1919";
const INK_900 = "#111827";
const INK_700 = "#33302c";
const INK_600 = "#463f39";
const SAND_700 = "#726a5a";
const SAND_500 = "#8c8578";
const SAND_400 = "#a49c8c";
const SAND_300 = "#b6afa1";
const GREY_400 = "#9ca3af";
const SAND_MARK = "#eee8db";
const STROKE = "#57514a";

/* prices the 7.00 balance cannot reach */
const OVER_TEXT = "#c4bdb0";
const OVER_LEADER = "#ece7dd";

/* the only amber on the screen */
const AMBER = "#e8b53c";

const BALANCE = 7.0;

const EASE_DRAWER = "cubic-bezier(.2,.75,.3,1)";
const EASE_CHEVRON = "cubic-bezier(.2,.7,.3,1)";

const SCENE_W = 1440;
const SCENE_H = 900;
const BAR_H = 55;
const DRAWER_W = 700;
const BODY_H = SCENE_H - BAR_H;

/* ------------------------------------------------------------------ */
/* icons                                                               */
/* ------------------------------------------------------------------ */

type IconProps = { size?: number; color?: string; width?: number; style?: CSSProperties };

function svgProps({ size = 14, color = "currentColor", width = 1.8, style }: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: width,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
    style: { display: "block", flex: "0 0 auto", ...style },
  };
}

const ChevronDown = (p: IconProps) => (
  <svg {...svgProps(p)}>
    <path d="M6 9l6 6 6-6" />
  </svg>
);
const ChevronLeft = (p: IconProps) => (
  <svg {...svgProps(p)}>
    <path d="M15 6l-6 6 6 6" />
  </svg>
);
const ChevronRight = (p: IconProps) => (
  <svg {...svgProps(p)}>
    <path d="M9 6l6 6-6 6" />
  </svg>
);
const Plug = (p: IconProps) => (
  <svg {...svgProps(p)}>
    <path d="M9 3v5M15 3v5M7 8h10v3a5 5 0 0 1-10 0Z" />
    <path d="M12 16v5" />
  </svg>
);
const Gear = (p: IconProps) => (
  <svg {...svgProps(p)}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 9 19.4a1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 4.6 9a1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1Z" />
  </svg>
);
const Globe = (p: IconProps) => (
  <svg {...svgProps(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3c2.6 3 2.6 15 0 18M12 3c-2.6 3-2.6 15 0 18" />
  </svg>
);
const Gift = (p: IconProps) => (
  <svg {...svgProps(p)}>
    <path d="M20 12v9H4v-9M2 7h20v5H2zM12 22V7M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7ZM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7Z" />
  </svg>
);
const FileDoc = (p: IconProps) => (
  <svg {...svgProps(p)}>
    <path d="M14 3v5h5M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8Z" />
  </svg>
);
const LogOut = (p: IconProps) => (
  <svg {...svgProps(p)}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
  </svg>
);
const Moon = (p: IconProps) => (
  <svg {...svgProps(p)}>
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
  </svg>
);
const FileIcon = (p: IconProps) => (
  <svg {...svgProps(p)}>
    <path d="M14 3H7a1.6 1.6 0 0 0-1.6 1.6v14.8A1.6 1.6 0 0 0 7 21h10a1.6 1.6 0 0 0 1.6-1.6V7.6z" />
    <path d="M14 3v4.6h4.6" />
  </svg>
);
const FileLinesIcon = (p: IconProps) => (
  <svg {...svgProps(p)}>
    <path d="M14 3H7a1.6 1.6 0 0 0-1.6 1.6v14.8A1.6 1.6 0 0 0 7 21h10a1.6 1.6 0 0 0 1.6-1.6V7.6z" />
    <path d="M14 3v4.6h4.6" />
    <path d="M8.6 13h6.8" />
    <path d="M8.6 16.6h6.8" />
  </svg>
);
const MessageIcon = (p: IconProps) => (
  <svg {...svgProps(p)}>
    <path d="M20.5 15.2a1.8 1.8 0 0 1-1.8 1.8H8.2L4.5 20.5V5.3a1.8 1.8 0 0 1 1.8-1.8h12.4a1.8 1.8 0 0 1 1.8 1.8z" />
  </svg>
);
const PencilIcon = (p: IconProps) => (
  <svg {...svgProps(p)}>
    <path d="M16.6 3.9a2 2 0 0 1 2.9 2.9L7.4 18.9l-3.9 1 1-3.9z" />
  </svg>
);
const BarChartIcon = (p: IconProps) => (
  <svg {...svgProps(p)}>
    <path d="M4.5 20.5V4.5" />
    <path d="M4.5 20.5h15" />
    <path d="M8.6 17V11" />
    <path d="M13 17V7.4" />
    <path d="M17.4 17v-4" />
  </svg>
);
const WalletIcon = (p: IconProps) => (
  <svg {...svgProps(p)}>
    <path d="M3.6 7.6A2 2 0 0 1 5.6 5.6h11.8a2 2 0 0 1 2 2v9.8a2 2 0 0 1-2 2H5.6a2 2 0 0 1-2-2z" />
    <path d="M15.4 11.4h5v3.6h-5a1.8 1.8 0 0 1 0-3.6z" />
  </svg>
);
const DatabaseIcon = (p: IconProps) => (
  <svg {...svgProps(p)}>
    <ellipse cx="12" cy="6" rx="7.4" ry="3.1" />
    <path d="M4.6 6v12c0 1.7 3.3 3.1 7.4 3.1s7.4-1.4 7.4-3.1V6" />
    <path d="M4.6 12c0 1.7 3.3 3.1 7.4 3.1s7.4-1.4 7.4-3.1" />
  </svg>
);
const TagIcon = (p: IconProps) => (
  <svg {...svgProps(p)}>
    <path d="M11.2 3.5H4.6a1.1 1.1 0 0 0-1.1 1.1v6.6a1.1 1.1 0 0 0 .33.78l8.3 8.3a1.1 1.1 0 0 0 1.56 0l6.6-6.6a1.1 1.1 0 0 0 0-1.56l-8.3-8.3a1.1 1.1 0 0 0-.78-.33z" />
    <path d="M7.6 7.6h.01" />
  </svg>
);
const ReceiptIcon = (p: IconProps) => (
  <svg {...svgProps(p)}>
    <path d="M5.4 3.5v17l2.2-1.5 2.2 1.5 2.2-1.5 2.2 1.5 2.2-1.5 2.2 1.5v-17l-2.2 1.5-2.2-1.5-2.2 1.5-2.2-1.5-2.2 1.5z" />
    <path d="M9 9.5h6" />
    <path d="M9 13.5h6" />
  </svg>
);
const CloseIcon = (p: IconProps) => (
  <svg {...svgProps(p)}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);
const ReplayIcon = (p: IconProps) => (
  <svg {...svgProps(p)}>
    <path d="M20.5 12a8.5 8.5 0 1 1-2.5-6" />
    <path d="M20.5 4v5.2h-5.2" />
  </svg>
);

/* ------------------------------------------------------------------ */
/* agent marks                                                         */
/* ------------------------------------------------------------------ */

type MarkId =
  | "reddit"
  | "hackernews"
  | "x"
  | "linkedin"
  | "seo"
  | "geo"
  | "articles"
  | "ugc"
  | "influencer"
  | "image"
  | "chat";

const BRAND: Partial<Record<MarkId, string>> = {
  reddit: "/okara/icons/reddit.svg",
  hackernews: "/okara/icons/hacker-news.png",
  x: "/okara/icons/x-logo-black.png",
  linkedin: "/okara/icons/linkedin.svg",
};

/** single weight lucide stroke, 1.8, no fills */
function MarkGlyph({ id }: { id: MarkId }) {
  const p = { size: 12, color: STROKE, width: 1.8 };
  switch (id) {
    case "seo": // magnifier
      return (
        <svg {...svgProps(p)}>
          <circle cx="10.6" cy="10.6" r="6.6" />
          <path d="M20 20l-4.7-4.7" />
        </svg>
      );
    case "geo": // four point sparkle
      return (
        <svg {...svgProps(p)}>
          <path d="M12 3.2c.9 4.6 4.2 7.9 8.8 8.8-4.6.9-7.9 4.2-8.8 8.8-.9-4.6-4.2-7.9-8.8-8.8 4.6-.9 7.9-4.2 8.8-8.8z" />
        </svg>
      );
    case "articles": // document with lines
      return (
        <svg {...svgProps(p)}>
          <path d="M14 3H7a1.6 1.6 0 0 0-1.6 1.6v14.8A1.6 1.6 0 0 0 7 21h10a1.6 1.6 0 0 0 1.6-1.6V7.6z" />
          <path d="M14 3v4.6h4.6" />
          <path d="M8.6 13h6.8" />
          <path d="M8.6 16.6h6.8" />
        </svg>
      );
    case "ugc": // video camera
      return (
        <svg {...svgProps(p)}>
          <rect x="3.2" y="6.4" width="12.4" height="11.2" rx="1.8" />
          <path d="M15.6 11.2l5.2-2.9v7.4l-5.2-2.9z" />
        </svg>
      );
    case "influencer": // paper plane
      return (
        <svg {...svgProps(p)}>
          <path d="M20.8 3.2L3.6 10.4l7 2.8 2.8 7z" />
          <path d="M20.8 3.2l-10.2 10.2" />
        </svg>
      );
    case "image":
      return (
        <svg {...svgProps(p)}>
          <rect x="3.4" y="4.6" width="17.2" height="14.8" rx="2" />
          <circle cx="8.8" cy="9.8" r="1.7" />
          <path d="M20.6 15.6l-4.8-4.6-8.6 8.4" />
        </svg>
      );
    default: // chat
      return (
        <svg {...svgProps(p)}>
          <path d="M20.5 15.2a1.8 1.8 0 0 1-1.8 1.8H8.2L4.5 20.5V5.3a1.8 1.8 0 0 1 1.8-1.8h12.4a1.8 1.8 0 0 1 1.8 1.8z" />
        </svg>
      );
  }
}

function AgentMark({ id, dim = false }: { id: MarkId; dim?: boolean }) {
  const src = BRAND[id];
  const box: CSSProperties = {
    width: 20,
    height: 20,
    flex: "0 0 auto",
    borderRadius: id === "hackernews" ? 6 : 10,
    background: SAND_MARK,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    opacity: dim ? 0.4 : 1,
    filter: dim ? "saturate(.15)" : "none",
    transition: "opacity 220ms ease, filter 220ms ease",
  };
  return (
    <span style={box}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          aria-hidden="true"
          width={13}
          height={13}
          style={{ width: 13, height: 13, objectFit: "contain", display: "block" }}
        />
      ) : (
        <MarkGlyph id={id} />
      )}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* content                                                             */
/* ------------------------------------------------------------------ */

type PriceRow = { mark: MarkId; label: string; note?: string; value: number };

/* Derived from Okara's own monthly task estimates. Nothing here is invented:
   every figure is one the product itself implies. */
const PRICES: PriceRow[] = [
  { mark: "articles", label: "Blog article", value: 18 },
  { mark: "seo", label: "SEO analysis", value: 10 },
  { mark: "reddit", label: "Reddit opportunity", value: 8 },
  { mark: "linkedin", label: "LinkedIn post", note: "all of it", value: 7 },
  { mark: "ugc", label: "UGC script", value: 6 },
  { mark: "x", label: "X post", value: 5 },
  { mark: "image", label: "AI hero image", value: 5 },
];

type SpendRow = { date: string; label: string; value: string; muted?: boolean };

const SPEND: SpendRow[] = [
  { date: "14 Aug", label: "Granted", value: "+14.37" },
  { date: "17 Aug, 21:41", label: "AI Chat", value: "−0.74" },
  { date: "13 Aug, 16:06", label: "AI Chat", value: "−0.61" },
  { date: "13 Aug, 16:05", label: "AI Chat", value: "−4.28" },
  { date: "", label: "Not itemised", value: "−1.74", muted: true },
];

const DOCUMENTS = [
  "Product Information",
  "Marketing Strategy",
  "Competitor Analysis",
  "Brand Voice",
  "Content Strategy",
  "Articles",
];

const COMPETITORS: { name: string; bg: string; ch: string }[] = [
  { name: "conductor.build", bg: "#110f0e", ch: "C" },
  { name: "parallelcode.app", bg: "#3b82f6", ch: "P" },
  { name: "nimbalyst.com", bg: "#463f39", ch: "N" },
  { name: "codeagentswarm.…", bg: "#ea580b", ch: "C" },
  { name: "claude-squad", bg: "#1a1919", ch: "G" },
  { name: "augmentcode.com", bg: "#0c0a09", ch: "A" },
];

/* ------------------------------------------------------------------ */
/* drawer                                                              */
/* ------------------------------------------------------------------ */

const blockTitle: CSSProperties = {
  fontFamily: SANS,
  fontSize: 13,
  fontWeight: 600,
  color: INK,
};

function BlockHead({
  icon,
  title,
  credits,
}: {
  icon: ReactNode;
  title: string;
  credits?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        borderBottom: `1px solid ${HAIR_SOFT}`,
        paddingBottom: 8,
      }}
    >
      <span
        style={{
          width: 20,
          height: 20,
          borderRadius: 6,
          background: HAIR_SOFT,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flex: "0 0 auto",
        }}
      >
        {icon}
      </span>
      <span style={blockTitle}>{title}</span>
      {credits ? (
        <span style={{ marginLeft: "auto", fontFamily: SANS, fontSize: 12, color: SAND_400 }}>
          credits
        </span>
      ) : null}
    </div>
  );
}

function Leader({ color }: { color: string }) {
  return (
    <span
      style={{
        flex: "1 1 auto",
        minWidth: 16,
        borderBottom: `1px dotted ${color}`,
        transform: "translateY(-2px)",
        transition: "border-color 220ms ease",
      }}
    />
  );
}

const noteStyle: CSSProperties = {
  fontFamily: SANS,
  fontSize: 12.5,
  lineHeight: "19px",
  color: SAND_400,
  margin: 0,
};

const valueCell: CSSProperties = {
  ...NUM,
  minWidth: 76,
  textAlign: "right",
  flex: "0 0 auto",
};

function DrawerBody({ onClose }: { onClose?: () => void }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: WHITE,
        fontFamily: SANS,
        color: INK,
        boxSizing: "border-box",
      }}
    >
      {/* header --------------------------------------------------- */}
      <div
        style={{
          height: 52,
          flex: "0 0 auto",
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "0 24px",
          borderBottom: `1px solid ${HAIR}`,
          boxSizing: "border-box",
        }}
      >
        <span
          style={{
            width: 26,
            height: 26,
            borderRadius: 8,
            background: HAIR_SOFT,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flex: "0 0 auto",
          }}
        >
          <WalletIcon size={14} color={INK_600} />
        </span>
        <span
          style={{ fontSize: 15.5, fontWeight: 600, letterSpacing: "-.15px", color: INK }}
        >
          Credits
        </span>
        <span style={{ marginLeft: "auto", fontSize: 12.5, color: SAND_500 }}>No refill</span>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close credits"
            style={{
              border: 0,
              background: "transparent",
              padding: 0,
              margin: 0,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              flex: "0 0 auto",
            }}
          >
            <CloseIcon size={15} color={GREY_400} />
          </button>
        ) : null}
      </div>

      {/* body ----------------------------------------------------- */}
      <div
        style={{
          flex: "1 1 auto",
          overflowY: "auto",
          padding: "14px 24px 12px",
          display: "flex",
          flexDirection: "column",
          gap: 13,
          boxSizing: "border-box",
        }}
      >
        {/* 1. what you have -------------------------------------- */}
        <section>
          <BlockHead icon={<DatabaseIcon size={12} color={SAND_700} />} title="What you have" />
          <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginTop: 18 }}>
            <span
              style={{
                ...NUM,
                fontSize: 44,
                lineHeight: "42px",
                letterSpacing: "-2px",
                color: INK,
              }}
            >
              7.00
            </span>
            <span style={{ fontSize: 13, color: SAND_500 }}>credits, granted once</span>
          </div>
          <p
            style={{
              margin: "16px 0 0",
              fontSize: 14.5,
              lineHeight: "23px",
              color: INK_700,
              maxWidth: "62ch",
            }}
          >
            They never refill. One LinkedIn post would take all of it.
          </p>
        </section>

        {/* 2. what things cost ----------------------------------- */}
        <section>
          <BlockHead icon={<TagIcon size={12} color={SAND_700} />} title="What things cost" credits />

          <div style={{ display: "flex", flexDirection: "column", gap: 7, marginTop: 12 }}>
            {PRICES.map((row) => {
              const over = row.value > BALANCE;
              const tone = over ? OVER_TEXT : INK;
              return (
                <div
                  key={row.label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    whiteSpace: "nowrap",
                    ...NUM,
                    fontSize: 15,
                    color: tone,
                    transition: "color 220ms ease",
                  }}
                >
                  <AgentMark id={row.mark} dim={over} />
                  <span style={{ transition: "color 220ms ease" }}>{row.label}</span>
                  {row.note ? (
                    <span
                      style={{
                        fontFamily: SANS,
                        fontSize: 12,
                        color: over ? OVER_TEXT : SAND_400,
                        transition: "color 220ms ease",
                      }}
                    >
                      {row.note}
                    </span>
                  ) : null}
                  <Leader color={over ? OVER_LEADER : HAIR_WARM} />
                  <span style={{ ...valueCell, color: tone, transition: "color 220ms ease" }}>
                    {row.value.toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>

          <p style={{ ...noteStyle, marginTop: 14 }}>
            Derived from your monthly task estimates in Settings. Okara never puts a price on an
            action.
          </p>

          {/* chat replaces a priced row: it has no fixed price */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              whiteSpace: "nowrap",
              ...NUM,
              fontSize: 15,
              color: INK,
              marginTop: 16,
            }}
          >
            <AgentMark id="chat" />
            <span>Chat message</span>
            <Leader color={HAIR_WARM} />
            <span style={valueCell}>0.61 to 4.28</span>
          </div>

          <p style={{ ...noteStyle, marginTop: 10 }}>
            The only action with no fixed price. It ranged 0.61 to 4.28 across 3 messages, and every
            credit spent on this account went on it.
          </p>
        </section>

        {/* 3. what you spent ------------------------------------- */}
        <section>
          <BlockHead icon={<ReceiptIcon size={12} color={SAND_700} />} title="What you spent" credits />

          <div style={{ display: "flex", flexDirection: "column", gap: 7, marginTop: 12 }}>
            {SPEND.map((row) => {
              const tone = row.muted ? SAND_400 : INK_700;
              return (
                <div
                  key={row.label + row.date}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    whiteSpace: "nowrap",
                    ...NUM,
                    fontSize: 15,
                    color: tone,
                  }}
                >
                  <span
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 6,
                      background: HAIR_SOFT,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flex: "0 0 auto",
                    }}
                  >
                    <MessageIcon size={12} color={SAND_500} />
                  </span>
                  <span
                    style={{
                      width: 122,
                      flex: "0 0 122px",
                      fontSize: 13,
                      color: row.muted ? SAND_400 : SAND_500,
                    }}
                  >
                    {row.date}
                  </span>
                  <span>{row.label}</span>
                  <Leader color={HAIR_WARM} />
                  <span style={{ ...valueCell, color: row.muted ? SAND_400 : INK }}>
                    {row.value}
                  </span>
                </div>
              );
            })}

            {/* total */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                whiteSpace: "nowrap",
                marginTop: 5,
                paddingTop: 12,
                borderTop: `1px solid ${INK}`,
                ...NUM,
                fontSize: 15,
                fontWeight: 500,
                color: INK,
              }}
            >
              <span style={{ width: 20, flex: "0 0 20px" }} />
              <span style={{ width: 122, flex: "0 0 122px" }} />
              <span style={{ fontFamily: SANS, fontSize: 13.5, fontWeight: 600, color: INK }}>
                Left
              </span>
              <Leader color={HAIR_WARM} />
              <span style={{ ...valueCell, color: INK, fontWeight: 500 }}>7.00</span>
            </div>
          </div>

          <p style={{ ...noteStyle, marginTop: 14 }}>
            Okara’s activity log accounts for 5.63 of the 7.37 spent. The other 1.74 is not itemised
            anywhere. Every credit it can account for went on chat, and none went on shipping.
          </p>
        </section>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* scene                                                               */
/* ------------------------------------------------------------------ */

function ColumnHead({ icon, title }: { icon: ReactNode; title: string }) {
  return (
    <div
      style={{
        height: 32,
        flex: "0 0 auto",
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "0 12px",
        borderBottom: `1px solid ${HAIR}`,
        boxSizing: "border-box",
      }}
    >
      {icon}
      <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 600, color: INK_900 }}>
        {title}
      </span>
      <ChevronLeft size={13} color={GREY_400} style={{ marginLeft: "auto" }} />
    </div>
  );
}

const sectionLabel: CSSProperties = {
  fontFamily: DISPLAY,
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: ".55px",
  textTransform: "uppercase",
  color: SAND_700,
};

function CompanyColumn() {
  return (
    <div
      style={{
        width: 318,
        flex: "0 0 318px",
        height: "100%",
        background: WHITE,
        borderRight: `1px solid ${HAIR}`,
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <ColumnHead icon={<FileIcon size={14} color={SAND_700} />} title="Company" />

      <div style={{ padding: 12, overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              width: 24,
              height: 24,
              borderRadius: 6,
              background: BAR,
              color: WHITE,
              fontFamily: MONO,
              fontSize: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flex: "0 0 auto",
            }}
          >
            S
          </span>
          <span style={{ fontFamily: SANS, fontSize: 14, fontWeight: 600, color: INK_900 }}>
            Skribbl
          </span>
          <PencilIcon size={13} color={GREY_400} style={{ marginLeft: "auto" }} />
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
          {["Hybrid", "@ skribbldev", "in skribbl.dev"].map((t) => (
            <span
              key={t}
              style={{
                fontFamily: SANS,
                fontSize: 11,
                color: INK_600,
                border: `1px solid ${HAIR_WARM}`,
                borderRadius: 9999,
                padding: "3px 8px",
              }}
            >
              {t}
            </span>
          ))}
        </div>

        <p
          style={{
            margin: "12px 0 0",
            fontFamily: SANS,
            fontSize: 12,
            lineHeight: "18px",
            color: INK,
          }}
        >
          Skribbl is a desktop application that gives developers a unified interface to run multiple
          AI coding agents, Claude, Codex, Gemini, and Grok, side by side, each in its own real
          terminal.
        </p>

        <div style={{ height: 1, background: HAIR, margin: "14px 0" }} />

        <div style={sectionLabel}>Documents</div>
        <div style={{ marginTop: 6 }}>
          {DOCUMENTS.map((d) => (
            <div key={d} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0" }}>
              <FileIcon size={13} color={SAND_700} />
              <span style={{ fontFamily: SANS, fontSize: 13, color: INK_900 }}>{d}</span>
              <ChevronRight size={12} color={GREY_400} style={{ marginLeft: "auto" }} />
            </div>
          ))}
        </div>

        <div style={{ height: 1, background: HAIR, margin: "14px 0" }} />

        <div style={{ display: "flex", alignItems: "center" }}>
          <span style={sectionLabel}>Competitors</span>
          <PencilIcon size={13} color={GREY_400} style={{ marginLeft: "auto" }} />
        </div>
        <div
          style={{
            marginTop: 10,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "10px 8px",
          }}
        >
          {COMPETITORS.map((c) => (
            <div key={c.name} style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
              <span
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 4,
                  background: c.bg,
                  color: WHITE,
                  fontFamily: MONO,
                  fontSize: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flex: "0 0 auto",
                }}
              >
                {c.ch}
              </span>
              <span
                style={{
                  fontFamily: SANS,
                  fontSize: 11,
                  color: INK,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {c.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AnalyticsRail() {
  return (
    <div
      style={{
        width: 40,
        flex: "0 0 40px",
        height: "100%",
        background: "#fdfdfc",
        borderRight: `1px solid ${HAIR}`,
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: 10,
        gap: 13,
        overflow: "hidden",
      }}
    >
      <ChevronRight size={13} color={GREY_400} />
      <BarChartIcon size={13} color={SAND_700} />
      <span
        style={{
          fontFamily: MONO,
          fontSize: 10,
          letterSpacing: "1.4px",
          textTransform: "uppercase",
          color: SAND_300,
          writingMode: "vertical-rl",
        }}
      >
        Analytics
      </span>
    </div>
  );
}

function AgentsColumn({ feedSlot }: { feedSlot?: ReactNode }) {
  return (
    <div
      style={{
        width: 372,
        flex: "0 0 372px",
        height: "100%",
        borderRight: `1px solid ${HAIR}`,
        boxSizing: "border-box",
        overflow: "hidden",
        background: WHITE,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {feedSlot ?? <ColumnHead icon={<FileIcon size={14} color={SAND_700} />} title="Agents Feed" />}
    </div>
  );
}

function ChatColumn() {
  return (
    <div
      style={{
        flex: "1 1 auto",
        height: "100%",
        background: WHITE,
        boxSizing: "border-box",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <ColumnHead icon={<MessageIcon size={14} color={SAND_700} />} title="Talk to AI CMO" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* account menu, rebuilt from Okara's own popover                      */
/* ------------------------------------------------------------------ */

function MenuRow({
  icon,
  label,
  dot,
  chevron,
}: {
  icon: React.ReactNode;
  label: string;
  dot?: boolean;
  chevron?: boolean;
}) {
  return (
    <span
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "9px 18px",
        fontFamily: SANS,
        fontSize: 15,
        color: INK,
        whiteSpace: "nowrap",
      }}
    >
      {icon}
      {label}
      {dot && (
        <span
          style={{ width: 7, height: 7, borderRadius: 9999, background: "#00b398", flex: "0 0 auto" }}
        />
      )}
      {chevron && (
        <span style={{ marginLeft: "auto", display: "flex" }}>
          <ChevronRight size={14} color="#9ca3af" />
        </span>
      )}
    </span>
  );
}

function AccountMenu({ onOpenCredits }: { onOpenCredits: () => void }) {
  return (
    <div
      style={{
        position: "absolute",
        top: 50,
        right: 10,
        width: 322,
        zIndex: 20,
        background: "#ffffff",
        border: `1px solid ${HAIR_SOFT}`,
        borderRadius: 14,
        boxShadow: "0 18px 44px -18px rgba(26,25,25,.42), 0 2px 6px rgba(26,25,25,.08)",
        overflow: "hidden",
        textAlign: "left",
      }}
    >
      <div style={{ padding: "16px 18px 14px", position: "relative" }}>
        <span style={{ position: "absolute", top: 16, right: 18, display: "flex" }}>
          <Moon size={17} color={INK_600} />
        </span>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
          <span
            style={{
              width: 46,
              height: 46,
              flex: "0 0 46px",
              borderRadius: 9999,
              background: "#8a8272",
              color: "#ffffff",
              fontFamily: SANS,
              fontSize: 15,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            JJ
          </span>
          <span style={{ display: "flex", flexDirection: "column", gap: 3, minWidth: 0 }}>
            <span style={{ fontFamily: SANS, fontSize: 16, fontWeight: 600, color: INK }}>
              Jawad Jalal
            </span>
            <span style={{ fontFamily: SANS, fontSize: 13.5, color: "#8c8578" }}>
              hijawadjalal@gmail.com
            </span>
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginTop: 14, paddingLeft: 60 }}>
          {/* the one click to credits: the number is the trigger */}
          <button
            type="button"
            onClick={onOpenCredits}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              border: `1px solid ${HAIR_SOFT}`,
              background: "#faf8f4",
              borderRadius: 9999,
              padding: "6px 12px",
              fontFamily: SANS,
              fontSize: 13,
              fontWeight: 500,
              color: INK_600,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            <span style={{ fontFamily: MONO, fontVariantNumeric: "tabular-nums" }}>7.00</span>
            Credits
            <ChevronDown size={13} color="#9ca3af" />
          </button>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              background: "#000000",
              color: "#ffffff",
              borderRadius: 9999,
              padding: "6px 15px",
              fontFamily: SANS,
              fontSize: 13,
              fontWeight: 600,
              whiteSpace: "nowrap",
            }}
          >
            Upgrade
          </span>
        </div>
      </div>

      <div style={{ height: 1, background: HAIR_SOFT }} />
      <div style={{ padding: "6px 0" }}>
        <MenuRow icon={<Plug size={18} color={INK_600} />} label="Integrations" />
        <MenuRow icon={<Gear size={18} color={INK_600} />} label="Settings" dot />
        <MenuRow icon={<Globe size={18} color={INK_600} />} label="Language" chevron />
        <MenuRow icon={<Gift size={18} color={INK_600} />} label="Invite Friends & Earn Money" />
      </div>
      <div style={{ height: 1, background: HAIR_SOFT }} />

      <div style={{ display: "flex", alignItems: "center", padding: "11px 18px" }}>
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            flex: 1,
            justifyContent: "center",
            fontFamily: SANS,
            fontSize: 14.5,
            color: INK,
          }}
        >
          <FileDoc size={17} color={INK_600} />
          Docs
        </span>
        <span style={{ width: 1, height: 20, background: HAIR_SOFT }} />
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            flex: 1,
            justifyContent: "center",
            fontFamily: SANS,
            fontSize: 14.5,
            color: "#d94a3d",
          }}
        >
          <LogOut size={17} color="#d94a3d" />
          Log out
        </span>
      </div>
    </div>
  );
}

function TopBar({
  menuOpen,
  onToggleMenu,
  onOpenCredits,
}: {
  menuOpen: boolean;
  onToggleMenu: () => void;
  onOpenCredits: () => void;
}) {
  return (
    <div
      style={{
        height: BAR_H,
        flex: `0 0 ${BAR_H}px`,
        background: BAR,
        display: "flex",
        alignItems: "center",
        padding: "0 16px",
        boxSizing: "border-box",
      }}
    >
      <ChevronDown size={16} color={SAND_300} />

      <span
        style={{
          marginLeft: 20,
          display: "flex",
          alignItems: "center",
          gap: 7,
          background: "rgba(255,255,255,.09)",
          border: "1px solid rgba(255,255,255,.12)",
          borderRadius: 8,
          padding: "5px 10px",
        }}
      >
        <span
          style={{
            width: 16,
            height: 16,
            borderRadius: 4,
            background: WHITE,
            color: BAR,
            fontFamily: MONO,
            fontSize: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flex: "0 0 auto",
          }}
        >
          S
        </span>
        <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 600, color: "#fafaf9" }}>
          Skribbl
        </span>
      </span>

      <span style={{ marginLeft: 11, fontFamily: SANS, fontSize: 12, color: SAND_300 }}>
        Okara Terminal
      </span>

      <span
        style={{
          width: 1,
          height: 18,
          background: "rgba(255,255,255,.16)",
          margin: "0 12px",
          flex: "0 0 auto",
        }}
      />

      <span style={{ fontFamily: MONO, fontSize: 12, color: "#5fd6c3", whiteSpace: "nowrap" }}>
        {"✓"} Documents loaded and CMO initialized. Chat with your CMO.
      </span>

      {/* the account button opens Okara's own profile menu. Credits live one
          click deeper, on the number inside it. */}
      <button
        type="button"
        onClick={onToggleMenu}
        aria-expanded={menuOpen}
        style={{
          marginLeft: "auto",
          display: "flex",
          alignItems: "center",
          gap: 9,
          background: "transparent",
          border: 0,
          padding: 0,
          cursor: "pointer",
          textAlign: "left",
          flex: "0 0 auto",
        }}
      >
        <span
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            background: HAIR_WARM,
            color: INK_600,
            fontFamily: SANS,
            fontSize: 11,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flex: "0 0 auto",
          }}
        >
          JJ
        </span>
        <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <span
            style={{
              fontFamily: SANS,
              fontSize: 12,
              fontWeight: 500,
              lineHeight: "13px",
              color: "#fafaf9",
            }}
          >
            Jawad Jalal
          </span>
          {/* the only amber on the screen */}
          <span style={{ fontFamily: SANS, fontSize: 11, lineHeight: "12px", color: AMBER }}>
            7.00 credits · one LinkedIn post, and that is it
          </span>
        </span>
        <ChevronDown
          size={14}
          color={SAND_300}
          style={{
            transform: menuOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: `transform 260ms ${EASE_CHEVRON}`,
          }}
        />
      </button>

      {menuOpen && <AccountMenu onOpenCredits={onOpenCredits} />}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* component                                                           */
/* ------------------------------------------------------------------ */

export default function CreditsPanel({
  bare = false,
  feedSlot,
}: {
  bare?: boolean;
  feedSlot?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [replay, setReplay] = useState(0);

  useEffect(() => {
    if (bare) return;
    const id = window.setTimeout(() => setOpen(true), 620);
    return () => window.clearTimeout(id);
  }, [bare, replay]);

  if (bare) {
    return (
      <div
        style={{
          width: DRAWER_W,
          minHeight: BODY_H,
          background: WHITE,
          boxSizing: "border-box",
        }}
      >
        <DrawerBody />
      </div>
    );
  }

  return (
    <div
      style={{
        position: "relative",
        width: SCENE_W,
        height: SCENE_H,
        background: SHELL_BG,
        border: `1px solid ${SHELL_EDGE}`,
        borderRadius: 12,
        overflow: "hidden",
        boxSizing: "border-box",
        fontFamily: SANS,
        color: INK,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <TopBar
          menuOpen={menuOpen}
          onToggleMenu={() => {
            const next = !menuOpen;
            setMenuOpen(next);
            // the menu and the drawer never share the screen
            if (next) setOpen(false);
          }}
          onOpenCredits={() => {
            setMenuOpen(false);
            setOpen(true);
          }}
        />
        <div style={{ flex: "1 1 auto", display: "flex", minHeight: 0 }}>
          <CompanyColumn />
          <AnalyticsRail />
          <AgentsColumn feedSlot={feedSlot} />
          <ChatColumn />
        </div>
      </div>

      {/* scrim */}
      <div
        onClick={() => setOpen(false)}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: BAR_H,
          bottom: 0,
          background: "rgba(26,25,25,.2)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity 300ms ease",
        }}
      />

      {/* replay affordance, only while the drawer is shut */}
      <button
        type="button"
        onClick={() => {
          setOpen(false);
          setReplay((n) => n + 1);
        }}
        style={{
          position: "absolute",
          left: 16,
          bottom: 16,
          display: "flex",
          alignItems: "center",
          gap: 7,
          padding: "6px 11px",
          borderRadius: 9999,
          border: `1px solid ${HAIR_WARM}`,
          background: WHITE,
          color: SAND_500,
          fontFamily: SANS,
          fontSize: 12,
          cursor: "pointer",
          opacity: open ? 0 : 1,
          pointerEvents: open ? "none" : "auto",
          transition: "opacity 300ms ease",
        }}
      >
        <ReplayIcon size={13} color={SAND_500} />
        Replay
      </button>

      {/* drawer */}
      <div
        style={{
          position: "absolute",
          top: BAR_H,
          right: 0,
          bottom: 0,
          width: DRAWER_W,
          display: "flex",
          flexDirection: "column",
          background: WHITE,
          borderLeft: `1px solid ${HAIR_WARM}`,
          boxShadow: "-20px 0 46px -26px rgba(26,25,25,.45)",
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: `transform 300ms ${EASE_DRAWER}`,
          willChange: "transform",
          boxSizing: "border-box",
        }}
      >
        <DrawerBody onClose={() => setOpen(false)} />
      </div>
    </div>
  );
}
