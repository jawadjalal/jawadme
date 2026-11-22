// The launch board: today's three goals in jawad's order, and the launch readiness list's red, amber and green lines.
// A loop on the crew's Linux base reads docs/launch/READINESS.md on the game repo's main every 3 minutes, scrubs it
// to public-safe text (store and money lines show only their colour and owner) and writes launch.json to the same
// public gist as the feed. The page reads it when it rebuilds, at most every 180 s, so no token is ever on the site.
const LAUNCH_URL = "https://gist.githubusercontent.com/jawadjalal/04eb0fef24e83e3856a51ad0fc3214b9/raw/board.json";

import { scrub } from "./ui";

type Status = "red" | "amber" | "green" | "killed";
type Line = { s: Status; rule: string; where: string | null; owner: string | null };
type Group = { name: string; lines: Line[] };
export type LaunchData = {
  generated_at: string;
  doc: { edited_sha: string | null; edited_at: string | null; graded_on: string | null };
  counts: { red: number; amber: number; green: number; killed: number; total: number };
  sections: Group[];
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
      return isStatus(lr.s) && str(lr.rule) ? [{ s: lr.s, rule: String(lr.rule).toLowerCase(), where: str(lr.where)?.toLowerCase() ?? null, owner: str(lr.owner)?.toLowerCase() ?? null }] : [];
    });
    return [{ name: str(gr.name)?.toLowerCase() ?? "other", lines }];
  });
  return {
    generated_at: r.generated_at,
    doc: { edited_sha: str(d.edited_sha), edited_at: str(d.edited_at), graded_on: str(d.graded_on) },
    counts: { red: num(c.red), amber: num(c.amber), green: num(c.green), killed: num(c.killed), total: num(c.total) },
    sections,
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
  ["finish every mechanic properly", "every red and amber line below turns green before launch. the list is regraded on current main, and its owner column is the assignment."],
  ["clean, striking thumbnails and key art", "capsule art held to the bar of the best on steam, scored blind beside real references, not by the team that made it."],
  [
    "then all in on game feel, visuals and ui",
    "a crisp rpg interface on phone and desktop, with no pixel fonts or blown-up pixel buttons, and a pixel-style, cel-shaded 3d world built from real references. numbers go up: health, damage and gear grow big the deeper you dive.",
  ],
];

const LABEL: Record<Status, string> = { red: "red: blocks launch", amber: "amber: launchable, not proven", green: "green: done, with proof", killed: "killed for beta: gated off until its gate opens" };

function Lines({ status, launch, compact = false }: { status: Status; launch: LaunchData; compact?: boolean }) {
  const lines = launch.sections.flatMap((g) => g.lines.filter((l) => l.s === status).map((l) => ({ ...l, group: g.name })));
  return (
    <ul className={"ml-lb-list" + (compact ? " compact" : "")}>
      {lines.map((l, i) => (
        <li key={i} className={"ml-lb-line " + l.s}>
          <b>{scrub(l.rule)}</b>
          {l.where ? <p>{scrub(l.where)}</p> : null}
          <div className="m">
            <span>{l.group}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function LaunchBoard({ launch }: { launch: LaunchData | null }) {
  const c = launch?.counts;
  return (
    <>
      <div className="ml-col">
        <p>today's three goals, in jawad's order. the second and third start once the first has nothing red left.</p>
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
        <p className="ml-note">the launch readiness list is unavailable right now. it refreshes every 3 minutes, so check back shortly.</p>
      ) : (
        <>
          <h3 className="ml-h3">{LABEL.red}</h3>
          <Lines status="red" launch={launch} />
          <h3 className="ml-h3">{LABEL.amber}</h3>
          <Lines status="amber" launch={launch} compact />
          <details className="ml-older">
            <summary>{LABEL.green}</summary>
            <Lines status="green" launch={launch} compact />
          </details>
          {c.killed ? (
            <details className="ml-older">
              <summary>{LABEL.killed}</summary>
              <Lines status="killed" launch={launch} compact />
            </details>
          ) : null}
          <p className="ml-vis-meta">
            read from the game's launch readiness list on main. store and pricing lines show only their colour until launch.
          </p>
        </>
      )}
    </>
  );
}
