import type { Metadata } from "next";
import { WorkWorld, type WorldItem } from "@/components/ds/WorkWorld";
import { ADS, CAMPAIGNS } from "@/content/ads";
import { REAL } from "@/content/work";
import { GALLERY, ROOMS } from "@/lib/gallery";
import { JsonLd, PERSON_ID, abs, caseWork, meta, pieceWork } from "@/lib/seo";
import "./work.css";

export const metadata: Metadata = meta({
  title: "work",
  description: `work by jawad jalal: ${ADS.length} ads (${CAMPAIGNS.slice(0, 4).join(", ")} and more), websites, ignaru, 3d and roblox.`,
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

const ITEMS: WorldItem[] = ROOMS.flatMap((room) =>
  room.entries
    .filter((e) => e.key !== "coresrent")
    .map((e) => ({
      key: `${room.key}-${e.key}`,
      href: e.href,
      title: e.title,
      src: e.piece?.sm || e.media.src,
      w: e.media.w,
      h: e.media.h,
      alt: e.media.alt,
      section: room.section,
    })),
);

export default function Work() {
  return (
    <main className="ww-page">
      <JsonLd data={LD} />
      <WorkWorld items={ITEMS} />
    </main>
  );
}
