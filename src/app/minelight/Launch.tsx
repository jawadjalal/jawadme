// The launch board: today's three goals in jawad's order, and the launch readiness list's red, amber and green lines.
// A loop on the crew's Linux base reads docs/launch/READINESS.md on the game repo's main every 3 minutes, scrubs it
// to public-safe text (store and money lines show only their colour and owner) and writes launch.json to the same
// public gist as the feed. The page reads it when it rebuilds, at most every 180 s, so no token is ever on the site.
const LAUNCH_URL = "https://gist.githubusercontent.com/jawadjalal/04eb0fef24e83e3856a51ad0fc3214b9/raw/launch.json";
const TZ = "Europe/London";

type Status = "red" | "amber" | "green" | "killed";
type Line = { s: Status; rule: string; where: string | null; owner: string | null };
type Group = { name: string; lines: Line[] };
type Point = { t: string; red: number; amber: number; green: number };
export type LaunchData = {
  generated_at: string;
  doc: { edited_sha: string | null; edited_at: string | null; graded_on: string | null };
  counts: { red: number; amber: number; green: number; killed: number; total: number };
  sections: Group[];
  history: Point[];
};

const str = (v: unknown) => (typeof v === "string" && v ? v : null);
const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : 0);
const isStatus = (v: unknown): v is Status => v === "red" || v === "amber" || v === "green" || v === "killed";

function clean(raw: unknown): LaunchData | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const c = (r.counts ?? {}) as Record<string, unknown>;
  const d = (r.doc ?? {}) as Record<string, unknown>;
  if (typeof r.generated_at !== "string" || !Array.isArray(r.sections)) return null;
  const sections = r.sections.flatMap((g) => {
    const gr = (g ?? {}) as Record<string, unknown>;
    if (!Array.isArray(gr.lines)) return [];
    const lines = gr.lines.flatMap((l) => {
      const lr = (l ?? {}) as Record<string, unknown>;
      return isStatus(lr.s) && str(lr.rule) ? [{ s: lr.s, rule: String(lr.rule), where: str(lr.where), owner: str(lr.owner) }] : [];
    });
    return [{ name: str(gr.name) ?? "Other", lines }];
  });
  const history = (Array.isArray(r.history) ? r.history : []).flatMap((p) => {
    const pr = (p ?? {}) as Record<string, unknown>;
    return typeof pr.t === "string" ? [{ t: pr.t, red: num(pr.red), amber: num(pr.amber), green: num(pr.green) }] : [];
  });
  return {
    generated_at: r.generated_at,
    doc: { edited_sha: str(d.edited_sha), edited_at: str(d.edited_at), graded_on: str(d.graded_on) },
    counts: { red: num(c.red), amber: num(c.amber), green: num(c.green), killed: num(c.killed), total: num(c.total) },
    sections,
    history,
  };
}

export async function getLaunch(): Promise<LaunchData | null> {
  // Same cache-busting as the feed: the gist's CDN keeps a URL for 5 minutes, so the query changes every 3.
  const bucket = Math.floor(Date.now() / 180_000);
  try {
    const res = await fetch(LAUNCH_URL + "?v=" + bucket, { next: { revalidate: 180 } });
    if (!res.ok) return null;
    return clean(await res.json());
  } catch {
    return null;
  }
}

const GOALS: [string, string][] = [
  ["Finish every mechanic properly", "Every red and amber line below turns green before launch. The list is regraded on current main, and its owner column is the assignment."],
  ["Clean, striking thumbnails and key art", "Capsule art held to the bar of the best on Steam, scored blind beside real references, not by the team that made it."],
  [
    "Then all in on game feel, visuals and UI",
    "A crisp RPG interface on phone and desktop, with no pixel fonts or blown-up pixel buttons, and a pixel-style, cel-shaded 3D world built from real references. Numbers go up: health, damage and gear grow big the deeper you dive.",
  ],
];

