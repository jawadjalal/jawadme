import "./px.css";
import { ABOUT_ROLES, IDENTITY, SOCIALS } from "@/lib/profile";
import { WORK, type Work } from "@/lib/work";
import { Bit } from "@/components/px/Bit";
import { Desk } from "@/components/px/Desk";
import { Develop } from "@/components/px/Develop";
import { ART, Doodle } from "@/components/px/Doodle";
import { Lens } from "@/components/px/Lens";
import { Log } from "@/components/px/Log";
import { Arrivals, LondonTime } from "@/components/px/Live";

// jawadjalal.com as a sketchbook kept in pixels, laid out as two panes: the
// jawad.png sheet stays put on the left (who he is, one statement, one
// button), and the work scrolls past it on the right, ending at a booking
// form. Every drawing started as an ink sketch and was box-filtered onto a
// square grid (art/pixelate.py). Square corners everywhere.

/** Ignura's intro call, the same link ignura.com books through. */
const BOOK = "https://cal.com/jawad-jalal-hesqbk/intro-call-with-ignura";

export default function Home() {
  return (
    <main className="px split" id="main">
      <Desk />
      <Arrivals />
      <a href="#work" className="skip">Skip to the work</a>
      <noscript>
        <style>{"[data-in]{opacity:1!important;transform:none!important}.dev img{opacity:1!important}"}</style>
      </noscript>
      <Side />
      <div className="pane">
        <Bar />
        <Gallery />
        <Book />
        <Foot />
      </div>
    </main>
  );
}

function Side() {
  const [fw, fh] = ART["face-sm"];
  return (
    <aside className="side" id="top" aria-labelledby="hero-h">
      <header className="side-top">
        <a href="#top" className="side-me">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/px/face-sm.png" alt="" width={fw} height={fh} className="pxart" />
          <span>hi, i&apos;m jawad</span>
        </a>
        <nav className="side-links" aria-label="Elsewhere">
          <a href="/blog">blog</a>
          <a href="https://x.com/jawadmakes" target="_blank" rel="noreferrer">
            x
          </a>
        </nav>
      </header>

      <Lens
        src="/px/hero-ink.png"
        still="/px/hero-still.png"
        alt="A sketch of Jawad, curly hair and a grin, painting a website with a giant pencil, a pigeon on the browser window"
      />

      <div className="side-copy">
        <p className="status">
          <i aria-hidden="true" />
          design engineer · 15 · <LondonTime />
        </p>
        <h1 id="hero-h" className="h1">
          i make a
          <br />
          <mark>website</mark>
          <br />a day.
        </h1>
        <p className="lede">
          I design and build my own products, from the brand to the code that ships. My studio Ignura builds
          yours: launch pages go live in about a week.
        </p>
        <div className="ctas">
          <a href={BOOK} target="_blank" rel="noreferrer" className="btn">
            book a call <Bit name="arrowOut" cell={2} />
          </a>
          <a href={`mailto:${IDENTITY.email}`} className="mail">
            or email me
          </a>
        </div>
      </div>

      <div className="side-foot">
        <p className="kicker">where i work</p>
        <ul className="marks">
          {ABOUT_ROLES.map((r) => (
            <li key={r.key}>
              <a href={r.href} target="_blank" rel="noreferrer" title={`${r.name}, ${r.role}${r.stat ? `, ${r.stat}` : ""}`}>
                <span className="mark-tile" style={r.logoTile ? { background: r.logoTile } : undefined}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={r.logo} alt="" width={20} height={20} />
                </span>
                {r.name}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

function Bar() {
  return (
    <div className="bar-top">
      <p>
        <span className="bar-k">work</span>
        <span className="bar-n">{WORK.length} sites, newest first</span>
      </p>
      <a href={BOOK} target="_blank" rel="noreferrer" className="btn btn-sm">
        book a call
      </a>
    </div>
  );
}

function Gallery() {
  return (
    <section className="gallery" id="work" aria-label="Work">
      <div className="g-wide" data-in>
        <Log work={WORK} />
      </div>
      {WORK.map((w, i) => (
        <Card key={w.key} w={w} i={i} />
      ))}
    </section>
  );
}

function Card({ w, i }: { w: Work; i: number }) {
  const wide = i === 0;
  const ext = w.url?.startsWith("http");
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
      <Develop src={w.still} alt={`${w.name}, the first screen`} width={1600} height={1000} pos={w.pos} />
      {wide && w.phone && (
        <div className="phone" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={w.phone} alt="" width={780} height={1688} loading="lazy" />
        </div>
      )}
    </div>
  );
  return (
    <article className={`card ${wide ? "g-wide card-big" : ""} ${w.pinned ? "card-pin" : ""}`} data-in>
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
        {w.date && <time dateTime={w.date}>{fmt(w.date)}</time>}
        <p>{w.line}</p>
      </div>
    </article>
  );
}

function fmt(d: string) {
  return new Date(d + "T12:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }).toLowerCase();
}

function Book() {
  return (
    <section className="book" id="contact" aria-labelledby="book-h">
      <Doodle name="pigeon" cell={2} className="dd dd-pigeon" />
      <div className="book-head" data-in>
        <h2 id="book-h" className="h2">
          yours could be
          <br />
          the next one.
        </h2>
        <p>
          Book an intro call with Ignura, my studio. Every site is designed and built from scratch, and launch
          pages go live in about a week.
        </p>
      </div>
      <div className="win book-win" data-in>
        <div className="win-bar">
          <span className="bar-dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span className="win-title">cal.com/jawad-jalal-hesqbk</span>
          <a href={BOOK} target="_blank" rel="noreferrer" className="win-no">
            open
          </a>
        </div>
        <iframe
          src={`${BOOK}?embed=true&theme=light&layout=month_view`}
          title="Book an intro call with Ignura"
          loading="lazy"
        />
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
      <p className="px-foot-line">
        <span>drawn by hand, kept in pixels. © {new Date().getFullYear()} jawad jalal</span>
        <a href={BOOK} target="_blank" rel="noreferrer">
          book a call
        </a>
        <a href="/blog">blog</a>
        <a href={IDENTITY.cv}>cv</a>
        {SOCIALS.filter((s) => s.href.startsWith("https")).map((s) => (
          <a key={s.label} href={s.href} target="_blank" rel="noreferrer">
            {s.label.toLowerCase()}
          </a>
        ))}
      </p>
    </footer>
  );
}
