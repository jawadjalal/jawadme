"use client";

/*
 * The drawers: a native modal <dialog> on the right (full screen on a phone), dark like the site, the drawer's felt
 * colour as the accent. One drawer for each thing Jawad has made or done (copy.ts, DRAWERS), and each is built the way
 * ignaru.com's are: big felt art off the top corner, a headline of two lines at most and one short line, then blocks
 * of one idea each (a headline, a line, then the real thing: a live piece of UI, a number set large, the actual
 * screens), and a sticky bar at the foot with one ink key. Pictures open full size in a lightbox. A spring slides the
 * drawer in and its page staggers up; Escape and the backdrop close it, the arrow keys step through. Styles: felt.css.
 */
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Book } from "./Book";
import { dayLink, type Booking } from "./booking";
import { ADS, DRAWERS, MENUFIT, SITES, feltSrc, type DrawerId, type Site } from "./copy";
import { sfx } from "./Sound";

type Zoom = { src: string; alt: string; tall?: boolean } | null;

export function Drawer({ booking, at, onClose, onStep }: { booking: Booking; at: number | null; onClose: () => void; onStep: (by: number) => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const lb = useRef<HTMLDialogElement>(null);
  const [shown, setShown] = useState(0);
  const [zoom, setZoom] = useState<Zoom>(null);
  useEffect(() => {
    if (at !== null) setShown(at);
    const d = ref.current;
    if (!d) return;
    if (at !== null && !d.open) {
      d.showModal();
      sfx("open");
    } else if (at === null && d.open) d.close();
  }, [at]);
  useEffect(() => {
    const d = ref.current;
    d?.addEventListener("close", onClose);
    return () => d?.removeEventListener("close", onClose);
  }, [onClose]);
  useEffect(() => {
    ref.current?.scrollTo(0, 0);
  }, [shown]);
  useEffect(() => {
    const d = lb.current;
    if (!d) return;
    if (zoom && !d.open) d.showModal();
    if (!zoom && d.open) d.close();
  }, [zoom]);
  const s = DRAWERS[shown];
  const page = PAGES[s.id];
  const z = (src: string, alt: string, tall?: boolean) => setZoom({ src, alt, tall });
  return (
    <dialog
      ref={ref}
      className={"wide" in s && s.wide ? "fh-dr fh-dr-wide" : "fh-dr"}
      aria-labelledby="fh-dr-t"
      style={{ ["--c" as string]: s.color, ["--ci" as string]: s.ink }}
      onClick={(e) => {
        if (e.target !== e.currentTarget) return;
        const r = e.currentTarget.getBoundingClientRect();
        if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) e.currentTarget.close();
      }}
      onKeyDown={(e) => {
        if (zoom || (e.target as HTMLElement).closest("input")) return;
        if (e.key === "ArrowRight") onStep(1);
        if (e.key === "ArrowLeft") onStep(-1);
      }}
    >
      <div className="fh-dr-bar">
        <div className="fh-dr-nav">
          <button type="button" onClick={() => onStep(-1)} aria-label="Previous">
            <Chev d="M9 3.5 5.5 7 9 10.5" />
          </button>
          <button type="button" onClick={() => onStep(1)} aria-label="Next">
            <Chev d="M5 3.5 8.5 7 5 10.5" />
          </button>
          <span className="fh-dr-count" aria-live="polite">
            {s.label} · {shown + 1} of {DRAWERS.length}
          </span>
        </div>
        <button type="button" onClick={() => ref.current?.close()} aria-label="Close">
          <Chev d="M3.5 3.5l7 7M10.5 3.5l-7 7" />
        </button>
      </div>
      <article className="fh-dr-page" key={s.id}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="fh-dr-art" src={`/felt/${s.art}.webp`} alt="" width={640} height={640} />
        <header className="fh-dr-head fh-in" style={{ ["--d" as string]: 0 }}>
          <h2 id="fh-dr-t">{page.title}</h2>
          <p>{page.line}</p>
        </header>
        {page.body({ booking, z }).map((b, i) => (
          <div key={i} className="fh-in" style={{ ["--d" as string]: i + 1 }}>
            {b}
          </div>
        ))}
        <footer className="fh-dr-foot">
          <p>{page.foot}</p>
          {page.key ? page.key : <Book b={booking} />}
        </footer>
      </article>
      <dialog ref={lb} className="fh-lb" aria-label={zoom?.alt ?? "Picture"} onClose={() => setZoom(null)} onClick={() => lb.current?.close()}>
        {zoom && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={zoom.src} alt={zoom.alt} className={zoom.tall ? "is-tall" : undefined} />
        )}
        <button type="button" className="fh-lb-x" aria-label="Close the picture">
          <Chev d="M3.5 3.5l7 7M10.5 3.5l-7 7" />
        </button>
      </dialog>
    </dialog>
  );
}

