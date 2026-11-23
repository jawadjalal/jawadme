import type { Metadata } from "next";
import Link from "next/link";
import { ShaftMoment } from "@/components/moments/fracture";
import { projectBySlug } from "@/content/work";
import { JsonLd, PERSON_ID, abs, meta } from "@/lib/seo";
import "./fracture.css";

// The game, as an editorial page: the title, its one line, the 3d moment, a short paragraph. There is no public
// roblox link in the repo yet, so there is no play link; the case study holds the art.

const FR = projectBySlug("fracture")!;
const LINE = "a co-op action mining crawler for roblox.";

export const metadata: Metadata = meta({
  title: "fracture",
  description: "fracture, a co-op action mining crawler for roblox that jawad jalal designs and builds: dig deep with your friends, smash monsters, crack glowing ore, beat the boss, forge better gear.",
  path: "/fracture",
  type: "article",
});

const LD = { "@type": "VideoGame", "@id": abs("/fracture") + "#game", name: "fracture", url: abs("/fracture"), description: LINE, gamePlatform: "roblox", author: { "@id": PERSON_ID }, creator: { "@id": PERSON_ID } };

export default function Fracture() {
  return (
    <main className="fr">
      <JsonLd data={LD} />
      <header className="wrap fr-h">
        <h1 className="fr-t">fracture</h1>
        <p className="fr-line">{LINE}</p>
      </header>
      <ShaftMoment />
      <section className="wrap fr-body" aria-label="the game">
        <p>
          dig deep with your friends. up to four of you drop into a mine as your own roblox avatars, swing, dig and dodge, crack glowing ore and fight
          down to each floor&apos;s guardian, then go back to town to forge better gear and dive deeper. a dive takes minutes. i design it and build
          it: {FR.lines[1]}
        </p>
        <p className="fr-more">
          <Link href={"/work/" + FR.slug}>the art, in the case study</Link>
        </p>
      </section>
    </main>
  );
}
