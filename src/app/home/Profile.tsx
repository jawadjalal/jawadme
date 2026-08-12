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
import { SOCIALS } from "@/lib/content";
import { Beam } from "./Beam";
import { Preview } from "./Preview";
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

// What he is actually working on. Two, so they sit side by side without the
// blurbs wrapping to four lines each.
const PROJECTS = [
  {
    key: "skribbl",
    name: "skribbl",
    href: "https://skribbl.dev",
    icon: "https://www.google.com/s2/favicons?domain=skribbl.dev&sz=128",
    blurb: "mac app for running a few coding agents at once",
    bevel: false,
  },
  {
    key: "bevel",
    name: "bevel",
    href: "https://bevel.team",
    icon: "https://www.google.com/s2/favicons?domain=bevel.team&sz=128",
    blurb: "3d art team you can hire by the job",
    bevel: true,
  },
] as const;

// Older things, folded away behind a toggle. They are still live and still his,
// they are just not what he is spending the week on — putting them in the same
// row as the current two would say otherwise.
//
// Deliberately not part of SCRIPT: the typing cursor runs over one flat string,
// so copy that starts collapsed would stall it behind characters nobody can
// see. These fade in on open instead.
const ARCHIVE = [
  {
    key: "bidframe",
    name: "bidframe",
    href: "https://bidframe.org",
    icon: "https://www.google.com/s2/favicons?domain=bidframe.org&sz=128",
    blurb: "reads public tenders and flags what would sink a bid",
    bevel: false,
  },
  {
    key: "weld",
    name: "weld",
    href: "https://weldroblox.com",
    icon: "https://www.google.com/s2/favicons?domain=weldroblox.com&sz=128",
    blurb: "marketplace for how roblox studios hire developers",
    bevel: true,
  },
] as const;

// The rest of the history, under the same toggle but as plain rows rather than
// tiles. These are real and current — cosmos models and sof agency are not
// "old" — they are simply not the headline, and giving each one a tile would
// turn a profile into a portfolio. Name, then one short line.
//
// Same reasoning as ARCHIVE: outside SCRIPT, so the typing cursor never waits
// on characters hidden behind a collapsed panel.
const ELSEWHERE = [
  { name: "jawadj.design", href: "https://jawad-portfolio-kohl.vercel.app", note: "brand identity, ui/ux and full site builds" },
  { name: "acquiblox", href: "https://acquiblox.com", note: "cmo, marketing and community growth" },
  { name: "cosmos models", href: "https://cosmosmodels.lovable.app", note: "3d commissions in zbrush, blender and substance" },
  { name: "sof agency", href: "https://sof.agency", note: "pr, partnerships and crowdfunding for game studios" },
  { name: "vizzbees", href: "https://vizzbees.com", note: "saas site build" },
  { name: "kleoklaw", href: "https://kleoklaw.com", note: "mobile product site build" },
  { name: "splitting point", href: "https://splittingpoint.com", note: "landing page build" },
] as const;