const Chev = ({ d }: { d: string }) => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

const Arrow = () => (
  <svg className="fh-ink-arrow" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 11l6-6M6 5h5v5" />
  </svg>
);

/** The ink key in the sticky bar: the paper-ink block of ignaru.com, with an optional quiet link beside it. */
function Ink({ href, title, sub, glyph, also }: { href: string; title: string; sub: string; glyph?: string; also?: { href: string; label: string } }) {
  return (
    <span className="fh-keys">
      {also && (
        <a className="fh-also" href={also.href} target="_blank" rel="noreferrer">
          {also.label} <span aria-hidden="true">↗</span>
        </a>
      )}
      <a className="fh-ink" href={href} target="_blank" rel="noreferrer">
        {glyph && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={feltSrc(glyph).src} alt="" width={30} height={30} />
        )}
        <span className="fh-ink-text">
          <b>{title}</b>
          <span>{sub}</span>
        </span>
        <Arrow />
      </a>
    </span>
  );
}

/** One idea: a headline of two lines at most, one short line, then the thing itself. */
function Block({ title, line, children, side }: { title: string; line?: ReactNode; children?: ReactNode; side?: boolean }) {
  return (
    <section className={side ? "fh-blk fh-blk-side" : "fh-blk"}>
      <div className="fh-blk-text">
        <h3>{title}</h3>
        {line && <p>{line}</p>}
      </div>
      {children}
    </section>
  );
}

/** A real number set large, and what it counts. */
function Big({ n, what, line, stack }: { n: string; what: string; line?: string; stack?: boolean }) {
  return (
    <section className={stack ? "fh-big fh-big-stack" : "fh-big"}>
      <b>{n}</b>
      <div>
        <h3>{what}</h3>
        {line && <p>{line}</p>}
      </div>
    </section>
  );
}

