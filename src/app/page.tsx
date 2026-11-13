import { Bangers, Inter } from "next/font/google";
import { StoryColumn } from "@/components/portfolio/StoryColumn";
import { WorkFeed } from "@/components/portfolio/WorkFeed";
import { FEED } from "@/content/feed";
import { CLOSING, HEADLINE, HIRE, MARKS, REPLIES, SECOND, TIMELINE } from "@/content/story";
import "@/components/portfolio/portfolio.css";

// jawadjalal.com, after jacobtrebacki.com: a fixed column on the left says who he is, where he has worked and how to
// hire him; the rest of the screen is an endless wall of his ads, brand studies, sites, live components and app
// icons, broken every few rows by one line of his story in comic lettering. The column's words are in
// content/story.ts, the wall in content/feed.ts.

const sans = Inter({ subsets: ["latin"], display: "swap", variable: "--pf-sans" });
const comic = Bangers({ subsets: ["latin"], weight: "400", display: "swap", variable: "--pf-comic" });

export default function Home() {
  return (
    <div className={`pf ${sans.variable} ${comic.variable}`}>
      <StoryColumn headline={HEADLINE} hire={HIRE} second={SECOND} timeline={TIMELINE} replies={REPLIES} marks={MARKS} />
      <main className="pf-main" id="work">
        <h2 className="pf-sr">Work</h2>
        <WorkFeed entries={FEED} href={HIRE} closing={CLOSING} name="Jawad Jalal" />
      </main>
    </div>
  );
}
