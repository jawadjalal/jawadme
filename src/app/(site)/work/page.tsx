import type { Metadata } from "next";
import { BookLink } from "@/components/BookLink";
import { Footer } from "@/components/ds/Footer";
import { Media } from "@/components/ds/Media";
import { TLink } from "@/components/ds/TLink";
import { Moment } from "@/components/moments/Moment";
import { ADS, CAMPAIGNS } from "@/content/ads";
import { SITE } from "@/content/site";
import { REAL } from "@/content/work";
import { GALLERY, ROOMS, type Entry, type Room } from "@/lib/gallery";
import { JsonLd, PERSON_ID, abs, caseWork, meta, pieceWork } from "@/lib/seo";
import { Rail } from "./Rail";
import "./work.css";

export const metadata: Metadata = meta({
  title: "work",
  description: `work by jawad jalal: ${ADS.length} ads (${CAMPAIGNS.slice(0, 4).join(", ")} and more), then the websites, a design tool, 3d and the roblox game around them.`,
  path: "/work",
});

const LD = {
  "@type": "CollectionPage",
  "@id": abs("/work") + "#gallery",
  url: abs("/work"),
  name: "work by jawad jalal",
  author: { "@id": PERSON_ID },
  hasPart: [...GALLERY.filter((p) => p.credit.includes("jawad jalal")).map(pieceWork), ...REAL.map(caseWork)],
};

const [ads, ...rest] = ROOMS;
const cut = (e: Entry) => (e.line.startsWith(e.title + ": ") ? e.line.slice(e.title.length + 2) : e.line);

/** The 3d moments that stand between the sections, before the room they lead into. */
const MOMENTS: Record<string, { set: "break3d" | "shaft"; t: string; tail: string }> = {
  "cosmos-models": { set: "break3d", t: "3d art for blade ball and fish it,", tail: "two of roblox's biggest games (over 11 billion visits between them)" },
  fracture: { set: "shaft", t: "fracture.", tail: "a roblox mining game i design and build" },
};

/** One ad in the rail, at the rail's height and its own width. */
function Slide({ e, lead }: { e: Entry; lead: boolean }) {
  const ar = e.media.w / e.media.h;
  return (
    <li className="rail-i" style={{ ["--ar" as string]: ar }}>
      <TLink id={e.key} href={e.href} vt="piece" className="rail-a" data-cursor="view">
        <Media m={e.media} sizes={`(min-width: 768px) ${Math.ceil(70 * ar)}vh, ${Math.min(96, Math.ceil(110 * ar))}vw`} priority={lead} quality={75} />
        <span className="rail-cap">
          <span className="rail-co">{e.title}</span>
          <span className="rail-hl">{cut(e)}</span>
        </span>
      </TLink>
    </li>
  );
}

/** One piece in the list: the work as the picture, then its name, one line, a fact and the year where they exist. */
function Item({ e }: { e: Entry }) {
  const tall = e.media.h > e.media.w;
  return (
    <li className={"ed-i" + (tall ? " tall" : "")}>
      <TLink id={e.key} href={e.href} vt={e.href.startsWith("/w/") ? "piece" : "cover-" + e.href.split("/").pop()} className="ed-a" data-cursor="view">
        <Media m={e.media} sizes={tall ? "(min-width: 768px) 36vw, 100vw" : "(min-width: 768px) 64vw, 100vw"} quality={75} />
        <span className="ed-row">
          <span className="ed-n">{e.title}</span>
          <span className="ed-l">{cut(e)}</span>
          <span className="ed-f">{[e.fact, e.year].filter(Boolean).join(", ")}</span>
        </span>
      </TLink>
    </li>
  );
}

function Section({ room }: { room: Room }) {
  return (
    <section className="ed" aria-labelledby={"r-" + room.key}>
      <header className="ed-h">
        <h2 className="ed-t" id={"r-" + room.key}>
          {room.title}
        </h2>
        {room.note ? <p className="ed-note">{room.note}</p> : null}
        {room.caseHref ? (
          <TLink href={room.caseHref} className="ed-case">
            case study
          </TLink>
        ) : null}
      </header>
      <ol className="ed-list">
        {room.entries.map((e) => (
          <Item key={e.key} e={e} />
        ))}
      </ol>
    </section>
  );
}

export default function Work() {
  return (
    <main className="work">
      <JsonLd data={LD} />
      <header className="wrap wk-h">
        <h1 className="wk-t">work</h1>
        <dl className="wk-stat">
          <div>
            <dt>status</dt>
            <dd>{SITE.available}</dd>
          </div>
          <div>
            <dt>field</dt>
            <dd>{SITE.lanes.join(", ")}</dd>
          </div>
          <div>
            <dt>city</dt>
            <dd>london</dd>
          </div>
        </dl>
        <p className="wk-own">all work is my own. bevel&apos;s pieces are its team&apos;s.</p>
        <p className="wk-n">{ADS.length} ads first. then websites, a design tool, 3d and a roblox game, designed and built.</p>
      </header>
      <section className="wk-ads" data-room="hall" aria-labelledby="r-ads">
        <h2 className="wrap ed-t" id="r-ads">
          ads
        </h2>
        <Rail label="ads" n={ads.entries.length}>
          {ads.entries.map((e, i) => (
            <Slide key={e.key} e={e} lead={i === 0} />
          ))}
        </Rail>
        <p className="wrap disclose">independent work. not commissioned by or affiliated with the brands shown.</p>
      </section>
      {rest.map((room) => {
        const m = MOMENTS[room.key];
        return (
          <div key={room.key}>
            {m ? (
              <aside className="wrap wk-mo" aria-label={m.t + " " + m.tail}>
                <p className="wk-mo-t">
                  {m.t}
                  <span className="wk-mo-tail"> {m.tail}</span>
                </p>
                <Moment set={m.set} className="mo-brk" />
              </aside>
            ) : null}
            <Section room={room} />
          </div>
        );
      })}
      <BookLink src="work-inline" className="strip" cursor>
        <span className="d-name">want work like this?</span>
        <span className="strip-cta">book a call ↗</span>
      </BookLink>
      <Footer src="work" />
    </main>
  );
}
