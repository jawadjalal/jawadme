"use client";

// The page itself: a 640px column of plain paragraphs that type themselves in.
//
// Every piece of copy is a keyed entry in SCRIPT, laid end to end into one long
// string. A single character counter runs over that string at a fixed rate, and
// each block renders only the slice of its own text that the counter has
// reached — so the whole page shares one cursor and the order on screen is just
// the order in the array.
//
// Blocks are wrapped in <Resize> because a paragraph that gains a line would
// otherwise shove everything below it down a whole line-height in one frame.

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { Beam } from "./Beam";
import { Squircle } from "./Squircle";

const INK = "#0A0A0A";
const PAPER = "#fdfdfc";
const TILE = "#f4f4f2";

const CHARS_PER_SECOND = 150;
const BEAM_AT = 0.5; // seconds before the avatar's beam lights up
const TYPE_AT = 0.6; // seconds before the first character lands
const TILE_HOLD = 700; // ms a project tile keeps its beam after the icon loads

const EMAIL = "hijawadjalal@gmail.com";

// Apple's emoji set, so the flag renders the same on Windows and Linux as it
// does on a Mac. The system font would otherwise fall back to letters.
const EMOJI_CDN = "https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.1.2/img/apple/64";

const PROJECTS = [
  {
    key: "skribbl",
    name: "skribbl.dev",
    href: "https://skribbl.dev",
    icon: "https://www.google.com/s2/favicons?domain=skribbl.dev&sz=128",
    blurb: "Mac app that runs several coding agents at once",
  },
  {
    key: "bevel",
    name: "bevel.team",
    href: "https://bevel.team",
    icon: "https://www.google.com/s2/favicons?domain=bevel.team&sz=128",
    blurb: "3D art team you can hire by the job",
  },
  {
    key: "bidframe",
    name: "bidframe.org",
    href: "https://bidframe.org",
    icon: "https://www.google.com/s2/favicons?domain=bidframe.org&sz=128",
    blurb: "Reads public tenders and flags what would sink a bid",
  },
  {
    key: "weld",
    name: "weld.",
    href: "https://weldroblox.com",
    icon: "https://www.google.com/s2/favicons?domain=weldroblox.com&sz=128",
    blurb: "Fixing how Roblox studios hire developers",
  },
] as const;

// The script, in the order it types. Splitting the prose into fragments around
// each link is what lets a link underline appear mid-sentence rather than the
// whole sentence waiting for its anchor.
const SCRIPT = [
  ["name", "Jawad Jalal"],
  ["role", "Designer & founder"],
  ["loc", "London"],
  ["p1", "I'm a designer and founder, working on my own things."],
  ["p2", "Currently focused on four projects:"],
  ...PROJECTS.flatMap(
    (p) =>
      [
        [`${p.key}Title`, p.name],
        [`${p.key}Desc`, p.blurb],
      ] as [string, string][],
  ),
  ["p3", "I also do a fair bit of 3D art and brand design on the side."],
  ["p4a", "I'm a 3D artist at "],
  ["worldent", "World Ent"],
  ["p4b", " and on the acquisitions team at "],
  ["basket", "Basket Ent"],
  ["p4c", "."],
  ["p5", "I love working with the web and shipping things that actually look good."],
  ["p6a", "You can find me on "],
  ["x", "X"],
  ["p6b", ", "],
  ["li", "LinkedIn"],
  ["p6c", ", "],
  ["ig", "Instagram"],
  ["p6d", ", "],
  ["yt", "YouTube"],
  ["p6e", " or via "],
  ["email", "email"],
  ["p6f", ". You can also read my "],
  ["cv", "CV"],
  ["p6g", "."],
] as [string, string][];

// Flattened once at module scope: the text of each key, and the offset at which
// that key starts in the single shared cursor.
const TEXT: Record<string, string> = {};
const OFFSET: Record<string, number> = {};
let TOTAL = 0;
for (const [key, value] of SCRIPT) {
  TEXT[key] = value;
  OFFSET[key] = TOTAL;
  TOTAL += value.length;
}

