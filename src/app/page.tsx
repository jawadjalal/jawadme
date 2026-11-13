import { Archivo, Inter } from "next/font/google";
import { StoryColumn } from "@/components/portfolio/StoryColumn";
import { WorkFeed } from "@/components/portfolio/WorkFeed";
import { DriftWall } from "@/components/portfolio/DriftWall";
import { FEED, type Piece } from "@/content/feed";
import { CLOSING, HEADLINE, HEADLINE_ALT, HIRE, REPLIES, SECOND, TIMELINE } from "@/content/story";
import "@/components/portfolio/portfolio.css";

// jawadjalal.com, after jacobtrebacki.com: a fixed column on the left says who he is, where he has worked and how to
// hire him; the rest of the screen is an endless wall of his ads, brand studies, sites, live components and app
// icons, broken every few rows by one big line of his story. The column's words are in content/story.ts, the wall
// in content/feed.ts.

const sans = Inter({ subsets: ["latin"], display: "swap", variable: "--pf-sans" });
/** Archivo's width axis, taken down to extra condensed, in the black italic: the print face of the story lines. */
const print = Archivo({ subsets: ["latin"], style: ["italic"], axes: ["wdth"], display: "swap", variable: "--pf-print" });

/** What the wall holds, counted from the manifest so the column never states a number the wall does not show. */
function made(): [string, number][] {
  const pieces = FEED.filter((e): e is Piece => !("story" in e));
  const n = (k: string) => pieces.filter((p) => p.kind === k).length;
  return (
    [
      ["ads", n("ad")],
      ["brand studies", n("brand")],
      ["sites and app screens", n("site")],
      ["live components", n("component")],
      ["app icons", n("icon")],
    ] as [string, number][]
  ).filter(([, c]) => c > 0);
}

export default function Home() {
  return (
    <div className={`pf ${sans.variable} ${print.variable}`}>
      <StoryColumn headline={HEADLINE} headlineAlt={HEADLINE_ALT} hire={HIRE} second={SECOND} timeline={TIMELINE} replies={REPLIES} made={made()} />
      <main className="pf-main" id="work">
        <h2 className="pf-sr">Work</h2>
        <div className="wall-drift">
          <DriftWall entries={FEED} href={HIRE} />
        </div>
        <div className="wall-flow">
          <WorkFeed entries={FEED} href={HIRE} closing={CLOSING} name="Jawad Jalal" />
        </div>
      </main>
    </div>
  );
}
