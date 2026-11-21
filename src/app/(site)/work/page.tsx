import type { Metadata } from "next";
import Link from "next/link";
import { BookLink } from "@/components/BookLink";
import { Hang } from "@/components/ds/AdGallery";
import { Footer } from "@/components/ds/Footer";
import { ADS } from "@/content/ads";
import { REAL } from "@/content/work";
import { GALLERY, ROOMS, roomByKey, type Room } from "@/lib/gallery";
import { JsonLd, PERSON_ID, abs, caseWork, meta, pieceWork } from "@/lib/seo";

export const metadata: Metadata = meta({
  title: "Work",
  description: `Work by Jawad Jalal: ${ADS.length} ads (${ROOMS.filter((r) => r.section === "ads" && r.key !== "more-brands").slice(0, 4).map((r) => r.title).join(", ")} and more), then the websites, 3D and the Roblox game around them.`,
  path: "/work",
});

const LD = {
  "@type": "CollectionPage",
  "@id": abs("/work") + "#gallery",
  url: abs("/work"),
  name: "Work by Jawad Jalal",
  author: { "@id": PERSON_ID },
  hasPart: [...GALLERY.filter((p) => p.credit.includes("Jawad Jalal")).map(pieceWork), ...REAL.map(caseWork)],
};

type Props = { searchParams: Promise<{ c?: string; f?: string }> };

const SHAPES = [
  { first: 0.6, cycle: [0.3, 0.4] },
  { first: 0.42, cycle: [0.6, 0.3] },
  { first: 0.6, cycle: [0.4, 0.3] },
];
const WEB = { first: 0.4, cycle: [0.26, 0.3] };
const SMALL = { first: 0.3, cycle: [0.22, 0.26] };

/** The text between rooms: one sourced line, big, and a call booked from that spot. They sit after every third ad
 *  room and where the gallery turns from ads to websites and from websites to 3D. */
const SAY = {
  ads: [
    { t: "15, in London.", s: "Designing and building things. The ads come first." },
    { t: "Ignura Studio.", s: "His ad and brand studio: ads and brands people stop for." },
    { t: "Two 8-figure startups.", s: "Past roles at MenuFit, at 7-figure MRR, and Okara." },
  ],
  web: { t: "Sites, designed and built.", s: "For his studio, his 3D team and his clients." },
  "3d": { t: "3D art for Blade Ball and Fish It,", tail: "two of Roblox's biggest games (over 11 billion visits between them)" },
};

type Say = { t: string; tail?: string; s?: string };

function Break({ say, n }: { say: Say; n: number }) {
  return (
    <aside className="wrap brk" aria-label={say.t + (say.tail ? " " + say.tail : "")}>
      <p className="brk-t">
        {say.t}
        {say.tail ? <span className="brk-tail"> {say.tail}</span> : null}
      </p>
      <div className="brk-side">
        {say.s ? <p className="brk-s">{say.s}</p> : null}
        <BookLink src={"work-break-" + n} className="brk-cta" cursor>
          Book a call <span className="arr">↗</span>
        </BookLink>
      </div>
    </aside>
  );
}

/** The hall in order: each room, with a break before it when the section changes or three ad rooms have passed. */
function hall(rooms: Room[]) {
  const out: ({ room: Room; i: number } | { say: Say; n: number })[] = [];
  let since = 0;
  let n = 0;
  rooms.forEach((room, i) => {
    const prev = rooms[i - 1];
    const say = !prev ? null : prev.section !== room.section ? SAY[room.section as "web" | "3d"] : room.section === "ads" && since === 3 ? SAY.ads[n] : null;
    if (say) {
      out.push({ say, n: ++n });
      since = 0;
    }
    out.push({ room, i });
    since++;
  });
  return out;
}

function RoomView({ room, i, lead }: { room: Room; i: number; lead: boolean }) {
  const shape = room.section === "3d" ? SMALL : room.section === "web" ? WEB : SHAPES[i % SHAPES.length];
  return (
    <section className={"room-w" + (room.section === "3d" ? " room-sm" : "")} aria-labelledby={"r-" + room.key}>
      <header className="wrap rh">
        <h2 className="rh-t" id={"r-" + room.key}>
          {room.title}
        </h2>
        <div className="rh-side">
          {room.note ? <p className="rh-n">{room.note}</p> : null}
          <p className="rh-m">
            <span>{room.count}</span>
            {room.caseHref ? (
              <Link href={room.caseHref} className="rh-case">
                Case study <span className="arr">↗</span>
              </Link>
            ) : null}
          </p>
        </div>
      </header>
      <Hang entries={room.entries} first={shape.first} cycle={shape.cycle} lead={lead} />
    </section>
  );
}

export default async function Work({ searchParams }: Props) {
  const q = await searchParams;
  const pick = roomByKey(q.c ?? q.f);
  const rooms = pick ? [pick] : ROOMS;
  return (
    <main className="work">
      <JsonLd data={LD} />
      <header className="wrap wk-h">
        <h1 className="wk-t" data-lines="">
          Work
        </h1>
        <p className="wk-n">
          <strong>{ADS.length} ads</strong> first. Then websites, a design tool, 3D and a Roblox game, designed and built.
        </p>
      </header>
      <div className="gal-hall" data-room="hall">
        <nav className="chips" aria-label="Rooms">
          <div className="chips-in">
            <Link href="/work" aria-current={!pick ? "page" : undefined} scroll={false}>
              All
            </Link>
            {ROOMS.map((r) => (
              <Link key={r.key} href={"/work?c=" + r.key} aria-current={pick === r ? "page" : undefined} scroll={false}>
                {r.title}
              </Link>
            ))}
          </div>
        </nav>
        {(pick ? rooms.map((room, i) => ({ room, i })) : hall(rooms)).map((x) => ("room" in x ? <RoomView key={x.room.key} room={x.room} i={x.i} lead={x.i === 0} /> : <Break key={"b" + x.n} say={x.say} n={x.n} />))}
        <p className="wrap disclose">Independent work. Not commissioned by or affiliated with the brands shown.</p>
      </div>
      <BookLink src="work-inline" className="strip" cursor>
        <span className="d-name">Want work like this?</span>
        <span className="strip-cta">Book a call ↗</span>
      </BookLink>
      <Footer src="work" />
    </main>
  );
}
