import { Archivo, Inter } from "next/font/google";
import { StoryColumn } from "@/components/portfolio/StoryColumn";
import { WorkFeed } from "@/components/portfolio/WorkFeed";
import { FEED } from "@/content/feed";
import { CLOSING, HEADLINE, HIRE, REPLIES, SECOND, TIMELINE } from "@/content/story";
import "@/components/portfolio/portfolio.css";

// jawadjalal.com, after jacobtrebacki.com: a fixed column on the left says who he is, where he has worked and how to
// hire him; the rest of the screen is an endless wall of his ads, brand studies, sites, live components and app
// icons, broken every few rows by one big line of his story. The column's words are in content/story.ts, the wall
// in content/feed.ts.

const sans = Inter({ subsets: ["latin"], display: "swap", variable: "--pf-sans" });
/** Archivo's width axis, taken down to extra condensed, in the black italic: the print face of the story lines. */
const print = Archivo({ subsets: ["latin"], style: ["italic"], axes: ["wdth"], display: "swap", variable: "--pf-print" });

export default function Home() {
  return (
    <div className={`pf ${sans.variable} ${print.variable}`}>
      <StoryColumn headline={HEADLINE} hire={HIRE} second={SECOND} timeline={TIMELINE} replies={REPLIES} />
      <main className="pf-main" id="work">
        <h2 className="pf-sr">Work</h2>
        <WorkFeed entries={FEED} href={HIRE} closing={CLOSING} name="Jawad Jalal" />
      </main>
    </div>
  );
}
