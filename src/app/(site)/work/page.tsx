import type { Metadata } from "next";
import Link from "next/link";
import { BookLink } from "@/components/BookLink";
import { Hang } from "@/components/ds/AdGallery";
import { Footer } from "@/components/ds/Footer";
import { TitleTab } from "@/components/ds/TitleTab";
import { ADS } from "@/content/ads";
import { REAL } from "@/content/work";
import { ROOMS, headline, roomByKey, type Room } from "@/lib/gallery";
import { JsonLd, PERSON_ID, abs, adWork, caseWork, meta } from "@/lib/seo";

export const metadata: Metadata = meta({
  title: "Work",
  description: `Work by Jawad Jalal: ${ADS.length} ads (${ROOMS.filter((r) => r.count.endsWith(" ads") && r.key !== "more-brands").slice(0, 4).map((r) => r.title).join(", ")} and more), with the products, sites and Roblox game around them.`,
  path: "/work",
});

const LD = {
  "@type": "CollectionPage",
  "@id": abs("/work") + "#gallery",
  url: abs("/work"),
  name: "Work by Jawad Jalal",
  author: { "@id": PERSON_ID },
  hasPart: [...ADS.map((a) => adWork(a, headline(a))), ...REAL.map(caseWork)],
};

type Props = { searchParams: Promise<{ c?: string; f?: string }> };

const SHAPES = [
  { first: 0.6, cycle: [0.3, 0.4] },
  { first: 0.42, cycle: [0.6, 0.3] },
  { first: 0.6, cycle: [0.4, 0.3] },
];

function RoomView({ room, i, lead }: { room: Room; i: number; lead: boolean }) {
  const shape = SHAPES[i % SHAPES.length];
  return (
    <section className="room-w" aria-labelledby={"r-" + room.key}>
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
      <TitleTab as="h1" tag={ADS.length + " ads, and the work around them"} side={<span className="tab-say">Brands, ads, sites and Roblox games, designed and built.</span>}>
        Work
      </TitleTab>
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
        {rooms.map((r, i) => (
          <RoomView key={r.key} room={r} i={i} lead={i === 0} />
        ))}
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
