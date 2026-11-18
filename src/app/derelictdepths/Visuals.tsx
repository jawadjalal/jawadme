import finals from "./finals.json";
import { Table } from "./ui";

// The newest finished frames from each lane, and jawad's own scale and scores. finals.json and the images it names are
// written every hour by ROBL-42's job on the crew's Linux base, which reads the team's drive. Our own judges' scores
// are retired: the only scores shown are jawad's, and lane scores from the locked, blind, reference-anchored check
// (JAW-156) once that check passes calibration.
type Img = { src: string; w: number; h: number; label: string | null; alt: string };
type Item = { id: string; title: string; time: string; kind: string; pair: boolean; images: Img[] };
type Calibrated = { lane: string; score: number; at: string | null; note: string | null };
type Finals = { generatedAt: string; items: Item[]; calibrated?: Calibrated[] };

const KIND: Record<string, [string, string]> = {
  engine: ["In-engine capture", ""],
  "engine-art": ["In-engine + key art", " art"],
  box: ["Box render", " box"],
  ai: ["AI-assisted key art", " ai"],
};

const clock = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(iso));

export function LatestVisuals() {
  const v = finals as Finals;
  const calibrated = v.calibrated ?? [];
  return (
    <>
      <div className="ml-col">
        <p>
          The newest finished frames from each lane, refreshed every hour. Every picture says what it is: an <b>in-engine capture</b> is a real frame from Roblox Studio, a <b>box render</b>{" "}
          is drawn offline on a build box from the game's own files and is not the game itself, and <b>AI-assisted key art</b> is a thumbnail made from an in-engine capture with image tools.
        </p>
        <p className="ml-vis-meta">Last changed {clock(v.generatedAt)}. The drive is checked every hour.</p>
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
                {it.time ? <span className="ml-vis-when">{it.time}</span> : null}
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
            </article>
          );
        })}
      </div>
      <div className="ml-col">
        <h3 className="ml-h3">jawad's scale and his scores</h3>
      </div>
      <div className="ml-scale">
        <div><b>6 / 10</b><span>Ready for beta testers. Every design, UI, art and thumbnail lane has to clear 6 before the beta.</span></div>
        <div><b>8 / 10</b><span>Steam-level, award-winning. The aim for every lane.</span></div>
      </div>
      <div className="ml-col">
        <Table
          head={["17 Nov build", "jawad's score"]}
          rows={[
            ["Overall design", "2 / 10"],
            ["The UI", "The worst part. On a phone it was very pixelly, weird and cluttered. On desktop it was pixelly, the buttons made no sense, and it looked unrefined."],
            ["The map", "3 to 4 / 10"],
            ["Thumbnail capsule A", "2.5 / 10"],
          ]}
        />
        <p className="ml-note">
          &ldquo;Self-ratings are way off&rdquo; (jawad). So this page no longer shows our own judges' scores. A score counts only when it comes from the locked check for that lane (JAW-156):
          blind, side by side against real references (the top game thumbnails, and the best RPG game interfaces), and anchored on jawad's scored images. Every design, UI, art and thumbnail lane
          climbs in small steps, and a step stays only if that check scores it higher.
        </p>
        <h3 className="ml-h3">Calibrated lane scores</h3>
        {calibrated.length ? (
          <Table head={["Lane", "Score", "Checked", "Note"]} rows={calibrated.map((c) => [c.lane, c.score.toFixed(1) + " / 10", c.at ? clock(c.at) : "–", c.note ?? "–"])} num={[1]} />
        ) : (
          <p className="ml-vis-meta">No lane has a calibrated score yet. Each lane's number appears here once its check passes calibration.</p>
        )}
      </div>
    </>
  );
}
