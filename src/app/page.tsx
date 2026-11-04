import "./px.css";
import { ABOUT_ROLES, IDENTITY, SOCIALS } from "@/lib/profile";
import { WORK, type Work } from "@/lib/work";
import { Bit } from "@/components/px/Bit";
import { Columns } from "@/components/px/Columns";
import { Desk } from "@/components/px/Desk";
import { Develop } from "@/components/px/Develop";
import { ART, Doodle, Icon, type DoodleName } from "@/components/px/Doodle";
import { Lens } from "@/components/px/Lens";
import { Log } from "@/components/px/Log";
import { Arrivals, LondonTime } from "@/components/px/Live";

// jawadjalal.com as a sketchbook kept in pixels. Every drawing on the page
// started as an ink sketch and was box-filtered onto a square grid
// (art/pixelate.py), so the hand-drawn and the pixel are the same thing at
// two zoom levels. One desk (a dithered WebGL field), one sheet for the hero,
// a ruled board for the work, and square corners everywhere.

export default function Home() {
  return (
    <main className="px" id="main">
      <Desk />
      <Columns />
      <Arrivals />
      <a href="#work" className="skip">Skip to the work</a>
      <noscript>
        <style>{"[data-in]{opacity:1!important;transform:none!important}.dev img{opacity:1!important}"}</style>
      </noscript>

      <Nav />
      <Hero />
      <How />
      <WorkBoard />
      <About />
      <Contact />
      <Foot />
    </main>
  );
}

function Nav() {
  const [fw, fh] = ART["face-sm"];
  return (
    <nav className="nav" aria-label="Main">
      <a href="#top" className="nav-face" aria-label="Jawad Jalal, home">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/px/face-sm.png" alt="" width={fw} height={fh} className="pxart" />
      </a>
      <a href="#about">about</a>
      <a href="#work" className="nav-perch">
        work
        <Doodle name="pigeon" cell={1} className="perch" />
      </a>
      <a href="#contact">say hi</a>
      <a href="/blog">blog</a>
    </nav>
  );
}

function Hero() {
  return (
    <section className="px-hero" id="top" aria-labelledby="hero-h">
      <Doodle name="floppy" cell={2} className="dd dd-floppy" />
      <Doodle name="controller" cell={2} className="dd dd-controller" />
      <Doodle name="tea" cell={2} className="dd dd-tea" />
      <Doodle name="plane" cell={2} className="dd dd-plane" />

      <div className="sheet" data-in>
        <header className="bar">
          <span className="bar-dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span className="bar-title">jawad.png</span>
          <span className="bar-meta">1-bit · 100%</span>
        </header>
        <div className="sheet-body">
          <div className="hero-copy">
            <p className="sig">jawad jalal</p>
            <p className="kicker">design engineer · 15 · london</p>
            <h1 id="hero-h" className="h1">
              i make a <br />
              <mark>website</mark>
              <br />a day.
            </h1>
            <p className="lede">
              I design and build my own products, from the brand to the code that ships. Ignaru and Ignura are
              mine. Below is the sketchbook, one site at a time, nearly all of it live.
            </p>
            <div className="ctas">
              <a href="#work" className="btn">
                see the work <Bit name="arrowDown" cell={2} />
              </a>
              <a href={`mailto:${IDENTITY.email}`} className="btn btn-ghost">
                say hi
              </a>
            </div>
          </div>
          <Lens
            src="/px/hero-ink.png"
            still="/px/hero-still.png"
            alt="A sketch of Jawad, curly hair and a grin, painting a website with a giant pencil, a pigeon on the browser window"
          />
        </div>
        <footer className="sheet-foot">
          <span>
            <LondonTime />
          </span>
          <span>{WORK.length} sites in the sketchbook</span>
        </footer>
      </div>
    </section>
  );
}

const NOTES: { k: string; title: string; body: string; icon: DoodleName; look: string }[] = [
  {
    k: "design",
    title: "design it.",
    body: "The brand and the interface. Drawn first, then designed in Figma or straight in code.",
    icon: "pencil",
    look: "note-paper",
  },
  {
    k: "build",
    title: "build it.",
    body: "Next.js, React, TypeScript and real shaders. Claude Code and Codex do the typing, I make the calls.",
    icon: "laptop",
    look: "note-blue",
  },
  {
    k: "ship",
    title: "ship it.",
    body: "Live on the web the same day. Then the next one.",
    icon: "rocket",
    look: "note-grid",
  },
];

