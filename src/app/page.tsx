import { StoryColumn } from "@/components/portfolio/StoryColumn";
import { WorkFeed } from "@/components/portfolio/WorkFeed";
import { DriftWall } from "@/components/portfolio/DriftWall";
import { FEED } from "@/content/feed";
import { CLOSING, DOES, HEADLINE, HEADLINE_ALT, HIRE, PAST, REPLIES, SECOND, TIMELINE, X_HANDLE } from "@/content/story";
import { print, sans } from "@/components/portfolio/fonts";
import "@/components/portfolio/portfolio.css";

// jawadjalal.com, after jacobtrebacki.com: a fixed column on the left says who he is, what he does, his companies and how
// to hire him; the rest of the screen is an endless wall of his ads, brand studies, sites, live components and app
// icons, broken every few rows by one big line of his story. The column's words are in content/story.ts, the wall
// in content/feed.ts.

export default function Home() {
  return (
    <div className={`pf ${sans.variable} ${print.variable}`}>
      <StoryColumn headline={HEADLINE} headlineAlt={HEADLINE_ALT} hire={HIRE} second={SECOND} timeline={TIMELINE} past={PAST} replies={REPLIES} xHandle={X_HANDLE} does={DOES} />
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
