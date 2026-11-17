import visuals from "./visuals.json";
import { Table } from "./ui";

// The newest frames the judge scored, with its per-screen table. visuals.json and public/minelight/latest/ are written
// every hour by ROBL-42's job on the Mac (it reads the team's drive) and committed by the build box's :12/:42 refresh.
type Img = { src: string; w: number; h: number; label: string | null; alt: string };
type Item = { id: string; title: string; time: string; kind: string; score: string | null; verdict: string | null; pair: boolean; images: Img[] };
type Judge = { pass: string; at: string; note: string | null; head: string[]; rows: string[][]; prHead?: string[]; prRows?: string[][] };
type Visuals = { generatedAt: string; judge: Judge | null; items: Item[] };

const KIND: Record<string, [string, string]> = {
  engine: ["In-engine capture", ""],
  "engine-art": ["In-engine + key art", " art"],
  box: ["Box render", " box"],
  ai: ["AI-assisted key art", " ai"],
};

const clock = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(iso));

export function LatestVisuals() {
  const v = visuals as Visuals;
  return (
    <>
      <div className="ml-col">
        <p>
          The newest frames the team's judge has scored, refreshed every hour. Every picture says what it is: an <b>in-engine capture</b> is a real frame from Roblox Studio, a{" "}
          <b>box render</b> is drawn offline on a build box from the game's own files and is not the game itself, and <b>AI-assisted key art</b> is a thumbnail made from an in-engine
          capture with image tools.
        </p>
        <p className="ml-vis-meta">
          Checked {clock(v.generatedAt)}. Scores are out of 10: 7 is the bar for a UI round, 8 for the Golden Room. A screen that fails one of the four look gates is capped at 4.
        </p>
      </div>
      <div className="ml-vis">
        {v.items.map((it, i) => {
          const [label, cls] = KIND[it.kind] ?? KIND.box;
          return (
            <article key={it.id} className={"ml-vis-item" + (it.pair ? " pair" : "")}>
              <header>
                <span className={"ml-badge" + cls}>{label}</span>
                {it.pair ? <span className="ml-badge pair">Before and after</span> : null}
                <b>{it.title}</b>
                <span className="ml-vis-when">judged {it.time}</span>
                {it.score ? <span className="ml-score">{it.score}<small>/10</small></span> : null}
              </header>
              <div className={"ml-vis-imgs n" + it.images.length}>
                {it.images.map((im) => (
                  <figure key={im.src}>
                    <a href={im.src} target="_blank" rel="noopener">
                      <img src={im.src} width={im.w} height={im.h} alt={im.alt + " (" + label.toLowerCase() + ")"} loading={i < 2 ? "eager" : "lazy"} decoding="async" />
                    </a>
                    {im.label ? <figcaption>{im.label}</figcaption> : null}
                  </figure>
                ))}
              </div>
              {it.verdict ? <p className="ml-vis-verdict">{it.verdict}</p> : null}
            </article>
          );
        })}
      </div>
      {v.judge ? (
        <div className="ml-col">
          <h3 className="ml-h3">The judge's per-screen scores</h3>
          <p className="ml-vis-meta">{v.judge.pass}, updated {clock(v.judge.at)}. {v.judge.note}</p>
          <Table head={v.judge.head} rows={v.judge.rows} />
          {v.judge.prHead && v.judge.prRows?.length ? (
            <>
              <h3 className="ml-h3">Latest PR scores</h3>
              <Table head={v.judge.prHead} rows={v.judge.prRows} />
            </>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