function How() {
  return (
    <section className="how" aria-label="How I work">
      <Doodle name="bulb" cell={2} className="dd dd-bulb" />
      <Doodle name="cube" cell={2} className="dd dd-cube" />
      <div className="notes">
        {NOTES.map((n, i) => (
          <article key={n.k} className={`note ${n.look}`} data-in style={{ "--i": i } as React.CSSProperties}>
            <span className="tape" aria-hidden="true" />
            <Icon name={n.icon} tone={n.look === "note-blue" ? "i" : "b"} cell={3} />
            <h2>{n.title}</h2>
            <p>{n.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

// The board's columns, by position: the two pinned products side by side,
// then a repeating run of spans and drops so the stills land like prints
// pinned to a board rather than a uniform grid.
const PINS = [
  { span: 7, drop: 0 },
  { span: 5, drop: 96 },
];
const RUN = [
  { span: 4, drop: 0 },
  { span: 4, drop: 64 },
  { span: 4, drop: 16 },
  { span: 6, drop: 0 },
  { span: 6, drop: 72 },
  { span: 5, drop: 24 },
  { span: 7, drop: 0 },
  { span: 4, drop: 48 },
  { span: 4, drop: 0 },
  { span: 4, drop: 88 },
  { span: 7, drop: 0 },
  { span: 5, drop: 56 },
];
const place = (i: number) => (i < PINS.length ? PINS[i] : RUN[(i - PINS.length) % RUN.length]);

function WorkBoard() {
  return (
    <section className="work" id="work" aria-labelledby="work-h">
      <div className="work-head" data-in>
        <Doodle name="sketchbook" cell={2} className="dd dd-sketchbook" />
        <h2 id="work-h" className="h2">
          the sketchbook
        </h2>
        <p>
          A site a day, each one designed and built by me. My own two are pinned, the rest run newest
          first. Concepts are pitch sites I made for real companies.
        </p>
      </div>
      <div data-in>
        <Log work={WORK} />
      </div>
      <div className="board">
        <div className="ruler ruler-x" aria-hidden="true">
          {Array.from({ length: 13 }, (_, i) => (
            <span key={i}>{i * 128}</span>
          ))}
        </div>
        <div className="ruler ruler-y" aria-hidden="true">
          {Array.from({ length: 48 }, (_, i) => (
            <span key={i}>{String(i + 1).padStart(2, "0")}</span>
          ))}
        </div>
        <Doodle name="pigeon" cell={2} className="bd bd-1" />
        <Doodle name="rocket" cell={2} className="bd bd-2" />
        <Doodle name="plant" cell={2} className="bd bd-4" />
        <ol className="board-grid">
          {WORK.map((w, i) => (
            <Card key={w.key} w={w} i={i} />
          ))}
        </ol>
      </div>
    </section>
  );
}

function Card({ w, i }: { w: Work; i: number }) {
  const l = place(i);
  const big = l.span >= 7;
  const win = (
    <div className="win">
      <div className="win-bar">
        <span className="bar-dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className="win-title">{w.host}</span>
        <span className="win-no">{w.pinned ? "pinned" : `no. ${String(i - 1).padStart(2, "0")}`}</span>
      </div>
      <Develop src={w.still} alt={`${w.name}, the first screen`} width={1600} height={1000} priority={i < 2} pos={w.pos} />
      {big && w.phone && (
        <div className="phone" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={w.phone} alt="" width={780} height={1688} loading="lazy" />
        </div>
      )}
    </div>
  );
  const ext = w.url?.startsWith("http");
  return (
    <li
      className={`card ${big ? "card-big" : ""} ${w.pinned ? "card-pin" : ""}`}
      style={{ "--span": l.span, "--drop": `${l.drop}px` } as React.CSSProperties}
      data-in
    >
      {w.url ? (
        <a href={w.url} target={ext ? "_blank" : undefined} rel="noreferrer" className="card-link" aria-label={`${w.name}, opens ${w.host}`}>
          {win}
        </a>
      ) : (
        <div className="card-link">{win}</div>
      )}
      <div className="cap">
        <h3>
          {w.name}
          {w.tag && <span className={`tag tag-${w.tag}`}>{w.tag}</span>}
        </h3>
        <p>{w.line}</p>
        {w.url ? (
          <a href={w.url} target={ext ? "_blank" : undefined} rel="noreferrer" className="cap-url">
            {w.host} <Bit name="arrowOut" cell={1} />
          </a>
        ) : (
          <span className="cap-url cap-off">not public yet</span>
        )}
        {w.date && <time dateTime={w.date}>{fmt(w.date)}</time>}
      </div>
    </li>
  );
}

function fmt(d: string) {
  return new Date(d + "T12:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }).toLowerCase();
}

const ROLE_ICON: Record<string, DoodleName> = {
  ignura: "rocket",
  menufit: "phone",
  bevel: "cube",
  okara: "bulb",
  ignaru: "pencil",
};

function About() {
  const [fw, fh] = ART.face;
  return (
    <section className="about" id="about" aria-labelledby="about-h">
      <Doodle name="bus" cell={2} className="dd dd-bus" />
      <Doodle name="bigben" cell={2} className="dd dd-bigben" />
      <figure className="polaroid" data-in>
        <span className="tape" aria-hidden="true" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/px/face.png" alt="Jawad, drawn in pixels: curly hair, a taper fade" width={fw * 3} height={fh * 3} className="pxart" />
        <figcaption>jawad, london</figcaption>
      </figure>
      <div className="about-copy" data-in>
        <h2 id="about-h" className="h2">
          who&apos;s drawing
        </h2>
        <p>
          I&apos;m Jawad, 15, in London. I started making things for money at thirteen and never really stopped.
          These days that means a studio, a design tool and design work on other people&apos;s apps.
        </p>
        <ul className="px-roles">
          {ABOUT_ROLES.map((r) => (
            <li key={r.key}>
              <Icon name={ROLE_ICON[r.key] ?? "cursor"} tone="i" cell={1} />
              <a href={r.href} target="_blank" rel="noreferrer">
                {r.name}
              </a>
              <span className="role">{r.role}</span>
              {r.stat && <span className="stat">{r.stat}</span>}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

const TAKES = [
  "launch pages, live in about a week",
  "product design for apps",
  "brand identity and logos",
  "3d art for games",
];

function Contact() {
  return (
    <section className="contact" id="contact" aria-labelledby="contact-h">
      <Doodle name="postbox" cell={2} className="dd dd-postbox" />
      <Doodle name="console" cell={2} className="dd dd-console" />
      <div className="card-sheet" data-in>
        <Doodle name="plane" cell={2} className="fly" />
        <div className="contact-l">
          <h2 id="contact-h" className="h2 h2-ink">
            got something
            <br />
            in mind?
          </h2>
          <ul className="takes">
            {TAKES.map((t) => (
              <li key={t}>
                <span className="box" aria-hidden="true">
                  <Bit name="check" cell={2} />
                </span>
                {t}
              </li>
            ))}
          </ul>
          <div className="ctas">
            <a href={`mailto:${IDENTITY.email}`} className="btn">
              work with me
            </a>
            <a href={`mailto:${IDENTITY.email}`} className="mail">
              {IDENTITY.email}
            </a>
          </div>
        </div>
        <div className="contact-r">
          <p className="kicker">elsewhere</p>
          <ul className="socials">
            {SOCIALS.filter((s) => s.label !== "Email").map((s) => (
              <li key={s.label}>
                <a href={s.href} target={s.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
                  {s.label.toLowerCase()}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function Foot() {
  const [sw, sh] = ART.scene;
  return (
    <footer className="px-foot">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/px/scene.png"
        alt="Jawad cross-legged on a giant laptop, browser windows on an easel behind him and London across the river"
        width={sw * 2}
        height={sh * 2}
        className="pxart scene"
        loading="lazy"
      />
      <div className="ticker" aria-hidden="true">
        <div className="ticker-run">
          {[0, 1].map((k) => (
            <span key={k}>
              {WORK.map((w) => (
                <span key={w.key}>
                  {w.name} <Bit name="heart" cell={2} />
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>
      <p className="px-foot-line">
        <span>drawn by hand, kept in pixels. © {new Date().getFullYear()} jawad jalal</span>
        <a href="/blog">blog</a>
        <a href={IDENTITY.cv}>cv</a>
      </p>
    </footer>
  );
}