function Emoji({ code, label }: { code: string; label: string }) {
  return (
    <img
      src={`${EMOJI_CDN}/${code}.png`}
      alt={label}
      draggable={false}
      className="hm-emoji"
    />
  );
}

// Animates its own height so a paragraph gaining a line eases the rest of the
// page down instead of jumping it.
function Resize({ children, className = "" }: { children: ReactNode; className?: string }) {
  const inner = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number>();

  useLayoutEffect(() => {
    const el = inner.current;
    if (!el) return;
    setHeight(el.offsetHeight);
    const ro = new ResizeObserver(() => setHeight(el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div className={`t-resize ${className}`} style={{ height }}>
      <div ref={inner}>{children}</div>
    </div>
  );
}

function Link({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="hm-link"
    >
      {children}
    </a>
  );
}

// A project icon on its tile. The beam runs until the icon has both loaded and
// served its minimum hold, so a cached image still gets a moment of light
// rather than flashing the effect for one frame.
function Tile({ src, alt, instant }: { src: string; alt: string; instant: boolean }) {
  const [loaded, setLoaded] = useState(false);
  const [held, setHeld] = useState(instant);

  useEffect(() => {
    if (instant) return;
    const t = window.setTimeout(() => setHeld(true), TILE_HOLD);
    return () => clearTimeout(t);
  }, [instant]);

  const ready = loaded && held;

  return (
    <div className="t-slot-in">
      <Beam active={!instant && !ready} radius={12}>
        <div
          className="hm-tile"
          style={{ background: ready ? "transparent" : TILE }}
        >
          <img
            src={src}
            alt={alt}
            draggable={false}
            className={ready ? "t-image" : "t-hidden"}
            onLoad={() => setLoaded(true)}
            ref={(el) => {
              if (el?.complete && el.naturalWidth) setLoaded(true);
            }}
          />
        </div>
      </Beam>
    </div>
  );
}

export default function Profile() {
  // `instant` short-circuits every animation: it is set when the visitor has
  // asked for reduced motion, and the page renders fully typed.
  const [instant, setInstant] = useState(false);
  const [typing, setTyping] = useState(false);
  const [cursor, setCursor] = useState(0);
  const [beamOn, setBeamOn] = useState(false);
  const [avatarLoaded, setAvatarLoaded] = useState(false);
  const [copied, setCopied] = useState(false);
  const toastTimer = useRef(0);

  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setInstant(true);
      setTyping(true);
      setCursor(TOTAL);
      setBeamOn(true);
      return;
    }
    const beam = window.setTimeout(() => setBeamOn(true), BEAM_AT * 1000);
    const type = window.setTimeout(() => setTyping(true), TYPE_AT * 1000);
    return () => {
      clearTimeout(beam);
      clearTimeout(type);
    };
  }, []);

  // The cursor advances on wall-clock time rather than per frame, so the rate
  // is the same on a 60Hz and a 120Hz display. The per-frame delta is capped at
  // 100ms so a backgrounded tab does not resume with the page already typed.
  useEffect(() => {
    if (!typing || instant) return;
    let last = performance.now();
    let chars = 0;
    let raf = 0;
    const step = (now: number) => {
      chars += Math.min(0.1, (now - last) / 1000) * CHARS_PER_SECOND;
      last = now;
      const next = Math.min(TOTAL, Math.floor(chars));
      setCursor(next);
      if (next < TOTAL) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [typing, instant]);

  // The slice of `key` typed so far, one <span> per character so each can blur
  // in on its own.
  const type = (key: string) => {
    const n = Math.max(0, Math.min(TEXT[key].length, cursor - OFFSET[key]));
    if (n === 0) return null;
    return TEXT[key]
      .slice(0, n)
      .split("")
      .map((ch, i) => (
        <span className="t-char" key={i}>
          {ch}
        </span>
      ));
  };

  const started = (key: string) => cursor >= OFFSET[key];
  const finished = (key: string) => cursor >= OFFSET[key] + TEXT[key].length;

  const copyEmail = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
    } catch {
      // Clipboard access can be refused (insecure context, denied permission).
      // The toast still confirms, and the address is in the toast to copy by
      // hand — better than a dead button with no feedback.
    }
    setCopied(true);
    clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setCopied(false), 2400);
  }, []);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const avatarReady = beamOn && avatarLoaded;

  return (
    <main
      className="hm-main">
      <header className="hm-header">
        <div className="t-slot-in hm-avatar-slot">
          <Beam active={!instant && !avatarReady} radius={30}>
            <Squircle
              radius={30}
              smoothing={0.8}
              className="hm-avatar"
            >
              <img
                src="/design/jawad.webp"
                alt="Jawad Jalal"
                className={avatarReady ? "t-image" : "t-hidden"}
                onLoad={() => setAvatarLoaded(true)}
                ref={(el) => {
                  if (el?.complete && el.naturalWidth) setAvatarLoaded(true);
                }}
              />
            </Squircle>
          </Beam>
        </div>

        <div className="hm-id">
          <h1 className="hm-name">
            {type("name")}
          </h1>
          <p className="hm-role">{type("role")}</p>
          <p className="hm-loc">
            {started("loc") && (
              <span className="t-char">
                <Emoji code="1f1ec-1f1e7" label="United Kingdom" />
              </span>
            )}{" "}
            {type("loc")}
          </p>
        </div>
      </header>

      <Resize className="hm-mt-10">
        <p>{type("p1")}</p>
      </Resize>

      <Resize className="hm-mt-4">
        <p>{type("p2")}</p>
      </Resize>

      <Resize className="hm-mt-8">
        <div className="hm-projects">
          {PROJECTS.map((p) =>
            started(`${p.key}Title`) ? (
              <a
                key={p.key}
                href={p.href}
                target="_blank"
                rel="noreferrer"
                className="hm-project"
              >
                <Tile src={p.icon} alt={p.name} instant={instant} />
                <div className="hm-id">
                  <span className="hm-project-name">
                    <span>{type(`${p.key}Title`)}</span>
                    {finished(`${p.key}Title`) && (
                      <span className="t-char inline-flex">
                        <ArrowUpRight />
                      </span>
                    )}
                  </span>
                  <p className="hm-project-blurb">
                    {type(`${p.key}Desc`)}
                  </p>
                </div>
              </a>
            ) : null,
          )}
        </div>
      </Resize>

      <Resize className="hm-mt-10">
        <p>{type("p3")}</p>
      </Resize>

      <Resize className="hm-mt-4">
        <p>
          {type("p4a")}
          <Link href="https://games.worldent.online">{type("worldent")}</Link>
          {type("p4b")}
          <Link href="https://basketent.com">{type("basket")}</Link>
          {type("p4c")}
        </p>
      </Resize>

      <Resize className="hm-mt-4">
        <p>{type("p5")}</p>
      </Resize>

      <Resize className="hm-mt-4">
        <p>
          {type("p6a")}
          <Link href="https://x.com/jawadmakes">{type("x")}</Link>
          {type("p6b")}
          <Link href="https://www.linkedin.com/in/jawad-jalal-designs">{type("li")}</Link>
          {type("p6c")}
          <Link href="https://www.instagram.com/j.awadjalal/">{type("ig")}</Link>
          {type("p6d")}
          <Link href="https://www.youtube.com/@jawadmake">{type("yt")}</Link>
          {type("p6e")}
          {started("email") && (
            <button
              type="button"
              onClick={copyEmail}
              className="hm-link"
            >
              {type("email")}
            </button>
          )}
          {type("p6f")}
          <Link href="/jawad-jalal-cv.pdf">{type("cv")}</Link>
          {type("p6g")}
        </p>
      </Resize>

      <div
        role="status"
        className={`t-toast ${copied ? "is-open" : ""}`}
        style={{ background: INK, color: PAPER }}
      >
        <Emoji code="1f4cb" label="clipboard" /> Copied {EMAIL}
      </div>
    </main>
  );
}

function ArrowUpRight() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 6.65032C9 6.65032 15.9383 6.10759 16.9154 7.08463C17.8924 8.06167 17.3496 15 17.3496 15M16.5 7.5L6.5 17.5" />
    </svg>
  );
}