// The script, in the order it types. Splitting the prose into fragments around
// each link is what lets a link underline appear mid-sentence rather than the
// whole sentence waiting for its anchor.
const SCRIPT = [
  ["name", "jawad jalal"],
  ["role", "designer & founder"],
  ["loc", "london"],
  ["p1", "i'm a designer and founder, mostly working on my own stuff."],
  ["p2", "right now it's two things:"],
  ...PROJECTS.flatMap(
    (p) =>
      [
        [`${p.key}Title`, p.name],
        [`${p.key}Desc`, p.blurb],
      ] as [string, string][],
  ),
  ["older", "everything else"],
  ["p3", "i also do a bit of 3d art and logo design on the side."],
  ["p4a", "i'm a 3d artist at "],
  ["worldent", "world ent"],
  ["p4b", " and help out on acquisitions at "],
  ["basket", "basket ent"],
  ["p4c", "."],
  ["p5", "i like the web, and making things that feel good to use."],
  ["p6a", "you can find me on "],
  ["x", "twitter/x"],
  ["p6b", ", "],
  ["li", "linkedin"],
  ["p6c", ", "],
  ["ig", "instagram"],
  ["p6d", ", "],
  ["yt", "youtube"],
  ["p6e", " or via "],
  ["email", "email"],
  ["p6f", ". my "],
  ["cv", "cv"],
  ["p6g", " is here too."],
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

// The real brand marks, keyed by the label they carry in src/lib/content.ts, so
// the glyph and its colour live in one place rather than being redrawn here.
const BRAND = Object.fromEntries(SOCIALS.map((s) => [s.label, s]));

function Brand({ label }: { label: string }) {
  const mark = BRAND[label];
  if (!mark) return null;
  return (
    <svg viewBox="0 0 24 24" fill={mark.brand} className="hm-brand" aria-hidden="true">
      <path d={mark.path} />
    </svg>
  );
}

// A social link: brand mark in the platform's own colour, then the name. The
// underline belongs to the name alone — running it under the glyph and the gap
// makes the mark look struck through.
function Social({ label, children }: { label: string; children: ReactNode }) {
  const mark = BRAND[label];
  return (
    <a href={mark.href} target="_blank" rel="noreferrer" className="hm-social">
      <Brand label={label} />
      <span className="hm-social-name">{children}</span>
    </a>
  );
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
function Tile({
  src,
  alt,
  instant,
  bevel,
}: {
  src: string;
  alt: string;
  instant: boolean;
  bevel: boolean;
}) {
  const [loaded, setLoaded] = useState(false);
  const [held, setHeld] = useState(instant);

  useEffect(() => {
    if (instant) return;
    const t = window.setTimeout(() => setHeld(true), TILE_HOLD);
    return () => clearTimeout(t);
  }, [instant]);

  const ready = loaded && held;

  const icon = (
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
  );

  return (
    <div className="t-slot-in">
      <Beam active={!instant && !ready} radius={12}>
        <div
          className="hm-tile"
          style={{ background: ready ? "transparent" : TILE }}
        >
          {/* Opt-in per project. A favicon that is a hard-edged square looks
              wrong inside a rounded tile, so it gets the same continuous curve
              as the avatar. But several of these marks already carry their own
              rounding, or sit on a transparent ground — clipping those either
              does nothing or shaves the artwork, so they are left alone. */}
          {bevel ? (
            <Squircle radius={10} smoothing={0.8} className="hm-tile-icon">
              {icon}
            </Squircle>
          ) : (
            icon
          )}
        </div>
      </Beam>
    </div>
  );
}

// One project row: tile, name with its outward arrow, one line of blurb.
// `name` and `blurb` are nodes rather than strings so the same card serves both
// the typed projects up top and the static ones inside the disclosure.
function Project({
  href,
  icon,
  alt,
  name,
  blurb,
  arrow,
  instant,
  bevel,
  previewKey,
}: {
  href: string;
  icon: string;
  alt: string;
  name: ReactNode;
  blurb: ReactNode;
  arrow: boolean;
  instant: boolean;
  bevel: boolean;
  previewKey: string;
}) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="hm-project">
      <Preview previewKey={previewKey}>
        <Tile src={icon} alt={alt} instant={instant} bevel={bevel} />
      </Preview>
      <div className="hm-id">
        <span className="hm-project-name">
          <span>{name}</span>
          {arrow && (
            <span className="t-char hm-arrow">
              <ArrowUpRight />
            </span>
          )}
        </span>
        <p className="hm-project-blurb">{blurb}</p>
      </div>
    </a>
  );
}