const when = new Intl.DateTimeFormat("en-GB", { timeZone: TZ, day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hour12: false });
const hms = new Intl.DateTimeFormat("en-GB", { timeZone: TZ, hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
const hm = new Intl.DateTimeFormat("en-GB", { timeZone: TZ, hour: "2-digit", minute: "2-digit", hour12: false });
const LABEL: Record<Status, string> = { red: "Red: blocks launch", amber: "Amber: launchable, not proven", green: "Green: done, with proof", killed: "Killed for beta: gated off until its gate opens" };

function Burndown({ history }: { history: Point[] }) {
  if (history.length < 2) {
    return <p className="ml-vis-meta">The burndown chart draws itself as the list changes: one point each time a line changes colour, and one an hour.</p>;
  }
  const W = 640, H = 150, L = 34, B = 22, T = 10;
  const t0 = new Date(history[0].t).getTime();
  const t1 = Math.max(new Date(history[history.length - 1].t).getTime(), t0 + 1);
  const top = Math.max(...history.map((p) => p.red + p.amber), 1);
  const x = (t: string) => L + ((new Date(t).getTime() - t0) / (t1 - t0)) * (W - L - 8);
  const y = (v: number) => T + (1 - v / top) * (H - T - B);
  const area = (f: (p: Point) => number) =>
    "M" + x(history[0].t) + "," + y(0) + history.map((p) => " L" + x(p.t).toFixed(1) + "," + y(f(p)).toFixed(1)).join("") + " L" + x(history[history.length - 1].t) + "," + y(0) + " Z";
  return (
    <figure className="ml-lb-chart">
      <svg viewBox={"0 0 " + W + " " + H} role="img" aria-label={"Open lines over time, from " + (history[0].red + history[0].amber) + " to " + (history[history.length - 1].red + history[history.length - 1].amber)}>
        <line x1={L} x2={W - 8} y1={y(0)} y2={y(0)} stroke="#3a2f63" />
        <line x1={L} x2={W - 8} y1={y(top)} y2={y(top)} stroke="#2c2350" strokeDasharray="4 4" />
        <text x={L - 6} y={y(top) + 4} textAnchor="end">{top}</text>
        <text x={L - 6} y={y(0) + 4} textAnchor="end">0</text>
        <path d={area((p) => p.red + p.amber)} fill="#ffc043" opacity="0.9" />
        <path d={area((p) => p.red)} fill="#ff6b6b" />
        <text x={L} y={H - 4}>{hm.format(new Date(history[0].t))}</text>
        <text x={W - 8} y={H - 4} textAnchor="end">{hm.format(new Date(history[history.length - 1].t))}</text>
      </svg>
      <figcaption>Open lines over time: red on the bottom, amber above it. Green is everything under the dashed line that has left the chart.</figcaption>
    </figure>
  );
}

function Lines({ status, launch, compact = false }: { status: Status; launch: LaunchData; compact?: boolean }) {
  const lines = launch.sections.flatMap((g) => g.lines.filter((l) => l.s === status).map((l) => ({ ...l, group: g.name })));
  return (
    <ul className={"ml-lb-list" + (compact ? " compact" : "")}>
      {lines.map((l, i) => (
        <li key={i} className={"ml-lb-line " + l.s}>
          <b>{l.rule}</b>
          {l.where ? <p>{l.where}</p> : null}
          <div className="m">
            <span>{l.group}</span>
            {l.owner ? <span>Owner: {l.owner}</span> : null}
          </div>
        </li>
      ))}
    </ul>
  );
}

export function LaunchBoard({ launch, renderedAt }: { launch: LaunchData | null; renderedAt: number }) {
  const c = launch?.counts;
  return (
    <>
      <div className="ml-col">
        <p>Today's three goals, in jawad's order. The second and third start once the first has nothing red left.</p>
      </div>
      <ol className="ml-goals">
        {GOALS.map(([title, body]) => (
          <li key={title}>
            <b>{title}</b>
            <span>{body}</span>
          </li>
        ))}
      </ol>
      {!launch || !c ? (
        <p className="ml-note">The launch readiness list is unavailable right now. It refreshes every 3 minutes, so check back shortly.</p>
      ) : (
        <>
          <h3 className="ml-h3">Launch readiness: {c.green} of {c.total} green{c.killed ? ", " + c.killed + " killed for beta" : ""}</h3>
          <div className="ml-feed-head">
            <span className="ml-live"><i />Live</span>
            <span>Refreshed at <b>{hms.format(new Date(launch.generated_at))}</b> London, page built {hms.format(new Date(renderedAt))}</span>
            {launch.doc.edited_at ? <span>List last regraded {when.format(new Date(launch.doc.edited_at))}{launch.doc.edited_sha ? <> (<code>{launch.doc.edited_sha}</code>)</> : null}</span> : null}
          </div>
          <div className="ml-lb-counts">
            {(["red", "amber", "green", "killed"] as Status[]).filter((s) => s !== "killed" || c.killed > 0).map((s) => (
              <div key={s} className={"ml-lb-count " + s}>
                <b>{c[s]}</b>
                <span>{s === "killed" ? "killed for beta" : s}</span>
              </div>
            ))}
          </div>
          <div className="ml-lb-bar" role="img" aria-label={c.red + " red, " + c.amber + " amber, " + c.green + " green, " + c.killed + " killed for beta"}>
            {(["green", "amber", "red", "killed"] as Status[]).map((s) => <i key={s} className={s} style={{ width: (100 * c[s]) / Math.max(c.total, 1) + "%" }} />)}
          </div>
          <Burndown history={launch.history} />
          <h3 className="ml-h3">{LABEL.red} ({c.red})</h3>
          <Lines status="red" launch={launch} />
          <h3 className="ml-h3">{LABEL.amber} ({c.amber})</h3>
          <Lines status="amber" launch={launch} compact />
          <details className="ml-older">
            <summary>{LABEL.green} ({c.green})</summary>
            <Lines status="green" launch={launch} compact />
          </details>
          {c.killed ? (
            <details className="ml-older">
              <summary>{LABEL.killed} ({c.killed})</summary>
              <Lines status="killed" launch={launch} compact />
            </details>
          ) : null}
          <p className="ml-vis-meta">
            Read from the game's launch readiness list on main. Store and pricing lines show only their colour and owner until launch.
          </p>
        </>
      )}
    </>
  );
}
