import { Tag, scrub } from "./ui";

// The "what shipped" feed. A timer on the build box roblox-3 (robl42-feed.timer, every 3 minutes) lists the PRs
// merged into the game repo's main, gives each a one-line plain summary, scrubs anything that isn't public-safe
// and writes feed.json to this public gist. The page reads it when it rebuilds (at most every 180 s), so no token
// is ever on the site: the repo is private and only the box can read it.
const FEED_URL = "https://gist.githubusercontent.com/jawadjalal/04eb0fef24e83e3856a51ad0fc3214b9/raw/feed.json";
const TZ = "Europe/London";

type Item = { n: number; title: string; summary: string; area: string | null; merged_at: string; sha: string };
export type FeedData = { generated_at: string; main: string | null; merged_24h: number; refresh_seconds: number; items: Item[] };

function clean(raw: unknown): FeedData | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.generated_at !== "string" || !Array.isArray(r.items)) return null;
  const items = r.items
    .filter((i): i is Item => !!i && typeof i === "object" && typeof (i as Item).n === "number" && typeof (i as Item).merged_at === "string")
    .map((i) => ({
      n: i.n,
      title: String(i.title ?? "").toLowerCase(),
      summary: String(i.summary ?? "").toLowerCase(),
      area: typeof i.area === "string" ? i.area.toLowerCase() : null,
      merged_at: i.merged_at,
      sha: String(i.sha ?? "").slice(0, 7),
    }));
  return {
    generated_at: r.generated_at,
    main: typeof r.main === "string" ? r.main : null,
    merged_24h: typeof r.merged_24h === "number" ? r.merged_24h : 0,
    refresh_seconds: typeof r.refresh_seconds === "number" ? r.refresh_seconds : 180,
    items,
  };
}

export async function getFeed(): Promise<FeedData | null> {
  // The gist's CDN caches a URL for 5 minutes; a new query string every 3 minutes reads the latest file.
  const bucket = Math.floor(Date.now() / 180_000);
  try {
    const res = await fetch(FEED_URL + "?v=" + bucket, { next: { revalidate: 180 } });
    if (!res.ok) return null;
    return clean(await res.json());
  } catch {
    return null;
  }
}

const hm = new Intl.DateTimeFormat("en-gb", { timeZone: TZ, hour: "2-digit", minute: "2-digit", hour12: false });
const hms = new Intl.DateTimeFormat("en-gb", { timeZone: TZ, hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
const day = new Intl.DateTimeFormat("en-gb", { timeZone: TZ, weekday: "short", day: "numeric", month: "short" });
const hourOnly = new Intl.DateTimeFormat("en-gb", { timeZone: TZ, hour: "2-digit", hour12: false });

function groupByHour(items: Item[]) {
  const groups: { key: string; label: string; items: Item[] }[] = [];
  for (const item of items) {
    const d = new Date(item.merged_at);
    const h = Number(hourOnly.format(d)) % 24;
    const key = day.format(d) + " " + h;
    const label = day.format(d).toLowerCase() + " · " + String(h).padStart(2, "0") + ":00 to " + String((h + 1) % 24).padStart(2, "0") + ":00";
    const last = groups[groups.length - 1];
    if (last && last.key === key) last.items.push(item);
    else groups.push({ key, label, items: [item] });
  }
  return groups;
}

function Pr({ item }: { item: Item }) {
  const d = new Date(item.merged_at);
  return (
    <li className="ml-pr">
      <time dateTime={item.merged_at}>{hm.format(d)}</time>
      <div>
        <div className="t">{scrub(item.title)}</div>
        {item.summary && item.summary !== item.title ? <div className="s">{scrub(item.summary)}</div> : null}
        {item.area ? (
          <div className="m">
            <Tag area={item.area} />
          </div>
        ) : null}
      </div>
    </li>
  );
}

export function FeedMeta({ feed }: { feed: FeedData }) {
  return (
    <div className="ml-feed-head">
      <span className="ml-live"><i />live feed</span>
      <span>
        refreshed by the build box at <b>{hms.format(new Date(feed.generated_at))}</b> london
      </span>
    </div>
  );
}

export function LatestShipped({ feed }: { feed: FeedData }) {
  return (
    <ol className="ml-list-plain" style={{ listStyle: "none", margin: 0, padding: 0 }}>
      {feed.items.slice(0, 6).map((item) => <Pr key={item.n} item={item} />)}
    </ol>
  );
}

export function Feed({ feed }: { feed: FeedData | null }) {
  if (!feed || feed.items.length === 0) {
    return <p className="ml-note">the live feed is unavailable right now. it refreshes every 3 minutes, so check back shortly.</p>;
  }
  const groups = groupByHour(feed.items);
  const open = groups.slice(0, 8);
  const rest = groups.slice(8);
  const restCount = rest.reduce((n, g) => n + g.items.length, 0);
  return (
    <div>
      <FeedMeta feed={feed} />
      {open.map((g) => (
        <section key={g.key} className="ml-hour">
          <h3>{g.label} <span>{g.items.length} merged</span></h3>
          <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>{g.items.map((item) => <Pr key={item.n} item={item} />)}</ol>
        </section>
      ))}
      {rest.length ? (
        <details className="ml-older">
          <summary>older: {restCount} more prs over {rest.length} hours</summary>
          {rest.map((g) => (
            <section key={g.key} className="ml-hour">
              <h3>{g.label} <span>{g.items.length} merged</span></h3>
              <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>{g.items.map((item) => <Pr key={item.n} item={item} />)}</ol>
            </section>
          ))}
        </details>
      ) : null}
    </div>
  );
}