// The older-things toggle. Height is measured rather than transitioned from
// `auto`, which browsers will not animate, and the panel keeps its content
// mounted so the archive's icons are already decoded the first time it opens.
function Disclosure({ label, children }: { label: ReactNode; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const inner = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  // The panel has to clip while its height animates, or the contents spill past
  // the edge on the way open. But clipping also cuts off the hover previews,
  // which deliberately float above their row — so the clip is released once the
  // panel has finished opening, and reinstated the instant it starts to close.
  const [settled, setSettled] = useState(false);
  useEffect(() => {
    if (!open) {
      setSettled(false);
      return;
    }
    const ms =
      (parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--resize-dur")) ||
        0.3) * 1000;
    const t = window.setTimeout(() => setSettled(true), ms + 30);
    return () => clearTimeout(t);
  }, [open]);

  useLayoutEffect(() => {
    const el = inner.current;
    if (!el) return;
    const measure = () => setHeight(el.offsetHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="hm-disclosure"
      >
        <span className={`hm-chevron ${open ? "is-open" : ""}`} aria-hidden="true">
          <Chevron />
        </span>
        {/* The label arrives as one span per character from the typewriter, so
            it needs its own box — as direct children of the flex button they
            would each become a flex item and inherit the gap as letterspacing. */}
        <span>{label}</span>
      </button>

      {/* `inert` rather than aria-hidden: the panel keeps its links mounted
          while collapsed, and they must not be tabbable or read out. */}
      <div
        className={`hm-panel ${settled ? "is-settled" : ""}`}
        style={{ height: open ? height : 0 }}
        inert={!open}
      >
        <div ref={inner} className={`hm-panel-inner ${open ? "is-open" : ""}`}>
          {children}
        </div>
      </div>
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
              <Project
                key={p.key}
                href={p.href}
                icon={p.icon}
                alt={p.name}
                name={type(`${p.key}Title`)}
                blurb={type(`${p.key}Desc`)}
                arrow={finished(`${p.key}Title`)}
                instant={instant}
                bevel={p.bevel}
                previewKey={p.key}
              />
            ) : null,
          )}
        </div>
      </Resize>

      {started("older") && (
        <div className="hm-mt-8">
          <Disclosure label={type("older")}>
            <div className="hm-projects hm-archive">
              {ARCHIVE.map((p) => (
                <Project
                  key={p.key}
                  href={p.href}
                  icon={p.icon}
                  alt={p.name}
                  name={p.name}
                  blurb={p.blurb}
                  arrow
                  instant
                  bevel={p.bevel}
                  previewKey={p.key}
                />
              ))}
            </div>

            <ul className="hm-list">
              {ELSEWHERE.map((e) => (
                <li key={e.name}>
                  <Preview previewKey={e.name}>
                    <a href={e.href} target="_blank" rel="noreferrer" className="hm-link">
                      {e.name}
                    </a>
                  </Preview>
                  <span className="hm-list-note">{e.note}</span>
                </li>
              ))}
            </ul>
          </Disclosure>
        </div>
      )}

      <Resize className="hm-mt-10">
        <p>
          {type("p3")}
          {finished("p3") && (
            <span className="t-char hm-accent">
              <Emoji code="1f3a8" label="palette" />
            </span>
          )}
        </p>
      </Resize>

      <Resize className="hm-mt-4">
        <p>
          {type("p4a")}
          <Preview previewKey="world ent" inline>
            <Link href="https://games.worldent.online">{type("worldent")}</Link>
          </Preview>
          {type("p4b")}
          <Preview previewKey="basket ent" inline>
            <Link href="https://basketent.com">{type("basket")}</Link>
          </Preview>
          {type("p4c")}
        </p>
      </Resize>

      <Resize className="hm-mt-4">
        <p>
          {type("p5")}
          {finished("p5") && (
            <span className="t-char hm-accent">
              <Emoji code="1f310" label="globe" />
            </span>
          )}
        </p>
      </Resize>

      <Resize className="hm-mt-4">
        <p>
          {type("p6a")}
          <Social label="X">{type("x")}</Social>
          {type("p6b")}
          <Social label="LinkedIn">{type("li")}</Social>
          {type("p6c")}
          <Social label="Instagram">{type("ig")}</Social>
          {type("p6d")}
          <Social label="YouTube">{type("yt")}</Social>
          {type("p6e")}
          {started("email") && (
            <button type="button" onClick={copyEmail} className="hm-social">
              <MailIcon />
              <span className="hm-social-name">{type("email")}</span>
            </button>
          )}
          {type("p6f")}
          <a href="/jawad-jalal-cv.pdf" className="hm-social">
            <DocIcon />
            <span className="hm-social-name">{type("cv")}</span>
          </a>
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

// The email and CV are not platforms, so they get drawn marks rather than logos
// — same size and same slot as the brand glyphs so the line reads as one row.
function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" className="hm-brand" aria-hidden="true" fill="none"
      stroke="#0f9d76" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2.5" y="4.5" width="19" height="15" rx="2.5" />
      <path d="M3 7l9 6 9-6" />
    </svg>
  );
}

function DocIcon() {
  return (
    <svg viewBox="0 0 24 24" className="hm-brand" aria-hidden="true" fill="none"
      stroke="#e07a2f" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2.5H6.5A1.5 1.5 0 0 0 5 4v16a1.5 1.5 0 0 0 1.5 1.5h11A1.5 1.5 0 0 0 19 20V7.5z" />
      <path d="M14 2.5V8h5" />
    </svg>
  );
}

function Chevron() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 6l6 6-6 6" />
    </svg>
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