/** A still that opens full size. */
function Shot({ src, alt, z, w = 1200, h = 750, tall, field, className = "" }: { src: string; alt: string; z: (s: string, a: string, t?: boolean) => void; w?: number; h?: number; tall?: boolean; field?: boolean; className?: string }) {
  return (
    <button type="button" className={`fh-shot${field ? " fh-field" : ""} ${className}`} onClick={() => z(src, alt, tall)} aria-label={`Open full size: ${alt}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} width={w} height={h} loading="lazy" decoding="async" />
      <span className="fh-shot-x" aria-hidden="true">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8.5 2.5h3v3M5.5 11.5h-3v-3M11.5 2.5 8 6M2.5 11.5 6 8" />
        </svg>
      </span>
    </button>
  );
}

type Ctx = { booking: Booking; z: (src: string, alt: string, tall?: boolean) => void };
type Page = { title: string; line: string; foot: string; key?: ReactNode; body: (c: Ctx) => ReactNode[] };

const PAGES: Record<DrawerId, Page> = {
  ignaru: {
    title: "Ignaru, a canvas for your agent.",
    line: "It opens the repo you already have. Circle what looks wrong on a page, and Claude Code, Codex or Cursor fixes it in your files.",
    foot: "Try it on your own repo.",
    key: <Ink href="https://ignaru.com" title="Open ignaru.com" sub="Free · Mac and web" glyph="petal" />,
    body: ({ z }) => [
      <CanvasLoop key="loop" />,
      <Block key="real" title="Your real site, not a mock." line="The canvas loads your pages from your code, so what you circle is what ships.">
        <Shot src="/sites/ignaru.webp" field alt="ignaru.com, the first screen" z={z} w={960} h={600} />
      </Block>,
      // gh search: repo:jawadjalal/ignaru is:pr is:merged, 683 on 7 Nov 2026; the repo was created on 15 Oct
      <Big key="prs" n="680+" what="pull requests merged since 15 October" line="The Mac app, the web app and the site, all designed and built by me." />,
      <Block key="own" title="Bring your own agent." line="It drives the coding agent you already pay for. Free on Mac and the web, and Pro is $20 a month." />,
    ],
  },
  wayari: {
    title: "Wayari, from a prompt to a pull request.",
    line: "Tell the coding agent you already use to use Wayari. It runs the job on its own branch, checks it, and hands you a reviewed pull request. You decide what ships.",
    foot: "Give your coding subscriptions superpowers.",
    key: <Ink href="https://wayari.com" title="Open wayari.com" sub="A CLI and a desktop app" glyph="ship-merge" />,
    body: ({ z }) => [
      <Pipeline key="pipe" />,
      <Block key="site" title="The site tells one job, stop by stop." line="wayari.com, with the app's real dock drawn in code.">
        <Shot src="/sites/wayari.webp" field alt="wayari.com, the first screen" z={z} w={960} h={600} />
      </Block>,
      // gh search: repo:jawadjalal/wayariapp is:pr is:merged, 480 on 7 Nov 2026; the repo was created on 22 Jul
      <Big key="prs" n="480" what="pull requests merged since July" line="Nothing merges on an agent's say-so. A person presses merge, every time." />,
    ],
  },
  bidframe: {
    title: "Bidframe finds the clause that loses the bid.",
    line: "Public-sector tenders run past a hundred pages. Bidframe reads the whole pack, flags what would disqualify you, and links every flag to its clause.",
    foot: "The demo needs no login.",
    key: <Ink href="https://bidframe.org" title="Open bidframe.org" sub="See a worked example" glyph="nav-blog" also={{ href: "https://github.com/Welddevelopment/Tender_Breakdown_AI-Agent", label: "The code" }} />,
    body: ({ z }) => [
      <Tender key="tender" />,
      <Block key="site" title="Every claim back to its source." line="Requirements come out of PDFs, Word, Excel and zip files, each with its page and clause.">
        <Shot src="/sites/bidframe.webp" field alt="bidframe.org, the first screen" z={z} w={960} h={600} />
      </Block>,
      // GitHub contributors API for Welddevelopment/Tender_Breakdown_AI-Agent, 7 Nov 2026: jawadjalal 258
      <Big key="commits" n="258" what="commits of mine, in a team of four" line="Built for Conduct's Make Legacy Move hackathon: Python and FastAPI to read the pack, Next.js for the matrix. We've stopped work on it, and it's still live." />,
    ],
  },
  okara: {
    title: "Product development intern at Okara.",
    line: "Okara is an AI CMO, run by a team of four for 150,000+ businesses. I got the internship by taking its dashboard apart, unasked.",
    foot: "Okara drafts the marketing and you approve it.",
    key: <Ink href="https://okara.ai" title="Open okara.ai" sub="Your AI CMO" glyph="canvas-dashboard" />,
    body: ({ z }) => [
      <Big key="credits" stack n="14 → 7" what="my credits, overnight, with nothing saying why" line="A week on the free tier, 65 screenshots and every network call. That gap was the finding that landed." />,
      <Block key="feed" side title="Sell the work, not the count." line="Free users saw placeholder drafts while the real ones sat in the API response. Unlock one real draft per agent.">
        <Shot src="/okara/feed.webp" field alt="The agents feed redesign: one real X draft to approve, eight more locked" z={z} w={800} h={1127} tall className="fh-shot-tall" />
      </Block>,
      <Block key="morning" title="A morning note, not 54 numbers." line="What happened overnight, the fix that's ready, and an Approve button.">
        <Shot src="/okara/morning.webp" field alt="The morning note redesign: 8 people saw your newest page, none of them clicked" z={z} w={1200} h={749} />
      </Block>,
      <Block key="price" title="Put a price on the work." line="What each action costs, and where every credit went. All three were working React mockups, built in a day.">
        <Shot src="/okara/credits.webp" field alt="The credits drawer redesign: 7.00 credits left, what each action costs, what was spent" z={z} w={1200} h={750} />
      </Block>,
    ],
  },
  menufit: {
    title: "MenuFit, the app for eating out healthy.",
    line: "Over 1.5 million people use it to find a high-protein order wherever they're eating. I design the screens, in light and dark.",
    foot: "Every screen is live to click through.",
    key: <Ink href="https://menufit-screens.vercel.app" title="See every screen" sub="Light and dark, live" glyph="phone" also={{ href: "https://menufit.com", label: "menufit.com" }} />,
    body: ({ z }) => [<Phones key="phones" z={z} />],
  },
  ads: {
    title: "Ads for Devin, made on spec.",
    line: "Devin isn't a client. I made these to show what I'd do: every claim comes from devin.ai, and nothing is generated.",
    foot: "Want ads like these for your launch?",
    body: ({ z }) => [
      <ul key="ads" className="fh-ads">
        {ADS.map((a) => (
          <li key={a.key}>
            <Shot src={`/ads/${a.key}.webp`} alt={a.alt} z={z} w={864} h={1080} tall />
          </li>
        ))}
      </ul>,
      <Block key="idea" title="One line, one picture." line="A boarding pass, an out-of-office reply, a night of commits. Each turns a line Devin already uses into something you'd stop on." />,
    ],
  },
  sites: {
    title: `${SITES.length} live sites, all built from scratch.`,
    line: "My products, pitch sites for founders, redesign concepts and templates. Every one designed and coded by me.",
    foot: "Want the next one to be yours?",
    body: () => [<Gallery key="gal" />],
  },
  book: {
    title: "From a call to a live page in about a week.",
    line: "Most projects start with a short call through Ignura, my studio. Then it goes like this.",
    foot: "Fifteen minutes, no prep needed.",
    body: ({ booking: b }) => [
      <Week key="week" />,
      b.slots.length > 0 ? (
        <Block key="days" title="Next free days.">
          <ul className="fh-days">
            {b.slots.map((x) => (
              <li key={x.iso}>
                <a href={dayLink(x.iso)} target="_blank" rel="noreferrer">
                  <b>{x.day}</b>
                  <span>from {x.time}</span>
                </a>
              </li>
            ))}
          </ul>
        </Block>
      ) : null,
      <Block key="code" title="Real code, in your repo." line="Next.js and plain CSS, no page builder. You own all of it from the first day, and you see it grow on a live link." />,
    ],
  },
};

/* ---------- Ignaru: the canvas loop ---------- */

const AGENTS = [
  { name: "Claude Code", shape: "claude", note: "make this pop" },
  { name: "Codex", shape: "openai", note: "match the brand" },
  { name: "Gemini", shape: "gemini", note: "give it more room" },
  { name: "Grok", shape: "grok", note: "too quiet, lift it" },
];

function CanvasLoop() {
  const [a, setA] = useState(0);
  const ag = AGENTS[a];
  return (
    <div className="fh-cv">
      <div className="fh-seg" role="tablist" aria-label="Agent">
        {AGENTS.map((g, i) => (
          <button key={g.name} type="button" role="tab" aria-selected={i === a} onClick={() => setA(i)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={feltSrc(g.shape).src} alt="" width={18} height={18} />
            {g.name}
          </button>
        ))}
      </div>
      <div className="fh-cv-stage" key={a} aria-label={`${ag.name} fixing a circled button on a page`} role="img">
        <div className="fh-cv-page">
          <div className="fh-cv-nav">
            <i className="fh-cv-logo" />
            <span />
            <span />
            <span />
            <b />
          </div>
          <div className="fh-cv-hero">
            <span className="fh-cv-h1" />
            <span className="fh-cv-h1 fh-cv-h1b" />
            <span className="fh-cv-p" />
            <span className="fh-cv-p fh-cv-pb" />
            <span className="fh-cv-btn">
              <span>Get started</span>
            </span>
          </div>
          <div className="fh-cv-cards">
            <span />
            <span />
            <span />
          </div>
        </div>
        <svg className="fh-cv-ring" viewBox="0 0 200 80" aria-hidden="true">
          <path d="M18 44 C 16 14, 182 8, 186 38 C 190 66, 30 76, 14 50 C 8 38, 40 22, 70 20" />
        </svg>
        <span className="fh-cv-note">{ag.note}</span>
        <span className="fh-cv-cur">
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
            <path d="M3 2l11 6.5-4.6 1.2L7.2 14z" fill="#fff" stroke="#111" strokeWidth="1.2" strokeLinejoin="round" />
          </svg>
          <span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={feltSrc(ag.shape).src} alt="" width={16} height={16} />
            {ag.name}
          </span>
        </span>
        <span className="fh-cv-pr">
          <i>
            <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
              <path d="M2 5.2l2 2L8 3" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </i>
          <span>
            <b>hero.tsx</b> <em>+4</em> <u>−2</u>
          </span>
          <span className="fh-cv-pr-s">checks passed</span>
        </span>
      </div>
    </div>
  );
}

/* ---------- Wayari: the job's path, in its two modes (PRODUCT.md, 0.8.0) ---------- */

const MODES = {
  burst: { label: "Burst", when: "at your desk", say: "use wayari, fix the flaky checkout test", builders: 2, line: "A focused job on the small pipeline, two builders by default." },
  sunrise: { label: "Sunrise", when: "while you're away", say: "use wayari, I'm off for the night: ship the pricing page", builders: 4, line: "The full pipeline while you're gone, with the same review and the same merge boundary." },
} as const;

function Pipeline() {
  const [m, setM] = useState<keyof typeof MODES>("burst");
  const mode = MODES[m];
  const steps = [
    { art: "pen", t: "Your words", s: "in the app you already use" },
    { art: "code", t: "Its own branch", s: "one goal, one repo" },
    { art: "terminal", t: `${mode.builders} builders`, s: "on a shift" },
    { art: "ship-merge", t: "Pull request", s: "checked, reviewed, yours to merge" },
  ];
  return (
    <div className="fh-pl">
      <div className="fh-seg" role="tablist" aria-label="Mode">
        {(Object.keys(MODES) as (keyof typeof MODES)[]).map((k) => (
          <button key={k} type="button" role="tab" aria-selected={k === m} onClick={() => setM(k)}>
            {MODES[k].label}
            <span className="fh-seg-sub">{MODES[k].when}</span>
          </button>
        ))}
      </div>
      <div className="fh-pl-stage" key={m}>
        <p className="fh-pl-say">
          <span aria-hidden="true">›</span> {mode.say}
        </p>
        <ol className="fh-pl-steps" style={{ ["--n" as string]: steps.length } as CSSProperties}>
          {steps.map((x, k) => (
            <li key={x.t} style={{ ["--k" as string]: k } as CSSProperties}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={feltSrc(x.art).src} alt="" width={56} height={56} />
              <b>{x.t}</b>
              <span>{x.s}</span>
            </li>
          ))}
        </ol>
        <p className="fh-pl-line">{mode.line}</p>
      </div>
    </div>
  );
}

/* ---------- Bidframe: the deal-breakers from its own worked example (bidframe.org, 7 Nov 2026) ---------- */

const RULES = [
  { ref: "p. 14 · Section 4.2.1", t: "The supplier must hold current ISO 9001 certification valid for the full contract term." },
  { ref: "p. 22 · Section 6.1.3", t: "Bidder must be Cyber Essentials Plus certified at the date of submission." },
  { ref: "p. 8 · Section 3.4", t: "Minimum annual turnover of £2,000,000 in each of the last two financial years." },
  { ref: "p. 19 · Section 5.3", t: "Professional indemnity insurance of at least £10,000,000 for the contract duration." },
];

function Tender() {
  const [ok, setOk] = useState<boolean[]>(() => RULES.map(() => false));
  const left = ok.filter((x) => !x).length;
  return (
    <div className={left === 0 ? "fh-td is-done" : "fh-td"} data-ui>
      <div className="fh-td-head">
        <b>{left === 0 ? "Every deal-breaker cleared" : `${left} requirement${left === 1 ? "" : "s"} would disqualify the bid`}</b>
        <span>{left === 0 ? "Ready to write the bid" : "Tick each one you can meet"}</span>
      </div>
      <ul>
        {RULES.map((r, i) => (
          <li key={r.ref}>
            <label className={ok[i] ? "is-ok" : undefined}>
              <input type="checkbox" checked={ok[i]} onChange={() => setOk((o) => o.map((v, k) => (k === i ? !v : v)))} />
              <span className="fh-td-box" aria-hidden="true">
                <svg width="12" height="12" viewBox="0 0 12 12">
                  <path d="M2.5 6.2l2.3 2.3L9.5 3.6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="fh-td-t">{r.t}</span>
              <em>{r.ref}</em>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------- MenuFit: the screens ---------- */

function Phones({ z }: { z: Ctx["z"] }) {
  const [t, setT] = useState<"light" | "dark">("light");
  const src = (k: string) => `/menufit/${k}-${t}.webp`;
  return (
    <div className="fh-mf" data-theme={t}>
      <div className="fh-mf-bar">
        <div className="fh-seg fh-seg-sm" role="tablist" aria-label="Theme">
          {(["light", "dark"] as const).map((k) => (
            <button key={k} type="button" role="tab" aria-selected={k === t} onClick={() => setT(k)}>
              {k === "light" ? "Light" : "Dark"}
            </button>
          ))}
        </div>
      </div>
      <section className="fh-mf-hack">
        <div className="fh-blk-text">
          <h3>Nearly 4× the protein.</h3>
          <p>The hack screen: the same Pintos N Cheese with three proteins on top. The macros fill like liquid, drawn to scale.</p>
          <p className="fh-mf-num" aria-label="9 grams becomes 35 grams">
            <b>9g</b>
            <span aria-hidden="true">→</span>
            <b>35g</b>
          </p>
        </div>
        <Shot src={src("the-hack")} alt="The hack: the same Pintos N Cheese with three proteins on top, 9g becomes 35g" z={z} w={540} h={1169} tall className="fh-phone fh-phone-lg" />
      </section>
      <ul className="fh-mf-grid">
        {MENUFIT.core.map((s) => (
          <li key={s.key}>
            <Shot src={src(s.key)} alt={`MenuFit, ${s.name}`} z={z} w={540} h={1169} tall className="fh-phone" />
            <span>{s.name}</span>
          </li>
        ))}
      </ul>
      <section className="fh-mf-grid fh-mf-states">
        <div className="fh-blk-text">
          <h3>The quiet screens too.</h3>
          <p>Loading, nothing nearby, and location turned off each get a design, not a spinner.</p>
        </div>
        {MENUFIT.states.map((s) => (
          <div key={s.key} className="fh-mf-cell">
            <Shot src={src(s.key)} alt={`MenuFit, ${s.name}`} z={z} w={540} h={1169} tall className="fh-phone" />
            <span>{s.name}</span>
          </div>
        ))}
      </section>
    </div>
  );
}

/* ---------- sites: every live site ---------- */

const GROUPS = ["All", "Products", "Pitch sites", "Concepts", "Templates"] as const;

function Gallery() {
  const [g, setG] = useState<(typeof GROUPS)[number]>("All");
  const list = g === "All" ? SITES : SITES.filter((w) => w.group === g);
  return (
    <>
      <div className="fh-chips" role="tablist" aria-label="Filter sites">
        {GROUPS.map((x) => (
          <button key={x} type="button" role="tab" aria-selected={x === g} onClick={() => setG(x)}>
            {x}
            <span>{x === "All" ? SITES.length : SITES.filter((w) => w.group === x).length}</span>
          </button>
        ))}
      </div>
      <ul className="fh-gal">
        {list.map((w) => (
          <SiteCard key={w.key} w={w} />
        ))}
      </ul>
    </>
  );
}

function SiteCard({ w }: { w: Site }) {
  return (
    <li>
      <a href={`https://${w.host}`} target="_blank" rel="noreferrer" className="fh-site">
        <span className="fh-site-win">
          <span className="fh-site-bar" aria-hidden="true">
            <span>{w.host}</span>
          </span>
          <span className="fh-site-view" style={{ ["--tall" as string]: `url(/sites/${w.key}-tall.webp)` }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/sites/${w.key}.webp`} alt={`${w.name}, the first screen`} width={960} height={600} loading="lazy" decoding="async" />
          </span>
        </span>
        <span className="fh-site-meta">
          <b>{w.name}</b>
          <em>{w.group === "Products" ? "Mine" : w.group === "Pitch sites" ? "Pitch" : w.group.replace(/s$/, "")}</em>
          <Chev d="M4.5 9.5l5-5M5.5 4.5h4v4" />
        </span>
        <span className="fh-site-line">{w.line}</span>
      </a>
    </li>
  );
}

/* ---------- book: a week laid out ---------- */

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const TRACK = [
  { k: "Call", from: 0, to: 0.6, art: "call" },
  { k: "Design", from: 0.3, to: 2.6, art: "pen" },
  { k: "Build", from: 1.4, to: 4.3, art: "code" },
  { k: "Ship", from: 4.2, to: 5, art: "terminal" },
];

function Week() {
  return (
    <div className="fh-wk" role="img" aria-label="A week: a call on Monday, design from Monday to Wednesday, build from Tuesday to Friday, live on Friday">
      <div className="fh-wk-days">
        {DAYS.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      <div className="fh-wk-rows">
        {TRACK.map((t, i) => (
          <div key={t.k} className="fh-wk-row">
            <span className="fh-wk-bar" style={{ ["--a" as string]: t.from / 5, ["--b" as string]: t.to / 5, ["--i" as string]: i }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={feltSrc(t.art).src} alt="" width={22} height={22} />
              {t.k}
            </span>
          </div>
        ))}
        <span className="fh-wk-head" aria-hidden="true" />
      </div>
      <span className="fh-wk-live">
        <i className="fh-live" /> Live on Friday
      </span>
    </div>
  );
}

